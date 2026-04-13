from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.utils.html import escape
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from app.models import UserSystem, DataSdm, LokasiUppkb
from .utils import json_response, time_ago, get_datetimenow
import random


def index(request):
    lokasi = LokasiUppkb.objects.first()
    context = {
        'title': 'Akses Pengguna',
        'active_menu': 'users_access',
        'app_name': lokasi.nama,
    }
    return render(request, 'backend/users_access.html', context)

def show(request):
    if 'idp' in request.GET:
        idp = request.GET.get('idp')
        try:
            user = UserSystem.objects.filter(id=idp).first()
            user_data = {
                "id": user.id,
                "sdm_id": user.sdm_id,
                "nama": user.nama,
                "username": user.username,
                "email": user.email,
                "level_id": user.level_id,
                "is_active": user.is_active,
            }
            return json_response(status=True, message='Success', data=user_data)
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    else:
        # Params datatables
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search = request.GET.get('search[value]', '').strip()
        # Filter
        filter_roles = request.GET.get('filter_roles', 'ALL')
        filter_regu = request.GET.get('filter_regu', 'ALL')
        filter_shift = request.GET.get('filter_shift', 'ALL')
        # print(filter_roles)

        # Base query
        base_queryset = UserSystem.objects.filter(
            is_deleted='N',
            sdm__is_active='Y',
            sdm__is_deleted='N',
            sdm__is_development='N',
        ).select_related('sdm', 'level').order_by('-level_id')

        # Filter berdasarkan level
        if filter_roles and filter_roles != 'ALL':
            base_queryset = base_queryset.filter(level_id=filter_roles)
        # Filter berdasarkan regu
        if filter_regu and filter_regu != 'ALL':
            base_queryset = base_queryset.filter(sdm__regu_id=filter_regu)
        # Filter berdasarkan shift
        if filter_shift and filter_shift != 'ALL':
            base_queryset = base_queryset.filter(sdm__shift_id=filter_shift)

        filtered_queryset = base_queryset

        # Filter pencarian
        if search:
            filtered_queryset = filtered_queryset.filter(
                Q(nama__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )

        records_total = base_queryset.count()
        records_filtered = filtered_queryset.count()
        paginated_record = filtered_queryset[start:start+length]
        data = []

        
        for index, user in enumerate(paginated_record, start=start + 1):
            pengguna_html = f'''
                <div class="d-flex align-items-center">
                    <div class="ms-2">
                        <a href="javascript:void(0);" class="fw-bold text-gray-900 text-hover-primary mb-2">{escape(user.nama)}</a>
                        <div class="fw-bold text-muted">Username : {escape(user.username)}</div>
                        <div class="fw-bold text-muted">Email : {escape(user.email)}</div>
                    </div>
                </div>
            '''
            if user.is_active == 'Y':
                statusCustom = f'<button type="button" class="btn btn-sm btn-info mb-1" data-bs-toggle="tooltip" title="Pengguna Aktif, Nonaktifkan ?" onclick="_updateStatus({user.id}, \'N\');"><i class="fas fa-toggle-on fs-2"></i></button>'
            else:
                statusCustom = f'<button type="button" class="btn btn-sm btn-light mb-1" data-bs-toggle="tooltip" title="Pengguna Tidak Aktif, Aktifkan ?" onclick="_updateStatus({user.id}, \'Y\');"><i class="fas fa-toggle-off fs-2"></i></button>'
            action = f'''
                <button type="button" class="btn btn-icon btn-circle btn-sm btn-dark mb-1 ms-1" data-bs-toggle="tooltip" title="Edit data!" onclick="_editUser({user.id});"><i class="la la-edit fs-3"></i></button>
                <button type="button" class="btn btn-icon btn-circle btn-sm btn-warning mb-1 ms-1" data-bs-toggle="tooltip" title="Reset Password!" onclick="_resetUserPass({user.id});"><i class="las la-unlock-alt fs-3"></i></button>
                <button type="button" class="btn btn-icon btn-circle btn-sm btn-danger mb-1 ms-1" data-bs-toggle="tooltip" title="Hapus data!" onclick="_deleteData({user.id});"><i class="las la-trash fs-3"></i></button>
            '''
            level = f'<span class="badge badge-outline badge-primary">{user.level.nama}</span>'
            regu = f'<span class="badge badge-outline badge-success">{user.sdm.regu.nama}</span>'
            shift = f'<span class="badge badge-outline badge-info">{user.sdm.shift.nama}</span>'
            
            data.append({
                'no': index,
                "regu": regu,
                "shift": shift,
                "level": level,
                'pengguna': pengguna_html,
                'email': user.email,
                'nip': user.sdm.nip,
                'last_login': time_ago(user.last_login) if user.last_login else '-',
                'is_active': statusCustom,
                'action': action,
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': records_total,
            'recordsFiltered': records_filtered,
            'data': data
        })

def store(request):
    role = request.POST.get('role')
    username = request.POST.get('username')
    fid_sdm = request.POST.get('fid_sdm')
    pass_user = request.POST.get('pass_user')
    repass_user = request.POST.get('repass_user')
    try:
        user = UserSystem.objects.filter(sdm_id=fid_sdm, is_deleted='N').first()
        if user:
            return json_response(status=False, message='Gagal menambahkan data, pegawai yang sama sudah ada pada sistem. Coba gunakan pegawai yang lain!', data={
                'error_code':'pegawai_available'
            })
        user = UserSystem.objects.filter(username=username, is_deleted='N').first()
        if user:
            return json_response(status=False, message='Gagal menambahkan data, username yang sama sudah ada pada sistem. Coba gunakan username yang lain!', data={
                'error_code':'username_available'
            })

        sdm = DataSdm.objects.get(id=fid_sdm)
        user = UserSystem(
            sdm=sdm,
            nama=sdm.name,
            email=sdm.email,
            username= username,
            level_id=role,
            password=make_password(repass_user),
        )
        user.save()
        return json_response(status=True, message='Data pengguna berhasil ditambahkan!')
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)
    
def update(request):
    if 'is_status' in request.POST:
        idp = request.POST.get('idp')
        value = request.POST.get('value')
        try:
            user = UserSystem.objects.get(id=idp)
            user.is_active = value
            user.save(update_fields=['is_active'])

            if value == 'N':
                textMsg = 'Status berhasil diubah menjadi <strong class="text-danger">Nonaktif</strong>';
            else:
                textMsg = 'Status berhasil diubah menjadi <strong class="text-success">Aktif</strong>';
            return json_response(status=True, message=textMsg)
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    if 'is_resetpass' in request.POST:
        idp = request.POST.get('idp_user')
        new_password = request.POST.get('new_password')
        try:
            user = UserSystem.objects.get(id=idp)
            user.password = make_password(new_password)
            user.save(update_fields=['password'])

            textMsg = 'Password baru telah berhasil dibuat dengan kriteria <strong>' + new_password + '</strong>. Harap simpan dan berikan kepada pemilik akun jika diperlukan.'
            return json_response(status=True, message=textMsg)
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    elif 'is_deleted' in request.POST:
        idp = request.POST.get('idp')
        try:
            user = UserSystem.objects.get(id=idp)
            user.is_deleted = 'Y' 
            user.deleted_by = request.user.id
            user.deleted_at = get_datetimenow()
            user.save()

            textMsg = 'Data berhasil <strong class="text-success">Dihapus</strong>';
            return json_response(status=True, message=textMsg)
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    else:
        id = request.POST.get('id')
        role = request.POST.get('role')
        username = request.POST.get('username')
        fid_sdm = request.POST.get('fid_sdm')
        is_active = request.POST.get('is_active')
        try:
            user = UserSystem.objects.filter(sdm_id=fid_sdm, is_deleted='N').exclude(id=id).first()
            if user:
                return json_response(status=False, message='Gagal menambahkan data, pegawai yang sama sudah ada pada sistem. Coba gunakan pegawai yang lain!', data={
                    'error_code':'pegawai_available'
                })
            user = UserSystem.objects.filter(username=username, is_deleted='N').exclude(id=id).first()
            if user:
                return json_response(status=False, message='Gagal menambahkan data, username yang sama sudah ada pada sistem. Coba gunakan username yang lain!', data={
                    'error_code':'username_available'
                })
            sdm = DataSdm.objects.filter(id=fid_sdm).first()
            user = UserSystem.objects.filter(id=id).first()
            user.sdm_id = sdm.id
            user.nama = sdm.name
            user.email = sdm.email
            user.username = username
            user.level_id = role
            user.is_active = 'Y' if is_active is not None else 'N'
            user.save()
            return json_response(status=True, message='Data pengguna berhasil ditambahkan!')
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)


            