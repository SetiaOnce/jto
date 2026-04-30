import requests
from django.shortcuts import render
from django.conf import settings
from app.models import LokasiUppkb, DataBptd, DataLokasiUppkbPusat, KategoriKomoditi, MasterKomoditi, MasterKendaraan, MasterJenisKendaraan, MasterSumbu, MasterGolSim, MasterToleransiKomoditi, MasterToleransiDimensi, MasterKategoriKepemilikan, Dokumen, MasterJenisPelanggaran, Sanksi, SubSanksi, Sitaan, Pasal, DataProvinsi, DataKotaKab
from .utils import json_response
from django.db import transaction
import logging
from django.utils.dateparse import parse_datetime
from django.core.paginator import Paginator
from django.db.models import Q
from datetime import date

def parse_date_safe(val):
    return date.fromisoformat(val) if val else None

# ✅ FIX Error 1: Helper strip timezone agar kompatibel dengan USE_TZ = False
def parse_datetime_naive(val):
    """Parse datetime string dari API pusat dan strip timezone info.
    API pusat return format ISO dengan 'Z' suffix (UTC aware).
    MySQL dengan USE_TZ=False tidak support timezone-aware datetime.
    """
    if not val:
        return None
    dt = parse_datetime(str(val))
    if dt is not None and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt

def _get_config():
    """Helper: ambil config token & url API pusat dari DB."""
    config = LokasiUppkb.objects.first()
    token = config.access_token_api_pusat if config else None
    url_api_pusat = (config.url_api_pusat if config else 'https://jto.kemenhub.go.id/api/v2').rstrip('/')
    return token, url_api_pusat

def index(request):
    lokasi = LokasiUppkb.objects.first()
    context = {
        'title': 'Sinkronisasi Data Pusat',
        'active_menu': 'sync_data_pusat',
        'app_name': lokasi.nama
    }
    return render(request, 'backend/sync_data_pusat.html', context)

def sync_bptd(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/bptd"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API BPTD (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = DataBptd.objects.update_or_create(
                id=item.get('id'),
                defaults={
                    'nama': item.get('nama'),
                    'kode': item.get('kode'),
                    'alamat': item.get('alamat'),
                    'lat_pos': item.get('lat_pos'),
                    'lon_pos': item.get('lon_pos'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi BPTD Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_lokasi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum ditemukan.")

        url = url_api_pusat + "/v2pv/lokasi/publish/paginate?paginate=300"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message="Gagal akses API Lokasi Pusat.")

        res_data = response.json()
        items = res_data.get('results', {}).get('data', []) if 'results' in res_data else res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = DataLokasiUppkbPusat.objects.update_or_create(
                id=item.get('id'),
                defaults={
                    # MAPPING FOREIGN KEY (Harus field_name + _id)
                    'kab_kota_id': item.get('kota_kab_id'),
                    'bptd_id': item.get('bptd_id'), 
                    
                    # DATA STRING & NUMERIC
                    'kode': item.get('kode'),
                    'gen_kode': item.get('gen_kode'),
                    'nama': item.get('nama'),
                    'alamat_uppkb': item.get('alamat_uppkb'),
                    'lat_pos': item.get('lat_pos'),
                    'lon_pos': item.get('lon_pos'),
                    'tahun_diresmikan': item.get('tahun_diresmikan'),
                    'luas_lahan': item.get('luas_lahan'),
                    'kapasitas_timbangan': item.get('kapasitas_timbangan'),
                    'jml_sdm': item.get('jml_sdm'),
                    'jml_pns': item.get('jml_pns'),
                    'jml_ppns': item.get('jml_ppns'),
                    'jml_ppnpn': item.get('jml_ppnpn'),
                    'tahun_jto': item.get('tahun_jto'),
                    'status_operasi': item.get('status_operasi'),
                    'versi_lhr': item.get('versi_lhr'),
                    
                    # CASTING DATA BOOLEAN
                    'is_lhr': item.get('is_lhr') in [1, '1', True],
                    'is_wim': item.get('is_wim') in [1, '1', True],
                    'is_integrasi_etilang': item.get('is_integrasi_etilang') in [1, '1', True],
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # ✅ FIX Error 1: Wrap semua datetime field dengan parse_datetime_naive()
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                    'created_at': parse_datetime_naive(item.get('created_at')),
                    'updated_at': parse_datetime_naive(item.get('updated_at')),
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Lokasi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_jenis_kendaraan(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/jeniskendaraan"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Jenis Kendaraan (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterJenisKendaraan.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Jenis Kendaraan Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_sumbu(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/sumbu"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Sumbu (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterSumbu.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'konfig_sumbu': item.get('konfig_sumbu'),
                    'jml_sumbu': item.get('jml_sumbu'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    # 'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Sumbu Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_gol_sim(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/golsim"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Golongan SIM (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterGolSim.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'keterangan': item.get('keterangan'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Golongan SIM Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_toleransi_komoditi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/toleransikomoditi"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Toleransi Komoditi (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterToleransiKomoditi.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kategori_komoditi_id': item.get('kategori_komoditi_id'),
                    'prosen_toleransi': item.get('prosen_toleransi'),
                    'tgl_mulai': item.get('tgl_mulai'),
                    'tgl_selesai': item.get('tgl_selesai'),
                    'durasi': item.get('durasi'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Toleransi Komoditi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_toleransi_dimensi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/toleransidimensi"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Toleransi Dimensi (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterToleransiDimensi.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode_uppkb': item.get('kode_uppkb'),
                    'prosen_pjg': item.get('prosen_pjg'),
                    'prosen_lebar': item.get('prosen_lebar'),
                    'prosen_tinggi': item.get('prosen_tinggi'),
                    'prosen_foh': item.get('prosen_foh'),
                    'prosen_roh': item.get('prosen_roh'),
                    'keterangan': item.get('keterangan'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Toleransi Dimensi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_kategori_kepemilikan(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/kategorikepemilikan"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Kategori Kepemilikan (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterKategoriKepemilikan.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Kategori Kepemilikan Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_dokumen(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/dokumen"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Dokumen (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = Dokumen.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Dokumen Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_jenispelanggaran(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/jenispelanggaran"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses Jenis Pelanggaran (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterJenisPelanggaran.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'is_active' : 'Y' if item.get('is_active') in [1, '1', True] else 'N'
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Jenis Pelanggaran Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_sanksi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/sanksi"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Sanksi (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = Sanksi.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'deskripsi': item.get('deskripsi'),
                    'keterangan': item.get('keterangan'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Sanksi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_subsanksi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/subsanksi"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Sub Sanksi (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = SubSanksi.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'sanksi_id': item.get('sanksi_id'),
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'keterangan': item.get('keterangan'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Sub Sanksi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_sitaan(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/sitaan"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Sitaan (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = Sitaan.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'sanksi_id': item.get('sanksi_id'),
                    'dokumen_id': item.get('dokumen_id'),
                    'keterangan': item.get('keterangan'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Sitaan Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_pasal(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/pasal"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Pasal (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = Pasal.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'no_pasal': item.get('no_pasal'),
                    'pasal': item.get('pasal'),
                    'desk_pasal': item.get('desk_pasal'),
                    'denda_maks': item.get('denda_maks'),
                    'keterangan': item.get('keterangan'),

                    'etilang_id': item.get('etilang_id'),
                    
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Provinsi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_provinsi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/provinsi"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Provinsi (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = DataProvinsi.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'bptd_id': item.get('bptd_id'),
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),

                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Provinsi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_kotakab(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/kotakab"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Kabupaten Kota (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = DataKotaKab.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'provinsi_id': item.get('provinsi_id'),
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'lat_pos': item.get('lat_pos'),
                    'lon_pos': item.get('lon_pos'),

                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Kabupaten Kota Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def sync_kategori_komoditi(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi di tabel Lokasi.")

        url = url_api_pusat + "/v2pv/kategorikomoditi"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses API Kategori Komoditi (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = KategoriKomoditi.objects.update_or_create(
                id=item.get('id'), 
                defaults={
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    
                    # Riwayat Metadata User
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                
                    # ✅ FIX Error 1: deleted_at pakai parse_datetime_naive()
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(status=True, message=f"Sinkronisasi Kategori Komoditi Berhasil. {count_new} Data Baru, {count_update} Terupdate.")

    except Exception as e:
        return json_response(status=False, message=str(e))

def get_komoditi_metadata(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi.")

        url = url_api_pusat + "/v2pv/komoditi?paginate=100&page=1"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal fetch metadata komoditi (HTTP {response.status_code})")

        res_data = response.json()
        
        # ✅ FIX Error 2: API pusat pakai key 'meta' → { "pages": 41650, "total": 41650 }
        meta_info = res_data.get('meta', {})
        total_pages = meta_info.get('pages', 0)
        total_records = meta_info.get('total', 0)

        if not total_pages:
            return json_response(status=False, message="Tidak dapat mengambil informasi total halaman dari API pusat.")

        return json_response(
            status=True,
            message="Metadata komoditi berhasil diambil",
            data={
                'total_pages': total_pages,
                'total_records': total_records
            }
        )

    except Exception as e:
        return json_response(status=False, message=f"Error: {str(e)}")

def sync_komoditi_page(request):
    try:
        page = request.GET.get('page', 1)
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi.")

        url = url_api_pusat + f"/v2pv/komoditi?paginate=100&page={page}"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses halaman {page} (HTTP {response.status_code})")

        res_data = response.json()
        # ✅ FIX Error 2: Data langsung di key 'data' (bukan nested results.data)
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            obj, created = MasterKomoditi.objects.update_or_create(
                id=item.get('id'),
                defaults={
                    'kategori_komoditi_id': item.get('kategori_komoditi_id'),
                    'kode': item.get('kode'),
                    'nama': item.get('nama'),
                    'is_active': item.get('is_active') in [1, '1', True],
                    'is_deleted': item.get('is_deleted') in [1, '1', True],
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                    # ✅ FIX Error 1: Wrap datetime fields
                    'created_at': parse_datetime_naive(item.get('created_at')),
                    'updated_at': parse_datetime_naive(item.get('updated_at')),
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(
            status=True,
            message=f"Halaman {page} berhasil disinkronkan. {count_new} data baru, {count_update} terupdate."
        )

    except Exception as e:
        return json_response(status=False, message=f"Error: {str(e)}")

def get_kendaraan_metadata(request):
    try:
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi.")

        url = url_api_pusat + "/v2pv/kendaraan?paginate=100&page=1"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal fetch metadata kendaraan (HTTP {response.status_code})")

        res_data = response.json()
        
        # ✅ FIX Error 2: API pusat pakai key 'meta' → { "pages": 1441301, "total": 1441301 }
        meta_info = res_data.get('meta', {})
        total_pages = meta_info.get('pages', 0)
        total_records = meta_info.get('total', 0)

        if not total_pages:
            return json_response(status=False, message="Tidak dapat mengambil informasi total halaman dari API pusat.")

        return json_response(
            status=True,
            message="Metadata kendaraan berhasil diambil",
            data={
                'total_pages': total_pages,
                'total_records': total_records
            }
        )

    except Exception as e:
        return json_response(status=False, message=f"Error: {str(e)}")

def sync_kendaraan_page(request):
    try:
        page = request.GET.get('page', 1)
        token, url_api_pusat = _get_config()
        if not token:
            return json_response(status=False, message="Token API Pusat belum dikonfigurasi.")

        url = url_api_pusat + f"/v2pv/kendaraan?page={page}&paginate=10000&orderBy=no_reg_kend&sortedBy=asc"
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return json_response(status=False, message=f"Gagal akses halaman {page} (HTTP {response.status_code})")

        res_data = response.json()
        items = res_data.get('data', [])

        count_new = 0
        count_update = 0

        for item in items:
            # ✅ FIX: Parse semua field datetime/date SEBELUM masuk ke defaults
            tgl_srut        = parse_datetime_naive(item.get('tgl_srut'))
            etl_date        = parse_datetime_naive(item.get('etl_date'))
            tanggal_uji     = parse_date_safe(item.get('tanggal_uji'))
            masa_berlaku_uji = parse_date_safe(item.get('masa_berlaku_uji'))
            print('=' * 10)
            print(item.get('foto_depan_url'))
            print('=' * 10)
            obj, created = MasterKendaraan.objects.update_or_create(
                id=item.get('id'),
                defaults={
                    'no_reg_kend': item.get('no_reg_kend'),
                    'no_uji': item.get('no_uji'),
                    'nama_pemilik': item.get('nama_pemilik'),
                    'alamat_pemilik': item.get('alamat_pemilik'),
                    'lokasi_uji': item.get('lokasi_uji'),
                    'tanggal_uji': tanggal_uji,
                    'masa_berlaku_uji': masa_berlaku_uji,
                    'is_masa_berlaku': item.get('is_masa_berlaku', False) in [1, '1', True],
                    'jenis_kend': item.get('jenis_kend'),
                    'jenis_kendaraan_id': item.get('jenis_kendaraan_id'),
                    'sumbu_id': item.get('sumbu_id'),
                    'konfigurasi_sumbu': item.get('konfigurasi_sumbu'),
                    'kepemilikan_id': item.get('kepemilikan_id'),
                    'kepemilikan_val': item.get('kepemilikan_val'),
                    'berat_kosong': item.get('berat_kosong'),
                    'jbb': item.get('jbb'),
                    'jbkb': item.get('jbkb'),
                    'jbi': item.get('jbi'),
                    'jbki': item.get('jbki'),
                    'mst': item.get('mst'),
                    'panjang_utama': item.get('panjang_utama'),
                    'lebar_utama': item.get('lebar_utama'),
                    'tinggi_utama': item.get('tinggi_utama'),
                    'julur_depan': item.get('julur_depan'),
                    'julur_belakang': item.get('julur_belakang'),
                    'jarak_sumbu_1_2': item.get('jarak_sumbu_1_2'),
                    'jarak_sumbu_2_3': item.get('jarak_sumbu_2_3'),
                    'jarak_sumbu_3_4': item.get('jarak_sumbu_3_4'),
                    'dimensi_bak_tangki': item.get('dimensi_bak_tangki'),
                    'nomor_rangka': item.get('nomor_rangka'),
                    'merek': item.get('merek'),
                    'bahan_bakar': item.get('bahan_bakar'),
                    'kelas': item.get('kelas'),
                    'daya_angkut_orang': item.get('daya_angkut_orang'),
                    'daya_angkut_barang': item.get('daya_angkut_barang'),
                    'foto_kanan': item.get('foto_kanan'),
                    'foto_kiri': item.get('foto_kiri'),
                    'foto_depan': item.get('foto_depan'),
                    'foto_belakang': item.get('foto_belakang'),
                    'foto_kanan_url': item.get('foto_kanan_url'),
                    'foto_kiri_url': item.get('foto_kiri_url'),
                    'foto_depan_url': item.get('foto_depan_url'),
                    'foto_belakang_url': item.get('foto_belakang_url'),
                    'blue_id': item.get('blue_id'),
                    'no_srut': item.get('no_srut'),
                    'tgl_srut': tgl_srut,
                    'no_mesin': item.get('no_mesin'),
                    'tipe': item.get('tipe'),
                    'tahun_rakit': item.get('tahun_rakit'),
                    'isi_silinder': item.get('isi_silinder'),
                    'daya_motor': item.get('daya_motor'),
                    'ukuran_ban': item.get('ukuran_ban'),
                    'keterangan_hasil_uji': item.get('keterangan_hasil_uji'),
                    'petugas_penguji': item.get('petugas_penguji'),
                    'nrp_petugas_penguji': item.get('nrp_petugas_penguji'),
                    'kepala_dinas': item.get('kepala_dinas'),
                    'pangkat_kepala_dinas': item.get('pangkat_kepala_dinas'),
                    'nip_kepala_dinas': item.get('nip_kepala_dinas'),
                    'unit_pelaksana_teknis': item.get('unit_pelaksana_teknis'),
                    'direktur': item.get('direktur'),
                    'pangkat_direktur': item.get('pangkat_direktur'),
                    'nip_direktur': item.get('nip_direktur'),
                    'etl_date': etl_date,
                    'rfid': None,
                    'vcode': None,
                    'is_blue': 1,
                    'is_active': item.get('is_active', False) in [1, '1', True],
                    'is_deleted': item.get('is_deleted', False) in [1, '1', True],
                    'created_by': item.get('created_by'),
                    'updated_by': item.get('updated_by'),
                    'deleted_by': item.get('deleted_by'),
                    'created_at': parse_datetime_naive(item.get('created_at')),
                    'updated_at': parse_datetime_naive(item.get('updated_at')),
                    'deleted_at': parse_datetime_naive(item.get('deleted_at')),
                }
            )
            if created: count_new += 1
            else: count_update += 1

        return json_response(
            status=True,
            message=f"Halaman {page} berhasil disinkronkan. {count_new} data baru, {count_update} terupdate."
        )

    except Exception as e:
        return json_response(status=False, message=f"Error: {str(e)}")

# ============================================================
# SHOW / DISPLAY FUNCTIONS (dengan pagination & search)
# ============================================================

def show_bptd(request):
    try:
        page = request.GET.get('page', 1)
        search = request.GET.get('search', '').strip()
        
        queryset = DataBptd.objects.order_by('-id')
        if search:
            queryset = queryset.filter(
                Q(nama__icontains=search) | 
                Q(kode__icontains=search) |
                Q(alamat__icontains=search)
            )
        
        paginator = Paginator(queryset, 25)
        page_obj = paginator.get_page(page)
        
        data = []
        for obj in page_obj:
            data.append({
                'id': obj.id,
                'kode': obj.kode,
                'nama': obj.nama,
                'alamat': obj.alamat,
                'is_active': obj.is_active,
                'is_deleted': obj.is_deleted,
            })
        
        return json_response(
            status=True,
            message="Data BPTD berhasil diambil",
            data={
                'items': data,
                'pagination': {
                    'total': paginator.count,
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                }
            }
        )
    except Exception as e:
        return json_response(status=False, message=str(e))

def show_lokasi(request):
    try:
        page = request.GET.get('page', 1)
        search = request.GET.get('search', '').strip()
        
        queryset = DataLokasiUppkbPusat.objects.select_related('kab_kota', 'bptd').order_by('-id')
        if search:
            queryset = queryset.filter(
                Q(nama__icontains=search) | 
                Q(kode__icontains=search) |
                Q(alamat_uppkb__icontains=search)
            )
        
        paginator = Paginator(queryset, 25)
        page_obj = paginator.get_page(page)
        
        data = []
        for obj in page_obj:
            data.append({
                'id': obj.id,
                'kode': obj.kode,
                'nama': obj.nama,
                'alamat': obj.alamat_uppkb,
                'bptd': obj.bptd.nama if obj.bptd else '-',
                'kapasitas': obj.kapasitas_timbangan,
                'status_operasi': obj.status_operasi,
                'is_active': obj.is_active,
                'is_deleted': obj.is_deleted,
            })
        
        return json_response(
            status=True,
            message="Data Lokasi berhasil diambil",
            data={
                'items': data,
                'pagination': {
                    'total': paginator.count,
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                }
            }
        )
    except Exception as e:
        return json_response(status=False, message=str(e))

def show_kategori_komoditi(request):
    try:
        page = request.GET.get('page', 1)
        search = request.GET.get('search', '').strip()
        
        queryset = KategoriKomoditi.objects.order_by('-id')
        if search:
            queryset = queryset.filter(
                Q(nama__icontains=search) | 
                Q(kode__icontains=search)
            )
        
        paginator = Paginator(queryset, 25)
        page_obj = paginator.get_page(page)
        
        data = []
        for obj in page_obj:
            data.append({
                'id': obj.id,
                'kode': obj.kode,
                'nama': obj.nama,
                'is_active': obj.is_active,
                'is_deleted': obj.is_deleted,
                'created_at': obj.created_at.strftime('%d-%m-%Y') if obj.created_at else '-',
            })
        
        return json_response(
            status=True,
            message="Data Kategori Komoditi berhasil diambil",
            data={
                'items': data,
                'pagination': {
                    'total': paginator.count,
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                }
            }
        )
    except Exception as e:
        return json_response(status=False, message=str(e))

def show_master_komoditi(request):
    try:
        page = request.GET.get('page', 1)
        search = request.GET.get('search', '').strip()
        
        queryset = MasterKomoditi.objects.select_related('kategori_komoditi').order_by('-id')
        if search:
            queryset = queryset.filter(
                Q(nama__icontains=search) | 
                Q(kode__icontains=search)
            )
        
        paginator = Paginator(queryset, 25)
        page_obj = paginator.get_page(page)
        
        data = []
        for obj in page_obj:
            data.append({
                'id': obj.id,
                'kode': obj.kode,
                'nama': obj.nama,
                'kategori': obj.kategori_komoditi.nama if obj.kategori_komoditi else '-',
                'is_active': obj.is_active,
                'is_deleted': obj.is_deleted,
                'created_at': obj.created_at.strftime('%d-%m-%Y') if obj.created_at else '-',
            })
        
        return json_response(
            status=True,
            message="Data Master Komoditi berhasil diambil",
            data={
                'items': data,
                'pagination': {
                    'total': paginator.count,
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                }
            }
        )
    except Exception as e:
        return json_response(status=False, message=str(e))

def show_data_kendaraan(request):
    try:
        page = request.GET.get('page', 1)
        search = request.GET.get('search', '').strip()
        
        queryset = MasterKendaraan.objects.order_by('-id')
        if search:
            queryset = queryset.filter(
                Q(merek__icontains=search) | 
                Q(kode__icontains=search) |
                Q(tipe__icontains=search)
            )
        
        paginator = Paginator(queryset, 25)
        page_obj = paginator.get_page(page)
        
        data = []
        for obj in page_obj:
            data.append({
                'id': obj.id,
                'kode': obj.kode,
                'merek': obj.merek,
                'tipe': obj.tipe,
                'isi_silinder': obj.isi_silinder,
                'is_active': obj.is_active,
                'is_deleted': obj.is_deleted,
                'created_at': obj.created_at.strftime('%d-%m-%Y') if obj.created_at else '-',
            })
        
        return json_response(
            status=True,
            message="Data Kendaraan berhasil diambil",
            data={
                'items': data,
                'pagination': {
                    'total': paginator.count,
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                }
            }
        )
    except Exception as e:
        return json_response(status=False, message=str(e))