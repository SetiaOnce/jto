import random
import requests
import os
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils.html import escape
from django.db.models import Q
from app.models import DataSdm, LokasiUppkb, Instansi, UserSystem
from .utils import json_response, time_ago, get_datetimenow, generate_encryption_filename
from django.utils import timezone
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.templatetags.static import static

def index(request):
    lokasi = LokasiUppkb.objects.first()
    context = {
        'title': 'Data SDM',
        'active_menu': 'data_sdm',
        'app_name': lokasi.nama,
    }
    print(f'INI ADALAH JAM : {get_datetimenow()}')
    return render(request, 'backend/data_sdm.html', context)

def show(request):
    if 'idp' in request.GET:
        idp = request.GET.get('idp')
        try:
            row = DataSdm.objects.filter(id=idp).first()

            base_dir = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
            fallback = static('dist/img/default-img.png')
            def url_or_fallback(fn):
                if not fn:
                    return fallback
                if not os.path.isfile(os.path.join(base_dir, fn)):
                    return fallback
                return static(f'dist/img/tanda-tangan/{fn}')

            results = {
                "id": row.id,
                "nip": row.nip,
                "nama": row.name,
                "email": row.email,
                "pangkat": row.pangkat,
                "jabatan": row.jabatan,
                "no_skep": row.no_skep,
                "no_telepon": row.no_telepon,
                "no_reg_penguji": row.no_reg_penguji,
                "regu_id": row.regu_id,
                "shift_id": row.shift_id,
                "keterangan": row.keterangan,
                "is_korsatpel": row.is_korsatpel,
                "is_penguji": row.is_penguji,
                "is_ppns": row.is_ppns,
                "ttd_ppns": url_or_fallback(row.ttd_ppns),
                "ttd_korsatpel": url_or_fallback(row.ttd_korsatpel),
                "ttd_danru": url_or_fallback(row.ttd_danru),
                "is_danru": row.is_danru,
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
        query = DataSdm.objects.filter(is_deleted='N', is_development='N').select_related('regu')
        
        if search:
            query = query.filter(
                Q(name__icontains=search) |
                Q(nip__icontains=search)
            )

        getRow = query.all()
        total_record = query.count()
        paginated_record = getRow[start:start+length]
        data = []

        for index, user in enumerate(paginated_record, start=start + 1):
            if user.is_danru == 'Y':
                danruCustom = f'<span><i class="ki-outline ki-check-circle text-success fs-2" data-bs-toggle="tooltip" title="Ya"></i></span>'
            else:
                danruCustom = f'<span><i class="ki-outline ki-cross-circle text-danger fs-2" data-bs-toggle="tooltip" title="Tidak"></i></span>'
            if user.is_ppns == 'Y':
                ppnsCustom = f'<span><i class="ki-outline ki-check-circle text-success fs-2" data-bs-toggle="tooltip" title="Ya"></i></span>'
            else:
                ppnsCustom = f'<span><i class="ki-outline ki-cross-circle text-danger fs-2" data-bs-toggle="tooltip" title="Tidak"></i></span>'
            if user.is_penguji == 'Y':
                pengujiCustom = f'<span><i class="ki-outline ki-check-circle text-success fs-2" data-bs-toggle="tooltip" title="Ya"></i></span>'
            else:
                pengujiCustom = f'<span><i class="ki-outline ki-cross-circle text-danger fs-2" data-bs-toggle="tooltip" title="Tidak"></i></span>'
            if user.is_korsatpel == 'Y':
                korsatpelCustom = f'<span><i class="ki-outline ki-check-circle text-success fs-2" data-bs-toggle="tooltip" title="Ya"></i></span>'
            else:
                korsatpelCustom = f'<span><i class="ki-outline ki-cross-circle text-danger fs-2" data-bs-toggle="tooltip" title="Tidak"></i></span>'
            # Status
            if user.is_active == 'Y':
                statusCustom = f'<button type="button" class="btn btn-sm btn-info mb-1" data-bs-toggle="tooltip" title="Data Aktif, Nonaktifkan ?" onclick="_updateStatus({user.id}, \'N\');"><i class="fas fa-toggle-on fs-2"></i></button>'
            else:
                statusCustom = f'<button type="button" class="btn btn-sm btn-light mb-1" data-bs-toggle="tooltip" title="Data Tidak Aktif, Aktifkan ?" onclick="_updateStatus({user.id}, \'Y\');"><i class="fas fa-toggle-off fs-2"></i></button>'
            # Action
            action = f'''
                <button type="button" class="btn btn-icon btn-circle btn-sm btn-dark mb-1 ms-1" data-bs-toggle="tooltip" title="Edit data!" onclick="_editData({user.id});"><i class="la la-edit fs-3"></i></button>
                <button type="button" class="btn btn-icon btn-circle btn-sm btn-danger mb-1 ms-1" data-bs-toggle="tooltip" title="Hapus data!" onclick="_deleteData({user.id});"><i class="las la-trash fs-3"></i></button>
            '''
            data.append({
                'no': index,
                'name': user.name,
                'regu': user.regu.nama,
                'email': user.email,
                'nip': user.nip,
                'pangkat': user.pangkat,
                'jabatan': user.jabatan,
                'is_active': statusCustom,
                'danru': danruCustom,
                'ppns': ppnsCustom,
                'penguji': pengujiCustom,
                'korsatpel': korsatpelCustom,
                'action': action,
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_record,
            'recordsFiltered': getRow.count(),
            'data': data
        })

def store(request):
    regu_id = request.POST.get('regu_id')
    shift_id = request.POST.get('shift_id')
    nip = request.POST.get('nip')
    nama = request.POST.get('nama')
    no_telepon = request.POST.get('no_telepon')
    email = request.POST.get('email')
    pangkat = request.POST.get('pangkat')
    jabatan = request.POST.get('jabatan')
    is_ppns = request.POST.get('is_ppns')
    no_skep = request.POST.get('no_skep')
    is_penguji = request.POST.get('is_penguji')
    no_reg_penguji = request.POST.get('no_reg_penguji')
    is_korsatpel = request.POST.get('is_korsatpel')
    is_danru = request.POST.get('is_danru')
    is_active = request.POST.get('is_active')
    keterangan = request.POST.get('keterangan')

    print("\n================= FORM INPUT =================")
    print(f"ID             : {id}")
    print(f"Regu ID        : {regu_id}")
    print(f"Shift ID       : {shift_id}")
    print(f"NIP            : {nip}")
    print(f"Nama           : {nama}")
    print(f"No Telepon     : {no_telepon}")
    print(f"Email          : {email}")
    print(f"Pangkat        : {pangkat}")
    print(f"Jabatan        : {jabatan}")
    print(f"PPNS           : {is_ppns}")
    print(f"Penguji        : {is_penguji}")
    print(f"No SKEP        : {no_skep}")
    print(f"No Reg Penguji : {no_reg_penguji}")
    print(f"Korsatpel      : {is_korsatpel}")
    print(f"Danru          : {is_danru}")
    print(f"Status Aktif   : {is_active}")
    print(f"Keterangan     : {keterangan}")
    print("==============================================\n")
    try:
        user = DataSdm.objects.filter(email=email).first()
        if user:
            return json_response(status=False, message='Gagal menambahkan data, email yang sama sudah ada pada sistem. Coba gunakan email yang lain!', data={
                'error_code':'email_available'
            })
        
        # save data
        user = DataSdm(
            regu_id=regu_id,
            shift_id=shift_id,
            nip=nip,
            name=nama.upper(),
            email=email,
            no_telepon=no_telepon if no_telepon is not None else None,
            pangkat=pangkat.upper(),
            jabatan=jabatan.upper(),
            is_ppns='Y' if is_ppns == '1' else 'N',
            no_skep=no_skep if is_ppns == '1' else None,
            is_penguji='Y' if is_penguji == '1' else 'N',
            no_reg_penguji=no_reg_penguji if is_penguji == '1' else None,
            is_korsatpel='Y' if is_korsatpel == '1' else 'N',
            is_danru='Y' if is_danru == '1' else 'N',
            keterangan=keterangan.upper() if keterangan is not None else None
        )

        # ttd ppnd
        if request.method == 'POST' and request.FILES.get('ttdppns'):
            files = request.FILES['ttdppns']
            file_name, file_extension = os.path.splitext(files.name)
            # pass
            destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
            if not os.path.exists(destination_path):
                os.makedirs(destination_path)

            # Simpan file yang di-upload
            fs = FileSystemStorage(location=destination_path)
            filename = generate_encryption_filename('ttd-ppns', file_name, file_extension)
            fs.save(filename, files)
            file_url = fs.url(filename)
            
            user.ttd_ppns = filename

        # ttd korsatpel
        if request.method == 'POST' and request.FILES.get('ttdwasatpel'):
            files = request.FILES['ttdwasatpel']
            file_name, file_extension = os.path.splitext(files.name)
            # pass
            destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
            if not os.path.exists(destination_path):
                os.makedirs(destination_path)

            # Simpan file yang di-upload
            fs = FileSystemStorage(location=destination_path)
            filename = generate_encryption_filename('ttd-korsatpel', file_name, file_extension)
            fs.save(filename, files)
            file_url = fs.url(filename)
            
            user.ttd_korsatpel = filename

        # ttd danru
        if request.method == 'POST' and request.FILES.get('ttddandru'):
            files = request.FILES['ttddandru']
            file_name, file_extension = os.path.splitext(files.name)
            # pass
            destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
            if not os.path.exists(destination_path):
                os.makedirs(destination_path)

            # Simpan file yang di-upload
            fs = FileSystemStorage(location=destination_path)
            filename = generate_encryption_filename('ttd-ttddandru', file_name, file_extension)
            fs.save(filename, files)
            file_url = fs.url(filename)
            
            user.ttd_danru = filename

        user.save()
        return json_response(status=True, message='Data SDM berhasil ditambahkan!')
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)
    
def update(request):
    if 'is_status' in request.POST:
        idp = request.POST.get('idp')
        value = request.POST.get('value')
        try:
            user = DataSdm.objects.get(id=idp)
            user.is_active = value
            user.save(update_fields=['is_active'])

            if value == 'N':
                textMsg = 'Status berhasil diubah menjadi <strong class="text-danger">Nonaktif</strong>';
            else:
                textMsg = 'Status berhasil diubah menjadi <strong class="text-success">Aktif</strong>';
            return json_response(status=True, message=textMsg)
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)
    elif 'is_deleted' in request.POST:
        idp = request.POST.get('idp')
        try:
            user = DataSdm.objects.get(id=idp)
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
        regu_id = request.POST.get('regu_id')
        shift_id = request.POST.get('shift_id')
        nip = request.POST.get('nip')
        nama = request.POST.get('nama')
        no_telepon = request.POST.get('no_telepon')
        email = request.POST.get('email')
        pangkat = request.POST.get('pangkat')
        jabatan = request.POST.get('jabatan')
        is_ppns = request.POST.get('is_ppns')
        no_skep = request.POST.get('no_skep')
        is_penguji = request.POST.get('is_penguji')
        no_reg_penguji = request.POST.get('no_reg_penguji')
        is_korsatpel = request.POST.get('is_korsatpel')
        is_danru = request.POST.get('is_danru')
        is_active = request.POST.get('is_active')
        keterangan = request.POST.get('keterangan')

        print("\n================= FORM INPUT =================")
        print(f"ID             : {id}")
        print(f"Regu ID        : {regu_id}")
        print(f"Shift ID       : {shift_id}")
        print(f"NIP            : {nip}")
        print(f"Nama           : {nama}")
        print(f"No Telepon     : {no_telepon}")
        print(f"Email          : {email}")
        print(f"Pangkat        : {pangkat}")
        print(f"Jabatan        : {jabatan}")
        print(f"PPNS           : {is_ppns}")
        print(f"Penguji        : {is_penguji}")
        print(f"No SKEP        : {no_skep}")
        print(f"No Reg Penguji : {no_reg_penguji}")
        print(f"Korsatpel      : {is_korsatpel}")
        print(f"Danru          : {is_danru}")
        print(f"Status Aktif   : {is_active}")
        print(f"Keterangan     : {keterangan}")
        print("==============================================\n")

        try:
            Checksdm = DataSdm.objects.filter(email=email).exclude(id=id).first()
            if Checksdm:
                return json_response(status=False, message='Gagal menambahkan data, email yang sama sudah ada pada sistem. Coba gunakan email yang lain!', data={
                    'error_code':'email_available'
                })
            # Cek user jika ada update datanya (nama & email)
            user = UserSystem.objects.filter(sdm_id=id).first()
            if user:
                user.nama = nama.upper()
                user.email = email
                user.save()

            # Update SDM
            sdm = DataSdm.objects.filter(id=id).first()
            sdm.regu_id = regu_id
            sdm.shift_id = shift_id
            sdm.nip = nip
            sdm.name = nama.upper()
            sdm.email = email
            sdm.no_telepon = no_telepon if no_telepon is not None else None
            sdm.pangkat = pangkat.upper()
            sdm.jabatan = jabatan.upper()
            sdm.is_ppns = 'Y' if is_ppns == '1' else 'N'
            sdm.no_skep = no_skep if is_ppns == '1' else None
            sdm.is_penguji = 'Y' if is_penguji == '1' else 'N'
            sdm.no_reg_penguji = no_reg_penguji if is_penguji == '1' else None
            sdm.is_korsatpel = 'Y' if is_korsatpel == '1' else 'N'
            sdm.is_danru = 'Y' if is_danru == '1' else 'N'

            sdm.is_active = 'Y' if is_active is not None else 'N'
            sdm.keterangan = keterangan.upper() if keterangan is not None else None
            # ttd ppnd
            if request.method == 'POST' and request.FILES.get('ttdppns'):
                files = request.FILES['ttdppns']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('ttd-ppns', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                sdm.ttd_ppns = filename

            # ttd korsatpel
            if request.method == 'POST' and request.FILES.get('ttdwasatpel'):
                files = request.FILES['ttdwasatpel']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('ttd-korsatpel', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                sdm.ttd_korsatpel = filename

            # ttd danru
            if request.method == 'POST' and request.FILES.get('ttddandru'):
                files = request.FILES['ttddandru']
                file_name, file_extension = os.path.splitext(files.name)
                # pass
                destination_path = os.path.join(settings.BASE_DIR, 'static', 'dist', 'img', 'tanda-tangan')
                if not os.path.exists(destination_path):
                    os.makedirs(destination_path)

                # Simpan file yang di-upload
                fs = FileSystemStorage(location=destination_path)
                filename = generate_encryption_filename('ttd-ttddandru', file_name, file_extension)
                fs.save(filename, files)
                file_url = fs.url(filename)
                
                sdm.ttd_danru = filename
            sdm.save()
            return json_response(status=True, message='Data berhasil diperbarui!')
        except Exception as e:
            return json_response(status=False, message=str(e), code=401)


            
def sincrone(request):
    return json_response(status=False, message='Fitur ini sedang dalam proses pengembangan')
    instansi = Instansi.objects.filter(id=1).first()
    # END POINT API
    url =  instansi.url_portal+ "/api/master/sdm"
    # Parameter
    params = {
        "fidJt": instansi.jt_id,
        "clientId": instansi.client_id
    }
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == True:
                for row in data['data']:
                    data = DataSdm.objects.filter(nip=row['nip']).first()
                    if data:
                        data.name = row['nama_pegawai']
                        data.email = row['email']
                        data.nip = row['nip']
                        data.rank = row['jabatan']
                        data.status = row['status']
                        data.address = row['alamat']
                        data.foto = row['foto']
                        data.save()
                    else:
                       DataSdm.objects.create(
                            name= row['nama_pegawai'],
                            email= row['email'],
                            nip= row['nip'],
                            rank= row['jabatan'],
                            status= row['status'],
                            address= row['alamat'],
                            foto= row['foto'],
                        )
                return json_response(status=True, message='Data telah berhasil disinkronisasi. Saat ini, data SDM sudah sesuai dengan pusat data SDM.')
            else:
                return json_response(status=True, message='Credentials Errors')
        else:
            return JsonResponse({
                "error": "Failed to fetch data from external API",
                "status_code": response.status_code,
                "message": response.text
            }, status=response.status_code)
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": str(e)}, status=500)