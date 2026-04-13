from django.shortcuts import render
from app.models import SiteInfo, LokasiUppkb, AksesMenu
from datetime import date
import locale
from django.shortcuts import redirect
from user_agents import parse

def index(request):
    locale.setlocale(locale.LC_TIME, 'id_ID.UTF-8')
    site_info = SiteInfo.objects.filter(id=1).first()
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
        'menus' : AksesMenu.objects.filter(is_active='Y', is_mobile='Y').order_by('order').all(),
        'lokasi' : {
            'bptd' : '-' if lokasi.bptd is None else lokasi.bptd.nama.upper(),
            'uppkb' : lokasi.nama.upper(),
        },
        'today' : date.today().strftime("%Y-%m-%d"),
        'date_now' : date_now,
    }
    return render(request, 'mobile/dashboard.html', context)