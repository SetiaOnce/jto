from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from app.models import LokasiUppkb, DataPenimbangan, MasterPelanggaran, MasterKomoditi, DataKotaKab, MasterTimbangan, MasterJenisKendaraan, MasterRegu, MasterShift, UserSystem, DataPelanggaran, MasterJenisPelanggaran, DataPenindakan, MasterGolSim, Sanksi, MasterRegu
from django.templatetags.static import static
from django.db.models import Q
from datetime import date, time
from .utils import json_response
import locale, os
from datetime import datetime, timedelta
from django.utils.timezone import now
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from .api import login_pusat, send_penimbangan_to_pusat, send_pelanggaran_to_pusat, send_penindakan_to_pusat, send_penimbangan_to_balai, send_penindakan_to_balai

def index(request):
    locale.setlocale(locale.LC_TIME, 'id_ID.UTF-8')
    lokasi = LokasiUppkb.objects.first()
    context = {
        'title': 'Pengiriman Penimbangan',
        'active_menu': 'send_data',
        'app_name': lokasi.nama,
        'today' : date.today().strftime("%d/%m/%Y"),
    }
    return render(request, 'backend/reports_send_data.html', context)

def show(request):
    if 'is_show_penindakan' in request.GET:
        # Params datatables
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search = request.GET.get('search[value]', '').strip()

        
        filter_tujuan = request.GET.get('filter_tujuan')
        filter_regu = request.GET.get('filter_regu')
        filter_sanksi = request.GET.get('filter_sanksi')
        filter_date = str(request.GET.get('filter_date') or '')

        start_date_str, end_date_str = filter_date.split(" - ")
        start_date = datetime.strptime(start_date_str, "%d/%m/%Y").date()
        end_date = datetime.strptime(end_date_str, "%d/%m/%Y").date()

        start_datetime = datetime.combine(start_date, time.min)
        end_datetime = datetime.combine(end_date, time.max)

        query = DataPenindakan.objects.filter(
            # is_send_to_pusat='N',
        )
        if filter_date:
            query = query.filter(tgl_penindakan__range=(start_datetime, end_datetime))
        query = query.filter(is_send_to_pusat='N')

        if filter_sanksi and filter_sanksi != 'ALL':
            query = query.filter(sanksi_id=filter_sanksi)
        if filter_regu and filter_regu != 'ALL':
            query = query.filter(regu_id = filter_regu)
        if search:
            query = query.filter(
                Q(no_kendaraan__icontains=search)
            )

        get_row = query.all()
        total_record = query.count()
        paginated_record = get_row[start:start + length]

        data = []

        for index, penindakan in enumerate(paginated_record, start=start + 1):
            pelanggaran = 'TIDAK MELANGGAR'
            sanksi_name = '-'
            regu_name = '-'

            pelanggaran_qs = DataPelanggaran.objects.filter(kode_trx=penindakan.kode_trx)
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

            sanksi = Sanksi.objects.filter(id=penindakan.sanksi_id).first()
            if sanksi:
                sanksi_name = sanksi.nama

            regu = MasterRegu.objects.filter(id=penindakan.regu_id).first()
            if sanksi:
                regu_name = regu.nama

            action = f"""<button type="button" class="btn btn-sm btn-success mb-1 ms-1" data-bs-toggle="tooltip" title="Kirim penindakan!" onclick="sendDataPenindakan('{penindakan.id}');"><i class="ki-outline ki-send"></i>Kirim</button>
            """

            data.append({
                'no': f"{index:,}" if index else '-',
                'no_kendaraan': penindakan.no_kendaraan,
                'waktu': penindakan.tgl_penindakan.strftime('%d/%m/%Y %H:%M'),
                'nama_ppns': penindakan.nama_ppns,
                'pelanggaran': pelanggaran,
                'sanksi': sanksi_name,
                'regu': regu_name,
                'kategori_jenis_kendaraan': penindakan.kategori_jenis_kendaraan,
                'action': action
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_record,
            'recordsFiltered': get_row.count(),
            'data': data
        })
    else:
        try:
            # Params datatables
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search = request.GET.get('search[value]', '').strip()

            filter_tujuan = request.GET.get('filter_tujuan')
            filter_shift = request.GET.get('filter_shift')
            filter_regu = request.GET.get('filter_regu')
            filter_timbangan = request.GET.get('filter_timbangan')
            filter_date = str(request.GET.get('filter_date') or '')
            print("="*40)
            print("FILTER PARAMETER:")
            print(f"Tujuan    : {filter_tujuan or '-'}")
            print(f"Shift     : {filter_shift or '-'}")
            print(f"Regu      : {filter_regu or '-'}")
            print(f"Timbangan : {filter_timbangan or '-'}")
            print(f"Tanggal   : {filter_date or '-'}")
            print("="*40)
            start_date_str, end_date_str = filter_date.split(" - ")
            start_date = datetime.strptime(start_date_str, "%d/%m/%Y").date()
            end_date = datetime.strptime(end_date_str, "%d/%m/%Y").date()

            start_datetime = datetime.combine(start_date, time.min)
            end_datetime = datetime.combine(end_date, time.max)
            # Query seperti biasa
            query = DataPenimbangan.objects.order_by('-tgl_penimbangan').filter(
                is_transaksi=1,
                # is_melanggar='Y',
                # is_tindakan='Y',
                # is_send_to_pusat='N',
                tgl_penimbangan__range=(start_datetime, end_datetime)
            )
            if filter_tujuan and filter_tujuan != 'ALL':
                if filter_tujuan == 'BPTD':
                    query = query.filter(is_send_to_balai='N')
                if filter_tujuan == 'KEMENHUB':
                    query = query.filter(is_send_to_pusat='N')
            else:
                query = query.filter(is_send_to_balai='N', is_send_to_pusat='N')

            if filter_shift and filter_shift != 'ALL':
                query = query.filter(
                    shift_id = filter_shift
                )
            if filter_regu and filter_regu != 'ALL':
                query = query.filter(
                    regu_id = filter_regu
                )
            if filter_timbangan and filter_timbangan != 'ALL':
                query = query.filter(
                    timbangan_id = filter_timbangan
                )
            if search:
                query = query.filter(
                    Q(noken__icontains=search) |
                    Q(nouji__icontains=search) |
                    Q(nama_pemilik__icontains=search)
                )
            getRow = query.all()
            total_record = query.count()
            paginated_record = getRow[start:start+length]
            data = []

            for index, penimbangan in enumerate(paginated_record, start=start + 1):
                melanggarCustom = '<span class="badge badge-success fs-7">TIDAK MELANGGAR</span>' if penimbangan.is_melanggar == 'N' else '<span class="badge badge-danger fs-7">MELANGGAR</span>'
                statusPengiriman = '<span class="badge badge-danger fs-7">BELUM DIKIRIM</span>' if penimbangan.is_send_to_pusat == 'N' else '<span class="badge badge-success fs-7">TERKIRIM</span>'
                action = '-'
                if penimbangan.is_send_to_pusat == 'N' or penimbangan.is_send_to_balai == 'N':
                    action = f'''
                        <button type="button" class="btn btn-sm btn-success mb-1 ms-1" data-bs-toggle="tooltip" title="Kirim penimbangan!" onclick="sendDataPenimbangan('{penimbangan.id}');"><i class="ki-outline ki-send"></i>Kirim</button>
                    '''
                # Foto Penimbangan Depan
                foto_depan = static('dist/img/default-img.png')
                if penimbangan.foto_depan:
                    if os.path.exists(os.path.join('static', 'dist', 'img', 'penimbangan', penimbangan.foto_depan)):
                        foto_depan = static('dist/img/penimbangan/') + penimbangan.foto_depan

                # Foto Penimbangan Belakang
                foto_belakang = static('dist/img/default-img.png')
                if penimbangan.foto_belakang:
                    if os.path.exists(os.path.join('static', 'dist', 'img', 'penimbangan', penimbangan.foto_belakang)):
                        foto_belakang = static('dist/img/penimbangan/') + penimbangan.foto_belakang
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
                timbangan = MasterTimbangan.objects.filter(id=penimbangan.timbangan_id).first()
                regu = MasterRegu.objects.filter(id=penimbangan.regu_id).first()
                shift = MasterShift.objects.filter(id=penimbangan.shift_id).first()
                jenis_kendaraan = MasterJenisKendaraan.objects.filter(id=penimbangan.jenis_kendaraan_id).first()
                operator = UserSystem.objects.filter(id=penimbangan.petugas_id).first()
                
                data.append({
                    'status': statusPengiriman,
                    'melanggar': melanggarCustom,
                    'action': action,
                    'waktu': penimbangan.tgl_penimbangan.strftime('%d/%m/%Y %H:%M'),
                    'timbangan': timbangan.nama if timbangan else '-',
                    'foto_depan': foto_depan,
                    'foto_belakang': foto_belakang,
                    'no_kendaraan': penimbangan.no_kendaraan,
                    'no_uji': penimbangan.no_uji,
                    'masa_berlaku_uji': penimbangan.tgl_masa_berlaku,
                    'jenis_kendaraan': jenis_kendaraan.nama if jenis_kendaraan else '-',
                    'sumbu': penimbangan.sumbu,
                    'jbi': penimbangan.jbi_uji,
                    'berat_timbang': penimbangan.berat_timbang,
                    'kelebihan_berat': penimbangan.kelebihan_berat,
                    'prosen_lebih': penimbangan.prosen_lebih,
                    'toleransi': str(penimbangan.toleransi_komoditi),
                    'komoditi': komoditi.nama if komoditi else '-',
                    'asal_tujuan': (asal_kota.nama if asal_kota else '-') + ' - ' + (tujuan_kota.nama if tujuan_kota else '-'),
                    'pelanggaran': pelanggaran,
                    'regu': regu.nama if regu else '-',
                    'shift': shift.nama if shift else '-',
                    'operator': operator.nama if operator else '-',
                })


            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': getRow.count(),
                'data': data,
            })
        except Exception as e:
            return json_response(status=False, message=str(e), code=401) 
    
def send(request):
    if 'is_send_penimbangan' in request.GET:
        is_send_penimbangan = request.GET.get('is_send_penimbangan')
        filter_tujuan = request.GET.get('filter_tujuan')
        kendaraan_id = request.GET.get('kendaraan_id')
        kendaraan = DataPenimbangan.objects.filter(id=kendaraan_id).first()

        if not kendaraan:
            return json_response(
                status=False,
                message='Kendaraan tidak ditemukan, Silakan masukkan data manual!',
                data={'error_code': 'noken_not_available'}
            )

        # Jika kendaraan melanggar, pastikan sudah ada penindakan
        # penindakan = DataPenindakan.objects.filter(kode_trx=kendaraan.kode_trx).first()
        # if not penindakan:
        #     if kendaraan.is_melanggar == 'Y' and kendaraan.is_tindakan == 'N' and kendaraan.is_surat_tilang == 'N':
        #         return json_response(
        #             status=False,
        #             message='Gagal mengirim data penimbangan, Kendaraan belum ditindak!'
        #         )

        # Jika kendaraan melanggar, kirim juga data pelanggaran
        pelanggarans = []
        pelanggaran_ids = None
        if kendaraan.is_melanggar == 'Y':
            pelanggarans = DataPelanggaran.objects.filter(
                kode_trx=kendaraan.kode_trx,
                is_send_to_pusat='N'
            )

            pelanggaran_ids = ",".join(str(p.jenis_pelanggaran_id) for p in pelanggarans)
            for pelanggaran in pelanggarans:
                # ==============================
                # KIRIM DATA PELANGGARAN
                # ==============================
                response_pelanggaran = send_pelanggaran_to_pusat(pelanggaran)
                print(response_pelanggaran)
                if response_pelanggaran and response_pelanggaran.get('success') is True:
                    pelanggaran.is_send_to_pusat = 'Y'
                    pelanggaran.save()

        if pelanggaran_ids:
            setattr(kendaraan, 'pelanggaran_ids', pelanggaran_ids)

        tgl_penimbangan = kendaraan.tgl_penimbangan
        tgl_antrian = kendaraan.tgl_antrian

        setattr(kendaraan, 'tgl_penimbangan', tgl_penimbangan)
        setattr(kendaraan, 'tgl_antrian', tgl_antrian)
        # ==============================
        # KIRIM DATA PENIMBANGAN
        # ==============================
        if filter_tujuan == 'BPTD':
            # response_penimbangan = send_penimbangan_to_balai(kendaraan)
            # if response_penimbangan and response_penimbangan.get('success') is True:
            #     kendaraan.is_send_to_balai = 'Y'
            #     kendaraan.save()
            pass
        elif filter_tujuan == 'PUSAT':
            response_penimbangan = send_penimbangan_to_pusat(kendaraan)
            if response_penimbangan and response_penimbangan.get('success') is True:
                kendaraan.is_send_to_pusat = 'Y'
                kendaraan.save()
        else:
            response_penimbangan = send_penimbangan_to_pusat(kendaraan)
            # response_penimbangan = send_penimbangan_to_balai(kendaraan)
            if response_penimbangan and response_penimbangan.get('success') is True:
                kendaraan.is_send_to_pusat = 'Y'
                # kendaraan.is_send_to_balai = 'Y'
                kendaraan.save()
        if response_penimbangan and response_penimbangan.get('success') is True:
            return json_response(status=True, message='Berhasil mengirim data penimbangan!')
        else:
            return json_response(status=False, message='Gagal mengirim data penimbangan!')

    if 'is_send_penindakan' in request.GET:
        filter_tujuan = request.GET.get('filter_tujuan')
        penindakan_id = request.GET.get('penindakan_id')
        penindakan = DataPenindakan.objects.filter(id=penindakan_id).first()
        if not penindakan:
            return json_response(
                status=False,
                message='Penindakan tidak ditemukan, Silakan pilih penindakan lainnya!',
                data={'error_code': 'penindakan_not_available'}
            )
        
        penimbangan = DataPenimbangan.objects.filter(kode_trx=penindakan.kode_trx).first()
        if not penimbangan:
            return json_response(
                status=False,
                message='Kendaraan tidak ditemukan, Silakan pilih penindakan lainnya!',
                data={'error_code': 'kendaraan_not_available'}
            )

        # ==============================
        # KIRIM DATA PENINDAKAN
        # ==============================
        sim = MasterGolSim.objects.filter(id=penindakan.gol_sim_id).first()
        if sim:
            penindakan.nama_sim = sim.nama

        if filter_tujuan == 'BPTD':
            response_penindakan = send_penindakan_to_pusat(penindakan, penimbangan)
            if response_penindakan and response_penindakan.get('success') is True:
                # penindakan.is_send_to_balai = 'Y'
                penindakan.save()
        elif filter_tujuan == 'PUSAT':
            response_penindakan = send_penindakan_to_balai(penindakan, penimbangan)
            if response_penindakan and response_penindakan.get('success') is True:
                penindakan.is_send_to_pusat = 'Y'
                penindakan.save()
        else:
            response_penindakan = send_penindakan_to_balai(penindakan, penimbangan)
            response_penindakan = send_penindakan_to_pusat(penindakan, penimbangan)
            if response_penindakan and response_penindakan.get('success') is True:
                penindakan.is_send_to_pusat = 'Y'
                # penindakan.is_send_to_balai = 'Y'
                penindakan.save()
        
        if response_penindakan and response_penindakan.get('success') is True:
            return json_response(status=True, message='Berhasil mengirim data penindakan!')
        else:
            return json_response(status=False, message='Gagal mengirim data penindakan!')
        