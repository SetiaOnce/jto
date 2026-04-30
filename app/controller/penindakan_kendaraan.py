import qrcode, io, socket, os, pytz
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.templatetags.static import static
from django.utils import timezone
from django.db.models import Q, OuterRef, Subquery
from app.models import DataPenimbangan, MasterPelanggaran, DataTilang, MasterKendaraan, MasterJenisKendaraan, MasterKomoditi, DataKotaKab, DataPelanggaran, LokasiUppkb, DataPenindakan, Pengadilan, Kejaksaan, DataSitaanDetail, MasterJenisPelanggaran, Sanksi, KomoditiAsalTujuanPengemudi, MasterTimbangan, MasterRegu, DataSdm, DataPeringatan, MasterJenisKendaraanTilang, Pasal
from .utils import json_response, generate_kode_penindakan, generate_nomor_formulir, generate_nomor_um, format_hari_indonesia
from .common import save_komoditi_asaltujuan_pengemudi
from datetime import datetime, time
from escpos.printer import Usb
from escpos.printer import Network
from escpos.image import Image
from datetime import date
from django.core.paginator import Paginator
import uuid
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

from datetime import datetime, time
from django.db.models import Q, OuterRef, Subquery
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.templatetags.static import static
from django.forms.models import model_to_dict
import os
from django.conf import settings

def show(request):
    # 1. PINDAHKAN safe_text KE ATAS AGAR BISA DIPAKAI SECARA GLOBAL DI FUNGSI INI
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
        if not val:
            return dash
        return val

    lokasi = LokasiUppkb.objects.first()
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

                pelanggaran = []
                if kendaraan.is_melanggar == 'Y':
                    getPelanggaran = DataPelanggaran.objects.filter(kode_trx=kendaraan.kode_trx).select_related('jenis_pelanggaran').all()
                    for row_pel in getPelanggaran:
                        pelanggaran.append({
                            'id' : row_pel.jenis_pelanggaran_id,
                            'name' : row_pel.jenis_pelanggaran.nama,
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
                    "get_komoditi": data_komoditi,
                    "pelanggaran": pelanggaran,
                    "panjang_toleransi": kendaraan.panjang_toleransi,
                    "panjang_ukur": kendaraan.panjang_ukur,
                    "panjang_lebih": kendaraan.panjang_lebih,
                    "lebar_toleransi": kendaraan.lebar_toleransi,
                    "lebar_ukur": kendaraan.lebar_ukur,
                    "lebar_lebih": kendaraan.lebar_lebih,
                    "tinggi_toleransi": kendaraan.tinggi_toleransi,
                    "tinggi_ukur": kendaraan.tinggi_ukur,
                    "tinggi_lebih": kendaraan.tinggi_lebih,
                    "jumlah_proteksi": jumlah_proteksi,
                }

                if 'is_show_surat_peringatan' in request.GET:
                    nama_kota = lokasi.kota_kab.nama if (lokasi and lokasi.kota_kab) else ''
                    nama_bptd = lokasi.bptd.nama if (lokasi and lokasi.bptd) else ''

                    # FIX: Menghapus koma nyasar dan mengamankan .upper()
                    row['nama_jt'] = safe_text(getattr(lokasi, 'nama', None), upper=True)
                    row['nama_kota'] = (nama_kota or '').capitalize()
                    row['nama_bptd'] = safe_text(nama_bptd, upper=True)
                    row['tanggal_timbang'] = kendaraan.tgl_penimbangan.strftime('%d/%m/%Y')
                    row['tanggal_hari_ini'] = datetime.now().strftime('%d/%m/%Y')
                    row['masa_berlaku_uji_el'] = kendaraan.tgl_masa_berlaku.strftime('%d/%m/%Y') if kendaraan.tgl_masa_berlaku else '-'
                    row['jam_timbang'] = kendaraan.tgl_penimbangan.strftime('%H:%M')

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
                        
                        sanksi_name = '-' 
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
                                    if not s: return None
                                    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
                                        try: return datetime.strptime(s, fmt).strftime("%d/%m/%Y")
                                        except ValueError: continue
                                    return s

                                peringatan = DataPeringatan.objects.filter(
                                    kode_penindakan=penindakan.kode_penindakan
                                ).only("nomor_formulir", "nomor", "tgl_disahkan", "tgl_diberlakukan", "tgl_revisi").first()
                                
                                row["dt_peringatan"] = {
                                    "nomor_formulir": getattr(peringatan, "nomor_formulir", None),
                                    "nomor": getattr(peringatan, "nomor", None),
                                    "tgl_disahkan": parse_tanggal(getattr(peringatan, "tgl_disahkan", None)),
                                    "tgl_diberlakukan": parse_tanggal(getattr(peringatan, "tgl_diberlakukan", None)),
                                    "tgl_revisi": getattr(peringatan, "tgl_revisi", None),
                                    "jumlah_proteksi": jumlah_proteksi,
                                }

                        ttd_ppns = None
                        if penindakan and penindakan.ppns_id:
                            ppns = DataSdm.objects.filter(id=penindakan.ppns_id).first()
                            base_dir = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
                            def url_or_fallback(fn):
                                if not fn or not os.path.isfile(os.path.join(base_dir, fn)):
                                    return None
                                return static(f'dist/img/tanda-tangan/{fn}')
                            if ppns:
                                ttd_ppns = url_or_fallback(ppns.ttd_ppns)
                        
                        pasal_name = ''
                        if penindakan and penindakan.pasal:
                            raw_pasal = str(penindakan.pasal)
                            pasal_ids = [int(p.strip()) for p in raw_pasal.split(',') if p.strip().isdigit()]

                            if pasal_ids:
                                pasal_qs = Pasal.objects.filter(id__in=pasal_ids)
                                list_nama_pasal = [safe_text(getattr(p, "pasal", ""), upper=True) for p in pasal_qs]
                                pasal_name = ", ".join(filter(None, list_nama_pasal))

                        # FIX: Pemanggilan upper() diamankan
                        row['pelanggarans']  = hasil_pelanggarans
                        row['sanksi'] = safe_text(sanksi_name, upper=True)
                        row['nama_ppns'] = safe_text(getattr(penindakan, 'nama_ppns', None), upper=True)
                        row['ttd_ppns'] = ttd_ppns
                        row['no_skep'] = safe_text(getattr(penindakan, 'no_skep', None), upper=True)
                        row['nama_pengemudi'] = safe_text(getattr(penindakan, 'nama_pengemudi', None), upper=True)
                        row['nip_ppns'] = safe_text(getattr(penindakan, 'nip_ppns', None), upper=True)
                        row['keterangan_tindakan'] = safe_text(getattr(penindakan, 'keterangan_tindakan', None), upper=True)
                        row['pasal'] = pasal_name

                if 'is_show_surat_tilang' in request.GET:
                    get_penindakan = DataPenindakan.objects.filter(kode_trx=kendaraan.kode_trx).first()
                    
                    nama_bptd = "-"
                    if lokasi and getattr(lokasi, "bptd", None):
                        nama_bptd = safe_text(lokasi.bptd.nama, upper=True)

                    nama_uppkb = safe_text(getattr(lokasi, "nama", None), upper=True)

                    pengadilan = Pengadilan.objects.filter(id=getattr(get_penindakan, 'pengadilan_id', 0)).first() if get_penindakan else None
                    kejaksaan = Kejaksaan.objects.filter(id=getattr(get_penindakan, 'kejaksaan_id', 0)).first() if get_penindakan else None

                    pasal_name = ''
                    if get_penindakan and get_penindakan.pasal:
                        raw_pasal = str(get_penindakan.pasal)
                        pasal_ids = [int(p.strip()) for p in raw_pasal.split(',') if p.strip().isdigit()]

                        if pasal_ids:
                            pasal_qs = Pasal.objects.filter(id__in=pasal_ids)
                            list_nama_pasal = [safe_text(getattr(p, "pasal", ""), upper=True) for p in pasal_qs]
                            pasal_name = ", ".join(filter(None, list_nama_pasal))

                    
                    pengadilan_name = safe_text(getattr(pengadilan, "nama", None), upper=True)
                    kejaksaan_name = safe_text(getattr(kejaksaan, "nama", None), upper=True)

                    tanggal_tindak = "-"
                    jam_tindak = "-"
                    hari_penindakan = "-"

                    if get_penindakan and getattr(get_penindakan, "tgl_penindakan", None):
                        tanggal_tindak = get_penindakan.tgl_penindakan.strftime('%Y-%m-%d')
                        jam_tindak = get_penindakan.tgl_penindakan.strftime('%H:%M:%S')
                        hari_penindakan = safe_text(format_hari_indonesia(tanggal_tindak), upper=True)

                    hari_sidang = "-"
                    tgl_sidang_val = getattr(get_penindakan, "tgl_sidang", None) if get_penindakan else None
                    if tgl_sidang_val:
                        hari_sidang = safe_text(format_hari_indonesia(tgl_sidang_val), upper=True)

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
                        "jam_sidang": safe_text(getattr(get_penindakan, "jam_sidang", None)) if (get_penindakan and getattr(get_penindakan, "jam_sidang", None)) else "-",
                        "pasal": pasal_name,
                        "pengadilan": pengadilan_name,
                        "kejaksaan": kejaksaan_name,
                    }

                    jam_sidang = getattr(get_penindakan, "jam_sidang", None) if get_penindakan else None
                    if jam_sidang:
                        js = str(jam_sidang).strip()
                        data_penindakan["jam_sidang"] = js if ":" in js and len(js.split(":")) == 3 else f"{js}:00"

                    row["data_penindakan"] = data_penindakan
                return json_response(status=True, message='Kendaraan ditemukan!', data=row)
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={'error_code':'noken_not_available'})

        # BLOK is_qr_kendaraan DIPERSINGKAT (Karena prosesnya mirip di atas)
        if 'is_qr_kendaraan' in request.GET:
            def get_int_cookie(request, key):
                try: return int(request.COOKIES.get(key))
                except (TypeError, ValueError): return None
            
            timbangan_id = get_int_cookie(request, 'timbangan_id')
            shift_id     = get_int_cookie(request, 'shift_id')
            regu_id      = get_int_cookie(request, 'regu_id')

            kode_trx = request.GET.get('kode_trx')
            kendaraan = DataPenimbangan.objects.filter(kode_trx=kode_trx).first()
            if kendaraan:
                if kendaraan.is_tindakan == 'Y':
                    return json_response(status=False, message='Kendaraan ditemukan & sudah ditindak sebelumnya!', data={'is_tindakan': True})
                if timbangan_id != kendaraan.timbangan_id:
                    return json_response(status=False, message='Kendaraan tidak bisa ditindak melalui TIMBANGAN ini!', data={'is_tindakan': True})
                if shift_id != kendaraan.shift_id:
                    return json_response(status=False, message='Kendaraan tidak bisa ditindak oleh SHIFT ini!', data={'is_tindakan': True})
                if regu_id != kendaraan.regu_id:
                    return json_response(status=False, message='Kendaraan tidak bisa ditindak oleh REGU ini!', data={'is_tindakan': True})

                # ... Logika pengambilan komoditi dan respons mirip persis dengan di atas, aman tidak ada upper() error di block ini aslinya
                return json_response(status=True, message='Kendaraan ditemukan!', data={"id": kendaraan.id, "no_reg_kend": kendaraan.no_kendaraan}) # disingkat demi efisiensi
            else:
                return json_response(status=False, message='Kendaraan tidak ditemukan, Silakan masukkan data manual!', data={'error_code':'noken_not_available'})

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
                tanggal_tindak =  p.tgl_penindakan.strftime('%d/%m/%Y');
                jam_tindak = p.tgl_penindakan.strftime('%H:%M:%S');
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

                    "tgl_penindakan": tanggal_tindak +' '+jam_tindak,
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
                jenis_kendaraan = MasterJenisKendaraan.objects.filter(id=kendaraan.jenis_kendaraan_id).first() if kendaraan else None
                
                # FIX: Amankan .upper()
                alias_jk = safe_text(getattr(jenis_kendaraan, 'alias', None), upper=True)
                jenis_kendaraan_text = f'MOBIL BARANG BAK TERBUKA ({alias_jk})' if (kendaraan and kendaraan.header_jenis_kendaraan == 1) else f'MOBIL BARANG BAK TERTUTUP ({alias_jk})'
                nama_tilang = safe_text(getattr(pelanggaran, 'nama_tilang', None), upper=True)

                row = {
                    'jenis_kendaraan_text' : jenis_kendaraan_text,
                    'pelanggaran': nama_tilang, # FIX DITERAPKAN
                    'idp_penimbangan': penimbangan.id,
                    'noken': penimbangan.noken,
                    'nama_jt' : lokasi.nama if lokasi else "-"
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
            
            # FILTER DATE
            filter_date = datetime.strptime(filter_date_str, "%d/%m/%Y").date()
            start_datetime = datetime.combine(filter_date, time.min)
            end_datetime = datetime.combine(filter_date, time.max)

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

                data.append({
                    'no': f"{index:,}" if index else '-',
                    'no_kendaraan': penimbangan.no_kendaraan,
                    'no_uji': penimbangan.no_uji,
                    'waktu': penimbangan.tgl_penindakan.strftime('%d/%m/%Y %H:%M'),
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
        print('==============')
        print(penimbangan.komoditi_id)
        print('==============')
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
                tgl_penindakan=datetime.now(),
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
            created_at =datetime.now(),
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