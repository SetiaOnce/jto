import random
import os
from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from app.models import SiteInfo, Instansi, SiteInfo, DataLokasiUppkbPusat, LokasiUppkb, DataSdm, Kejaksaan, Pengadilan
from .utils import json_response, generate_encryption_filename, JsonResponse, get_datetimenow
from urllib.parse import unquote
from django.db.models import Q
from .api import login_pusat

def index(request):
    lokasi = LokasiUppkb.objects.first()
    context = {
        'title': 'Managemen Aplikasi',
        'active_menu': 'instansi',
        'app_name': lokasi.nama,
    }
    return render(request, 'backend/manage_site_info.html', context)

def show(request):
    if 'is_show_profile_uppkb' in request.GET:
        getRow = LokasiUppkb.objects.first()
        results = {
            'nama' : getRow.nama,
            'kode' : getRow.kode,
            'alamat' : getRow.alamat_uppkb,
            'koordinat' : f'{getRow.lat_pos}, {getRow.lon_pos}',
            'provinsi' : '-' if getRow.kota_kab.provinsi is None else getRow.kota_kab.provinsi.nama,
            'kota_kab' : '-' if getRow.kota_kab is None else getRow.kota_kab.nama,
            'bptd' : '-' if getRow.bptd is None else getRow.bptd.nama,
            'provinsi' : '-' if getRow.kota_kab.provinsi is None else getRow.kota_kab.provinsi.nama,
            'kota_kab' : '-' if getRow.kota_kab is None else getRow.kota_kab.nama,
            'bptd' : '-' if getRow.bptd is None else getRow.bptd.nama,
            'korsatpel_id' : '-' if getRow.korsatpel_id is None else getRow.korsatpel_id,
            'nama_korsatpel' : '-' if getRow.nama_korsatpel is None else getRow.nama_korsatpel,
            'pangkat_korsatpel' : '-' if getRow.pangkat is None else getRow.pangkat,
            'nip_korsatpel' : '-' if getRow.nip is None else getRow.nip,
            'toleransi_berat' : getRow.toleransi_berat,
            'toleransi_panjang' : getRow.toleransi_panjang,
            'toleransi_lebar' : getRow.toleransi_lebar,
            'toleransi_tinggi' : getRow.toleransi_tinggi,
            'kode_api_pusat' : getRow.kode_api_pusat,
            'url_api_pusat' : getRow.url_api_pusat,
            'jt_id_portal' : getRow.jt_id_portal,
            'client_id_portal' : getRow.client_id_portal,
            'url_portal' : getRow.url_portal,
            'email_api_pusat' : getRow.email_api_pusat,
            'password_api_pusat' : getRow.password_api_pusat,
            'access_token_api_pusat' : getRow.access_token_api_pusat,
        }
        return json_response(status=True, message='Success', data=results)
    if 'is_show_list_uppkb_pusat' in request.GET:
        # Params datatables
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search = request.GET.get('search[value]', '').strip()

        # Init query
        query = DataLokasiUppkbPusat.objects.select_related('kab_kota', 'bptd')
        if search:
            query = query.filter(
                Q(nama__icontains=search)
            )

        getRow = query.all()
        total_record = query.count()
        paginated_record = getRow[start:start+length]
        data = []

        for index, uppkb in enumerate(paginated_record, start=start + 1):
            # Action
            action = f'''
                <button type="button" class="btn btn-sm btn-primary mb-1 ms-1" data-bs-toggle="tooltip" title="Pilih UPPKB!!" onclick="_pilihUppkb({uppkb.id});">Pilih</button>
            '''
            data.append({
                'no': index,
                'bptd': '-' if uppkb.bptd is None else uppkb.bptd.nama,
                'kab_kota': '-' if uppkb.kab_kota is None else uppkb.kab_kota.nama,
                'nama': uppkb.nama,
                'kode': uppkb.kode,
                'alamat': uppkb.alamat_uppkb,
                'koordinat': f'{uppkb.lat_pos}, {uppkb.lon_pos}',
                'action': action,
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_record,
            'recordsFiltered': getRow.count(),
            'data': data
        })
    if 'is_show_kejaksaan' in request.GET:
        if 'idp' in request.GET:
            idp = request.GET.get('idp')
            try:
                row = Kejaksaan.objects.filter(id=idp).first()
                results = {
                    "id": row.id,
                    "kode": row.kode,
                    "nama": row.nama,
                    "alamat": row.alamat,
                    "tipe": row.tipe,
                    "no_telp": row.no_telp,
                    "is_active": row.is_active,
                }
                return json_response(status=True, message='Success', data=results)
            except Exception as e:
                return json_response(status=False, message=str(e), code=401)
        else:
            # Params datatables
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search = request.GET.get('search[value]', '').strip()

            # Init query
            query = Kejaksaan.objects.select_related('kota')
            if search:
                query = query.filter(
                    Q(nama__icontains=search)
                )

            getRow = query.all()
            total_record = query.count()
            paginated_record = getRow[start:start+length]
            data = []

            for index, row in enumerate(paginated_record, start=start + 1):
                # Action
                action = f'''
                    <button type="button" class="btn btn-icon btn-circle btn-sm btn-dark mb-1 ms-1" data-bs-toggle="tooltip" title="Edit data!" onclick="_editDataKejaksaan({row.id});"><i class="la la-edit fs-3"></i></button>
                '''
                # Active
                if row.is_active == 1:
                    statusCustom = f'<button type="button" class="btn btn-sm btn-info mb-1" data-bs-toggle="tooltip" title="Data Aktif, Nonaktifkan ?" onclick="_updateStatusKejaksaan({row.id}, \'0\');"><i class="fas fa-toggle-on fs-2"></i></button>'
                else:
                    statusCustom = f'<button type="button" class="btn btn-sm btn-light mb-1" data-bs-toggle="tooltip" title="Data Tidak Aktif, Aktifkan ?" onclick="_updateStatusKejaksaan({row.id}, \'1\');"><i class="fas fa-toggle-off fs-2"></i></button>'
                data.append({
                    'no': index,
                    'kode': row.kode,
                    'nama': row.nama,
                    'alamat': row.alamat,
                    'tipe': row.tipe,
                    'kab_kota': row.kota.nama,
                    'provinsi': row.kota.provinsi.nama,
                    'no_telp': row.no_telp,
                    'is_active': statusCustom,
                    'action': action,
                })

            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': getRow.count(),
                'data': data
            })
    if 'is_show_pengadilan' in request.GET:
        if 'idp' in request.GET:
            idp = request.GET.get('idp')
            try:
                row = Pengadilan.objects.filter(id=idp).first()
                results = {
                    "id": row.id,
                    "kode": row.kode,
                    "nama": row.nama,
                    "alamat": row.alamat,
                    "lat_pos": row.lat_pos,
                    "lon_pos": row.lon_pos,
                    "no_telp": row.no_telp,
                    "is_active": row.is_active,
                }
                return json_response(status=True, message='Success', data=results)
            except Exception as e:
                return json_response(status=False, message=str(e), code=401)
        else:
            # Params datatables
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search = request.GET.get('search[value]', '').strip()

            # Init query
            query = Pengadilan.objects.select_related('kota')
            if search:
                query = query.filter(
                    Q(nama__icontains=search)
                )

            getRow = query.all()
            total_record = query.count()
            paginated_record = getRow[start:start+length]
            data = []

            for index, row in enumerate(paginated_record, start=start + 1):
                # Action
                action = f'''
                    <button type="button" class="btn btn-icon btn-circle btn-sm btn-dark mb-1 ms-1" data-bs-toggle="tooltip" title="Edit data!" onclick="_editDataPengadilan({row.id});"><i class="la la-edit fs-3"></i></button>
                '''
                # Active
                if row.is_active == 1:
                    statusCustom = f'<button type="button" class="btn btn-sm btn-info mb-1" data-bs-toggle="tooltip" title="Data Aktif, Nonaktifkan ?" onclick="_updateStatusPengadilan({row.id}, \'0\');"><i class="fas fa-toggle-on fs-2"></i></button>'
                else:
                    statusCustom = f'<button type="button" class="btn btn-sm btn-light mb-1" data-bs-toggle="tooltip" title="Data Tidak Aktif, Aktifkan ?" onclick="_updateStatusPengadilan({row.id}, \'1\');"><i class="fas fa-toggle-off fs-2"></i></button>'
                data.append({
                    'no': index,
                    'kode': row.kode,
                    'nama': row.nama,
                    'alamat': row.alamat,
                    'lat_pos': row.lat_pos,
                    'lon_pos': row.lon_pos,
                    'kab_kota': row.kota.nama,
                    'provinsi': row.kota.provinsi.nama,
                    'no_telp': row.no_telp,
                    'is_active': statusCustom,
                    'action': action,
                })

            return JsonResponse({
                'draw': draw,
                'recordsTotal': total_record,
                'recordsFiltered': getRow.count(),
                'data': data
            })
    else:
        getRow = LokasiUppkb.objects.first()
        results = {
            'jt_id' : getRow.jt_id,
            'nama_jt' : getRow.nama_jt,
            'alamat_jt' : getRow.alamat_jt,
            'nama_kupt' : getRow.nama_kupt,
            'pangkat' : getRow.pangkat,
            'nip' : getRow.nip,
            'toleransi_berat' : getRow.toleransi_berat,
            'toleransi_panjang' : getRow.toleransi_panjang,
            'toleransi_lebar' : getRow.toleransi_lebar,
            'toleransi_tinggi' : getRow.toleransi_tinggi,
        }
        return json_response(status=True, message='Success', data=results)

def store(request):
    lokasi = LokasiUppkb.objects.first()
    if 'is_form_kejaksaan' in request.POST:
        kode_kejaksaan = request.POST.get('kode_kejaksaan')
        nama_kejaksaan = request.POST.get('nama_kejaksaan')
        no_telepon = request.POST.get('no_telepon')
        tipe = request.POST.get('tipe')
        alamat = request.POST.get('alamat')

        print("\n================= FORM INPUT =================")
        print(f"Kode                : {kode_kejaksaan}")
        print(f"Nama Kejaksaan      : {nama_kejaksaan}")
        print(f"No Telepon          : {no_telepon}")
        print(f"Kode                : {tipe}")
        print(f"ALamat              : {alamat}")
        print("==============================================\n")
        try:            
            # save data
            user = Kejaksaan(
                kode=kode_kejaksaan.upper(),
                nama=nama_kejaksaan.upper(),
                no_telp=no_telepon,
                tipe=tipe.upper(),
                alamat=alamat,
                lokasi_id=lokasi.id,
                kode_uppkb=lokasi.kode,
                kota_id=lokasi.kota_kab_id,
            )
            user.save()
            return json_response(status=True, message='Data Kejaksaan berhasil ditambahkan!')
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    if 'is_form_pengadilan' in request.POST:
        kode_pengadilan = request.POST.get('kode_pengadilan')
        nama_pengadilan = request.POST.get('nama_pengadilan')
        no_telepon_pengadilan = request.POST.get('no_telepon_pengadilan')
        koordinat_bujur = request.POST.get('koordinat_bujur')
        koordinat_lintang = request.POST.get('koordinat_lintang')
        alamat_pengadilan = request.POST.get('alamat_pengadilan')

        print("\n================= FORM INPUT =================")
        print(f"Kode                : {kode_pengadilan}")
        print(f"Nama                : {nama_pengadilan}")
        print(f"No Telepon          : {no_telepon_pengadilan}")
        print(f"Bujur               : {koordinat_bujur}")
        print(f"Lintang             : {koordinat_lintang}")
        print(f"ALamat              : {alamat_pengadilan}")
        print("==============================================\n")
        try:            
            # save data
            pengadilan = Pengadilan(
                kode=kode_pengadilan.upper(),
                nama=nama_pengadilan.upper(),
                no_telp=no_telepon_pengadilan,
                lat_pos=koordinat_bujur,
                lon_pos=koordinat_lintang,
                alamat=alamat_pengadilan,
                lokasi_id=lokasi.id,
                kode_uppkb=lokasi.kode,
                kota_id=lokasi.kota_kab_id,
            )
            pengadilan.save()
            return json_response(status=True, message='Data Pengadilan berhasil ditambahkan!')
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    return json_response(status=False, message="Credentials error")
def update(request):
    try:
        if 'is_update_siteinfo' in request.POST:
            # Query
            site_info = SiteInfo.objects.filter(id=1).first()

            # Logo Login 
            if request.method == 'POST' and request.FILES.get('login_logo'):
                files = request.FILES['login_logo']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)
                try:
                    if site_info and site_info.login_logo:
                        old_file_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img', site_info.login_logo)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                except SiteInfo.DoesNotExist:
                    pass

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('logo-login', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                if site_info:
                    site_info.login_logo = filename
            # Login Background 
            if request.method == 'POST' and request.FILES.get('login_bg'):
                files = request.FILES['login_bg']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)
                try:
                    if site_info and site_info.login_bg:
                        old_file_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img', site_info.login_bg)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                except SiteInfo.DoesNotExist:
                    pass

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('bacground-login', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                if site_info:
                    site_info.login_bg = filename
            # Backend Logo
            if request.method == 'POST' and request.FILES.get('headbackend_logo'):
                files = request.FILES['headbackend_logo']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)
                try:
                    if site_info and site_info.headbackend_logo:
                        old_file_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img', site_info.headbackend_logo)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                except SiteInfo.DoesNotExist:
                    pass

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('logo-backend', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                if site_info:
                    site_info.headbackend_logo = filename
            # Backennd Logo Dark
            if request.method == 'POST' and request.FILES.get('headbackend_logo_dark'):
                files = request.FILES['headbackend_logo_dark']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)
                try:
                    if site_info and site_info.headbackend_logo_dark:
                        old_file_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img', site_info.headbackend_logo_dark)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                except SiteInfo.DoesNotExist:
                    pass

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('logo-backend-dark', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                if site_info:
                    site_info.headbackend_logo_dark = filename
            # Backend Logo Icon
            if request.method == 'POST' and request.FILES.get('headbackend_icon'):
                files = request.FILES['headbackend_icon']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)
                try:
                    if site_info and site_info.headbackend_icon:
                        old_file_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img', site_info.headbackend_icon)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                except SiteInfo.DoesNotExist:
                    pass

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('logo-backend-dark', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                if site_info:
                    site_info.headbackend_icon = filename
            # Backend Logo Icon Dark
            if request.method == 'POST' and request.FILES.get('headbackend_icon_dark'):
                files = request.FILES['headbackend_icon_dark']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)
                try:
                    if site_info and site_info.headbackend_icon_dark:
                        old_file_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'site-img', site_info.headbackend_icon_dark)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                except SiteInfo.DoesNotExist:
                    pass

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('logo-backend-dark', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                if site_info:
                    site_info.headbackend_icon_dark = filename
            
            # Update
            site_info.name = request.POST.get('name')
            site_info.short_name = request.POST.get('short_name')
            site_info.description = request.POST.get('description')
            site_info.address = request.POST.get('address')
            site_info.copyright = unquote(unquote(request.POST.get('copyright')))
            # Save
            site_info.save()
            return json_response(status=True, message="Informasi aplikasi berhasil diperbarui")
        if 'is_update_api' in request.POST:
            kode_api_pusat = request.POST.get('kode_api_pusat') or 'SN01'
            url_api_pusat = request.POST.get('url_api_pusat') or 'https://jto.kemenhub.go.id/api/v2'
            email_api_pusat = request.POST.get('email_api_pusat') or '-'
            password_api_pusat = request.POST.get('password_api_pusat') or '-'
            access_token_api_pusat = request.POST.get('access_token_api_pusat') or '-'

            uppkb = LokasiUppkb.objects.filter(id_update=1).first()
            uppkb.kode_api_pusat = kode_api_pusat
            uppkb.url_api_pusat = url_api_pusat
            uppkb.email_api_pusat = email_api_pusat
            uppkb.password_api_pusat = password_api_pusat
            uppkb.access_token_api_pusat = access_token_api_pusat
            uppkb.save()
            return json_response(status=True, message="URL Sinkronisasi berhasil diperbarui")
        if 'is_update_api_balai' in request.POST:
            jt_id_portal = request.POST.get('jt_id_portal') or '0'
            client_id_portal = request.POST.get('client_id_portal') or '-'
            url_portal = request.POST.get('url_portal') or '-'

            uppkb = LokasiUppkb.objects.filter(id_update=1).first()
            uppkb.jt_id_portal = jt_id_portal
            uppkb.client_id_portal = client_id_portal
            uppkb.url_portal = url_portal
            uppkb.save()
            return json_response(status=True, message="URL Sinkronisasi Balai berhasil diperbarui")
        if 'is_update_uppkb' in request.POST:
            idp = request.POST.get('idp')
            new_uppkb = DataLokasiUppkbPusat.objects.filter(id=idp).first()
            if not new_uppkb:
                return json_response(status=False, message="Data pusat tidak ditemukan")

            LokasiUppkb.objects.filter(id_update=1).update(
                kota_kab_id=new_uppkb.kab_kota.id if new_uppkb.kab_kota else None,
                kode=new_uppkb.kode,
                nama=new_uppkb.nama,
                lat_pos=new_uppkb.lat_pos,
                lon_pos=new_uppkb.lon_pos,
                alamat_uppkb=new_uppkb.alamat_uppkb,
                gen_kode=new_uppkb.gen_kode,
                bptd_id=new_uppkb.bptd.id if new_uppkb.bptd else None,
                tahun_diresmikan=new_uppkb.tahun_diresmikan,
                updated_by=request.user.id,

                # url_api_pusat='https://jto.kemenhub.go.id/api/v2',
                # kode_api_pusat='SN01',
                # email_api_pusat='sabilambo@dephub.go.id',
                # password_api_pusat='hubdat12345',
                # access_token_api_pusat=login_pusat(),

                # toleransi_berat=5,
                # toleransi_tinggi=1000,
                # toleransi_lebar=1000,
                # toleransi_panjang=1000,

                # nama_korsatpel='-',
                # pangkat='-',
                # nip='0',

                updated_at=get_datetimenow()
            )
            return json_response(status=True, message="Lokasi UPPKB berhasil diperbarui dengan ID baru")
        if 'is_update_korsatpel' in request.POST:
            sdm_id = request.POST.get('sdm_id')
            uppkb = LokasiUppkb.objects.filter(id_update=1).first()
             # Update
            new_korsatpel = DataSdm.objects.filter(id=sdm_id).first()
            if not new_korsatpel:
                return json_response(status=False, message="Data sdm tidak ditemukan")
            # Save
            uppkb.korsatpel_id = new_korsatpel.id
            uppkb.nama_korsatpel = new_korsatpel.name
            uppkb.pangkat = new_korsatpel.pangkat
            uppkb.nip = new_korsatpel.nip
            uppkb.save()
            return json_response(status=True, message="Korsatpel berhasil diperbarui")
        if 'is_update_toleransi' in request.POST:
            toleransi_berat = request.POST.get('toleransi_berat')
            toleransi_tinggi = request.POST.get('toleransi_tinggi')
            toleransi_lebar = request.POST.get('toleransi_lebar')
            toleransi_panjang = request.POST.get('toleransi_panjang')
            uppkb = LokasiUppkb.objects.filter(id_update=1).first()
            uppkb.toleransi_berat = toleransi_berat
            uppkb.toleransi_tinggi = toleransi_tinggi
            uppkb.toleransi_lebar = toleransi_lebar
            uppkb.toleransi_panjang = toleransi_panjang
            uppkb.save()
            return json_response(status=True, message="Toleransi berhasil diperbarui")
        if 'is_form_kejaksaan' in request.POST:
            if 'is_status' in request.POST:
                idp = request.POST.get('idp')
                value = request.POST.get('value')
                try:
                    user = Kejaksaan.objects.get(id=idp)
                    user.is_active = value
                    user.save(update_fields=['is_active'])

                    if value == '0':
                        textMsg = 'Status berhasil diubah menjadi <strong class="text-danger">Nonaktif</strong>';
                    else:
                        textMsg = 'Status berhasil diubah menjadi <strong class="text-success">Aktif</strong>';
                    return json_response(status=True, message=textMsg)
                except Exception as e:
                    return json_response(status=False, message=str(e), code=401)
            else:
                lokasi = LokasiUppkb.objects.first()
                id_kejaksaan = request.POST.get('id_kejaksaan')
                kode_kejaksaan = request.POST.get('kode_kejaksaan')
                nama_kejaksaan = request.POST.get('nama_kejaksaan')
                no_telepon = request.POST.get('no_telepon')
                tipe = request.POST.get('tipe')
                alamat = request.POST.get('alamat')
                is_active = request.POST.get('is_active_kejaksaan')

                print("\n================= FORM INPUT =================")
                print(f"ID                  : {id_kejaksaan}")
                print(f"Kode                : {kode_kejaksaan}")
                print(f"Nama Kejaksaan      : {nama_kejaksaan}")
                print(f"No Telepon          : {no_telepon}")
                print(f"Kode                : {tipe}")
                print(f"ALamat              : {alamat}")
                print("==============================================\n")

                kejaksaan = Kejaksaan.objects.filter(id=id_kejaksaan).first()
                if not kejaksaan:
                    return json_response(status=False, message="Credentials error")

                kejaksaan.kode=kode_kejaksaan.upper()
                kejaksaan.nama=nama_kejaksaan.upper()
                kejaksaan.no_telp=no_telepon
                kejaksaan.tipe=tipe.upper()
                kejaksaan.alamat=alamat
                kejaksaan.lokasi_id=lokasi.id
                kejaksaan.kode_uppkb=lokasi.kode
                kejaksaan.kota_id=lokasi.kota_kab_id
                kejaksaan.is_active = '1' if is_active is not None else '0'
                kejaksaan.save()
                return json_response(status=True, message="Data kejaksaan berhasil diperbarui")
        if 'is_form_pengadilan' in request.POST:
            if 'is_status' in request.POST:
                idp = request.POST.get('idp')
                value = request.POST.get('value')
                try:
                    user = Pengadilan.objects.get(id=idp)
                    user.is_active = value
                    user.save(update_fields=['is_active'])

                    if value == '0':
                        textMsg = 'Status berhasil diubah menjadi <strong class="text-danger">Nonaktif</strong>';
                    else:
                        textMsg = 'Status berhasil diubah menjadi <strong class="text-success">Aktif</strong>';
                    return json_response(status=True, message=textMsg)
                except Exception as e:
                    return json_response(status=False, message=str(e), code=401)
            else:
                lokasi = LokasiUppkb.objects.first()
                id_pengadilan = request.POST.get('id_pengadilan')
                kode_pengadilan = request.POST.get('kode_pengadilan')
                nama_pengadilan = request.POST.get('nama_pengadilan')
                no_telepon_pengadilan = request.POST.get('no_telepon_pengadilan')
                koordinat_bujur = request.POST.get('koordinat_bujur')
                koordinat_lintang = request.POST.get('koordinat_lintang')
                alamat_pengadilan = request.POST.get('alamat_pengadilan')
                is_active = request.POST.get('is_active_pengadilan')

                print("\n================= FORM INPUT =================")
                print(f"ID                  : {id_pengadilan}")
                print(f"Kode                : {kode_pengadilan}")
                print(f"Nama                : {nama_pengadilan}")
                print(f"No Telepon          : {no_telepon_pengadilan}")
                print(f"Bujur               : {koordinat_bujur}")
                print(f"Lintang             : {koordinat_lintang}")
                print(f"ALamat              : {alamat_pengadilan}")
                print("==============================================\n")

                pengadilan = Pengadilan.objects.filter(id=id_pengadilan).first()
                if not pengadilan:
                    return json_response(status=False, message="Credentials error")

                pengadilan.kode=kode_pengadilan.upper()
                pengadilan.nama=nama_pengadilan.upper()
                pengadilan.no_telp=no_telepon_pengadilan
                pengadilan.lat_pos=koordinat_bujur
                pengadilan.lon_pos=koordinat_lintang
                pengadilan.alamat=alamat_pengadilan

                pengadilan.lokasi_id=lokasi.id
                pengadilan.kode_uppkb=lokasi.kode
                pengadilan.kota_id=lokasi.kota_kab_id
                pengadilan.is_active = '1' if is_active is not None else '0'
                pengadilan.save()
                return json_response(status=True, message="Data Pengadilan berhasil diperbarui")
        else:
            return json_response(status=False, message="Credentials error")
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)