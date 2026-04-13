import os, cv2, bcrypt, base64, time, pytz, qrcode, io, socket, serial, threading, asyncio
from datetime import datetime, time
from channels.layers import get_channel_layer
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.conf import settings
from app.models import DataPenimbangan, MasterKendaraan, LokasiUppkb, DataPelanggaran, MasterJenisPelanggaran, MasterKomoditi, MasterSumbu, MasterJenisKendaraan, DataKotaKab, MasterTimbangan, KomoditiAsalTujuanPengemudi, MasterRegu, LprBlue, SensorDimensi, KendaraanBodong
from django.utils import timezone
from django.db.models import Q
from django.utils.text import slugify
from .utils import json_response, get_device_ip, generate_kode_trx, convert_timezone, play_combined_voices, generate_voice, convertMp3, generate_kode_trx_bodong
from .common import save_kendaraan, save_komoditi_asaltujuan_pengemudi
from escpos.printer import Network
from escpos.image import Image
import requests
from django.templatetags.static import static
from io import BytesIO
import uuid
from gtts import gTTS
from django.http import FileResponse
from django.db import transaction
from requests.auth import HTTPDigestAuth

def index(request):
    lokasi = LokasiUppkb.objects.first()
    timbangan = MasterTimbangan.objects.filter(id=request.COOKIES.get('timbangan_id')).first()
    regu = MasterRegu.objects.filter(id=request.COOKIES.get('regu_id')).first()

    context = {
        'title': 'Penimbangan Kendaraan',
        'app_name': lokasi.nama,
        'row' :{
            'toleransi_berat': lokasi.toleransi_berat,
            'toleransi_panjang': lokasi.toleransi_panjang,
            'toleransi_lebar': lokasi.toleransi_lebar,
            'toleransi_tinggi': lokasi.toleransi_tinggi,
            'ws_alat': timbangan.ws_alat if timbangan else "ws://127.0.0.1:8300",
            'timbangan_name': timbangan.nama if timbangan else "",
            'regu_name': regu.nama if regu else "",
            'is_lpr': timbangan.is_lpr,
            'is_auto_lpr': timbangan.is_auto_lpr,
            'is_rfid': timbangan.is_rfid,
            'cam_depan_ws': timbangan.cam_depan_ws,
            'cam_belakang_ws': timbangan.cam_belakang_ws,
            'cam_lpr_ws': timbangan.cam_lpr_ws,
        }
    }
    if timbangan.is_ip_access_timbang == 'Y':
        if timbangan.ip_timbang_allowed == get_device_ip(request):
            return render(request, 'backend/penimbangan_kendaraan.html', context)
        return HttpResponse('FITUR INI HANYA BISA DIAKSES OLEH PC PENIMBANGAN')
    return render(request, 'backend/penimbangan_kendaraan.html', context)

def show(request):
    lokasi = LokasiUppkb.objects.first()
    try:
        if 'is_check_noken' in request.GET:
            no_kendaraan = request.GET.get('no_kendaraan')
            kendaraan = MasterKendaraan.objects.filter(no_reg_kend=no_kendaraan).first()
            if not kendaraan :
                end_point = settings.APP_API_JTO_KEMENHUB + f'/v2pb/jto/kendaraan/ujiberkala?nokend={no_kendaraan}'
                response = requests.get(end_point, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get('success'):
                    kendaraan = data.get('data', {})

                    def get(val, default=None):
                        return kendaraan.get(val, default)

                    def get_date(val):
                        return get(val).split("T")[0] if get(val) else None
                    
                    row = {
                        "id": get("id"),
                        "no_reg_kend": get("no_reg_kend"),
                        "no_uji": get("no_uji"),
                        "nama_pemilik": get("nama_pemilik"),
                        "alamat_pemilik": get("alamat_pemilik"),
                        "lokasi_uji": get("lokasi_uji"),
                        "tanggal_uji": get("tanggal_uji"),
                        "masa_berlaku_uji": get("masa_berlaku_uji"),
                        "jenis_kend": get("jenis_kend"),
                        "konfigurasi_sumbu": get("konfigurasi_sumbu"),
                        "berat_kosong": get("berat_kosong", 0),
                        "jbb": get("jbb", 0),
                        "jbkb": get("jbkb", 0),
                        "jbi": get("jbi", 0),
                        "jbki": get("jbki", 0),
                        "panjang_utama": get("panjang_utama"),
                        "lebar_utama": get("lebar_utama"),
                        "tinggi_utama": get("tinggi_utama"),
                        "julur_depan": get("julur_depan", 0),
                        "julur_belakang": get("julur_belakang", 0),
                        "foto_depan": get("foto_depan", "undefined"),
                        "foto_kanan": get("foto_kanan", "undefined"),
                        "foto_kiri": get("foto_kiri", "undefined"),
                        "nomor_rangka": get("nomor_rangka", ""),
                        "merek": get("merek", ""),
                        "bahan_bakar": get("bahan_bakar", ""),
                        "daya_angkut_orang": get("daya_angkut_orang", ""),
                        "daya_angkut_barang": get("daya_angkut_barang", ""),
                        "kelas": get("kelas", ""),
                        "created_at": get("created_at"),
                        "updated_at": get("updated_at"),
                        "jenis_kendaraan_id": get("jenis_kendaraan_id"),
                        "sumbu_id": get("sumbu_id"),
                        "no_srut": get("no_srut", ""),
                        "tgl_srut": get("tgl_srut"),
                        "no_mesin": get("no_mesin", ""),
                        "tipe": get("tipe", ""),
                        "tahun_rakit": get("tahun_rakit", ""),
                        "isi_silinder": get("isi_silinder", ""),
                        "daya_motor": get("daya_motor", ""),
                        "ukuran_ban": get("ukuran_ban", ""),
                        "keterangan_hasil_uji": get("keterangan_hasil_uji", ""),
                        "petugas_penguji": get("petugas_penguji", ""),
                        "nrp_petugas_penguji": get("nrp_petugas_penguji", ""),
                        "kepala_dinas": get("kepala_dinas", ""),
                        "pangkat_kepala_dinas": get("pangkat_kepala_dinas", ""),
                        "nip_kepala_dinas": get("nip_kepala_dinas", ""),
                        "unit_pelaksana_teknis": get("unit_pelaksana_teknis", ""),
                        "direktur": get("direktur", ""),
                        "pangkat_direktur": get("pangkat_direktur", ""),
                        "nip_direktur": get("nip_direktur", ""),
                        "etl_date": get("etl_date"),
                        "jarak_sumbu_1_2": get("jarak_sumbu_1_2", ""),
                        "jarak_sumbu_2_3": get("jarak_sumbu_2_3", ""),
                        "foto_depan_url": data.get("foto_depan_url") or static('dist/img/default-img.png'),
                        "foto_belakang_url":  data.get("foto_belakang_url") or static('dist/img/default-img.png'),
                        "foto_kanan_url":  data.get("foto_kanan_url") or static('dist/img/default-img.png'),
                        "foto_kiri_url":  data.get("foto_kiri_url") or static('dist/img/default-img.png'),
                        "jarak_sumbu_3_4": get("jarak_sumbu_3_4", ""),
                        "dimensi_bak_tangki": get("dimensi_bak_tangki", ""),
                        "mst": get("mst", 0),
                        "kepemilikan_id": get("kepemilikan_id", 0),
                        "kepemilikan_val": get("kepemilikan_val", ""),
                        "sync_to_pusat": get("sync_to_pusat", False),
                        "sync_from_pusat": get("sync_from_pusat", False),
                        "is_blue": get("is_blue", 1),
                        "rfid": get("rfid", ""),
                        "vcode": get("vcode", ""),
                        "toleransi_berat": lokasi.toleransi_berat or 0,
                        "toleransi_panjang": lokasi.toleransi_panjang or 0,
                        "toleransi_tinggi": lokasi.toleransi_tinggi or 0,
                        "toleransi_lebar": lokasi.toleransi_lebar or 0,
                    }

                    return json_response(status=True, message='Kendaraan ditemukan!', data=row)
                else:
                    return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={
                        'error_code':'noken_not_available'
                    })
            if kendaraan:
                get_komoditi = KomoditiAsalTujuanPengemudi.objects.filter(no_kendaraan=no_kendaraan).first()
                if get_komoditi:
                    # ==============================
                    # KOMODITI, ASAL, TUJUAN
                    # ==============================
                    komoditi = MasterKomoditi.objects.filter(id=get_komoditi.komoditi_id).select_related('kategori_komoditi').first()
                    if not komoditi:
                        return json_response(status=False, message="Komoditi tidak ditemukan", code=400)
                    asal_kota = DataKotaKab.objects.filter(id=get_komoditi.asal_kota_id).first()
                    if not asal_kota:
                        return json_response(status=False, message="Asal kota tidak ditemukan", code=400)
                    tujuan_kota = DataKotaKab.objects.filter(id=get_komoditi.tujuan_kota_id).first()
                    if not tujuan_kota:
                        return json_response(status=False, message="Tujuan kota tidak ditemukan", code=400)
                        
                    data_komoditi = {
                        'id': get_komoditi.id,
                        'no_kendaraan': get_komoditi.no_kendaraan,
                        'komoditi_id': get_komoditi.komoditi_id,
                        'komoditi_val': komoditi.nama,
                        'kategori_komoditi_id': get_komoditi.kategori_komoditi_id,
                        'asal_kota_id': get_komoditi.asal_kota_id,
                        'asal_kota_val': asal_kota.nama,
                        'tujuan_kota_id': get_komoditi.tujuan_kota_id,
                        'tujuan_kota_val': tujuan_kota.nama,
                        'no_surat_jalan': get_komoditi.no_surat_jalan,
                        'pemilik_komoditi': get_komoditi.pemilik_komoditi,
                        'alamat_pemilik_komoditi': get_komoditi.alamat_pemilik_komoditi,
                        
                        'nama_pengemudi': get_komoditi.nama_pengemudi,
                        'alamat_pengemudi': get_komoditi.alamat_pengemudi,
                        'jenis_kelamin': get_komoditi.jenis_kelamin,
                        'umur_pengemudi': get_komoditi.umur_pengemudi,
                        'no_telepon': get_komoditi.no_telepon,
                        'warna_kendaraan': get_komoditi.warna_kendaraan,
                        'gol_sim_id': get_komoditi.gol_sim_id,
                        'no_sim': get_komoditi.no_sim,
                    }
                else:
                    data_komoditi = None
                row = {
                    "id": kendaraan.id,
                    "no_reg_kend": kendaraan.no_reg_kend,
                    "no_uji": kendaraan.no_uji,
                    "nama_pemilik": kendaraan.nama_pemilik,
                    "alamat_pemilik": kendaraan.alamat_pemilik,
                    "lokasi_uji": kendaraan.lokasi_uji,
                    "tanggal_uji": kendaraan.tanggal_uji,
                    "masa_berlaku_uji": kendaraan.masa_berlaku_uji,
                    "jenis_kend": kendaraan.jenis_kend,
                    "konfigurasi_sumbu": kendaraan.konfigurasi_sumbu,
                    "berat_kosong": kendaraan.berat_kosong or 0,
                    "jbb": kendaraan.jbb or 0,
                    "jbkb": kendaraan.jbkb or 0,
                    "jbi": kendaraan.jbi or 0,
                    "jbki": kendaraan.jbki or 0,
                    "panjang_utama": kendaraan.panjang_utama,
                    "lebar_utama": kendaraan.lebar_utama,
                    "tinggi_utama": kendaraan.tinggi_utama,
                    "julur_depan": kendaraan.julur_depan or 0,
                    "julur_belakang": kendaraan.julur_belakang or 0,
                    "foto_depan": kendaraan.foto_depan or "undefined",
                    "foto_kanan": kendaraan.foto_kanan or "undefined",
                    "foto_kiri": kendaraan.foto_kiri or "undefined",
                    "nomor_rangka": kendaraan.nomor_rangka or "",
                    "merek": kendaraan.merek or "",
                    "bahan_bakar": kendaraan.bahan_bakar or "",
                    "daya_angkut_orang": kendaraan.daya_angkut_orang or "",
                    "daya_angkut_barang": kendaraan.daya_angkut_barang or "",
                    "kelas": kendaraan.kelas or "",
                    "created_at": kendaraan.created_at,
                    "updated_at": kendaraan.updated_at,
                    "jenis_kendaraan_id": kendaraan.jenis_kendaraan_id,
                    "sumbu_id": kendaraan.sumbu_id,
                    "no_srut": kendaraan.no_srut or "",
                    "tgl_srut": kendaraan.tgl_srut,
                    "no_mesin": kendaraan.no_mesin or "",
                    "tipe": kendaraan.tipe or "",
                    "tahun_rakit": kendaraan.tahun_rakit or "",
                    "isi_silinder": kendaraan.isi_silinder or "",
                    "daya_motor": kendaraan.daya_motor or "",
                    "ukuran_ban": kendaraan.ukuran_ban or "",
                    "keterangan_hasil_uji": kendaraan.keterangan_hasil_uji or "",
                    "petugas_penguji": kendaraan.petugas_penguji or "",
                    "nrp_petugas_penguji": kendaraan.nrp_petugas_penguji or "",
                    "kepala_dinas": kendaraan.kepala_dinas or "",
                    "pangkat_kepala_dinas": kendaraan.pangkat_kepala_dinas or "",
                    "nip_kepala_dinas": kendaraan.nip_kepala_dinas or "",
                    "unit_pelaksana_teknis": kendaraan.unit_pelaksana_teknis or "",
                    "direktur": kendaraan.direktur or "",
                    "pangkat_direktur": kendaraan.pangkat_direktur or "",
                    "nip_direktur": kendaraan.nip_direktur or "",
                    "etl_date": kendaraan.etl_date,
                    "jarak_sumbu_1_2": kendaraan.jarak_sumbu_1_2 or "",
                    "jarak_sumbu_2_3": kendaraan.jarak_sumbu_2_3 or "",
                    "foto_depan_url": kendaraan.foto_depan_url or static('dist/img/default-img.png'),
                    "foto_belakang_url": kendaraan.foto_belakang_url or static('dist/img/default-img.png'),
                    "foto_kanan_url": kendaraan.foto_kanan_url or static('dist/img/default-img.png'),
                    "foto_kiri_url": kendaraan.foto_kiri_url or static('dist/img/default-img.png'),
                    "jarak_sumbu_3_4": kendaraan.jarak_sumbu_3_4 or "",
                    "dimensi_bak_tangki": kendaraan.dimensi_bak_tangki or "",
                    "mst": kendaraan.mst or 0,
                    "kepemilikan_id": kendaraan.kepemilikan_id or 0,
                    "kepemilikan_val": kendaraan.kepemilikan_val or "",
                    "sync_to_pusat": kendaraan.sync_to_pusat or False,
                    "sync_from_pusat": kendaraan.sync_from_pusat or False,
                    "is_blue": kendaraan.is_blue or 1,
                    "rfid": kendaraan.rfid or "",
                    "vcode": kendaraan.vcode or "",
                    "toleransi_berat": lokasi.toleransi_berat or 0,
                    "toleransi_panjang": lokasi.toleransi_panjang or 0,
                    "toleransi_tinggi": lokasi.toleransi_tinggi or 0,
                    "toleransi_lebar": lokasi.toleransi_lebar or 0,
                    "get_komoditi": data_komoditi
                }
                return json_response(status=True, message='Kendaraan ditemukan!', data=row)
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={
                    'error_code':'noken_not_available'
                })
        if 'is_check_noken_bodong' in request.GET:
            no_kendaraan = request.GET.get('no_kendaraan_bd', '').strip()

            queryset = KendaraanBodong.objects.filter(
                no_kendaraan=no_kendaraan
            ).order_by('-tgl_penimbangan')

            timezone_user = request.COOKIES.get('timezone')

            kendaraan_list = []

            for r in queryset:
                tgl_penimbangan = convert_timezone(r.tgl_penimbangan, request.COOKIES.get('timezone'))
                tanggal_timbang =  tgl_penimbangan.strftime('%d/%m/%Y');
                jam_timbang = tgl_penimbangan.strftime('%H:%M:%S');
                kendaraan_list.append({
                    'id': str(r.id),
                    'kode_trx': r.kode_trx,
                    'no_kendaraan': r.no_kendaraan,
                    'berat_timbang': r.berat_timbang,
                    'panjang_ukur': r.panjang_ukur,
                    'lebar_ukur': r.lebar_ukur,
                    'tinggi_ukur': r.tinggi_ukur,
                    'komoditi': r.komoditi,
                    'asal_kota': r.asal_kota,
                    'tujuan_kota': r.tujuan_kota,
                    "tgl_penimbangan": tanggal_timbang+' '+jam_timbang,
                })

            # ===== RESPONSE =====
            if kendaraan_list:
                return json_response(
                    status=True,
                    message='Data kendaraan bodong ditemukan',
                    data={
                        'is_found': True,
                        'kendaraan': kendaraan_list
                    },
                    code=200
                )
            else:
                return json_response(
                    status=True,
                    message='Data kendaraan bodong tidak ditemukan',
                    data={
                        'is_found': False,
                        'kendaraan': []
                    },
                    code=200
                )   
        if 'is_select_antrian' in request.GET:
            kendaraan_id = request.GET.get('kendaraan_id')
            kendaraan = DataPenimbangan.objects.filter(id=kendaraan_id).first()
            if kendaraan :
                get_komoditi = KomoditiAsalTujuanPengemudi.objects.filter(no_kendaraan=kendaraan.no_kendaraan).first()
                if get_komoditi:
                    # ==============================
                    # KOMODITI, ASAL, TUJUAN
                    # ==============================
                    komoditi = MasterKomoditi.objects.filter(id=get_komoditi.komoditi_id).select_related('kategori_komoditi').first()
                    if not komoditi:
                        return json_response(status=False, message="Komoditi tidak ditemukan", code=400)
                    asal_kota = DataKotaKab.objects.filter(id=get_komoditi.asal_kota_id).first()
                    if not asal_kota:
                        return json_response(status=False, message="Asal kota tidak ditemukan", code=400)
                    tujuan_kota = DataKotaKab.objects.filter(id=get_komoditi.tujuan_kota_id).first()
                    if not tujuan_kota:
                        return json_response(status=False, message="Tujuan kota tidak ditemukan", code=400)
                        
                    data_komoditi = {
                        'id': get_komoditi.id,
                        'no_kendaraan': get_komoditi.no_kendaraan,
                        'komoditi_id': get_komoditi.komoditi_id,
                        'komoditi_val': komoditi.nama,
                        'kategori_komoditi_id': get_komoditi.kategori_komoditi_id,
                        'asal_kota_id': get_komoditi.asal_kota_id,
                        'asal_kota_val': asal_kota.nama,
                        'tujuan_kota_id': get_komoditi.tujuan_kota_id,
                        'tujuan_kota_val': tujuan_kota.nama,
                        'no_surat_jalan': get_komoditi.no_surat_jalan,
                        'pemilik_komoditi': get_komoditi.pemilik_komoditi,
                        'alamat_pemilik_komoditi': get_komoditi.alamat_pemilik_komoditi,
                        
                        'nama_pengemudi': get_komoditi.nama_pengemudi,
                        'alamat_pengemudi': get_komoditi.alamat_pengemudi,
                        'jenis_kelamin': get_komoditi.jenis_kelamin,
                        'umur_pengemudi': get_komoditi.umur_pengemudi,
                        'no_telepon': get_komoditi.no_telepon,
                        'warna_kendaraan': get_komoditi.warna_kendaraan,
                        'gol_sim_id': get_komoditi.gol_sim_id,
                        'no_sim': get_komoditi.no_sim,
                    }
                else:
                    data_komoditi = None
                # ==============================
                # GET PELANGGARAN
                # ==============================
                pelanggaran = []
                if kendaraan.is_melanggar == 'Y':
                    getPelanggaran = DataPelanggaran.objects.filter(kode_trx=kendaraan.kode_trx).select_related('jenis_pelanggaran').all()
                    for row in getPelanggaran:
                        pelanggaran.append({
                            'id' : row.jenis_pelanggaran_id,
                            'name' : row.jenis_pelanggaran.nama,
                        })
                row = {
                    "id": kendaraan.id,
                    "no_reg_kend": kendaraan.no_kendaraan,
                    "no_uji": kendaraan.no_uji,
                    "nama_pemilik": kendaraan.nama_pemilik,
                    "alamat_pemilik": kendaraan.alamat_pemilik,
                    "tanggal_uji": kendaraan.tgl_uji,
                    "masa_berlaku_uji": kendaraan.tgl_masa_berlaku,
                    "jenis_kendaraan_id": kendaraan.jenis_kendaraan_id,
                    "jenis_kend": kendaraan.jenis_kendaraan,
                    "sumbu_id": kendaraan.sumbu_id,
                    "konfigurasi_sumbu": kendaraan.sumbu,
                    "jbb": kendaraan.jbb_uji,
                    "jbkb": kendaraan.jbkb_uji,
                    "jbi": kendaraan.jbi_uji,
                    "mst": kendaraan.mst_uji,
                    "panjang_utama": kendaraan.panjang_utama,
                    "lebar_utama": kendaraan.lebar_utama,
                    "tinggi_utama": kendaraan.tinggi_utama,
                    "julur_depan": kendaraan.foh_utama,
                    "julur_belakang": kendaraan.roh_utama,
                    "kepemilikan_id": kendaraan.kategori_kepemilikan_id,
                    "kepemilikan_val": kendaraan.kategori_kepemilikan_id,
                    "is_gandengan": kendaraan.is_gandengan,
                    "is_surat_tilang": kendaraan.is_surat_tilang,
                    "no_ba_tilang": kendaraan.no_ba_tilang,
                    # KOMODITI & ASAL TUJUAN
                    "get_komoditi": data_komoditi,
                    "pelanggaran": pelanggaran,
                    # TOLERANSI
                    "toleransi_berat": lokasi.toleransi_berat or 0,
                    "toleransi_panjang": lokasi.toleransi_panjang or 0,
                    "toleransi_tinggi": lokasi.toleransi_tinggi or 0,
                    "toleransi_lebar": lokasi.toleransi_lebar or 0,
                }
                return json_response(status=True, message='Kendaraan ditemukan!', data=row)
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={
                    'error_code':'noken_not_available'
                })
        if 'is_show_printer' in request.GET:
            idp_penimbangan = request.GET.get('idp_penimbangan')
            penimbangan = DataPenimbangan.objects.filter(id=idp_penimbangan).first()

            # STATUS PELANGGARAN
            status_melanggar = 'TIDAK MELANGGAR'
            if penimbangan:
                pelanggaran_qs = DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx)
                if pelanggaran_qs.count() > 0 :
                    status_melanggar = 'MELANGGAR ' 
                    for pel in pelanggaran_qs:
                        try:
                            jenis_pelanggaran = MasterJenisPelanggaran.objects.get(id=int(pel.jenis_pelanggaran_id))
                        except MasterJenisPelanggaran.DoesNotExist:
                            continue
                        status_melanggar += jenis_pelanggaran.nama + ', '  

                # ==============================
                # KOMODITI, ASAL, TUJUAN
                # ==============================
                komoditi = MasterKomoditi.objects.filter(id=penimbangan.komoditi_id).select_related('kategori_komoditi').first()
                if not komoditi:
                    return json_response(status=False, message="Komoditi tidak ditemukan", code=400)
                asal_kota = DataKotaKab.objects.filter(id=penimbangan.asal_kota_id).first()
                if not asal_kota:
                    return json_response(status=False, message="Asal kota tidak ditemukan", code=400)
                tujuan_kota = DataKotaKab.objects.filter(id=penimbangan.tujuan_kota_id).first()
                if not tujuan_kota:
                    return json_response(status=False, message="Tujuan kota tidak ditemukan", code=400)
                tgl_penimbangan = convert_timezone(penimbangan.tgl_penimbangan, request.COOKIES.get('timezone'))
                row = {
                    'id_penimbangan': penimbangan.id,
                    'kode_trx': penimbangan.kode_trx,
                    'noken': penimbangan.no_kendaraan,
                    'nouji': penimbangan.no_uji,
                    'masa_akhir_uji': penimbangan.tgl_masa_berlaku.strftime('%d/%m/%Y'),
                    'tanggal_timbang': tgl_penimbangan.strftime('%d/%m/%Y'),
                    'jam_timbang': tgl_penimbangan.strftime('%H:%M:%S'),
                    'jbi': penimbangan.jbi_uji,
                    'berat_timbangan': penimbangan.berat_timbang,
                    'kelebihan_berat': penimbangan.kelebihan_berat,
                    'persentase_kelebihan_berat': penimbangan.prosen_lebih,
                    'asal_kendaraan': asal_kota.nama,
                    'tujuan_kendaraan': tujuan_kota.nama,
                    'komoditi': komoditi.nama,
                    'status_melanggar': status_melanggar,
                    'nama_jt' : lokasi.nama.upper()
                }
                return json_response(status=True, message='Success', data=row)
            else:
                return json_response(status=False, message='Credentials errors')
        if 'is_antrian_data' in request.GET:
            # Params datatables
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search = request.GET.get('search[value]', '').strip()

            query = DataPenimbangan.objects.order_by('id').filter(is_transaksi=0)
            if search:
                query = query.filter(
                    Q(no_kendaraan__icontains=search) |
                    Q(no_uji__icontains=search)
                )
                
            getRow = query.all()
            total_record = query.count()
            paginated_record = getRow[start:start+length]
            data = []

            for index, kendaraan in enumerate(paginated_record, start=start + 1):
                action = f'''
                    <button type="button" class="btn btn-sm btn-primary mb-1 ms-1" onclick="pilihKendaraan('{kendaraan.id}');">Pilih Kendaraan</button>
                '''
                no_kendaraan = f'<span class="badge badge-outline badge-primary fs-3">{kendaraan.no_kendaraan}</span>'

                hari_ini = datetime.now().date()
                tgl = kendaraan.tgl_uji

                if isinstance(tgl, datetime):
                    tgl = tgl.date()

                statusUjiKendaraan = '<span class="badge badge-danger fs-5">MATI UJI</span>' if tgl < hari_ini else '<span class="badge badge-success fs-5">AKTIF UJI</span>'
                
                data.append({
                    'no': f"{index:,}" if index else '-',
                    'no_kendaraan': no_kendaraan,
                    'dokumen': statusUjiKendaraan,
                    'no_uji': kendaraan.no_uji.upper(),
                    'pemilik': kendaraan.nama_pemilik,
                    'action': action,
                })

            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': getRow.count(),
                'data': data
            })
        if 'is_check_count_antrian' in request.GET:
            count = DataPenimbangan.objects.filter(is_transaksi=0).count()
            return json_response(status=True, message='Success', data=count)
        if 'is_load_lpr' in request.GET:
            timbangan_id = int(request.COOKIES.get('timbangan_id', 0))
            time_zone = int(request.COOKIES.get('timezone', 8))
            
            kendaraan_found = (
                LprBlue.objects
                .filter(timbangan_id=timbangan_id, is_found='Y')
                .order_by('-id')
                .values()[:6]  # ambil semua kolom, otomatis jadi dict
            )

            kendaraan_not_found = (
                LprBlue.objects
                .filter(timbangan_id=timbangan_id, is_found='N')
                .order_by('-id')
                .values()[:6]
            )

            data = {
                'is_found': list(kendaraan_found),
                'is_not_found': list(kendaraan_not_found),
            }

            return json_response(
                status=True,
                message='Kendaraan ditemukan!',
                data=data
            )
        if 'is_load_history' in request.GET:
            no_kendaraan = request.GET.get('no_kendaraan', '').strip()
            query = DataPenimbangan.objects.filter(
                no_kendaraan=no_kendaraan
            ).order_by('-tgl_penimbangan')

            getRow = list(query.values())

            query = (
                DataPenimbangan.objects
                .filter(no_kendaraan=no_kendaraan)
                .order_by('-tgl_penimbangan')
            )

            getRow = []
            for r in query:
                komoditi = (
                    MasterKomoditi.objects
                    .filter(id=r.komoditi_id)
                    .select_related('kategori_komoditi')
                    .first()
                )

                asal_kota = DataKotaKab.objects.filter(id=r.asal_kota_id).first()
                tujuan_kota = DataKotaKab.objects.filter(id=r.tujuan_kota_id).first()
                tgl_penimbangan = convert_timezone(r.tgl_penimbangan, request.COOKIES.get('timezone'))
                tanggal_timbang =  tgl_penimbangan.strftime('%d/%m/%Y');
                jam_timbang = tgl_penimbangan.strftime('%H:%M:%S');

                # ==============================
                # GET PELANGGARAN
                # ==============================
                pelanggaran = []
                if r.is_melanggar == 'Y':
                    getPelanggaran = DataPelanggaran.objects.filter(kode_trx=r.kode_trx).select_related('jenis_pelanggaran').all()
                    for row in getPelanggaran:
                        pelanggaran.append({
                            'id' : row.jenis_pelanggaran_id,
                            'name' : row.jenis_pelanggaran.nama,
                        })
                getRow.append({
                    "id": r.id,
                    "no_kendaraan": r.no_kendaraan,
                    "is_melanggar": r.is_melanggar,
                    "pelanggaran": pelanggaran,
                    "tgl_penimbangan": tanggal_timbang+' '+jam_timbang,

                    # ASAL
                    "asal_kota_id": asal_kota.id if asal_kota else "-",
                    "asal_kendaraan": asal_kota.nama if asal_kota else "-",

                    # TUJUAN
                    "tujuan_kota_id": tujuan_kota.id if tujuan_kota else "-",
                    "tujuan_kendaraan": tujuan_kota.nama if tujuan_kota else "-",

                    # KOMODITI
                    "komoditi_id": komoditi.id if komoditi else "-",
                    "komoditi": komoditi.nama if komoditi else "-",

                    # DATA LAIN
                    "pemilik_komoditi": r.pemilik_komoditi or "-",
                    "alamat_pemilik_komoditi": r.alamat_pemilik_komoditi or "-",
                    "no_surat_jalan": r.no_surat_jalan or "-",
                })
                
            # CEK DATA
            if getRow:
                return json_response(
                    status=True,
                    message='Kendaraan ditemukan!',
                    data=getRow
                )
            else:
                data = {
                    'status_data': False,
                    'kendaraan': []
                }
                return json_response(
                    status=False,
                    message='Data kendaraan tidak ada',
                    data=[]
                )
        if 'is_load_lpr_realtime' in request.GET:
            timbangan_id = int(request.COOKIES.get('timbangan_id', 0))
            obj = (
                LprBlue.objects
                .filter(timbangan_id=timbangan_id)
                .order_by('-id')
                .values('id', 'no_reg_kend', 'is_found', 'jbi', 'jenis_kend', 'masa_berlaku_uji')   
                .first()                        
            )

            return json_response(
                status=True,
                message='Kendaraan ditemukan!',
                data=obj
            )
        if 'is_load_dimention' in request.GET:
            timbangan_id = int(request.COOKIES.get('timbangan_id', 0))

            dimensi = SensorDimensi.objects.filter(timbangan_id=timbangan_id).first()
            if not dimensi:
                return json_response(status=False, message="Dimensi tidak ditemukan", code=400)
            
            row = {
                'p': dimensi.panjang,
                'l': dimensi.lebar,
                't': dimensi.tinggi,
            }
            return json_response(status=True, message='Success', data=row)
        else:
            current_time = datetime.now()
            timbangan_id = request.COOKIES.get('timbangan_id')
            timbangan = MasterTimbangan.objects.filter(id=timbangan_id).first()
            # Params datatables
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 5))
            search = request.GET.get('search[value]', '').strip()
            
            # Ambil waktu lokal sekarang (WITA)
            now_local = timezone.localtime(timezone.now())
            date_today = now_local.date()

            # Gabungkan dengan time min/max
            start_datetime = timezone.make_aware(datetime.combine(date_today, time.min), timezone.get_current_timezone())
            end_datetime = timezone.make_aware(datetime.combine(date_today, time.max), timezone.get_current_timezone())

            query = DataPenimbangan.objects.filter(
                is_transaksi=1,
                timbangan_id=timbangan_id,
                tgl_penimbangan__range=(start_datetime, end_datetime)
            ).order_by('-tgl_penimbangan')
            if search:
                query = query.filter(
                    Q(no_kendaraan__icontains=search) |
                    Q(no_uji__icontains=search) |
                    Q(nama_pemilik__icontains=search)
                )
                
            getRow = query.all()
            total_record = query.count()
            paginated_record = getRow[start:start+length]
            data = []

            for index, penimbangan in enumerate(paginated_record, start=start + 1):
                statusCustom = '<span class="badge badge-success fs-7">TIDAK MELANGGAR</span>' if penimbangan.is_melanggar == 'N' else '<span class="badge badge-danger fs-7">MELANGGAR</span>'
                action = ''
                if timbangan.is_print_struk == "Y":
                    action = f'''
                        <button type="button" class="btn btn-icon btn-circle btn-sm btn-dark mb-1 ms-1" data-bs-toggle="tooltip" title="Cetak Struk!" onclick="_printStruk('Y', '{penimbangan.id}');"><i class="ki-solid ki-printer fs-4"></i></button>
                    '''
                
                if penimbangan.is_melanggar == 'Y' and penimbangan.is_tindakan == 'N' and penimbangan.is_send_to_pusat == 'N':
                    action += f'''
                        <button type="button" class="btn btn-icon btn-circle btn-sm btn-danger mb-1 ms-1" data-bs-toggle="tooltip" title="Hapus data!" onclick="_deleteData('{penimbangan.id}');"><i class="las la-trash fs-3"></i></button>
                    '''

                tgl_penimbangan = convert_timezone(penimbangan.tgl_penimbangan, request.COOKIES.get('timezone'))
                data.append({
                    'no': f"{index:,}" if index else '-',
                    'no_kendaraan': penimbangan.no_kendaraan,
                    'no_uji': penimbangan.no_uji,
                    'waktu': tgl_penimbangan.strftime('%H:%M'),
                    'nama_pemilik': penimbangan.nama_pemilik,
                    'jbi_uji': penimbangan.jbi_uji,
                    'berat_timbang': penimbangan.berat_timbang,
                    'kelebihan_berat': penimbangan.kelebihan_berat,
                    'prosen_lebih': penimbangan.prosen_lebih,
                    'status': statusCustom,
                    'action': action
                })

            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': getRow.count(),
                'data': data
            })
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)

def store(request):
    is_kendaraan_bodong      = request.POST.get('is_kendaraan_bodong') or 0
    if is_kendaraan_bodong :
        try:
            timbangan_id = request.COOKIES.get('timbangan_id')
            timbangan = MasterTimbangan.objects.filter(id=timbangan_id).first()
            # ==============================
            # AMBIL DATA DARI COOKIES
            # ==============================
            timbangan_id = request.COOKIES.get('timbangan_id')
            shift_id     = request.COOKIES.get('shift_id')
            regu_id      = request.COOKIES.get('regu_id')
            # ==============================
            # UUID & KODE TRX
            # ==============================
            lokasi = LokasiUppkb.objects.first()
            uuids = uuid.uuid4()
            kode_trx = generate_kode_trx_bodong(kode_uppkb=lokasi.kode)
            # ==============================
            # USER AND DATETIME
            # ==============================
            current_time = datetime.now()
            user = request.user
            
            no_kendaraan       = (request.POST.get('no_kendaraan_bd') or "").replace(" ", "").upper()
            berat_kendaraan             = request.POST.get('berat_kendaraan')
            panjang_p            = request.POST.get('panjang_p')
            lebar_p          = request.POST.get('lebar_p')
            tinggi_p          = request.POST.get('tinggi_p')

            # ==============================
            # KOMODITI & ASAL TUJUAN
            # ==============================
            komoditi_id             = request.POST.get('komoditi_id_bd')
            asal_kota_id            = request.POST.get('asal_kota_id_bd')
            tujuan_kota_id          = request.POST.get('tujuan_kota_id_bd')
            # ==============================
            # KOMODITI, SUMBU, JENIS KENDARAAN, ASAL, TUJUAN
            # ==============================
            komoditi = MasterKomoditi.objects.filter(id=komoditi_id).select_related('kategori_komoditi').first()
            if not komoditi:
                return json_response(status=False, message="Komoditi tidak ditemukan", code=400)
            asal_kota = DataKotaKab.objects.filter(id=asal_kota_id).first()
            if not asal_kota:
                return json_response(status=False, message="Asal kota tidak ditemukan", code=400)
            tujuan_kota = DataKotaKab.objects.filter(id=tujuan_kota_id).first()
            if not tujuan_kota:
                return json_response(status=False, message="Tujuan kota tidak ditemukan", code=400)

            # SAVE IMAGE
            foto_depan = None
            foto_depan_url = None
            foto_belakang = None
            foto_belakang_url = None

            # === CAMERA DEPAN ===
            camdepan = capture_snapshot_and_save(
                url=timbangan.cam_depan_url,
                username=timbangan.cam_depan_username,
                password=timbangan.cam_depan_password,
                no_kendaraan=no_kendaraan,
                label="DEPAN"
            )
            if camdepan["success"]:
                foto_depan = camdepan["filename"]
                foto_depan_url = camdepan["filepath"]
            else:
                print("Error:", camdepan["error"])

            # === CAMERA BELAKANG ===
            cambelakang = capture_snapshot_and_save(
                url=timbangan.cam_belakang_url,
                username=timbangan.cam_belakang_username,
                password=timbangan.cam_belakang_password,
                no_kendaraan=no_kendaraan,
                label="BELAKANG"
            )
            if cambelakang["success"]:
                foto_belakang = cambelakang["filename"]
                foto_belakang_url = cambelakang["filepath"]
            else:
                print("Error:", cambelakang["error"])
                
            with transaction.atomic():
                KendaraanBodong.objects.create(
                    id=uuids,
                    kode_trx=kode_trx,

                    timbangan_id=timbangan_id,
                    regu_id=regu_id,
                    shift_id=shift_id,
                    petugas_id=user.id,

                    no_kendaraan=no_kendaraan,
                    berat_timbang=berat_kendaraan,
                    panjang_ukur=panjang_p,
                    lebar_ukur=lebar_p,
                    tinggi_ukur=tinggi_p,

                    komoditi_id=komoditi.id,
                    kategori_komoditi_id=komoditi.kategori_komoditi.id,
                    komoditi=komoditi.nama,

                    asal_kode_kota=asal_kota.kode,
                    asal_kota_id=asal_kota.id,
                    asal_kota=asal_kota.nama,

                    tujuan_kode_kota=tujuan_kota.kode,
                    tujuan_kota_id=tujuan_kota.id,
                    tujuan_kota=tujuan_kota.nama,

                    tgl_penimbangan=current_time,

                    foto_depan=foto_depan,
                    foto_depan_url=foto_depan_url,
                    foto_belakang=foto_belakang,
                    foto_belakang_url=foto_belakang_url,
                )

            # ===== RESPONSE BERHASIL =====
            return json_response(
                status=True,
                message=(
                    'Data penimbangan berhasil disimpan, '
                    'selanjutnya kendaraan bisa keluar dari platform penimbangan '
                    'dan ditindak jika diperlukan!'
                ),
                code=200
            )
        except Exception as e:
            # ===== ERROR GLOBAL =====
            return json_response(
                status=False,
                message=f'Terjadi kesalahan sistem: {str(e)}',
                code=500
            )
    else:
        try:
            timbangan_id = request.COOKIES.get('timbangan_id')
            timbangan = MasterTimbangan.objects.filter(id=timbangan_id).first()
            # User Penimbangan
            current_time = datetime.now()
            user = request.user
            is_from_antrian = request.POST.get('is_from_antrian')
            lokasi = LokasiUppkb.objects.first()
            # ==============================
            # CREDENTIALS HIDDEN ALAT TIMBANGAN
            # ==============================
            berat_kendaraan      = request.POST.get('berat_kendaraan') or 0
            kelebihan_berat      = request.POST.get('kelebihan_berat') or 0
            persentase_kelebihan = request.POST.get('persentase_kelebihan') or 0
            panjang_p            = request.POST.get('panjang_p') or 0
            lebar_p              = request.POST.get('lebar_p') or 0
            tinggi_p             = request.POST.get('tinggi_p') or 0
            kelebihan_panjang    = request.POST.get('kelebihan_panjang') or 0
            kelebihan_lebar      = request.POST.get('kelebihan_lebar') or 0
            kelebihan_tinggi     = request.POST.get('kelebihan_tinggi') or 0

            # ==============================
            # HIDDEN DETAIL KENDARAAN
            # ==============================
            foto_depan_url       = request.POST.get('foto_depan_url')
            foto_belakang_url    = request.POST.get('foto_belakang_url')
            foto_kanan_url       = request.POST.get('foto_kanan_url')
            foto_kiri_url        = request.POST.get('foto_kiri_url')
            jbb_uji              = request.POST.get('jbb_uji') or 0
            jbkb_uji             = request.POST.get('jbkb_uji') or 0
            mst_uji              = request.POST.get('mst_uji') or 0
            jenis_kendaraan_nama = request.POST.get('jenis_kendaraan_nama')
            sumbu_nama           = request.POST.get('sumbu_nama')
            tanggal_uji          = request.POST.get('tanggal_uji')

            # ==============================
            # DIMENSI KENDARAAN
            # ==============================
            panjang_utama = request.POST.get('panjang_utama') or 0
            lebar_utama = request.POST.get('lebar_utama') or 0
            tinggi_utama = request.POST.get('tinggi_utama') or 0
            foh_utama = request.POST.get('julur_depan') or 0
            roh_utama = request.POST.get('julur_belakang') or 0

            # ==============================
            # AMBIL DATA DARI COOKIES
            # ==============================
            timbangan_id = request.COOKIES.get('timbangan_id')
            shift_id     = request.COOKIES.get('shift_id')
            regu_id      = request.COOKIES.get('regu_id')

            # ==============================
            # INFORMASI KENDARAAN
            # ==============================
            no_kendaraan       = (request.POST.get('no_kendaraan') or "").replace(" ", "").upper()
            no_uji             = (request.POST.get('no_uji') or "").upper()
            masa_berlaku_uji   = request.POST.get('masa_berlaku_uji')
            jbi                = request.POST.get('jbi') or 0
            jenis_kendaraan_id = request.POST.get('jenis_kendaraan_id')
            sumbu_id           = request.POST.get('sumbu_id')
            kepemilikan_id     = request.POST.get('kepemilikan_id')
            gandengan          = request.POST.get('gandengan')
            nama_pemilik       = (request.POST.get('nama_pemilik') or "").upper()
            alamat_pemilik     = (request.POST.get('alamat_pemilik') or "").upper()
            
            # ==============================
            # STATUS TILANG
            # ==============================
            is_already_tilang = request.POST.get('is_already_tilang')
            nomor_surat_tilang = request.POST.get('nomor_surat_tilang')

            # ==============================
            # KOMODITI & ASAL TUJUAN
            # ==============================
            komoditi_id             = request.POST.get('komoditi_id')
            asal_kota_id            = request.POST.get('asal_kota_id')
            tujuan_kota_id          = request.POST.get('tujuan_kota_id')
            nomor_surat_jalan       = request.POST.get('nomor_surat_jalan')
            pemilik_komoditi        = request.POST.get('pemilik_komoditi')
            alamat_pemilik_komoditi = request.POST.get('alamat_pemilik_komoditi')
            # ==============================
            # FORM PENGEMUDI
            # ==============================
            nama_pengemudi              = request.POST.get('nama_pengemudi') or '-'
            alamat_pengemudi            = request.POST.get('alamat_pengemudi') or '-'
            jenis_kelamin_pengemudi     = request.POST.get('jenis_kelamin_pengemudi') or '-'
            umur_pengemudi              = request.POST.get('umur_pengemudi') or 0
            no_telepon                  = request.POST.get('no_telepon') or 0
            warna_kendaraan             = request.POST.get('warna_kendaraan') or '-'
            gol_sim_id                  = request.POST.get('gol_sim_id')
            no_identitas                = request.POST.get('no_identitas') or 0
            # ==============================
            # KOMODITI, SUMBU, JENIS KENDARAAN, ASAL, TUJUAN
            # ==============================
            komoditi = MasterKomoditi.objects.filter(id=komoditi_id).select_related('kategori_komoditi').first()
            if not komoditi:
                return json_response(status=False, message="Komoditi tidak ditemukan", code=400)
            sumbu = MasterSumbu.objects.filter(id=sumbu_id).first()
            if not sumbu:
                return json_response(status=False, message="Sumbu tidak ditemukan", code=400)
            jenis_kendaraan = MasterJenisKendaraan.objects.filter(id=jenis_kendaraan_id).first()
            if not jenis_kendaraan:
                return json_response(status=False, message="Jenis kendaraan tidak ditemukan", code=400)
            asal_kota = DataKotaKab.objects.filter(id=asal_kota_id).first()
            if not asal_kota:
                return json_response(status=False, message="Asal kota tidak ditemukan", code=400)
            tujuan_kota = DataKotaKab.objects.filter(id=tujuan_kota_id).first()
            if not tujuan_kota:
                return json_response(status=False, message="Tujuan kota tidak ditemukan", code=400)
            # ==============================
            # FORMAT TANGGAL
            # ==============================
            try:
                if masa_berlaku_uji:
                    masa_berlaku_uji = datetime.strptime(masa_berlaku_uji, "%d/%m/%Y").strftime("%Y-%m-%d")
                if not tanggal_uji:
                    tanggal_uji = datetime.now().strftime("%Y-%m-%d")

            except Exception:
                return json_response(status=False, message="Format tanggal masa berlaku uji tidak valid. Gunakan dd/mm/yyyy", code=400)
            # ==============================
            # UUID & KODE TRX
            # ==============================
            uuids = uuid.uuid4()
            kode_trx = generate_kode_trx(kode_uppkb=lokasi.kode)
            # ==============================
            # PELANGGARAN KENDARAAN
            # ==============================
            pelanggaran_id = request.POST.getlist('pelanggaran_id')
                

            # CHECK DATA PENIMBANGAN
            penimbangan = DataPenimbangan.objects.filter(
                no_kendaraan=no_kendaraan, is_transaksi=0
            ).first()
            # =====================================
            # JIKA PENIMBANGAN BERASAL DARI ANTRIAN
            # =====================================
            if penimbangan:
                # CHECK PELANGGARAN
                selected_kode_trx = penimbangan.kode_trx
                pelanggaran_qs = DataPelanggaran.objects.filter(kode_trx=selected_kode_trx)
                if pelanggaran_qs.count() != len(pelanggaran_id):
                    pelanggaran_qs.delete()
                    for idp in pelanggaran_id:
                        try:
                            jenis_pelanggaran = MasterJenisPelanggaran.objects.get(id=int(idp))
                        except MasterJenisPelanggaran.DoesNotExist:
                            continue

                        DataPelanggaran.objects.create(
                            kode_trx=selected_kode_trx,
                            kode_uppkb=lokasi.kode,
                            jenis_pelanggaran_id=jenis_pelanggaran.id,
                            kode_pelanggaran=jenis_pelanggaran.kode,
                            deskripsi=f"PELANGGARAN {jenis_pelanggaran.nama or ''}",
                            no_kendaraan=no_kendaraan,
                            tgl_penimbangan=current_time,
                        )

                        # === CAMERA DEPAN ===
                        camdepan = capture_snapshot_and_save(
                            url=timbangan.cam_depan_url,
                            username=timbangan.cam_depan_username,
                            password=timbangan.cam_depan_password,
                            no_kendaraan=no_kendaraan,
                            label="DEPAN"
                        )
                        if camdepan["success"]:
                            penimbangan.foto_depan = camdepan["filename"]
                            penimbangan.foto_depan_url = camdepan["filepath"]
                        else:
                            print("Error:", camdepan["error"])
                        
                        # === CAMERA BELAKANG ===
                        cambelakang = capture_snapshot_and_save(
                            url=timbangan.cam_belakang_url,
                            username=timbangan.cam_belakang_username,
                            password=timbangan.cam_belakang_password,
                            no_kendaraan=no_kendaraan,
                            label="BELAKANG"
                        )
                        if cambelakang["success"]:
                            penimbangan.foto_belakang = cambelakang["filename"]
                            penimbangan.foto_belakang_url = cambelakang["filepath"]
                        else:
                            print("Error:", cambelakang["error"])
                
                # ==============================
                # DATA PENIMBANGAN
                # ==============================
                penimbangan.is_transaksi=1
                penimbangan.no_uji=no_uji
                penimbangan.tgl_masa_berlaku=masa_berlaku_uji
                penimbangan.nama_pemilik=nama_pemilik
                penimbangan.alamat_pemilik=alamat_pemilik
                penimbangan.asal_kota_id=asal_kota.id
                penimbangan.asal_kode_kota=asal_kota.kode
                penimbangan.tujuan_kota_id=tujuan_kota.id
                penimbangan.tujuan_kode_kota=tujuan_kota.kode
                penimbangan.toleransi_komoditi=lokasi.toleransi_berat or 0
                penimbangan.toleransi_uppkb=lokasi.toleransi_berat or 0
                penimbangan.berat_timbang=berat_kendaraan
                penimbangan.jbi_uji=jbi
                penimbangan.kelebihan_berat=kelebihan_berat
                penimbangan.prosen_lebih=persentase_kelebihan
                penimbangan.is_gandengan='Y' if gandengan else 'N'
                penimbangan.jenis_kendaraan_id=jenis_kendaraan.id
                penimbangan.jenis_kendaraan=jenis_kendaraan.nama
                penimbangan.is_melanggar='Y' if pelanggaran_id else 'N'
                penimbangan.jbb_uji=jbb_uji
                penimbangan.jbkb_uji=jbkb_uji
                penimbangan.mst_uji=mst_uji
                penimbangan.kategori_kepemilikan_id=kepemilikan_id
                penimbangan.sumbu=sumbu.konfig_sumbu
                penimbangan.sumbu_id=sumbu.id
                penimbangan.pemilik_komoditi=pemilik_komoditi
                penimbangan.alamat_pemilik_komoditi=alamat_pemilik_komoditi
                # penimbangan.tgl_penimbangan=current_time
                penimbangan.no_surat_jalan=nomor_surat_jalan
                penimbangan.panjang_utama=panjang_utama
                penimbangan.panjang_toleransi=lokasi.toleransi_panjang or 0
                penimbangan.panjang_ukur=panjang_p
                penimbangan.panjang_lebih=kelebihan_panjang
                penimbangan.lebar_utama=lebar_utama
                penimbangan.lebar_toleransi=lokasi.toleransi_lebar or 0
                penimbangan.lebar_ukur=lebar_p
                penimbangan.lebar_lebih=kelebihan_lebar
                penimbangan.tinggi_utama=tinggi_utama
                penimbangan.tinggi_toleransi=lokasi.toleransi_tinggi or 0
                penimbangan.tinggi_ukur=tinggi_p
                penimbangan.tinggi_lebih=kelebihan_tinggi
                penimbangan.foh_utama=foh_utama
                penimbangan.foh_toleransi=0
                penimbangan.foh_ukur=0
                penimbangan.foh_lebih=0
                penimbangan.roh_utama=roh_utama
                penimbangan.roh_toleransi=0
                penimbangan.roh_ukur=0
                penimbangan.roh_lebih=0
                penimbangan.device_id=0
                penimbangan.timbangan_id=timbangan_id
                penimbangan.petugas_id=user.id
                penimbangan.regu_id=regu_id
                penimbangan.shift_id=shift_id
                penimbangan.use_toleransi=lokasi.toleransi_berat or 0
                penimbangan.is_tindakan = 'Y' if is_already_tilang else 'N'
                penimbangan.is_surat_tilang='Y' if is_already_tilang else 'N'
                penimbangan.no_ba_tilang=nomor_surat_tilang if is_already_tilang else None
                penimbangan.komoditi_id=komoditi.id
                penimbangan.kategori_komoditi_id=komoditi.kategori_komoditi.id
                penimbangan.save()

                # ==============================
                # DATA KOMODITI ASAL TUJUAN
                # ==============================
                data_komoditi_asal_tujaun = dict(
                    no_kendaraan=no_kendaraan,
                    komoditi_id=komoditi_id,
                    asal_kota_id=asal_kota_id,
                    tujuan_kota_id=tujuan_kota_id,
                    nomor_surat_jalan=nomor_surat_jalan,
                    pemilik_komoditi=pemilik_komoditi,
                    alamat_pemilik_komoditi=alamat_pemilik_komoditi,
                    kategori_komoditi_id=komoditi.kategori_komoditi.id,

                    nama_pengemudi=nama_pengemudi,
                    alamat_pengemudi=alamat_pengemudi,
                    jenis_kelamin_pengemudi=jenis_kelamin_pengemudi,
                    umur_pengemudi=umur_pengemudi,
                    no_telepon=no_telepon,
                    warna_kendaraan=warna_kendaraan,
                    gol_sim_id=gol_sim_id,
                    no_identitas=no_identitas,
                )
                save_komoditi_asaltujuan_pengemudi(data_komoditi_asal_tujaun, jenisupdate="KOMODITI")
                
                results = {
                    'idp_penimbangan': penimbangan.id,
                    'is_print_struk' : timbangan.is_print_struk
                }
                return json_response(status=True, message='Data penimbangan berhasil disimpan, selanjutnya kendaraan bisa keluar dari platform penimbangan atau menuju <b>PPNS</b> jika terjadi pelanggaran', code=200, data=results)
            else:
                # SAVE IMAGE
                foto_depan = None
                foto_depan_url = None
                foto_belakang = None
                foto_belakang_url = None

                # === CAMERA DEPAN ===
                camdepan = capture_snapshot_and_save(
                    url=timbangan.cam_depan_url,
                    username=timbangan.cam_depan_username,
                    password=timbangan.cam_depan_password,
                    no_kendaraan=no_kendaraan,
                    label="DEPAN"
                )
                if camdepan["success"]:
                    foto_depan = camdepan["filename"]
                    foto_depan_url = camdepan["filepath"]
                else:
                    print("Error:", camdepan["error"])

                # === CAMERA BELAKANG ===
                cambelakang = capture_snapshot_and_save(
                    url=timbangan.cam_belakang_url,
                    username=timbangan.cam_belakang_username,
                    password=timbangan.cam_belakang_password,
                    no_kendaraan=no_kendaraan,
                    label="BELAKANG"
                )
                if cambelakang["success"]:
                    foto_belakang = cambelakang["filename"]
                    foto_belakang_url = cambelakang["filepath"]
                else:
                    print("Error:", cambelakang["error"])
                
                # ==============================
                # DATA PENIMBANGAN
                # ==============================
                data_penimbangan = dict(
                    is_transaksi=1,
                    id=uuids,
                    kode_trx=kode_trx,
                    kode_uppkb=lokasi.kode,
                    timbangan_id=timbangan_id,
                    # tgl_penimbangan=current_time,
                    no_kendaraan=no_kendaraan,
                    no_uji=no_uji,
                    tgl_uji=tanggal_uji,
                    tgl_masa_berlaku=masa_berlaku_uji,
                    nama_pemilik=nama_pemilik,
                    alamat_pemilik=alamat_pemilik,
                    asal_kota_id=asal_kota.id,
                    asal_kode_kota=asal_kota.kode,
                    tujuan_kota_id=tujuan_kota.id,
                    tujuan_kode_kota=tujuan_kota.kode,
                    toleransi_komoditi=lokasi.toleransi_berat or 0,
                    toleransi_uppkb=lokasi.toleransi_berat or 0,
                    berat_timbang=berat_kendaraan,
                    jbi_uji=jbi,
                    kelebihan_berat=kelebihan_berat,
                    prosen_lebih=persentase_kelebihan,
                    is_gandengan='Y' if gandengan else 'N',
                    jenis_kendaraan_id=jenis_kendaraan.id,
                    jenis_kendaraan=jenis_kendaraan.nama,
                    is_melanggar='Y' if pelanggaran_id else 'N',
                    jbb_uji=jbb_uji,
                    jbkb_uji=jbkb_uji,
                    mst_uji=mst_uji,
                    kategori_kepemilikan_id=kepemilikan_id,
                    foto_depan=foto_depan,
                    foto_depan_url=foto_depan_url,
                    foto_belakang=foto_belakang,
                    foto_belakang_url=foto_belakang_url,
                    sumbu=sumbu.konfig_sumbu,
                    sumbu_id=sumbu.id,
                    pemilik_komoditi=pemilik_komoditi,
                    alamat_pemilik_komoditi=alamat_pemilik_komoditi,
                    # tgl_antrian=current_time,
                    no_surat_jalan=nomor_surat_jalan,
                    
                    panjang_utama=panjang_utama,
                    panjang_toleransi=lokasi.toleransi_panjang or 0,
                    panjang_ukur=panjang_p,
                    panjang_lebih=kelebihan_panjang,
                    lebar_utama=lebar_utama,
                    lebar_toleransi=lokasi.toleransi_lebar or 0,
                    lebar_ukur=lebar_p,
                    lebar_lebih=kelebihan_lebar,
                    tinggi_utama=tinggi_utama,
                    tinggi_toleransi=lokasi.toleransi_tinggi or 0,
                    tinggi_ukur=tinggi_p,
                    tinggi_lebih=kelebihan_tinggi,
                    foh_utama=foh_utama,
                    foh_toleransi=0,
                    foh_ukur=0,
                    foh_lebih=0,
                    roh_utama=roh_utama,
                    roh_toleransi=0,
                    roh_ukur=0,
                    roh_lebih=0,

                    device_id=0,
                    lokasi_id=lokasi.id,
                    use_toleransi=lokasi.toleransi_berat or 0,
                    is_surat_tilang='Y' if is_already_tilang else 'N',
                    no_ba_tilang=nomor_surat_tilang if is_already_tilang else None,
                    petugas_id=user.id,
                    regu_id=regu_id,
                    shift_id=shift_id,
                    komoditi_id=komoditi.id,
                    kategori_komoditi_id=komoditi.kategori_komoditi.id,
                    bptd_id=lokasi.bptd_id,
                )
                # SIMPAN PENIMBANGAN
                penimbangan = DataPenimbangan(**data_penimbangan)
                penimbangan.save()
                save_kendaraan(data_penimbangan)
                # ==============================
                # DATA KOMODITI ASAL TUJUAN
                # ==============================
                data_komoditi_asal_tujaun = dict(
                    no_kendaraan=no_kendaraan,
                    komoditi_id=komoditi_id,
                    asal_kota_id=asal_kota_id,
                    tujuan_kota_id=tujuan_kota_id,
                    nomor_surat_jalan=nomor_surat_jalan,
                    pemilik_komoditi=pemilik_komoditi,
                    alamat_pemilik_komoditi=alamat_pemilik_komoditi,
                    kategori_komoditi_id=komoditi.kategori_komoditi.id,

                    nama_pengemudi=nama_pengemudi,
                    alamat_pengemudi=alamat_pengemudi,
                    jenis_kelamin_pengemudi=jenis_kelamin_pengemudi,
                    umur_pengemudi=umur_pengemudi,
                    no_telepon=no_telepon,
                    warna_kendaraan=warna_kendaraan,
                    gol_sim_id=gol_sim_id,
                    no_identitas=no_identitas,
                )
                save_komoditi_asaltujuan_pengemudi(data_komoditi_asal_tujaun, jenisupdate="KOMODITI")
                # ==============================
                # SIMPAN PELANGGARAN
                # ==============================
                if pelanggaran_id:
                    for idp in pelanggaran_id:
                        jenis_pelanggaran = MasterJenisPelanggaran.objects.filter(id=int(idp)).first()
                        if jenis_pelanggaran:
                            DataPelanggaran.objects.create(
                                kode_trx=kode_trx,
                                kode_uppkb=lokasi.kode,
                                jenis_pelanggaran_id=jenis_pelanggaran.id,
                                kode_pelanggaran=jenis_pelanggaran.kode,
                                deskripsi='PELANGGARAN ' + (jenis_pelanggaran.nama or ""),
                                no_kendaraan=no_kendaraan,
                                tgl_penimbangan=current_time,
                            )
                results = {
                    'idp_penimbangan': penimbangan.id,
                    'is_print_struk' : timbangan.is_print_struk
                }
                return json_response(status=True, message='Data penimbangan berhasil disimpan, selanjutnya kendaraan bisa keluar dari platform penimbangan atau menuju <b>PPNS</b> jika terjadi pelanggaran', code=200, data=results)
            
        except DataPenimbangan.DoesNotExist:
            return json_response(status=False, message='Data penimbangan tidak ditemukan!', code=404)
        
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    
def print_struk(request):
    timbangan_id = request.COOKIES.get('timbangan_id')
    lokasi = LokasiUppkb.objects.first()
    timbangan = MasterTimbangan.objects.filter(id=timbangan_id).first()

    idp_penimbangan = request.GET.get('idp_penimbangan')
    penimbangan = DataPenimbangan.objects.filter(id=idp_penimbangan).first()
    if not penimbangan:
        return json_response(status=False, message="Data penimbangan tidak ditemukan", code=400)

    # convertMp3()
    # asyncio.run(generate_voice('DAN', 'DAN.mp3'))
    # return json_response(status=False, message="Data penimbangan tidak ditemukan", code=400)
    play_voices = []
    status_melanggar = "TIDAK MELANGGAR"

    # ==============================
    # CEK STATUS PELANGGARAN
    # ==============================
    pelanggaran_qs = DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx)
    if pelanggaran_qs.exists():
        play_voices.append("ANDA_MELANGGAR.mp3")
        status_melanggar = "MELANGGAR "

        pelanggaran_list = list(pelanggaran_qs)
        total_pelanggaran = len(pelanggaran_list)

        for i, pel in enumerate(pelanggaran_list):
            try:
                jenis_pelanggaran = MasterJenisPelanggaran.objects.get(id=int(pel.jenis_pelanggaran_id))
                status_melanggar += f"{jenis_pelanggaran.nama}"
                play_voices.append(f"{jenis_pelanggaran.kode}.wav")

                status_melanggar += ", "
            except MasterJenisPelanggaran.DoesNotExist:
                continue
    else:
        play_voices.append("ANDA_TIDAK_MELANGGAR.mp3")

    play_voices += ["AMBIL_STRUK.mp3", "TERIMA_KASIH.mp3"]

    # ==============================
    # PLAY VOICE (JIKA AKTIF)
    # ==============================
    # if timbangan and timbangan.is_voice == "Y":
    #     audio_url = play_combined_voices(play_voices)
    # else:
    #     audio_url = None

    # ==============================
    # CETAK STRUK (JIKA AKTIF)
    # ==============================
    if timbangan and timbangan.is_print_struk == "Y":
        # Ambil data relasi
        komoditi = MasterKomoditi.objects.filter(id=penimbangan.komoditi_id).select_related("kategori_komoditi").first()
        asal_kota = DataKotaKab.objects.filter(id=penimbangan.asal_kota_id).first()
        tujuan_kota = DataKotaKab.objects.filter(id=penimbangan.tujuan_kota_id).first()

        # Validasi data
        if not komoditi:
            return json_response(status=False, message="Komoditi tidak ditemukan", code=400)
        if not asal_kota:
            return json_response(status=False, message="Asal kota tidak ditemukan", code=400)
        if not tujuan_kota:
            return json_response(status=False, message="Tujuan kota tidak ditemukan", code=400)

        status = False
        message = "Terjadi kesalahan tak terduga"

        def clean_number(value):
            try:
                return str(int(float(value)))  # Buang koma + buang ".0"
            except:
                return str(value)
        try:
            # Koneksi ke printer
            printer = Network(timbangan.ip_printer_penimbangan, int(timbangan.port_printer_penimbangan))

            # ==============================
            # HEADER STRUK
            # ==============================
            printer.set(align="center", width=2, height=2, bold=True)
            printer.text(f"{penimbangan.kode_trx}\n\n")
            printer.text("STRUK PENIMBANGAN KENDARAAN BERMOTOR\n")
            printer.text(f"{lokasi.nama.upper()}\n")
            printer.set(bold=False)
            printer.text("------------------------------------------------\n")
            tgl_penimbangan = convert_timezone(penimbangan.tgl_penimbangan, request.COOKIES.get('timezone'))
            tanggal_timbang =  tgl_penimbangan.strftime('%d/%m/%Y');
            jam_timbang = tgl_penimbangan.strftime('%H:%M:%S');
            # ==============================
            # BODY STRUK
            # ==============================
            printer.set(align="left", width=2, height=1)
            printer.text(f"Tanggal Timbang       : {tanggal_timbang} {jam_timbang}\n")
            printer.text(f"Nomor Kendaraan       : {penimbangan.no_kendaraan}\n")
            printer.text(f"Nomor Uji             : {penimbangan.no_uji}\n")
            printer.text(f"JBI Kendaraan         : {clean_number(penimbangan.jbi_uji)} Kg\n")
            printer.text(f"Berat Timbangan       : {clean_number(penimbangan.berat_timbang)} Kg\n")
            printer.text(f"Kelebihan Berat       : {clean_number(penimbangan.kelebihan_berat)} Kg\n")
            printer.text(f"Persen Berat Lebih    : {clean_number(penimbangan.prosen_lebih)} %\n")
            printer.text(f"Panjang (uji)         : {clean_number(penimbangan.panjang_utama)} mm\n")
            printer.text(f"Lebar (uji)           : {clean_number(penimbangan.lebar_utama)} mm\n")
            printer.text(f"Tinggi (uji)          : {clean_number(penimbangan.tinggi_utama)} mm\n")
            printer.text(f"Panjang (pengukuran)  : {clean_number(penimbangan.panjang_ukur)} mm\n")
            printer.text(f"Lebar (pengukuran)    : {clean_number(penimbangan.lebar_ukur)} mm\n")
            printer.text(f"Tinggi (pengukuran)   : {clean_number(penimbangan.tinggi_ukur)} mm\n")
            printer.text(f"Panjang (lebih)       : {clean_number(penimbangan.panjang_lebih)} mm\n")
            printer.text(f"Lebar (lebih)         : {clean_number(penimbangan.lebar_lebih)} mm\n")
            printer.text(f"Tinggi (lebih)        : {clean_number(penimbangan.tinggi_lebih)} mm\n")
            printer.text(f"Asal                  : {asal_kota.nama}\n")
            printer.text(f"Tujuan                : {tujuan_kota.nama}\n")
            printer.text(f"Komoditi              : {komoditi.nama}\n")
            printer.text(f"Status Pelanggaran    : {status_melanggar}\n")

            # ==============================
            # QR CODE
            # ==============================
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=8,
                border=2
            )
            qr.add_data(penimbangan.kode_trx)
            qr.make(fit=True)

            qr_image = qr.make_image(fill="black", back_color="white")
            img_byte_arr = io.BytesIO()
            qr_image.save(img_byte_arr)
            img_byte_arr.seek(0)

            printer.set(align="center", width=1, height=1, bold=True)
            printer.image(img_byte_arr)

            # ==============================
            # FOOTER STRUK
            # ==============================
            printer.text("\n*Struk Penimbangan Kendaraan Bermotor\n")
            printer.text("*Dokumen Bukti Penimbangan Kendaraan Bermotor\n")
            printer.cut()

            status = True
            message = "Struk berhasil dicetak"

        except (socket.error, ConnectionRefusedError, TimeoutError, OSError) as e:
            status = False
            message = f"Koneksi printer gagal: {str(e)}"

        finally:
            # Tetap kirim data voice meskipun printer error
            return json_response(status=status, message=message, data=play_voices)


    # Jika tidak print dan tidak voice
    return json_response(status=True, message="Proses selesai tanpa cetak atau suara")
    
def delete(request):
    if 'is_delete_data' in request.GET:
        penimbangan_id = request.GET.get('idp')
        penimbangan = DataPenimbangan.objects.filter(id=penimbangan_id).first()
        if penimbangan:
            DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx).delete()
            DataPenimbangan.objects.filter(id=penimbangan_id).delete()
            return json_response(status=True, message='Data penimbangan berhasil dihapus!')
        return json_response(status=False, message='Gagal menghapus data, data kendaraan tidak tersedia!')

def capture_snapshot_and_save(url, username, password, no_kendaraan, label):
    try:
        # --- Ambil snapshot dari kamera ---
        response = requests.get(
            url,
            auth=HTTPDigestAuth(username, password),
            timeout=5,
            stream=True
        )

        if response.status_code != 200:
            return {
                "success": False,
                "error": f"Gagal mengambil gambar (HTTP {response.status_code})"
            }

        # --- Folder penyimpanan ---
        save_dir = os.path.join(settings.BASE_DIR, "static/dist/img/penimbangan")
        os.makedirs(save_dir, exist_ok=True)

        # --- Gunakan timestamp milidetik agar file tidak sama ---
        timestamp_ms = int(datetime.now().timestamp() * 1000)

        # --- Nama file unik & ada label ---
        filename = f"{no_kendaraan}-CAMERA-{label}-{timestamp_ms}.jpg"
        file_path = os.path.join(save_dir, filename)

        image = Image.open(BytesIO(response.content))
        rgb_image = image.convert("RGB")
        rgb_image.save(file_path, format='JPEG', quality=20, optimize=True)

        # --- Return hasil ---
        return {
            "success": True,
            "filename": filename,
            "filepath": file_path
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

 


