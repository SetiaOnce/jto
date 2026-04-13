import qrcode, io, socket, os, pytz
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.templatetags.static import static
from django.utils import timezone
from django.db.models import Q, OuterRef, Subquery
from app.models import DataPenimbangan, MasterPelanggaran, DataTilang, MasterKendaraan, MasterJenisKendaraan, MasterKomoditi, DataKotaKab, DataPelanggaran, LokasiUppkb, DataPenindakan, Pengadilan, Kejaksaan, DataSitaanDetail, MasterJenisPelanggaran, Sanksi, KomoditiAsalTujuanPengemudi, MasterTimbangan, MasterRegu, DataSdm, DataPeringatan, MasterJenisKendaraanTilang, Pasal
from .utils import json_response, generate_kode_penindakan, convert_timezone, generate_nomor_formulir, generate_nomor_um, format_hari_indonesia
from .common import save_komoditi_asaltujuan_pengemudi
from datetime import datetime, time
from escpos.printer import Usb
from escpos.printer import Network
from escpos.image import Image
from datetime import date
from django.core.paginator import Paginator
import uuid
from django.utils.timezone import make_aware
from django.forms.models import model_to_dict
from django.conf import settings

def index(request):
    lokasi = LokasiUppkb.objects.first()
    timbangan = MasterTimbangan.objects.filter(id=request.COOKIES.get('timbangan_id')).first()
    regu = MasterRegu.objects.filter(id=request.COOKIES.get('regu_id')).first()
    context = {
        'title': 'Penindakan Kendaraan',
        'app_name': lokasi.nama,
        'today' : date.today().strftime("%d/%m/%Y"),
        'row' :{
            'timbangan_name': timbangan.nama if timbangan else "",
            'regu_name': regu.nama if regu else "",
        }
    }
    return render(request, 'backend/penindakan_kendaraan.html', context)

def show(request):
    lokasi                      = LokasiUppkb.objects.first()
    try:
        if 'is_check_count_kendaraan' in request.GET:
            timbangan_id = request.COOKIES.get('timbangan_id')
            shift_id     = request.COOKIES.get('shift_id')
            regu_id      = request.COOKIES.get('regu_id')

            count = DataPenimbangan.objects.filter(
                is_transaksi=1, 
                is_melanggar='Y', 
                is_tindakan='N', 
                is_surat_tilang='N',
                timbangan_id=timbangan_id,
                shift_id=shift_id,
                regu_id=regu_id,
            ).count()
            return json_response(status=True, message='Success', data=count)
        if 'is_select_kendaraan' in request.GET:
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
                jumlah_proteksi = DataPeringatan.objects.filter(no_kendaraan=kendaraan.no_kendaraan, is_protection='Y').count()
                row = {
                    "id": kendaraan.id,
                    "no_reg_kend": kendaraan.no_kendaraan,
                    "kode_trx": kendaraan.kode_trx,
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
                    "berat_timbang": kendaraan.berat_timbang,
                    "kelebihan_berat": kendaraan.kelebihan_berat,
                    "prosen_lebih": kendaraan.prosen_lebih,
                    # KOMODITI & ASAL TUJUAN
                    "get_komoditi": data_komoditi,
                    "pelanggaran": pelanggaran,
                    # DIMENSI
                    "panjang_utama": kendaraan.panjang_utama,
                    "panjang_toleransi": kendaraan.panjang_toleransi,
                    "panjang_ukur": kendaraan.panjang_ukur,
                    "panjang_lebih": kendaraan.panjang_lebih,
                    "lebar_utama": kendaraan.lebar_utama,
                    "lebar_toleransi": kendaraan.lebar_toleransi,
                    "lebar_ukur": kendaraan.lebar_ukur,
                    "lebar_lebih": kendaraan.lebar_lebih,
                    "tinggi_utama": kendaraan.tinggi_utama,
                    "tinggi_toleransi": kendaraan.tinggi_toleransi,
                    "tinggi_ukur": kendaraan.tinggi_ukur,
                    "tinggi_lebih": kendaraan.tinggi_lebih,
                    "jumlah_proteksi": jumlah_proteksi,
                }
                if 'is_show_surat_peringatan' in request.GET:
                    tgl_penimbangan = convert_timezone(
                        kendaraan.tgl_penimbangan,
                        request.COOKIES.get('timezone')
                    )

                    if lokasi and lokasi.kota_kab:
                        kota_kab = lokasi.kota_kab
                        nama_kota = kota_kab.nama
                    else:
                        nama_kota = ''
                        
                    if lokasi and lokasi.bptd:
                        bptd = lokasi.bptd
                        nama_bptd = bptd.nama
                    else:
                        nama_bptd = ''

                    row['nama_jt'] = lokasi.nama.upper()
                    row['nama_kota'] = (nama_kota or '').capitalize()
                    row['nama_bptd'] = nama_bptd.upper()
                    row['tanggal_timbang'] = tgl_penimbangan.strftime('%d/%m/%Y'),
                    row['tanggal_hari_ini'] = datetime.now().strftime('%d/%m/%Y'),
                    row['masa_berlaku_uji_el'] = kendaraan.tgl_masa_berlaku.strftime('%d/%m/%Y'),
                    row['jam_timbang'] = tgl_penimbangan.strftime('%H:%M'),

                    # SECTION PELANGGARAN
                    if kendaraan.is_tindakan == 'Y':
                        hasil_pelanggarans = []
                        pelanggaran_qs = DataPelanggaran.objects.filter(
                            kode_trx=kendaraan.kode_trx
                        ).values_list('jenis_pelanggaran_id', flat=True)
                        pelanggaran_id_set = set(int(x) for x in pelanggaran_qs if x)
                        jenis_pelanggaran_qs = MasterJenisPelanggaran.objects.filter(is_active='Y')
                        for jp in jenis_pelanggaran_qs:
                            hasil_pelanggarans.append({
                                "id": jp.id,
                                "name": jp.nama,
                                "is_melanggar": "Y" if jp.id in pelanggaran_id_set else "N"
                            })

                        row['dt_peringatan']  = []
                        penindakan = DataPenindakan.objects.filter(kode_trx=kendaraan.kode_trx).first()
                        if penindakan:
                            sanksi = Sanksi.objects.filter(id=penindakan.sanksi_id).first()
                            if sanksi:
                                sanksi_name = sanksi.nama
                            row['pengadilan']  = "-"
                            row['kejaksaan']  = "-"
                            row['tanggal_sidang']  = penindakan.tgl_sidang.strftime('%d/%m/%Y') if penindakan.tgl_sidang else '-'
                            if penindakan.sanksi_id == 11:
                                pengadilan = Pengadilan.objects.filter(id=penindakan.pengadilan_id).first()
                                kejaksaan = Kejaksaan.objects.filter(id=penindakan.kejaksaan_id).first()
                                if pengadilan:
                                    row['pengadilan']  = pengadilan.nama
                                if kejaksaan:
                                    row['kejaksaan']  = kejaksaan.nama

                        
                            if penindakan.sanksi_id == 10:
                                def parse_tanggal(s):
                                    if not s:
                                        return None
                                    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
                                        try:
                                            return datetime.strptime(s, fmt).strftime("%d/%m/%Y")
                                        except ValueError:
                                            continue
                                    return s
                                jumlah_proteksi = DataPeringatan.objects.filter(
                                    no_kendaraan=penindakan.no_kendaraan, is_protection='Y'
                                ).count()
                                peringatan = DataPeringatan.objects.filter(
                                    kode_penindakan=penindakan.kode_penindakan
                                ).only(
                                    "nomor_formulir", "nomor", "tgl_disahkan", "tgl_diberlakukan", "tgl_revisi"
                                ).first()
                                row["dt_peringatan"] = {
                                    "nomor_formulir": getattr(peringatan, "nomor_formulir", None),
                                    "nomor": getattr(peringatan, "nomor", None),
                                    "tgl_disahkan": parse_tanggal(getattr(peringatan, "tgl_disahkan", None)),
                                    "tgl_diberlakukan": parse_tanggal(getattr(peringatan, "tgl_diberlakukan", None)),
                                    "tgl_revisi": getattr(peringatan, "tgl_revisi", None),
                                    "jumlah_proteksi": jumlah_proteksi,
                                }

                        ttd_ppns = None
                        if penindakan.ppns_id:
                            ppns = DataSdm.objects.filter(id=penindakan.ppns_id).first()
                            base_dir = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
                            fallback = None
                            def url_or_fallback(fn):
                                if not fn:
                                    return fallback
                                if not os.path.isfile(os.path.join(base_dir, fn)):
                                    return fallback
                                return static(f'dist/img/tanda-tangan/{fn}')
                            if ppns:
                                ttd_ppns = url_or_fallback(ppns.ttd_ppns)
                        
                        def safe_text(val, dash="-", upper=False):
                            """Return '-' jika None / '' / whitespace. Jika upper=True -> uppercase aman."""
                            if val is None:
                                return dash
                            s = str(val).strip()
                            if not s:
                                return dash
                            return s.upper() if upper else s
                        pasal_name = ''
                        if penindakan.pasal:
                            pasal = Pasal.objects.filter(id=penindakan.pasal).first()
                            pasal_name = safe_text(getattr(pasal, "pasal", None), upper=True)


                        row['pelanggarans']  = hasil_pelanggarans
                        row['sanksi'] = sanksi_name.upper()
                        row['nama_ppns'] = penindakan.nama_ppns.upper()
                        row['ttd_ppns'] = ttd_ppns
                        row['no_skep'] = penindakan.no_skep.upper()
                        row['nama_pengemudi'] = penindakan.nama_pengemudi.upper()
                        row['nip_ppns'] = penindakan.nip_ppns.upper()
                        row['keterangan_tindakan'] = penindakan.keterangan_tindakan.upper()
                        row['pasal'] = pasal_name

                if 'is_show_surat_tilang' in request.GET:
                    tgl_penimbangan = convert_timezone(kendaraan.tgl_penimbangan, request.COOKIES.get('timezone'))
                    # print('=' * 100)
                    # print(kendaraan.kode_trx)
                    # print(tgl_penimbangan)
                    # print('=' * 100)
                    get_penindakan = DataPenindakan.objects.filter(kode_trx=kendaraan.kode_trx).first()
                    if get_penindakan:
                        print("="*60)
                        print("📌 DATA PENINDAKAN")
                        print("="*60)
                        for key, value in model_to_dict(get_penindakan).items():
                            print(f"{key:<20}: {value}")
                        print("="*60)

                    def safe_text(val, dash="-", upper=False):
                        """Return '-' jika None / '' / whitespace. Jika upper=True -> uppercase aman."""
                        if val is None:
                            return dash
                        s = str(val).strip()
                        if not s:
                            return dash
                        return s.upper() if upper else s

                    def safe_int(val, dash="-"):
                        return val if val not in [None, ""] else dash

                    def safe_date(val, dash="-"):
                        """val bisa string/date/datetime. Kalau kosong -> '-'."""
                        if not val:
                            return dash
                        return val  # biarin apa adanya (string atau date), yang penting bukan kosong


                    # =========================
                    # BPTD / UPPKB aman
                    # =========================
                    nama_bptd = "-"
                    if lokasi and getattr(lokasi, "bptd", None):
                        nama_bptd = safe_text(lokasi.bptd.nama, upper=True)

                    nama_uppkb = safe_text(getattr(lokasi, "nama", None), upper=True)

                    # =========================
                    # Master data aman
                    # =========================
                    pasal = Pasal.objects.filter(id=get_penindakan.pasal).first()
                    pengadilan = Pengadilan.objects.filter(id=get_penindakan.pengadilan_id).first()
                    kejaksaan = Kejaksaan.objects.filter(id=get_penindakan.kejaksaan_id).first()

                    pasal_name = safe_text(getattr(pasal, "pasal", None), upper=True)
                    pengadilan_name = safe_text(getattr(pengadilan, "nama", None), upper=True)
                    kejaksaan_name = safe_text(getattr(kejaksaan, "nama", None), upper=True)

                    # =========================
                    # Tanggal & Jam Penindakan aman
                    # =========================
                    tgl_penindakan_local = None
                    tanggal_tindak = "-"
                    jam_tindak = "-"
                    hari_penindakan = "-"

                    if getattr(get_penindakan, "tgl_penindakan", None):
                        tgl_penindakan_local = convert_timezone(
                            get_penindakan.tgl_penindakan,
                            request.COOKIES.get('timezone')
                        )
                        tanggal_tindak = tgl_penindakan_local.strftime('%Y-%m-%d')
                        jam_tindak = tgl_penindakan_local.strftime('%H:%M:%S')
                        hari_penindakan = safe_text(format_hari_indonesia(tanggal_tindak), upper=True)

                    # =========================
                    # Hari Sidang aman
                    # =========================
                    hari_sidang = "-"
                    tgl_sidang_val = getattr(get_penindakan, "tgl_sidang", None)
                    if tgl_sidang_val:
                        hari_sidang = safe_text(format_hari_indonesia(tgl_sidang_val), upper=True)

                    # =========================
                    # Build data_penindakan aman
                    # =========================
                    data_penindakan = {
                        "id": safe_text(getattr(get_penindakan, "id", None)),
                        "no_kendaraan": safe_text(getattr(get_penindakan, "no_kendaraan", None), upper=True),

                        "nama_ppns": safe_text(getattr(get_penindakan, "nama_ppns", None), upper=True),
                        "no_skep": safe_text(getattr(get_penindakan, "no_skep", None), upper=True),
                        "nip_ppns": safe_text(getattr(get_penindakan, "nip_ppns", None), upper=True),
                        "pangkat_ppns": safe_text(getattr(get_penindakan, "pangkat_ppns", None), upper=True),
                        "ham_nomor": safe_text(getattr(get_penindakan, "ham_nomor", None), upper=True),

                        "nama_bptd": nama_bptd,
                        "nama_uppkb": nama_uppkb,

                        "tgl_penindakan": safe_text(tanggal_tindak),
                        "hari_penindakan": safe_text(hari_penindakan, upper=True),
                        "jam_penindakan": safe_text(jam_tindak, upper=True),

                        "nama_pemilik": safe_text(getattr(kendaraan, "nama_pemilik", None), upper=True),
                        "alamat_pemilik": safe_text(getattr(kendaraan, "alamat_pemilik", None), upper=True),

                        "kategori_jenis_kendaraan_id": safe_int(getattr(get_penindakan, "kategori_jenis_kendaraan_id", None)),
                        "kategori_jenis_kendaraan": safe_text(getattr(get_penindakan, "kategori_jenis_kendaraan", None), upper=True),

                        "no_uji": safe_text(getattr(kendaraan, "no_uji", None)),
                        "tanggal_uji": safe_date(getattr(kendaraan, "tgl_uji", None)),
                        "masa_berlaku_uji": safe_date(getattr(kendaraan, "tgl_masa_berlaku", None)),

                        "nama_pengemudi": safe_text(getattr(get_penindakan, "nama_pengemudi", None), upper=True),
                        "umur_pengemudi": safe_int(getattr(get_penindakan, "umur_pengemudi", None)),
                        "gol_sim_id": safe_int(getattr(get_penindakan, "gol_sim_id", None)),
                        "no_sim": safe_text(getattr(get_penindakan, "no_sim", None)),
                        "alamat_pengemudi": safe_text(getattr(get_penindakan, "alamat_pengemudi", None), upper=True),

                        "hari_sidang": safe_text(hari_sidang, upper=True),
                        "tgl_sidang": safe_date(tgl_sidang_val),
                        "jam_sidang": safe_text(getattr(get_penindakan, "jam_sidang", None)) if getattr(get_penindakan, "jam_sidang", None) else "-",
                        "pasal": pasal_name,
                        "pengadilan": pengadilan_name,
                        "kejaksaan": kejaksaan_name,
                    }

                    # rapihin jam sidang biar aman tambah ":00" hanya kalau jam ada dan belum ada detik
                    jam_sidang = getattr(get_penindakan, "jam_sidang", None)
                    if jam_sidang:
                        js = str(jam_sidang).strip()
                        data_penindakan["jam_sidang"] = js if ":" in js and len(js.split(":")) == 3 else f"{js}:00"

                    row["data_penindakan"] = data_penindakan
                return json_response(status=True, message='Kendaraan ditemukan!', data=row)
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={
                    'error_code':'noken_not_available'
                })
        if 'is_qr_kendaraan' in request.GET:
            def get_int_cookie(request, key):
                val = request.COOKIES.get(key)
                try:
                    return int(val)
                except (TypeError, ValueError):
                    return None
            timbangan_id = get_int_cookie(request, 'timbangan_id')
            shift_id     = get_int_cookie(request, 'shift_id')
            regu_id      = get_int_cookie(request, 'regu_id')

            kode_trx = request.GET.get('kode_trx')
            kendaraan = DataPenimbangan.objects.filter(kode_trx=kode_trx).first()
            if kendaraan :
                if kendaraan.is_tindakan == 'Y':
                    return json_response(status=False, message='Kendaraan ditemukan & sudah ditindak sebelumnya!', data={
                        'is_tindakan': True
                    })
                
                # cek timbangan
                if timbangan_id != kendaraan.timbangan_id:
                    return json_response(
                        status=False,
                        message='Kendaraan tidak bisa ditindak melalui TIMBANGAN ini!',
                        data={'is_tindakan': True}
                    )

                # cek shift
                if shift_id != kendaraan.shift_id:
                    return json_response(
                        status=False,
                        message='Kendaraan tidak bisa ditindak oleh SHIFT ini!',
                        data={'is_tindakan': True}
                    )

                # cek regu
                if regu_id != kendaraan.regu_id:
                    return json_response(
                        status=False,
                        message='Kendaraan tidak bisa ditindak oleh REGU ini!',
                        data={'is_tindakan': True}
                    )

                
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
                
                jumlah_proteksi = DataPeringatan.objects.filter(
                    no_kendaraan=kendaraan.no_kendaraan, is_protection='Y'
                ).count()
                row = {
                    "id": kendaraan.id,
                    "no_reg_kend": kendaraan.no_kendaraan,
                    "kode_trx": kendaraan.kode_trx,
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
                    "berat_timbang": kendaraan.berat_timbang,
                    "kelebihan_berat": kendaraan.kelebihan_berat,
                    "prosen_lebih": kendaraan.prosen_lebih,
                    # KOMODITI & ASAL TUJUAN
                    "get_komoditi": data_komoditi,
                    "pelanggaran": pelanggaran,
                    # DIMENSI
                    "panjang_utama": kendaraan.panjang_utama,
                    "panjang_toleransi": kendaraan.panjang_toleransi,
                    "panjang_ukur": kendaraan.panjang_ukur,
                    "panjang_lebih": kendaraan.panjang_lebih,
                    "lebar_utama": kendaraan.lebar_utama,
                    "lebar_toleransi": kendaraan.lebar_toleransi,
                    "lebar_ukur": kendaraan.lebar_ukur,
                    "lebar_lebih": kendaraan.lebar_lebih,
                    "tinggi_utama": kendaraan.tinggi_utama,
                    "tinggi_toleransi": kendaraan.tinggi_toleransi,
                    "tinggi_ukur": kendaraan.tinggi_ukur,
                    "tinggi_lebih": kendaraan.tinggi_lebih,
                    "jumlah_proteksi": jumlah_proteksi,
                }

                return json_response(status=True, message='Kendaraan ditemukan!', data=row)
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={
                    'error_code':'noken_not_available'
                })
        if 'show_kendaraan_melanggar' in request.GET:
            try:
                timbangan_id = request.COOKIES.get('timbangan_id')
                shift_id     = request.COOKIES.get('shift_id')
                regu_id      = request.COOKIES.get('regu_id')

                #Params
                search = request.GET.get('q', '')
                page = int(request.GET.get('page', 1))
                page_size = 10
                # Query
                queryset = DataPenimbangan.objects.filter(is_melanggar='Y', is_transaksi=1, is_tindakan='N', is_surat_tilang='N').all()

                if search:
                    queryset = queryset.filter(no_kendaraan__icontains=search)

                queryset = queryset.filter(timbangan_id=timbangan_id)
                queryset = queryset.filter(shift_id=shift_id)
                queryset = queryset.filter(regu_id=regu_id)

                paginator = Paginator(queryset, page_size)
                page_obj = paginator.get_page(page)

                results = [
                        {
                            'id': row.id,
                            'name': row.no_kendaraan
                        } for row in page_obj
                    ]

                return JsonResponse({
                    'results': results,
                    'has_next': page_obj.has_next() 
                })
            except Exception as e:
                return JsonResponse({
                    'results': [],
                    'pagination': {
                        'more': False
                    },
                    'error': str(e)
                }, status=500)
        if 'is_show_history' in request.GET:
            no_kendaraan = request.GET.get('no_kendaraan')
            getPenindakan = DataPenindakan.objects.filter(
                no_kendaraan=no_kendaraan
            ).order_by('-tgl_penindakan')

            data = []
            for p in getPenindakan:
                penimbangan = DataPenimbangan.objects.filter(kode_trx=p.kode_trx).first()

                foto_belakang = static('dist/img/default-img.png')
                foto_depan = static('dist/img/default-img.png')
                if penimbangan:
                    # Foto Penimbangan Depan
                    if penimbangan.foto_depan:
                        if os.path.exists(os.path.join('static', 'dist', 'img', 'penimbangan', penimbangan.foto_depan)):
                            foto_depan = static('dist/img/penimbangan/') + penimbangan.foto_depan

                    # Foto Penimbangan Belakang
                    if penimbangan.foto_belakang:
                        if os.path.exists(os.path.join('static', 'dist', 'img', 'penimbangan', penimbangan.foto_belakang)):
                            foto_belakang = static('dist/img/penimbangan/') + penimbangan.foto_belakang
                    pelanggaran = 'TIDAK MELANGGAR'
                    if penimbangan.is_melanggar == 'Y':
                        pelanggaran_qs = DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx)
                        if pelanggaran_qs.exists():
                            pelanggaran = ''
                            for pel in pelanggaran_qs:
                                try:
                                    jenis_pelanggaran = MasterJenisPelanggaran.objects.get(
                                        id=int(pel.jenis_pelanggaran_id)
                                    )
                                    pelanggaran += '<span class="badge badge-light me-1 text-dark">' + jenis_pelanggaran.nama + '</span>'
                                except MasterJenisPelanggaran.DoesNotExist:
                                    continue
                    # ==============================
                    # KOMODITI, ASAL, TUJUAN, PENGADILAN
                    # ==============================
                    komoditi = MasterKomoditi.objects.filter(id=penimbangan.komoditi_id).select_related('kategori_komoditi').first()
                    asal_kota = DataKotaKab.objects.filter(id=penimbangan.asal_kota_id).first()
                    tujuan_kota = DataKotaKab.objects.filter(id=penimbangan.tujuan_kota_id).first()
                foto_depan = f'''
                    <a class="image-popup" href="{foto_depan}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!">
                        <img src="{foto_depan}" class="rounded" alt="foto-penimbangan1" title="FOTO PENIMBANGAN - 1" width="72px">
                    </a>
                '''
                foto_belakang = f'''
                    <a class="image-popup" href="{foto_belakang}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!">
                        <img src="{foto_belakang}" class="rounded" alt="foto-penimbangan1" title="FOTO PENIMBANGAN - 2" width="72px">
                    </a>
                '''
                tgl_penindakan = convert_timezone(p.tgl_penindakan, request.COOKIES.get('timezone'))
                tanggal_tindak =  tgl_penindakan.strftime('%d/%m/%Y');
                jam_tindak = tgl_penindakan.strftime('%H:%M:%S');
                sanksi = Sanksi.objects.filter(id=p.sanksi_id).first()
                data.append({
                    "id": str(p.id),
                    "no_kendaraan": p.no_kendaraan,
                    "kode_trx": p.kode_trx,
                    "kode_penindakan": p.kode_penindakan,

                    "nama_pengemudi": p.nama_pengemudi.upper(),
                    "alamat_pengemudi": p.alamat_pengemudi,
                    "umur_pengemudi": p.umur_pengemudi,
                    "jenis_kelamin": p.jenis_kelamin,

                    "tgl_penindakan": p.tgl_penindakan.isoformat() if p.tgl_penindakan else None,
                    "tgl_sidang": p.tgl_sidang.isoformat() if p.tgl_sidang else None,
                    "jam_sidang": p.jam_sidang,

                    "pengadilan_id": p.pengadilan_id,
                    "pengadilan_kode": p.pengadilan_kode,
                    "kejaksaan_id": p.kejaksaan_id,
                    "kejaksaan_kode": p.kejaksaan_kode,

                    "gol_sim_id": p.gol_sim_id,
                    "no_sim": p.no_sim,

                    "nama_ppns": p.nama_ppns,
                    "nip_ppns": p.nip_ppns,
                    "no_skep": p.no_skep,

                    "asal_kota_id": p.asal_kota_id,
                    "tujuan_kota_id": p.tujuan_kota_id,
                    "kode_uppkb": p.kode_uppkb,
                    "lokasi_id": p.lokasi_id,
                    "bptd_id": p.bptd_id,

                    "is_tilang": p.is_tilang,
                    "is_transfer_muat": p.is_transfer_muat,
                    "is_over_dimensi": p.is_over_dimensi,

                    "no_ba_tilang": p.no_ba_tilang,
                    "no_ba_transfer": p.no_ba_transfer,
                    "no_ba_over_dim": p.no_ba_over_dim,

                    "sanksi_id": p.sanksi_id,
                    "status_penindakan": p.status_penindakan,
                    "pasal": p.pasal,
                    "sanksi_tambahan": p.sanksi_tambahan,
                    "sitaan": p.sitaan,

                    "no_telp_pengemudi": p.no_telp_pengemudi,
                    "warna_kendaraan": p.warna_kendaraan,
                    "kategori_jenis_kendaraan": p.kategori_jenis_kendaraan,
                    "kategori_jenis_kendaraan_id": p.kategori_jenis_kendaraan_id,
                    "foto_depan": foto_depan,
                    "foto_belakang": foto_belakang,
                    "waktu_penindakan": f'{tanggal_tindak} {jam_tindak}',
                    "pelanggaran": pelanggaran,
                    'komoditi': komoditi.nama if komoditi else '-',
                    'asal_tujuan': (asal_kota.nama if asal_kota else '-') + ' - ' + (tujuan_kota.nama if tujuan_kota else '-'),
                    'sanksi': sanksi.nama if sanksi else '-',
                })

            if data:
                return json_response(status=True, message="Success", data=data)
            return json_response(status=False, message="Credentials errors", data=[])      
        if 'idp_penimbangan' in request.GET or 'is_show_printer' in request.GET:
            idp_penimbangan = request.GET.get('idp_penimbangan')
            penimbangan = DataPenimbangan.objects.filter(id=idp_penimbangan).first()
            if penimbangan:
                kendaraan = MasterKendaraan.objects.filter(noken=penimbangan.noken).first()
                pelanggaran = MasterPelanggaran.objects.filter(tilang_id=penimbangan.pelanggaran_id).first()
                query_tilang = DataTilang.objects.filter(id_transaksi=penimbangan.id_transaksi).first()
                jenis_kendaraan = MasterJenisKendaraan.objects.filter(id=kendaraan.jenis_kendaraan_id).first()
                jenis_kendaraan_text = f'MOBIL BARANG BAK TERBUKA ({jenis_kendaraan.alias.upper()})' if kendaraan.header_jenis_kendaraan == 1 else f'MOBIL BARANG BAK TERTUTUP ({jenis_kendaraan.alias.upper()})'
                
                datatilang = None
                if query_tilang :
                    if query_tilang.sts_data == 1:
                        status_tilang = 'TILANG'
                    elif query_tilang.sts_data == 2:
                        status_tilang = 'SEDANG TILANG'
                    else:
                        status_tilang = 'NORMAL'
                    datatilang = {
                        'id' : query_tilang.id,
                        'id_transaksi' : query_tilang.id_transaksi,
                        'no_tilang' : query_tilang.no_tilang,
                        'tgl_sidang' : query_tilang.tgl_sidang.strftime('%d/%m/%Y'),
                        'lokasi_sidang' : query_tilang.lokasi_sidang,
                        'nama_ppns' : query_tilang.nama_ppns,
                        'nip_ppns' : query_tilang.nip_ppns,
                        'status_tilang' : status_tilang,
                        'catatan' : query_tilang.catatan,
                    }

                # Foto Penimbangan 1
                foto_penimbangan1 = static('dist/img/default-img.png')
                if penimbangan.foto_penimbangan1:
                    if os.path.exists(os.path.join('static', 'dist', 'img', 'penimbangan', penimbangan.foto_penimbangan1)):
                        foto_penimbangan1 = static('dist/img/penimbangan/') + penimbangan.foto_penimbangan1

                # Foto Penimbangan 2
                foto_penimbangan2 = static('dist/img/default-img.png')
                if penimbangan.foto_penimbangan2:
                    if os.path.exists(os.path.join('static', 'dist', 'img', 'penimbangan', penimbangan.foto_penimbangan2)):
                        foto_penimbangan2 = static('dist/img/penimbangan/') + penimbangan.foto_penimbangan2
                    
                row = {
                    'jenis_kendaraan_text' : jenis_kendaraan_text,
                    'panjang_kendaraan' : kendaraan.panjang,
                    'lebar_kendaraan' : kendaraan.lebar,
                    'tinggi_kendaraan' : kendaraan.tinggi,
                    'idp_penimbangan': penimbangan.id,
                    'id_transaksi': penimbangan.id_transaksi,
                    'noken': penimbangan.noken,
                    'nouji': penimbangan.nouji,
                    'masa_akhir_uji': penimbangan.masa_akhir_uji.strftime('%d/%m/%Y'),
                    'nama_pemilik': penimbangan.nama_pemilik,
                    'alamat_pemilik': penimbangan.alamat_pemilik,
                    'jbi': penimbangan.jbi,
                    'jbb': penimbangan.jbb,
                    'mst': penimbangan.mst,
                    'berat_timbangan': penimbangan.berat_timbangan,
                    'kelebihan_berat': penimbangan.kelebihan_berat,
                    'persentase_kelebihan_berat': penimbangan.persentase_kelebihan_berat,
                    'panjang_pengukuran': penimbangan.panjang_p,
                    'lebar_pengukuran': penimbangan.lebar_p,
                    'tinggi_pengukuran': penimbangan.tinggi_p,
                    'kelebihan_panjang': penimbangan.kelebihan_panjang,
                    'kelebihan_lebar': penimbangan.kelebihan_lebar,
                    'kelebihan_tinggi': penimbangan.kelebihan_tinggi,
                    'jumlah_sumbu': penimbangan.jumlah_sumbu,
                    'tgl_timbang': penimbangan.tgl_timbang.strftime('%d/%m/%Y'),
                    'jam_timbang': penimbangan.jam_timbang,
                    'nama_pemilik': penimbangan.nama_pemilik,
                    'alamat_pemilik': penimbangan.alamat_pemilik,
                    'asal_kendaraan': penimbangan.asal_kendaraan,
                    'tujuan_kendaraan': penimbangan.tujuan_kendaraan,
                    'komoditi': penimbangan.komoditi,
                    'pelanggaran_id': penimbangan.pelanggaran_id,
                    'pelanggaran': pelanggaran.nama_tilang.upper(),
                    'foto_penimbangan1': foto_penimbangan1,
                    'foto_penimbangan2': foto_penimbangan2,
                    'data_tilang' : datatilang,
                    'nama_jt' : lokasi.nama
               }
                return json_response(status=True, message='Success', data=row)
            else:
                return json_response(status=False, message='Credentials errors')
        else:
            # Params datatables
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search = request.GET.get('search[value]', '').strip()
            
            filter_sanksi = request.GET.get('filter_sanksi')
            filter_date_str = request.GET.get('filter_date')
            
            filter_date = datetime.strptime(filter_date_str, "%d/%m/%Y").date()
            start_datetime = make_aware(datetime.combine(filter_date, time.min))
            end_datetime = make_aware(datetime.combine(filter_date, time.max))

            query = DataPenimbangan.objects.filter(
                is_transaksi=1,
                is_melanggar='Y',
                is_tindakan='Y',
                kode_trx__in=DataPenindakan.objects.filter(
                    tgl_penindakan__range=(start_datetime, end_datetime)
                ).values_list('kode_trx', flat=True)
            ).annotate(
                tgl_penindakan=Subquery(
                    DataPenindakan.objects.filter(
                        kode_trx=OuterRef('kode_trx')
                    ).values('tgl_penindakan')[:1]
                )
            )
            if filter_sanksi and filter_sanksi != 'ALL':
                query = query.filter(
                    kode_trx__in=DataPenindakan.objects.filter(
                        sanksi_id=filter_sanksi
                    ).values_list('kode_trx', flat=True)
                )
            if search:
                query = query.filter(
                    Q(no_kendaraan__icontains=search) |
                    Q(no_uji__icontains=search) |
                    Q(nama_pemilik__icontains=search)
                )

            get_row = query.all()
            total_record = query.count()
            paginated_record = get_row[start:start + length]

            data = []

            for index, penimbangan in enumerate(paginated_record, start=start + 1):
                pelanggaran = 'TIDAK MELANGGAR'
                sanksi_name = '-'

                if penimbangan.is_melanggar == 'Y':
                    pelanggaran_qs = DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx)

                    if pelanggaran_qs.exists():
                        pelanggaran = ''
                        for pel in pelanggaran_qs:
                            try:
                                jenis_pelanggaran = MasterJenisPelanggaran.objects.get(
                                    id=int(pel.jenis_pelanggaran_id)
                                )
                                pelanggaran += '<span class="badge badge-light me-1 text-dark">' + jenis_pelanggaran.nama + '</span>'
                            except MasterJenisPelanggaran.DoesNotExist:
                                continue

                    penindakan = DataPenindakan.objects.filter(kode_trx=penimbangan.kode_trx).first()
                    if penindakan:
                        sanksi = Sanksi.objects.filter(id=penindakan.sanksi_id).first()
                        if sanksi:
                            sanksi_name = sanksi.nama
                action = f"""
                    <button type="button" 
                            class="btn btn-sm btn-dark ms-1" 
                            data-bs-toggle="tooltip" 
                            title="Cetak Surat Peringatan!" 
                            onclick="_printSuratPeringatan('Y', '{penimbangan.id}');">
                        <i class="ki-solid ki-printer fs-6"></i>Peringatan
                    </button>
                """
                if penindakan.sanksi_id == 11:
                    action = f"""
                        <button type="button" 
                                class="btn btn-sm btn-dark ms-1" 
                                data-bs-toggle="tooltip" 
                                title="Cetak Blanko Tilang!" 
                                onclick="_printSuratTilang('Y', '{penimbangan.id}');">
                            <i class="ki-solid ki-printer fs-6"></i>Blanko
                        </button>
                    """

                tgl_penindakan = convert_timezone(
                    penimbangan.tgl_penindakan,
                    request.COOKIES.get('timezone')
                )

                data.append({
                    'no': f"{index:,}" if index else '-',
                    'no_kendaraan': penimbangan.no_kendaraan,
                    'no_uji': penimbangan.no_uji,
                    'waktu': tgl_penindakan.strftime('%d/%m/%Y %H:%M'),
                    'nama_pemilik': penimbangan.nama_pemilik,
                    'pelanggaran': pelanggaran,
                    'sanksi': sanksi_name,
                    'status': '-',
                    'action': action
                })

            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': get_row.count(),
                'data': data
            })

    except Exception as e:
        return json_response(status=False, message=str(e), code=401)    
def store(request):
    # ==============================
    # AMBIL DATA DARI COOKIES
    # ==============================
    timbangan_id                = request.COOKIES.get('timbangan_id')
    shift_id                    = request.COOKIES.get('shift_id')
    regu_id                     = request.COOKIES.get('regu_id')
    # ==============================
    # HEADER DATA
    # ==============================
    current_time                = datetime.now()
    lokasi                      = LokasiUppkb.objects.first()
    user                        = request.user
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
    # FORM PENINDAKAN
    # ==============================
    sanksi_id                   = request.POST.get('sanksi_id')
    kat_jenis_kendaraan         = request.POST.get('kat_jenis_kendaraan')
    ppns_id                     = request.POST.get('ppns_id')
    nama_ppns                   = request.POST.get('nama_ppns')
    no_skep                     = request.POST.get('no_skep')
    tanggal_sidang              = request.POST.get('tanggal_sidang')
    jam_sidang                  = request.POST.get('jam_sidang')
    pengadilan_id               = request.POST.get('pengadilan_id')
    kejaksaan_id                = request.POST.get('kejaksaan_id')
    pasal_id                    = request.POST.getlist('pasal_id')
    sitaan_id                   = request.POST.getlist('sitaan_id')
    sub_sanksi_id               = request.POST.getlist('sub_sanksi_id')
    keterangan_penindakan       = request.POST.get('keterangan_penindakan')
    
    pasal_id_str = ",".join(pasal_id) if pasal_id else None
    sub_sanksi_id_str = ",".join(sub_sanksi_id) if sub_sanksi_id else None
    sitaan_id_str = ",".join(sitaan_id) if sitaan_id else None
    
    kode_penindakan             = generate_kode_penindakan(kode_uppkb=lokasi.kode)
    kendaraan_id                = request.POST.get('no_kendaraan')
    penimbangan                 = DataPenimbangan.objects.filter(id=kendaraan_id).first()
    if penimbangan :
        # ==============================
        # PPNS PETUGAS
        # ==============================
        ppns = DataSdm.objects.filter(id=ppns_id).first()
        ppns_name = '-'
        ppns_no_skep = '-'
        ppns_nip = '-'
        ppns_pangkat = '-'
        if ppns:
            ppns_pangkat = ppns.pangkat
            ppns_name = ppns.name
            ppns_no_skep = ppns.no_skep
            ppns_nip = ppns.nip
        
        # ==============================
        # KOMODITI, ASAL, TUJUAN, PENGADILAN, KATJENISKENDARAAN
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
        jenis_kendaraan_tilang = MasterJenisKendaraanTilang.objects.filter(id=kat_jenis_kendaraan).first()
        if not jenis_kendaraan_tilang:
            return json_response(status=False, message="Kategori jenis kendaraan tidak ditemukan", code=400)

        pengadilan = Pengadilan.objects.first()
        kejaksaan = Kejaksaan.objects.first()
        now = datetime.now()
        tanggal_sidang_str = now.strftime("%Y-%m-%d")
        jam_sidang_str = now.strftime("%H:%M")
        if int(sanksi_id) == 11:
            pengadilan = Pengadilan.objects.filter(id=pengadilan_id).first()
            if not pengadilan:
                return json_response(status=False, message="Pengadilan tidak ditemukan", code=400)
            kejaksaan = Kejaksaan.objects.filter(id=kejaksaan_id).first()
            if not kejaksaan:
                return json_response(status=False, message="Kejaksaan tidak ditemukan", code=400)
            
            tanggal_sidang = datetime.strptime(tanggal_sidang, "%d/%m/%Y")
            tanggal_sidang_str = tanggal_sidang.strftime("%Y-%m-%d")
            jam_sidang_str = jam_sidang
            
            # ==============================
            # UPDATE PROTECTION
            # ==============================
            DataPeringatan.objects.filter(
                no_kendaraan=penimbangan.no_kendaraan
            ).update(is_protection='N')

        # ==============================
        # GET PELANGGARAN
        # ==============================
        pelanggaran = []
        if penimbangan.is_melanggar == 'Y':
            getPelanggaran = DataPelanggaran.objects.filter(kode_trx=penimbangan.kode_trx).select_related('jenis_pelanggaran').all()
            for row in getPelanggaran:
                pelanggaran.append({
                    'id' : row.jenis_pelanggaran_id,
                    'name' : row.jenis_pelanggaran.nama,
                })

        # ==============================
        # DATA PENINDAKAN 
        # ==============================
        data_penindakan = dict(
            id=uuid.uuid4(),
            shift_id=shift_id,
            regu_id=regu_id,
            petugas_id=user.id,
            kode_penindakan=kode_penindakan,

            # PENGEMUDI
            gol_sim_id=gol_sim_id,
            no_sim=no_identitas,
            nama_pengemudi=nama_pengemudi,
            alamat_pengemudi=alamat_pengemudi,
            umur_pengemudi=umur_pengemudi,
            jenis_kelamin=jenis_kelamin_pengemudi,
            warna_kendaraan=warna_kendaraan,
            no_telp_pengemudi=no_telepon,
            
            # PENIMBANGAN
            kode_trx=penimbangan.kode_trx,
            no_kendaraan=penimbangan.no_kendaraan,
            bptd_id=penimbangan.bptd_id,
            kode_uppkb=penimbangan.kode_uppkb,
            lokasi_id=penimbangan.lokasi_id,
            asal_kota_id=penimbangan.asal_kota_id,
            tujuan_kota_id=penimbangan.tujuan_kota_id,

            # PENINDAKAN
            sanksi_id=sanksi_id,
            is_tilang= 1 if sanksi_id == 11 else 0,
            kategori_jenis_kendaraan = jenis_kendaraan_tilang.nama if jenis_kendaraan_tilang else 'UNKNOWN',
            kategori_jenis_kendaraan_id=jenis_kendaraan_tilang.id if jenis_kendaraan_tilang else 0,
            keterangan_tindakan= keterangan_penindakan if keterangan_penindakan else None,
            pengadilan_id= pengadilan.id if pengadilan else None,
            pengadilan_kode=pengadilan.kode if pengadilan else None,
            kejaksaan_id=kejaksaan.id if kejaksaan else None,
            kejaksaan_kode=kejaksaan.kode if kejaksaan else None,
            ppns_id=ppns_id,
            nama_ppns=ppns_name,
            pangkat_ppns=ppns_pangkat,
            no_skep=ppns_no_skep,
            nip_ppns=ppns_nip,
            ham_nomor='AHU-12.AH.09.01 TAHUN 2025',
            tgl_sidang=tanggal_sidang_str,
            jam_sidang=jam_sidang_str,
            pasal=pasal_id_str,
            sanksi_tambahan=sub_sanksi_id_str,
            sitaan=sitaan_id_str,

            created_by=user.id
        )
        for key, value in data_penindakan.items():
            print(f"{key:25} : {value}")
        # SIMPAN PENINDAKAN
        penindakan = DataPenindakan(**data_penindakan)
        penindakan.save()

        sitaan_objects = []
        for sitaan in sitaan_id:
            sitaan_objects.append(DataSitaanDetail(
                id=uuid.uuid4(),
                kode_penindakan=penindakan.kode_penindakan,
                kode_trx=penindakan.kode_trx,
                no_kendaraan=penindakan.no_kendaraan,
                kode_uppkb=penindakan.kode_uppkb,
                lokasi_id=penindakan.lokasi_id,
                tgl_penindakan=timezone.now().date(),
                created_by=penindakan.created_by,
                sitaan_id=sitaan,
            ))
        DataSitaanDetail.objects.bulk_create(sitaan_objects)
        # UPDATE STATUS PENINDAKAN
        penimbangan.is_tindakan = 'Y'
        penimbangan.save()
        # ==============================
        # IDENTITAS PENGEMUDI 
        # ==============================
        identitas_pengendara = dict(       
            no_kendaraan=penindakan.no_kendaraan,     
            nama_pengemudi=nama_pengemudi,
            alamat_pengemudi=alamat_pengemudi,
            jenis_kelamin_pengemudi=jenis_kelamin_pengemudi,
            umur_pengemudi=umur_pengemudi,
            no_telepon=no_telepon,
            warna_kendaraan=warna_kendaraan,
            gol_sim_id=gol_sim_id,
            no_identitas=no_identitas,
        )
        save_komoditi_asaltujuan_pengemudi(identitas_pengendara, jenisupdate="PENGEMUDI")
        # ==============================
        # SAVE PERINGATAN
        # ==============================
        if int(sanksi_id) == 10:
            date_today = date.today()
            nomor_formulir = generate_nomor_formulir(kodeBidang='HUB.01')
            data_peringatan = dict(
                no_kendaraan=penimbangan.no_kendaraan,
                tgl_peringatan=current_time,
                kode_penindakan=kode_penindakan,

                nomor_formulir=nomor_formulir,
                nomor=generate_nomor_um(lokasi.nama.upper()),
                
                tgl_disahkan=date_today,
                tgl_diberlakukan=date_today,
                tgl_revisi='-',
                is_protection='Y',

                created_at=current_time,
            )
            for key, value in data_peringatan.items():
                print(f"{key:25} : {value}")
            # SIMPAN PERINGATAN
            peringatan = DataPeringatan(**data_peringatan)
            peringatan.save()

        results = {
            'idp_penimbangan' : penimbangan.id,
            'sanksi_id' : int(sanksi_id),
        }
        return json_response(status=True, message='Penindakan kendaraan berhasil dilakukan.', data=results)
    else:
        return json_response(status=False, message='Credentials errors')
def update(request):
    user = request.user
    idp_penimbangan = request.POST.get('idp_penimbangan')
    status_tilang = request.POST.get('status_tilang')
    no_tilang = request.POST.get('no_tilang')
    tanggal_sidang = request.POST.get('tanggal_sidang')
    lokasi_sidang = request.POST.get('lokasi_sidang')
    catatan = request.POST.get('catatan')
    penimbangan = DataPenimbangan.objects.filter(id=idp_penimbangan).first()
    DataTilang.objects.filter(id_transaksi=penimbangan.id_transaksi).delete()
    if status_tilang == 'TILANG':
        penimbangan.sts_data = 2
        penimbangan.ppns_regu_id = user.regu_id
        penimbangan.ppns = user.id
        penimbangan.save()

        tanggal_sidang = datetime.strptime(tanggal_sidang, "%d/%m/%Y")
        tanggal_sidang = tanggal_sidang.strftime("%Y-%m-%d")
        DataTilang.objects.create(
            pelanggaran_id =penimbangan.pelanggaran_id,
            id_transaksi =penimbangan.id_transaksi,
            no_tilang =no_tilang,
            tgl_sidang =tanggal_sidang,
            catatan =catatan,
            lokasi_sidang =lokasi_sidang,
            nama_ppns =user.nama,
            nip_ppns =user.nip,
            sts_data =1,
            created_at =timezone.now(),
        )
        results = {
            'idp_penimbangan': idp_penimbangan
        }
        return json_response(status=True, message='Kendaraan sudah ditilang, selanjutnya akan dilakukan pencetakkan surat tilang.', data=results)
    if status_tilang == 'NORMAL':
        penimbangan.status_melanggar = 'TIDAK MELANGGAR'
        penimbangan.pelanggaran_id = 0
        penimbangan.sts_data = 2
        penimbangan.ppns_regu_id = user.regu_id
        penimbangan.ppns = user.id
        penimbangan.catatan_ppns = catatan
        penimbangan.save()
        return json_response(status=True, message='Kendaraan tidak melanggar dan surat tilang tidak akan diterbitkan.')
    else:
        penimbangan.status_melanggar = status_tilang
        penimbangan.sts_data = 2
        penimbangan.ppns_regu_id = user.regu_id
        penimbangan.ppns = user.id
        penimbangan.catatan_ppns = catatan
        penimbangan.save()
        return json_response(status=True, message='Kendaraan telah dikenakan tilang dan surat tilang tidak akan diterbitkan.')
# def print_surat_tilang(request):
#     config = KonfigurasiAlat.objects.get(id=1)
    
#     printer_ip = '192.168.113.2'
#     printer_port = int(config.port_printer_penimbangan)
#     try:
#         p = Network(printer_ip, printer_port)
#         # Header
#         p.set(align="center", bold=True, double_height=True, double_width=True)
#         p.text("SURAT PENILANGAN KENDARAAN BERMOTOR\n")
#         p.set(align="center", bold=True, double_height=False, double_width=False)
#         p.text("UNIT PELAYANAN PENIMBANGAN KENDARAAN BERMOTOR\n")
#         p.text("SABILAMBO\n\n")

#         p.set(align="left", bold=False)
#         p.text("--------------------------------------------\n")

#         # Isi Detail
#         p.text("Tanggal Penimbangan   : 17/12/2024\n")
#         p.text("Jam Penimbangan       : 08:51:03\n")
#         p.text("No. Kendaraan         : B7890SXE\n")
#         p.text("No. Uji Kendaraan     : BSE012382BSE\n")
#         p.text("Pemilik               : KETUT CARMITA\n")
#         p.text("Masa Berlaku Uji      : 31/01/2025\n")
#         p.text("Alamat                : BALI INDONESIA\n")
#         p.text("Jumlah Sumbu          : 4\n")
#         p.text("JBI                   : 500 Kg\n")
#         p.text("Berat Timbangan       : 520 Kg\n")
#         p.text("Kelebihan Berat       : 20 Kg\n")
#         p.text("Persen Kelebihan      : 4.00 %\n")
#         p.text("Asal                  : SIMULASI\n")
#         p.text("Tujuan                : SIMULASI\n")
#         p.text("Komoditi              : PRODUK PERTANIAN\n")
#         p.text("Jenis Tilang          : BERAT-DOKUMEN-DIMENSI\n")
#         p.text("No. Tilang            : 002/BPTD-II/2024\n")
#         p.text("Tanggal Sidang        : 31/12/2024\n")
#         p.text("Keterangan            : MELANGGAR BERAT DOKUMEN DIMENSI\n")
#         p.text("--------------------------------------------\n\n")

#         # Petugas
#         p.set(align="center", bold=True)
#         p.text("Petugas PPNS\n\n")

#         p.set(align="center", bold=True)
#         p.text("ALBERT EINSTEIN\n")
#         p.text("198411132008121001\n\n")

#         # QR Code
#         p.qr("https://example.com/verify?id=20241210072604", size=6)
#         p.text("\n\n")

#         # Footer
#         p.cut()
#     except (socket.error, ConnectionRefusedError, TimeoutError) as e:
#         return json_response(status=False, message='Koneksi printer gagal, periksa kembali konfigurasi IP & Port printer!')