from django.shortcuts import render, redirect
from django.http import HttpResponse
from app.models import SiteInfo, DataPenimbangan, DataPelanggaran, LokasiUppkb, MasterJenisPelanggaran
from .utils import json_response
import locale
from datetime import datetime, time, timedelta
from datetime import date
from django.utils.timezone import now
import requests
from user_agents import parse
from django.shortcuts import redirect
from calendar import monthrange

def index(request):
    ua_string = request.META.get('HTTP_USER_AGENT', '')
    user_agent = parse(ua_string)
    if user_agent.is_mobile or user_agent.is_tablet:
        return redirect('/mobile')
    else:
        locale.setlocale(locale.LC_TIME, 'id_ID.UTF-8')
        lokasi = LokasiUppkb.objects.first()
        lokasi = LokasiUppkb.objects.first()
        user = request.user
        date_now = date.today().strftime("%d %B %Y") 
        context = {
            'title': 'Dashboard',
            'app_name': lokasi.nama,
            'user' : {
                'id': user.id,
                'nama': user.nama,
                'email': user.email,
                'username': user.username,
                'pangkat': user.sdm.pangkat,
                'jabatan': user.sdm.jabatan,
                'nip': user.sdm.nip,
                'level': user.level.nama,
                'level_id': user.level_id,
                'regu_id': user.sdm.regu_id,
                'shift_id': user.sdm.shift_id,
                'regu_name': user.sdm.regu.nama,
            },
            'lokasi' : {
                'bptd' : '-' if lokasi.bptd is None else lokasi.bptd.nama.upper(),
                'uppkb' : lokasi.nama.upper(),
            },
            'today' : date.today().strftime("%Y-%m-%d"),
            'date_now' : date_now,
        }
        return render(request, 'backend/dashboard.html', context)
def show(request):
    if 'is_widget' in request.GET:
        today = now().date()
        # Statistik penimbangan
        start = datetime.combine(today, datetime.min.time())
        end = datetime.combine(today, datetime.max.time())
        kendaraan_timbang = DataPenimbangan.objects.filter(tgl_penimbangan__range=(start, end), is_transaksi=1).count()
        kendaraan_melanggar = DataPenimbangan.objects.filter(tgl_penimbangan__range=(start, end), is_melanggar='Y', is_transaksi=1).count()
        kendaraan_tidak_melanggar = DataPenimbangan.objects.filter(tgl_penimbangan__range=(start, end), is_melanggar='N', is_transaksi=1).count()
        if kendaraan_timbang > 0:
            persentase_kendaraan_melanggar = round((kendaraan_melanggar / kendaraan_timbang) * 100, 2)
            persentase_kendaraan_tidak_melanggar = round((kendaraan_tidak_melanggar / kendaraan_timbang) * 100, 2)
        else:
            persentase_kendaraan_melanggar = 0.00
            persentase_kendaraan_tidak_melanggar = 0.00
            
        output = {
            'kendaraan_timbang': f"{kendaraan_timbang:,}".replace(",", "."),
            'kendaraan_melanggar': f"{kendaraan_melanggar:,}".replace(",", "."),
            'kendaraan_tidak_melanggar': f"{kendaraan_tidak_melanggar:,}".replace(",", "."),
            'persentase_kendaraan_melanggar': persentase_kendaraan_melanggar,
            'persentase_kendaraan_tidak_melanggar': persentase_kendaraan_tidak_melanggar,
        }
        return json_response(status=True, message='success', data=output)
    if 'is_trend' in request.GET:
        if 'is_riwayat_today' in request.GET:
            tahun_ini = now().year
            title = f'Riwayat Pengawasan Hari Ini {date.today().strftime("%d %B %Y")}'
            xaxis = {'name': 'Jam'}
            jam = [f"{str(i).zfill(2)}:00" for i in range(24)]

            result = [
                {'name': 'Total Penimbangan', 'data': []},
                {'name': 'Melanggar', 'data': []},
                {'name': 'Tidak Melanggar', 'data': []},
            ]

            # Hari ini
            date_today = now().date()
            date_name = date_today.strftime("%d %B %Y")

            for i in range(24):
                start_time = datetime.combine(date_today, time(i, 0, 0))
                end_time = start_time + timedelta(hours=1)

                # Total semua penimbangan di jam tersebut
                total_penimbangan = DataPenimbangan.objects.filter(
                    tgl_penimbangan__gte=start_time,
                    tgl_penimbangan__lt=end_time,
                    is_transaksi=1
                )

                count_total = total_penimbangan.count()
                count_melanggar = total_penimbangan.filter(is_melanggar='Y').count()
                count_tidak_melanggar = total_penimbangan.filter(is_melanggar='N').count()

                result[0]['data'].append(count_total)
                result[1]['data'].append(count_melanggar)
                result[2]['data'].append(count_tidak_melanggar)

            # Final output
            xaxis['data'] = jam
            output = {
                'title': title,
                'date': date_name,
                'categories': xaxis,
                'chart': result,
            }

            return json_response(status=True, message='success', data=output)
        if 'is_riwayat_pengawasan' in request.GET:
            tahun_ini = now().year
            title = f'Riwayat Pengawasan Per-Bulan Tahun {tahun_ini}'
            xaxis = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

            result = [
                {'name': 'Total Penimbangan', 'data': []},
                {'name': 'Melanggar', 'data': []},
                {'name': 'Tidak Melanggar', 'data': []},
            ]

            for bulan in range(1, 13):
                awal_bulan = datetime(tahun_ini, bulan, 1)
                akhir_bulan = datetime(tahun_ini, bulan, monthrange(tahun_ini, bulan)[1], 23, 59, 59)

                total_timbang = DataPenimbangan.objects.filter(tgl_penimbangan__range=(awal_bulan, akhir_bulan), is_transaksi=1).count()
                total_melanggar = DataPenimbangan.objects.filter(tgl_penimbangan__range=(awal_bulan, akhir_bulan), is_melanggar='Y', is_transaksi=1).count()
                total_tidak_melanggar = DataPenimbangan.objects.filter(tgl_penimbangan__range=(awal_bulan, akhir_bulan), is_melanggar='N', is_transaksi=1).count()

                result[0]['data'].append(total_timbang)
                result[1]['data'].append(total_melanggar)
                result[2]['data'].append(total_tidak_melanggar)

            output = {
                'title': title,
                'categories': xaxis,
                'chart': result,
            }

            return json_response(status=True, message='success', data=output)
        if 'is_riwayat_pelanggaran' in request.GET:
            tahun_ini = now().year
            title = f'Riwayat Pelanggaran Per Jenis Pelanggaran Per-Bulan Tahun {tahun_ini}'

            xaxis = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
            getJenisPelanggaran = MasterJenisPelanggaran.objects.filter(is_active='Y')

            result = []
            for jenis in getJenisPelanggaran:
                result.append({
                    'name': jenis.nama.capitalize(),
                    'data': []
                })

            for bulan in range(1, 13):
                awal_bulan = datetime(tahun_ini, bulan, 1)
                akhir_bulan = datetime(tahun_ini, bulan, monthrange(tahun_ini, bulan)[1], 23, 59, 59)

                for idx, jenis in enumerate(getJenisPelanggaran):
                    total = DataPenimbangan
                    total =     DataPelanggaran.objects.filter(
                        tgl_penimbangan__range=(awal_bulan, akhir_bulan),
                        jenis_pelanggaran=jenis,
                        kode_trx__in=DataPenimbangan.objects.filter(
                            is_transaksi=1,
                        ).values_list('kode_trx', flat=True)
                    ).count()
                    
                    result[idx]['data'].append(total)

            output = {
                'title': title,
                'categories': xaxis,
                'chart': result,
            }

            return json_response(status=True, message='success', data=output)
