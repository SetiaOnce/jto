import requests
from django.http import JsonResponse
import json
from app.models import LokasiUppkb
from django.conf import settings
from datetime import date, datetime
import re
import os
from requests_toolbelt.multipart.encoder import MultipartEncoder

def login_pusat():
    lokasi  = LokasiUppkb.objects.first()
    if lokasi:
        end_point = lokasi.url_api_pusat + f'/v2pb/login/'
        payload = {
            'email': lokasi.email_api_pusat,
            'password': lokasi.password_api_pusat
        }
        try:
            response = requests.post(
                end_point,
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            result = response.json()
            if result.get('success'):
                access_token = result.get('accessToken')
                refresh_token = result.get('refreshToken')
                expired = result.get('expired')
                print("Login berhasil:")
                print("Access Token:", access_token)
                print("Refresh Token:", refresh_token)
                print("Expired:", expired)
                lokasi.access_token_api_pusat = access_token
                lokasi.save()
                return access_token
            else:
                print("Login gagal. Response:", json.dumps(result, indent=4))
        except requests.exceptions.RequestException as e:
            return False
    else:
        return 'LOKASI BELUM DI SETTING'
    
def send_penimbangan_to_pusat(row):
    def serialize_value(value):
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return value

    lokasi = LokasiUppkb.objects.first()
    if not lokasi:
        return {"success": False, "message": "LOKASI BELUM DI SETTING"}

    end_point = lokasi.url_api_pusat + '/v2pv/penimbangan/create'
    headers = {
        "Authorization": f"Bearer {lokasi.access_token_api_pusat}",
        "Content-Type": "application/json"
    }

    
    item = row
    payload = {
        "kode_trx": item.kode_trx,
        "is_transaksi": str(item.is_transaksi),
        "kode_uppkb": item.kode_uppkb,
        "timbangan_id": str(item.timbangan_id),
        "tgl_penimbangan": serialize_value(item.tgl_penimbangan),
        "no_kendaraan": item.no_kendaraan,
        "no_uji": item.no_uji,
        "tgl_uji": serialize_value(item.tgl_uji),
        "tgl_masa_berlaku": serialize_value(item.tgl_masa_berlaku),
        "nama_pemilik": item.nama_pemilik,
        "alamat_pemilik": item.alamat_pemilik,
        "asal_kota_id": str(item.asal_kota_id),
        "tujuan_kota_id": str(item.tujuan_kota_id),
        "toleransi_komoditi": str(item.toleransi_komoditi),
        "toleransi_uppkb": str(item.toleransi_uppkb),
        "berat_timbang": re.sub(r'\.0$', '', str(item.berat_timbang)),
        "jbi_uji": re.sub(r'\.0$', '', str(item.jbi_uji)),
        "kelebihan_berat": re.sub(r'\.0$', '', str(item.kelebihan_berat)),
        "prosen_lebih": str(item.prosen_lebih),
        "is_gandengan": "true" if item.is_gandengan else "false",
        "nama_pengemudi": item.nama_pengemudi or "",
        "alamat_pengemudi": item.alamat_pengemudi or "",
        "jenis_kendaraan_id": str(item.jenis_kendaraan_id),
        "gol_sim_id": "",
        "pelanggaran": getattr(item, "pelanggaran_ids", "") or "",
        # "is_melanggar":  "1" if item.is_melanggar == "Y" else "0",
        "is_active": "1" if item.is_active == "Y" else "0",
        "gandengan_no_uji": "",
        "gandengan_tgl_uji": "",
        "gandengan_masa_berlaku": "",
        "gandengan_jbi_uji": "0",
        "gandengan_jbki": "0",
        "jbb_uji": re.sub(r'\.0$', '', str(item.jbb_uji)),
        "jbkb_uji": re.sub(r'\.0$', '', str(item.jbkb_uji)),
        "mst_uji": re.sub(r'\.0$', '', str(item.mst_uji)),
        "kategori_kepemilikan_id": str(item.kategori_kepemilikan_id),
        "jenis_kendaraan": item.jenis_kendaraan,
        "sumbu": str(item.sumbu),
        "sumbu_id": str(item.sumbu_id),
        "pemilik_komoditi": item.nama_pemilik,
        "alamat_pemilik_komoditi": item.alamat_pemilik,
        "no_sim": "",
        "tgl_antrian": serialize_value(item.tgl_antrian),
        "no_surat_jalan": str(item.no_surat_jalan),
        "panjang_utama": re.sub(r'\.0$', '', str(item.panjang_utama)),
        "panjang_toleransi": re.sub(r'\.0$', '', str(item.panjang_toleransi)),
        "panjang_ukur": re.sub(r'\.0$', '', str(item.panjang_ukur)),
        "panjang_lebih": re.sub(r'\.0$', '', str(item.panjang_lebih)),
        "lebar_utama": re.sub(r'\.0$', '', str(item.lebar_utama)),
        "lebar_toleransi": re.sub(r'\.0$', '', str(item.lebar_toleransi)),
        "lebar_ukur": re.sub(r'\.0$', '', str(item.lebar_ukur)),
        "lebar_lebih": re.sub(r'\.0$', '', str(item.lebar_lebih)),
        "tinggi_utama": re.sub(r'\.0$', '', str(item.tinggi_utama)),
        "tinggi_toleransi": re.sub(r'\.0$', '', str(item.tinggi_toleransi)),
        "tinggi_ukur": re.sub(r'\.0$', '', str(item.tinggi_ukur)),
        "tinggi_lebih": re.sub(r'\.0$', '', str(item.tinggi_lebih)),
        "foh_utama": re.sub(r'\.0$', '', str(item.foh_utama)),
        "foh_toleransi": re.sub(r'\.0$', '', str(item.foh_toleransi)),
        "foh_ukur": re.sub(r'\.0$', '', str(item.foh_ukur)),
        "foh_lebih": re.sub(r'\.0$', '', str(item.foh_lebih)),
        "roh_utama": re.sub(r'\.0$', '', str(item.roh_utama)),
        "roh_toleransi": re.sub(r'\.0$', '', str(item.roh_toleransi)),
        "roh_ukur": re.sub(r'\.0$', '', str(item.roh_ukur)),
        "roh_lebih": re.sub(r'\.0$', '', str(item.roh_lebih)),
        "asal_kode_kota": str(item.asal_kota_id),
        "tujuan_kode_kota": str(item.tujuan_kota_id),
        "device_id": str(item.device_id),
        "lokasi_id": str(lokasi.id),
        "umur_pengemudi": "",
        "is_surat_tilang": "true" if item.is_surat_tilang == "Y" else "false",
        "no_ba_tilang": item.no_ba_tilang if item.no_ba_tilang else "",
        "petugas_id": str(item.petugas_id),
        "regu_id": str(item.regu_id),
        "shift_id": str(item.shift_id),
        "komoditi": str(item.komoditi_id),
        "kategori_komoditi_id": str(item.kategori_komoditi_id),
        "bptd_id": str(item.bptd_id),
        "dokumen": "13,14,15",
        "iact": "true",
        "foto_depan": "",
        "foto_belakang": "",
        "foto_kiri": "",
        "foto_kanan": "",
        "foto_depan_url": "",
        "foto_belakang_url": "",
        "foto_kiri_url": "",
        "foto_kanan_url": "",
        "foto_plate_no": "",
        "foto_plate_no_url": "",
        "plate_no_img_name": "",
        "plate_no_img_url": "",
    }

    multipart_fields = {}
    for key, value in payload.items():
        if value is not None:
            multipart_fields[key] = str(value)
    
    if getattr(item, 'foto_depan', None):
        path_depan = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'penimbangan', item.foto_depan)
        if os.path.exists(path_depan):
            multipart_fields['fotoDepan'] = ('foto_depan.jpg', open(path_depan, 'rb'), 'image/jpeg')
            print(f"✅ STREAMING: Gambar Foto Depan disiapkan -> {path_depan}")

    if getattr(item, 'foto_belakang', None):
        path_belakang = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'penimbangan', item.foto_belakang)
        if os.path.exists(path_belakang):
            multipart_fields['fotoBelakang'] = ('foto_belakang.jpg', open(path_belakang, 'rb'), 'image/jpeg')
            print(f"✅ STREAMING: Gambar Foto Belakang disiapkan -> {path_belakang}")

    m = MultipartEncoder(fields=multipart_fields)
    headers["Content-Type"] = m.content_type

    try:
        print("=========================================")
        print("PENGIRIMAN DATA PENIMBANGAN KENDARAAN:")
        print("=========================================")
        # print("PELANGGARAN : " + getattr(item, "pelanggaran_ids", "") or "")
        print(json.dumps(payload, indent=4, ensure_ascii=False))
        # return {"success": False, "data": {}}

        timeout=(5, 30)
        response = requests.post(end_point, data=m, headers=headers, timeout=timeout)

        print("\nRESPON DARI SERVER:")
        print("===================================")
        if response.status_code == 200:
            print("STATUS: SUCCESS")
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
            return {"success": True, "data": response.json()}
        else:
            print("STATUS: FAILED")
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}

def send_pelanggaran_to_pusat(row):
    lokasi = LokasiUppkb.objects.first()
    if not lokasi:
        return {"success": False, "message": "LOKASI BELUM DI SETTING"}

    end_point = lokasi.url_api_pusat + '/v2pv/pelanggaran/create'
    headers = {
        "Authorization": f"Bearer {lokasi.access_token_api_pusat}",
        "Content-Type": "application/json"
    }

    item = row
    payload = {
        'kode_trx' : str(item.kode_trx),
        'kode_uppkb' : str(item.kode_uppkb),
        'jenis_pelanggaran_id' : str(item.jenis_pelanggaran_id),
        'kode_pelanggaran' : str(item.kode_pelanggaran),
        'deskripsi' : str(item.deskripsi),
        'no_kendaraan' : str(item.no_kendaraan),
        'tgl_penimbangan' : str(item.tgl_penimbangan)
    }

    try:
        print("=========================================")
        print("PENGIRIMAN DATA PELANGGARAN :")
        print("=========================================")
        print(json.dumps(payload, indent=4, ensure_ascii=False))
        # return {"success": False, "data": {}}
        timeout=(5, 30)
        response = requests.post(end_point, json=payload, headers=headers, timeout=timeout)

        print("\nRESPON DARI SERVER:")
        print("===================================")
        if response.status_code == 200:
            print("STATUS: SUCCESS")
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
            return {"success": True, "data": response.json()}
        else:
            print("STATUS: FAILED")
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}
    
def send_penindakan_to_pusat(penindakan, penimbangan):
    def serialize_value(value):
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return value
    lokasi = LokasiUppkb.objects.first()
    if not lokasi:
        return {"success": False, "message": "LOKASI BELUM DI SETTING"}

    end_point = lokasi.url_api_pusat + '/v2pv/penindakan/create'
    headers = {
        "Authorization": f"Bearer {lokasi.access_token_api_pusat}",
        "Content-Type": "application/json"
    }

    payload = {
        # PENINDAKAN
        "nama_ppns": getattr(penindakan, "nama_ppns", "") or "",
        "kode_penindakan": getattr(penindakan, "kode_penindakan", "") or "",
        "sanksi_id": getattr(penindakan, "sanksi_id", "") or "",
        "no_skep": getattr(penindakan, "no_skep", "") or "",
        "tgl_sidang": serialize_value(getattr(penindakan, "tgl_sidang", "")),
        "pengadilan_id": getattr(penindakan, "pengadilan_id", "") or "",
        "gol_sim_id": getattr(penindakan, "gol_sim_id", "") or "",
        "identitas": getattr(penindakan, "nama_sim", "") or "-",
        "sim": getattr(penindakan, "nama_sim", "") or "-",
        "no_sim": getattr(penindakan, "no_sim", "") or "0",
        "jam_sidang": getattr(penindakan, "jam_sidang", "") or "-",
        "nama_pengemudi": getattr(penindakan, "nama_pengemudi", "") or "-",
        "alamat_pengemudi": getattr(penindakan, "alamat_pengemudi", "") or "-",
        "no_telp_pengemudi": getattr(penindakan, "no_telp_pengemudi", "") or "0",
        "jenis_kelamin": getattr(penindakan, "jenis_kelamin", "") or "",
        "warna_kendaraan": getattr(penindakan, "warna_kendaraan", "") or "-",
        "kejaksaan_id": getattr(penindakan, "kejaksaan_id", "") or "",
        "kategori_jenis_kendaraan": getattr(penindakan, "kategori_jenis_kendaraan", "") or "",
        "kategori_jenis_kendaraan_id": getattr(penindakan, "kategori_jenis_kendaraan_id", "") or "",
        "umur_pengemudi": getattr(penindakan, "umur_pengemudi", "") or "0",
        
        "sub_sanksi": list(map(int, penindakan.sanksi_tambahan.split(','))) if penindakan.sanksi_tambahan else "",  
        "pasal": penindakan.pasal.split(',') if penindakan.pasal else "",
        "sitaan": list(map(int, penindakan.sitaan.split(','))) if penindakan.sitaan else "",
        
        "kode_trx": getattr(penindakan, "kode_trx", "") or "",
        "no_kendaraan": getattr(penindakan, "no_kendaraan", "") or "",
        "kode_uppkb": getattr(penindakan, "kode_uppkb", "") or "",
        "asal_kota_id": getattr(penindakan, "asal_kota_id", "") or "",
        "tujuan_kota_id": getattr(penindakan, "tujuan_kota_id", "") or "",

        "shift_id": getattr(penimbangan, "shift_id", "") or "",
        "regu_id": getattr(penimbangan, "regu_id", "") or "",
        "petugas_id": getattr(penimbangan, "petugas_id", "") or "",
    }

    try:
        print("=========================================")
        print("PENGIRIMAN DATA PENINDAKAN :")
        print("=========================================")
        print(json.dumps(payload, indent=4, ensure_ascii=False))
        # return {"success": False, "data": {}}
        timeout=(5, 30)
        response = requests.post(end_point, json=payload, headers=headers, timeout=timeout)

        print("\nRESPON DARI SERVER:")
        print("===================================")
        if response.status_code == 200:
            print("STATUS: SUCCESS")
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
            return {"success": True, "data": response.json()}
        else:
            print("STATUS: FAILED")
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


def send_penimbangan_to_balai(row):
    def serialize_value(value):
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return value

    lokasi = LokasiUppkb.objects.first()
    if not lokasi:
        return {"success": False, "message": "LOKASI BELUM DI SETTING"}

    end_point = lokasi.url_portal + '/penimbangan/insert'
    headers = {
        "Content-Type": "application/json"
    }
    
    item = row
    payload = {
        "kode_trx": item.kode_trx,
        "is_transaksi": str(item.is_transaksi),
        "kode_uppkb": item.kode_uppkb,
        "timbangan_id": str(item.timbangan_id),
        "tgl_penimbangan": serialize_value(item.tgl_penimbangan),
        "no_kendaraan": item.no_kendaraan,
        "no_uji": item.no_uji,
        "tgl_uji": serialize_value(item.tgl_uji),
        "tgl_masa_berlaku": serialize_value(item.tgl_masa_berlaku),
        "nama_pemilik": item.nama_pemilik,
        "alamat_pemilik": item.alamat_pemilik,
        "asal_kota_id": str(item.asal_kota_id),
        "tujuan_kota_id": str(item.tujuan_kota_id),
        "toleransi_komoditi": str(item.toleransi_komoditi),
        "toleransi_uppkb": str(item.toleransi_uppkb),
        "berat_timbang": re.sub(r'\.0$', '', str(item.berat_timbang)),
        "jbi_uji": re.sub(r'\.0$', '', str(item.jbi_uji)),
        "kelebihan_berat": re.sub(r'\.0$', '', str(item.kelebihan_berat)),
        "prosen_lebih": str(item.prosen_lebih),
        "is_gandengan": "true" if item.is_gandengan else "false",
        "nama_pengemudi": item.nama_pengemudi or "",
        "alamat_pengemudi": item.alamat_pengemudi or "",
        "jenis_kendaraan_id": str(item.jenis_kendaraan_id),
        "gol_sim_id": "",
        "pelanggaran": getattr(item, "pelanggaran_ids", "") or "",
        "is_melanggar":  "1" if item.is_melanggar == "Y" else "0",
        "is_active": "1" if item.is_active == "Y" else "0",
        "gandengan_no_uji": "",
        "gandengan_tgl_uji": "",
        "gandengan_masa_berlaku": "",
        "gandengan_jbi_uji": "0",
        "gandengan_jbki": "0",
        "jbb_uji": re.sub(r'\.0$', '', str(item.jbb_uji)),
        "jbkb_uji": re.sub(r'\.0$', '', str(item.jbkb_uji)),
        "mst_uji": re.sub(r'\.0$', '', str(item.mst_uji)),
        "kategori_kepemilikan_id": str(item.kategori_kepemilikan_id),
        "jenis_kendaraan": item.jenis_kendaraan,
        "sumbu": str(item.sumbu),
        "sumbu_id": str(item.sumbu_id),
        "pemilik_komoditi": item.nama_pemilik,
        "alamat_pemilik_komoditi": item.alamat_pemilik,
        "no_sim": "",
        "tgl_antrian": serialize_value(item.tgl_antrian),
        "no_surat_jalan": str(item.no_surat_jalan),
        "panjang_utama": re.sub(r'\.0$', '', str(item.panjang_utama)),
        "panjang_toleransi": re.sub(r'\.0$', '', str(item.panjang_toleransi)),
        "panjang_ukur": re.sub(r'\.0$', '', str(item.panjang_ukur)),
        "panjang_lebih": re.sub(r'\.0$', '', str(item.panjang_lebih)),
        "lebar_utama": re.sub(r'\.0$', '', str(item.lebar_utama)),
        "lebar_toleransi": re.sub(r'\.0$', '', str(item.lebar_toleransi)),
        "lebar_ukur": re.sub(r'\.0$', '', str(item.lebar_ukur)),
        "lebar_lebih": re.sub(r'\.0$', '', str(item.lebar_lebih)),
        "tinggi_utama": re.sub(r'\.0$', '', str(item.tinggi_utama)),
        "tinggi_toleransi": re.sub(r'\.0$', '', str(item.tinggi_toleransi)),
        "tinggi_ukur": re.sub(r'\.0$', '', str(item.tinggi_ukur)),
        "tinggi_lebih": re.sub(r'\.0$', '', str(item.tinggi_lebih)),
        "foh_utama": re.sub(r'\.0$', '', str(item.foh_utama)),
        "foh_toleransi": re.sub(r'\.0$', '', str(item.foh_toleransi)),
        "foh_ukur": re.sub(r'\.0$', '', str(item.foh_ukur)),
        "foh_lebih": re.sub(r'\.0$', '', str(item.foh_lebih)),
        "roh_utama": re.sub(r'\.0$', '', str(item.roh_utama)),
        "roh_toleransi": re.sub(r'\.0$', '', str(item.roh_toleransi)),
        "roh_ukur": re.sub(r'\.0$', '', str(item.roh_ukur)),
        "roh_lebih": re.sub(r'\.0$', '', str(item.roh_lebih)),
        "asal_kode_kota": str(item.asal_kota_id),
        "tujuan_kode_kota": str(item.tujuan_kota_id),
        "device_id": str(item.device_id),
        "lokasi_id": str(lokasi.id),
        "umur_pengemudi": "",
        "is_surat_tilang": "true" if item.is_surat_tilang == "Y" else "false",
        "no_ba_tilang": item.no_ba_tilang if item.no_ba_tilang else "",
        "petugas_id": str(item.petugas_id),
        "regu_id": str(item.regu_id),
        "shift_id": str(item.shift_id),
        "komoditi_id": str(item.komoditi_id),
        "kategori_komoditi_id": str(item.kategori_komoditi_id),
        "bptd_id": str(item.bptd_id),
        "dokumen": "13,14,15",
        "iact": "true",
        "foto_depan": "",
        "foto_belakang": "",
        "foto_kiri": "",
        "foto_kanan": "",
        "foto_depan_url": "",
        "foto_belakang_url": "",
        "foto_kiri_url": "",
        "foto_kanan_url": "",
        "foto_plate_no": "",
        "foto_plate_no_url": "",
        "plate_no_img_name": "",
        "plate_no_img_url": "",
    }

    # bungkus payload ke dalam "data"
    final_payload = {
        "fidJt": lokasi.jt_id_portal,
        "clientId": lokasi.client_id_portal,
        "data": payload
    }

    try:
        print("=========================================")
        print("PENGIRIMAN DATA PENIMBANGAN KENDARAAN:")
        print("=========================================")
        print(json.dumps(final_payload, indent=4, ensure_ascii=False))
        return {"success": False, "data": {}}
    
        timeout = (5, 30)
        response = requests.post(end_point, json=final_payload, headers=headers, timeout=timeout)

        print("\nRESPON DARI SERVER:")
        print("===================================")
        if response.status_code == 200:
            print("STATUS: SUCCESS")
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
            return {"success": True, "data": response.json()}
        else:
            print("STATUS: FAILED")
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}
    
def send_penindakan_to_balai(penindakan, penimbangan):
    def serialize_value(value):
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return value
    lokasi = LokasiUppkb.objects.first()
    if not lokasi:
        return {"success": False, "message": "LOKASI BELUM DI SETTING"}

    end_point = lokasi.url_portal + '/penindakan/insert'
    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        # PENINDAKAN
        "nama_ppns": getattr(penindakan, "nama_ppns", "") or "",
        "kode_penindakan": getattr(penindakan, "kode_penindakan", "") or "",
        "sanksi_id": getattr(penindakan, "sanksi_id", "") or "",
        "no_skep": getattr(penindakan, "no_skep", "") or "",
        "tgl_sidang": serialize_value(getattr(penindakan, "tgl_sidang", "")),
        "pengadilan_id": getattr(penindakan, "pengadilan_id", "") or "",
        "gol_sim_id": getattr(penindakan, "gol_sim_id", "") or "",
        "identitas": getattr(penindakan, "nama_sim", "") or "-",
        "sim": getattr(penindakan, "nama_sim", "") or "-",
        "no_sim": getattr(penindakan, "no_sim", "") or "0",
        "jam_sidang": getattr(penindakan, "jam_sidang", "") or "-",
        "nama_pengemudi": getattr(penindakan, "nama_pengemudi", "") or "-",
        "alamat_pengemudi": getattr(penindakan, "alamat_pengemudi", "") or "-",
        "no_telp_pengemudi": getattr(penindakan, "no_telp_pengemudi", "") or "0",
        "jenis_kelamin": getattr(penindakan, "jenis_kelamin", "") or "",
        "warna_kendaraan": getattr(penindakan, "warna_kendaraan", "") or "-",
        "kejaksaan_id": getattr(penindakan, "kejaksaan_id", "") or "",
        "kategori_jenis_kendaraan": getattr(penindakan, "kategori_jenis_kendaraan", "") or "",
        "kategori_jenis_kendaraan_id": getattr(penindakan, "kategori_jenis_kendaraan_id", "") or "",
        "umur_pengemudi": getattr(penindakan, "umur_pengemudi", "") or "0",
        
        "sub_sanksi": list(map(int, penindakan.sanksi_tambahan.split(','))) if penindakan.sanksi_tambahan else "",  
        "pasal": penindakan.pasal.split(',') if penindakan.pasal else "",
        "sitaan": list(map(int, penindakan.sitaan.split(','))) if penindakan.sitaan else "",
        
        "kode_trx": getattr(penindakan, "kode_trx", "") or "",
        "no_kendaraan": getattr(penindakan, "no_kendaraan", "") or "",
        "kode_uppkb": getattr(penindakan, "kode_uppkb", "") or "",
        "asal_kota_id": getattr(penindakan, "asal_kota_id", "") or "",
        "tujuan_kota_id": getattr(penindakan, "tujuan_kota_id", "") or "",

        "shift_id": getattr(penimbangan, "shift_id", "") or "",
        "regu_id": getattr(penimbangan, "regu_id", "") or "",
        "petugas_id": getattr(penimbangan, "petugas_id", "") or "",
    }
    final_payload = {
        "fidJt": lokasi.jt_id_portal,
        "clientId": lokasi.client_id_portal,
        "data": payload
    }
    try:
        print("=========================================")
        print("PENGIRIMAN DATA PENINDAKAN BALAI:")
        print("=========================================")
        print(json.dumps(payload, indent=4, ensure_ascii=False))
        return {"success": False, "data": {}}
        timeout=(5, 30)
        response = requests.post(end_point, json=payload, headers=headers, timeout=timeout)

        print("\nRESPON DARI SERVER:")
        print("===================================")
        if response.status_code == 200:
            print("STATUS: SUCCESS")
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
            return {"success": True, "data": response.json()}
        else:
            print("STATUS: FAILED")
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}
