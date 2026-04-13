from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.db.models import Q
from .utils import json_response, generateIdTransaksi, generate_kode_trx
from .common import save_kendaraan, save_komoditi_asaltujuan_pengemudi
from datetime import datetime, date
import pytz
from user_agents import parse
from django.shortcuts import redirect
from django.conf import settings
import requests
from types import SimpleNamespace
from django.templatetags.static import static
import uuid
from django.utils import timezone
from app.models import (
    DataPenimbangan, 
    MasterKendaraan, 
    DataPenimbangan, 
    LokasiUppkb, 
    MasterKomoditi,
    MasterJenisPelanggaran,
    DataPelanggaran,
    KomoditiAsalTujuanPengemudi,
    DataKotaKab,
    MasterTimbangan, 
    MasterRegu
)
def index(request):
    lokasi = LokasiUppkb.objects.first()
    timbangan = MasterTimbangan.objects.filter(id=request.COOKIES.get('timbangan_id')).first()
    regu = MasterRegu.objects.filter(id=request.COOKIES.get('regu_id')).first()

    context = {
        'title': 'Pendataan Kendaraan',
        'app_name': lokasi.nama,
        'row' :{
            'timbangan_name': timbangan.nama if timbangan else "",
            'regu_name': regu.nama if regu else "",
        }
    }
    ua_string = request.META.get('HTTP_USER_AGENT', '')
    user_agent = parse(ua_string)
    if user_agent.is_mobile or user_agent.is_tablet:
        return render(request, 'mobile/pendataan_kendaraan.html', context)
    else:
        return render(request, 'backend/pendataan_kendaraan.html', context)

def show(request):
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
                        "vcode": get("vcode", "")
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
                    "get_komoditi": data_komoditi
                }
                return json_response(status=True, message='Kendaraan ditemukan!', data=row)
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={
                    'error_code':'noken_not_available'
                })
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
                    <button type="button" class="btn btn-icon btn-circle btn-sm btn-danger mb-1 ms-1" data-bs-toggle="tooltip" title="Hapus Antrian!" onclick="deleteData('{kendaraan.id}');"><i class="ki-solid ki-trash fs-4"></i></button>
                '''

                melanggarCustom = '<span class="badge badge-success fs-7">TIDAK</span>' if kendaraan.is_melanggar == 'N' else '<span class="badge badge-danger fs-7">MELANGGAR</span>'
                data.append({
                    'no': f"{index:,}" if index else '-',
                    'no_kendaraan': kendaraan.no_kendaraan,
                    'no_uji': kendaraan.no_uji.upper(),
                    'melanggar': melanggarCustom,
                    'action': action,
                })

            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': getRow.count(),
                'data': data
            })
        return json_response(status=False, message='Credentials errors')
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)  
    
def store(request):
    try:
        user = request.user
        lokasi = LokasiUppkb.objects.first()
        if not lokasi:
            return json_response(status=False, message="Lokasi UPPKB belum dikonfigurasi", code=400)

        # ==============================
        # AMBIL DATA DARI COOKIES
        # ==============================
        timbangan_id = request.COOKIES.get('timbangan_id')
        shift_id = request.COOKIES.get('shift_id')
        regu_id = request.COOKIES.get('regu_id')

        # ==============================
        # INFORMASI KENDARAAN
        # ==============================
        no_kendaraan = (request.POST.get('no_kendaraan') or "").replace(" ", "").upper()
        no_uji = (request.POST.get('no_uji') or "").upper()
        masa_berlaku_uji = request.POST.get('masa_berlaku_uji')
        jbi = request.POST.get('jbi') or 0
        jenis_kendaraan_id = request.POST.get('jenis_kendaraan_id')
        sumbu_id = request.POST.get('sumbu_id')
        kepemilikan_id = request.POST.get('kepemilikan_id')
        nama_pemilik = (request.POST.get('nama_pemilik') or "").upper()
        alamat_pemilik = (request.POST.get('alamat_pemilik') or "").upper()
        gandengan = request.POST.get('gandengan')

        # ==============================
        # KOMODITI & ASAL TUJUAN
        # ==============================
        komoditi_id = request.POST.get('komoditi_id')
        asal_kota_id = request.POST.get('asal_kota_id')
        tujuan_kota_id = request.POST.get('tujuan_kota_id')
        nomor_surat_jalan = request.POST.get('nomor_surat_jalan')
        pemilik_komoditi = request.POST.get('pemilik_komoditi')
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
        # DIMENSI KENDARAAN
        # ==============================
        panjang_utama = request.POST.get('panjang_utama') or 0
        lebar_utama = request.POST.get('lebar_utama') or 0
        tinggi_utama = request.POST.get('tinggi_utama') or 0
        foh_utama = request.POST.get('julur_depan') or 0
        roh_utama = request.POST.get('julur_belakang') or 0

        # ==============================
        # PELANGGARAN KENDARAAN
        # ==============================
        pelanggaran_id = request.POST.getlist('pelanggaran_id')

        # ==============================
        # STATUS TILANG
        # ==============================
        is_already_tilang = request.POST.get('is_already_tilang')
        nomor_surat_tilang = request.POST.get('nomor_surat_tilang')

        # ==============================
        # HIDDEN FORM
        # ==============================
        jbb_uji = request.POST.get('jbb_uji') or 0
        jbkb_uji = request.POST.get('jbkb_uji') or 0
        mst_uji = request.POST.get('mst_uji') or 0
        jenis_kendaraan_nama = request.POST.get('jenis_kendaraan_nama') or ""
        sumbu_nama = request.POST.get('sumbu_nama') or ""

        # ==============================
        # TANGGAL UJI
        # ==============================
        tanggal_uji = request.POST.get('tanggal_uji')
        if not tanggal_uji:
            tanggal_uji = date.today()

        # ==============================
        # UUID & KODE TRX
        # ==============================
        uuids = uuid.uuid4()
        kode_trx = generate_kode_trx(kode_uppkb=lokasi.kode)
        current_time = timezone.now()

        # ==============================
        # CHECK KENDARAAN
        # ==============================
        checkAntrian = DataPenimbangan.objects.filter(no_kendaraan=no_kendaraan, is_transaksi=0).first()
        if checkAntrian:
            return json_response(status=False, message='Gagal menambahkan antrian, kendaraan yang sama sudah ada dalam antrian. Coba gunakan no kendaraan lainnya yang lain!', data={
                'error_code':'kendaraan_available'
            })
        # ==============================
        # FORMAT TANGGAL
        # ==============================
        try:
            if masa_berlaku_uji:
                masa_berlaku_uji = datetime.strptime(masa_berlaku_uji, "%d/%m/%Y").strftime("%Y-%m-%d")
        except Exception:
            return json_response(status=False, message="Format tanggal masa berlaku uji tidak valid. Gunakan dd/mm/yyyy", code=400)
        print('=' * 100)
        print(tanggal_uji)
        print(masa_berlaku_uji)
        print('=' * 100)
        # ==============================
        # KOMODITI
        # ==============================
        komoditi = MasterKomoditi.objects.filter(id=komoditi_id).select_related('kategori_komoditi').first()
        if not komoditi:
            return json_response(status=False, message="Komoditi tidak ditemukan", code=400)

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

        # ==============================
        # DATA PENIMBANGAN
        # ==============================
        data_penimbangan = dict(
            id=uuids,
            kode_trx=kode_trx,
            kode_uppkb=lokasi.kode,
            timbangan_id=timbangan_id,
            tgl_penimbangan=current_time,
            no_kendaraan=no_kendaraan,
            no_uji=no_uji,
            tgl_uji=tanggal_uji,
            tgl_masa_berlaku=masa_berlaku_uji,
            nama_pemilik=nama_pemilik,
            alamat_pemilik=alamat_pemilik,
            asal_kota_id=asal_kota_id,
            tujuan_kota_id=tujuan_kota_id,
            toleransi_komoditi=lokasi.toleransi_berat or 0,
            toleransi_uppkb=lokasi.toleransi_berat or 0,
            berat_timbang=None,
            jbi_uji=jbi,
            kelebihan_berat=0,
            prosen_lebih=0,
            is_gandengan='Y' if gandengan else 'N',
            is_transaksi=0,
            jenis_kendaraan_id=jenis_kendaraan_id,
            is_melanggar='Y' if pelanggaran_id else 'N',
            jbb_uji=jbb_uji,
            jbkb_uji=jbkb_uji,
            mst_uji=mst_uji,
            kategori_kepemilikan_id=kepemilikan_id,
            foto_depan_url=None,
            foto_belakang_url=None,
            jenis_kendaraan=jenis_kendaraan_nama,
            sumbu=sumbu_nama,
            sumbu_id=sumbu_id,
            pemilik_komoditi=pemilik_komoditi,
            alamat_pemilik_komoditi=alamat_pemilik_komoditi,
            tgl_antrian=current_time,
            no_surat_jalan=nomor_surat_jalan,
            panjang_utama=panjang_utama,
            panjang_toleransi=lokasi.toleransi_panjang or 0,
            panjang_ukur=0,
            panjang_lebih=0,
            lebar_utama=lebar_utama,
            lebar_toleransi=lokasi.toleransi_lebar or 0,
            lebar_ukur=0,
            lebar_lebih=0,
            tinggi_utama=tinggi_utama,
            tinggi_toleransi=lokasi.toleransi_tinggi or 0,
            tinggi_ukur=0,
            tinggi_lebih=0,
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

        # Debug: print semua data sebelum simpan
        # for key, val in data_penimbangan.items():
        #     print(f"{key}: {val}")

        # SIMPAN PENIMBANGAN
        penimbangan = DataPenimbangan(**data_penimbangan)
        penimbangan.save()
        save_kendaraan(data_penimbangan)

        # ==============================
        # DATA KOMODITI ASAL TUJUAN DAN PENGEMUDI
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
        save_komoditi_asaltujuan_pengemudi(data_komoditi_asal_tujaun)
        return json_response(
            status=True, 
            message="Data kendaraan berhasil disimpan, selanjutnya penimbangan akan dilakukan sesuai dengan antrian!"
        )

    except Exception as e:
        return json_response(status=False, message=str(e), code=500)
    
def delete(request):
    if 'is_delete_antrian' in request.GET:
        idp = request.GET.get('idp')
        penimbangan = DataPenimbangan.objects.filter(id=idp, is_transaksi=0).first()
        if penimbangan:
            # Hapus data pelanggaran jika ada
            if penimbangan.is_melanggar == 'Y':
                DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx).delete()
            penimbangan.delete()
            return json_response(status=True, message='Data antrian berhasil dihapus!')
        else:
            return json_response(status=False, message='Penimbangan sudah dilakukan, tidak dapat menghapus antrian!')
            