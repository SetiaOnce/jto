from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
from django.contrib.auth import login, logout
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from .utils import json_response
from app.models import UserSystem, LokasiUppkb
from .common import set_cookies, get_site_info

def index(request):
    lokasi = LokasiUppkb.objects.first()
    lokasi = LokasiUppkb.objects.first()
    if request.user.is_authenticated:
         return redirect('dashboard')
    context = {
        'title': 'Login',
        'app_name': lokasi.nama,
        'csrf_token': get_token(request)
    }
    return render(request, 'auth/index.html', context)

@require_http_methods(["POST"])
def request(request):
    try:
        site_info = get_site_info()
        email_or_username = request.POST.get('username');
        password = request.POST.get('password');

        # Cari user berdasarkan email atau username
        try:
            user = UserSystem.objects.get(email=email_or_username)
        except ObjectDoesNotExist:
            try:
                user = UserSystem.objects.get(username=email_or_username)
            except ObjectDoesNotExist:
                return json_response(status=False, message='Sistem tidak dapat menemukan akun user')

        # Verifikasi password
        if not user.check_password(password):
            return json_response(status=False, message='Password yang anda masukkan tidak sesuai')

        # Perbarui status login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        # Login user
        login(request, user)

        # set cookie
        user = request.user
        cookie_data = {
            'timezone': site_info['timezone'],
            'regu_id': user.sdm.regu_id,
            'shift_id': user.sdm.shift_id,
        }
        response =  json_response(status=True, message='Success')
        set_cookies(response=response, cookies=cookie_data)
        return response
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)

def logout_request(request):
    logout(request)
    return redirect('auth')
