from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.templatetags.static import static
from django.db.models import Case, When, Q
import time, serial, threading
from serial.serialutil import SerialException
from .utils import json_response, print_error_box, print_success_box
from django.core.paginator import Paginator
import re
from app.models import (
   SensorDimensi,
   SensorLpr,
   DataSdm,
   SiteInfo,
   MasterJenisKendaraan,
   DataPenimbangan,
   MasterKomoditi,
   MasterRegu,
   MasterShift,
   MasterTimbangan,
   AksesMenu,
   MasterLevel,
   MasterSumbu,
   MasterKategoriKepemilikan,
   DataKotaKab,
   MasterJenisPelanggaran,
   MasterGolSim,
   Sanksi,
   Pasal,
   SubSanksi,
   Sitaan,
   Pengadilan,
   Kejaksaan,
   MasterKendaraan,
   KomoditiAsalTujuanPengemudi,
   MasterJenisKendaraanTilang
)

def get_site_info():
   getRow = SiteInfo.objects.filter(id=1).first()
   return {
      'app_version' : getRow.app_version,
      'timezone' : getRow.timezone,
      'name' : getRow.name,
      'short_name' : getRow.short_name,
      'description' : getRow.description,
      'address' : getRow.address,
      'copyright' : getRow.copyright,
      'login_bg' : getRow.login_bg,
      'login_logo' : getRow.login_logo,
      'headbackend_logo' : getRow.headbackend_logo,
      'headbackend_logo_dark' : getRow.headbackend_logo_dark,
      'headbackend_icon' : getRow.headbackend_icon,
      'headbackend_icon_dark' : getRow.headbackend_icon_dark,
      'login_bg_url' : static('dist/img/site-img/') + getRow.login_bg,
      'login_logo_url' : static('dist/img/site-img/') + getRow.login_logo,
      'headbackend_logo_url' : static('dist/img/site-img/') + getRow.headbackend_logo,
      'headbackend_logo_dark_url' : static('dist/img/site-img/') + getRow.headbackend_logo_dark,
      'headbackend_icon_url' : static('dist/img/site-img/') + getRow.headbackend_icon,
      'headbackend_icon_dark_url' : static('dist/img/site-img/') + getRow.headbackend_icon_dark,
   }
def site_info(request):
   results = get_site_info()
   return json_response(status=True, message='Success', data=results)
def load_dimention(request):
   getRow = SensorDimensi.objects.get(id='1')
   return JsonResponse({
         'panjang': getRow.panjang,
         'lebar': getRow.lebar,
         'tinggi': getRow.tinggi
      })
# start_reading_weight()
def load_lpr(request):
   getRow = SensorLpr.objects.all().order_by('-id').first()
   if(getRow):
      return JsonResponse({
            'noken': getRow.plate_nomor,
         })
   else:
      return JsonResponse({
            'noken': '0000000',
         })
def load_akses_menu(request):
   try:
      getRow = AksesMenu.objects.filter(is_active='Y').order_by('order')
      user = request.user
      if user:
         level_id = str(user.level_id)
         getRow = getRow.filter(
            Q(akses_level=level_id) |
            Q(akses_level__startswith=level_id + ',') |
            Q(akses_level__endswith=',' + level_id) |
            Q(akses_level__contains=',' + level_id + ',')
         )

      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'nama' : row.nama,
            'icon' : static('dist/img/menu-icons/' + row.icon),
            'url' : row.url,
            'need_shift_regu_platform' : row.need_shift_regu_platform,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_komoditi(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = MasterKomoditi.objects.filter(is_deleted=0)
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
            {
                'id': row.id,
                'name': row.nama
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
def load_kab_kota(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = DataKotaKab.objects.all()
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
            {
                'id': row.id,
                'name': row.nama
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
def load_jenis_pelanggaran(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = MasterJenisPelanggaran.objects.filter(is_active='Y').all()
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
            {
                'id': row.id,
                'name': row.nama
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
def load_sumbu(request):
   try:
      getRow = MasterSumbu.objects.filter(is_active=1).all()
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'name' : row.konfig_sumbu,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_kepemilikan(request):
   try:
      getRow = MasterKategoriKepemilikan.objects.filter(is_active=1, is_deleted=0).all()
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_level(request):
   # return JsonResponse({
   #    'row': [
   #          {
   #             'id': '1',
   #             'name': 'PENDATAAN',
   #          },
   #          {
   #             'id': '2',
   #             'name': 'PENIMBANGAN (Operator)',
   #          },
   #          {
   #             'id': '3',
   #             'name': 'PENINDAKAN (PPNS)',
   #          },
   #          {
   #             'id': '4',
   #             'name': 'ADMINISTRATOR',
   #          },
   #    ]
   # })
   try:
      getRow = MasterLevel.objects.filter(is_active='Y').all()
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'kode' : row.kode,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_regu(request):
   try:
      getRow = MasterRegu.objects.all()
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_shift(request):
   try:
      getRow = MasterShift.objects.all()
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_timbangan(request):
   try:
      getRow = MasterTimbangan.objects.filter(is_active='Y')
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_sdm(request):
   if 'idp' in request.GET:
      idp = request.GET.get('idp')
      try:
         user = DataSdm.objects.filter(id=idp).select_related('regu').select_related('shift').first()
         data = {
            "id": user.id,
            "regu": user.regu.nama,
            "shift": user.shift.nama,
            "name": user.name,
            "email": user.email,
            "nip": user.nip,
            "pangkat": user.pangkat,
            "jabatan": user.jabatan,
            "no_skep": user.no_skep,
            "status": user.status,
            "address": user.address,
            "foto": user.foto,
         }
         return json_response(status=True, message='Success', data=data)
      except Exception as e:
         return json_response(status=False, message=str(e), code=401)
   else:
      try:
         is_korsatpel = request.GET.get('is_korsatpel')
         is_ppns = request.GET.get('is_ppns')
         query = DataSdm.objects.filter(is_active='Y', is_deleted='N', is_development='N')
         # Filter korsatpel
         if is_korsatpel:
            query = query.filter(is_korsatpel='Y')
         if is_ppns:
            query = query.filter(is_ppns='Y')
         getRow = query
         data = []
         for row in getRow:   
            data.append({
               'id' : row.id,
               'name' : row.name,
               'jabatan' : row.jabatan,
            })
         return json_response(status=True, message='Success', data=data)
      except Exception as e:
         return json_response(status=False, message=str(e), code=401) 
def load_gol_sim(request):
   try:
      query = MasterGolSim.objects.filter(is_active=1, is_deleted=0)
      getRow = query
      data = []
      for row in getRow:   
         data.append({
            'id' : row.id,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401) 
def load_sanksi(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = Sanksi.objects.filter(is_active=1, is_deleted=0)
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
         {
            'id': row.id,
            'name': row.nama
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
def load_pengadilan(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = Pengadilan.objects.filter(is_active=1, is_deleted=0)
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
         {
            'id': row.id,
            'name': row.nama
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
def load_kejaksaan(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = Kejaksaan.objects.filter(is_active=1, is_deleted=0)
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
         {
            'id': row.id,
            'name': row.nama
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
def load_pasal(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = Pasal.objects.filter(is_active=1, is_deleted=0)
      if search:
         queryset = queryset.filter(pasal__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
            {
                'id': row.id,
                'name': row.pasal
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
def load_sub_sanski(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      sanksi_id = request.GET.get('sanksi_id')
      queryset = SubSanksi.objects.filter(is_active=1, is_deleted=0, sanksi_id=sanksi_id)
      if search:
         queryset = queryset.filter(nama__icontains=search)

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
         {
               'id': row.id,
               'name': row.nama
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
def load_sitaan(request):
   try:
      #Params
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      sanksi_id = request.GET.get('sanksi_id')
      queryset = Sitaan.objects.filter(is_active=1, is_deleted=0, sanksi_id=sanksi_id).select_related('dokumen')

      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
         {
               'id': row.id,
               'name': row.dokumen.nama
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
def load_jenis_kendaraan(request):
   try:
      getRow = MasterJenisKendaraan.objects.filter(is_active=1)
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'name' : row.nama,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401)
def load_jenis_kendaraan_tilang(request):
   try:
      # Params Select2
      search = request.GET.get('q', '')
      page = int(request.GET.get('page', 1))
      page_size = 10

      # Query
      queryset = MasterJenisKendaraanTilang.objects.filter(is_active=1)
      if search:
         queryset = queryset.filter(nama__icontains=search)

      # Pagination
      paginator = Paginator(queryset, page_size)
      page_obj = paginator.get_page(page)

      results = [
         {'id': row.id, 'name': row.nama}
         for row in page_obj
      ]

      return JsonResponse({
         'results': results,
         'has_next': page_obj.has_next()
      })

   except Exception as e:
      return JsonResponse({
         'results': [],
         'has_next': False,
         'error': str(e)
      }, status=500)

def load_antrian_kendaraan(request):
   try:
      getRow = DataPenimbangan.objects.filter(sts_data='0')
      data = []
      for row in getRow:
         data.append({
            'id' : row.id,
            'noken' : row.noken.upper(),
            'id_transaksi' : row.id_transaksi,
         })
      return json_response(status=True, message='Success', data=data)
   except Exception as e:
      return json_response(status=False, message=str(e), code=401) 
def set_cookies(response: HttpResponse, cookies: dict, max_age: int = 60 * 60 * 24 * 365 * 10):
    for key, value in cookies.items():
        response.set_cookie(
            key=key,
            value=value,
            max_age=max_age,
            httponly=False,  # Bisa diubah sesuai kebutuhan
            secure=False,    # True jika HTTPS
            samesite='Lax'   # 'Strict' / 'Lax' / 'None' sesuai kebutuhan
        )
    return response
def save_kendaraan(params):
    # ==============================
    # KEPEMILIKAN
    # ==============================
    kepemilikan = MasterKategoriKepemilikan.objects.filter(id=params.get('kategori_kepemilikan_id')).first()
    if not kepemilikan:
        return json_response(status=False, message="Kepemilikan tidak ditemukan", code=400)
    no_kendaraan = params.get('no_kendaraan')
    kendaraan = MasterKendaraan.objects.filter(no_reg_kend=no_kendaraan).first()
    if kendaraan:
        # Kendaraan ditemukan, lakukan update
        kendaraan.no_reg_kend = params.get('no_kendaraan')
        kendaraan.no_uji = params.get('no_uji')
        kendaraan.nama_pemilik = params.get('nama_pemilik')
        kendaraan.alamat_pemilik = params.get('alamat_pemilik')
        kendaraan.masa_berlaku_uji = params.get('tgl_masa_berlaku')
        kendaraan.jenis_kend = params.get('jenis_kendaraan')
        kendaraan.jenis_kendaraan_id = params.get('jenis_kendaraan_id')
        kendaraan.konfigurasi_sumbu = params.get('sumbu')
        kendaraan.sumbu_id = params.get('sumbu_id')
        kendaraan.jbi = params.get('jbi_uji')
        kendaraan.panjang_utama = params.get('panjang_utama')
        kendaraan.lebar_utama = params.get('lebar_utama')
        kendaraan.tinggi_utama = params.get('tinggi_utama')
        kendaraan.julur_depan = params.get('foh_utama')
        kendaraan.julur_belakang = params.get('roh_utama')
        kendaraan.kepemilikan_id = kepemilikan.id
        kendaraan.kepemilikan_val = kepemilikan.nama
        kendaraan.updated_by = params.get('petugas_id')
        kendaraan.save()
    else:
        # Kendaraan tidak ditemukan, buat baru
        MasterKendaraan.objects.create(
            no_reg_kend=params.get('no_kendaraan'),
            no_uji=params.get('no_uji'),
            nama_pemilik=params.get('nama_pemilik'),
            alamat_pemilik=params.get('alamat_pemilik'),
            masa_berlaku_uji=params.get('tgl_masa_berlaku'),
            jenis_kend=params.get('jenis_kendaraan'),
            jenis_kendaraan_id=params.get('jenis_kendaraan_id'),
            konfigurasi_sumbu=params.get('sumbu'),
            sumbu_id=params.get('sumbu_id'),
            jbi=params.get('jbi_uji'),
            panjang_utama=params.get('panjang_utama'),
            lebar_utama=params.get('lebar_utama'),
            tinggi_utama=params.get('tinggi_utama'),
            julur_depan=params.get('foh_utama'),
            julur_belakang=params.get('roh_utama'),
            kepemilikan_id=kepemilikan.id,
            kepemilikan_val=kepemilikan.nama,
            created_by=params.get('petugas_id'),
        )
def save_komoditi_asaltujuan_pengemudi(params, jenisupdate="KOMODITI"):
   no_kendaraan = params.get('no_kendaraan')
   obj, created = KomoditiAsalTujuanPengemudi.objects.get_or_create(
      no_kendaraan=no_kendaraan,
      defaults={
         # KOMODITI
         'komoditi_id': params.get('komoditi_id'),
         'kategori_komoditi_id': params.get('kategori_komoditi_id'),
         'asal_kota_id': params.get('asal_kota_id'),
         'tujuan_kota_id': params.get('tujuan_kota_id'),
         'no_surat_jalan': params.get('nomor_surat_jalan'),
         'pemilik_komoditi': params.get('pemilik_komoditi'),
         'alamat_pemilik_komoditi': params.get('alamat_pemilik_komoditi'),
         # SOPIR
         'nama_pengemudi': params.get('nama_pengemudi'),
         'alamat_pengemudi': params.get('alamat_pengemudi'),
         'jenis_kelamin': params.get('jenis_kelamin_pengemudi'),
         'umur_pengemudi': params.get('umur_pengemudi'),
         'no_telepon': params.get('no_telepon'),
         'warna_kendaraan': params.get('warna_kendaraan'),
         'gol_sim_id': params.get('gol_sim_id'),
         'no_sim': params.get('no_identitas'),
      }
   )
   if not created:
      if jenisupdate == 'KOMODITI':
         # KOMODITI
         obj.komoditi_id = params.get('komoditi_id')
         obj.kategori_komoditi_id = params.get('kategori_komoditi_id')
         obj.asal_kota_id = params.get('asal_kota_id')
         obj.tujuan_kota_id = params.get('tujuan_kota_id')
         obj.no_surat_jalan = params.get('nomor_surat_jalan')
         obj.pemilik_komoditi = params.get('pemilik_komoditi')
         obj.alamat_pemilik_komoditi = params.get('alamat_pemilik_komoditi')
         # SOPIR
         obj.nama_pengemudi = params.get('nama_pengemudi')
         obj.alamat_pengemudi = params.get('alamat_pengemudi')
         obj.jenis_kelamin = params.get('jenis_kelamin_pengemudi')
         obj.umur_pengemudi = params.get('umur_pengemudi')
         obj.no_telepon = params.get('no_telepon')
         obj.warna_kendaraan = params.get('warna_kendaraan')
         obj.gol_sim_id = params.get('gol_sim_id')
         obj.no_sim = params.get('no_identitas')
         obj.save()
      else:
         obj.nama_pengemudi = params.get('nama_pengemudi')
         obj.alamat_pengemudi = params.get('alamat_pengemudi')
         obj.jenis_kelamin = params.get('jenis_kelamin_pengemudi')
         obj.umur_pengemudi = params.get('umur_pengemudi')
         obj.no_telepon = params.get('no_telepon')
         obj.warna_kendaraan = params.get('warna_kendaraan')
         obj.gol_sim_id = params.get('gol_sim_id')
         obj.no_sim = params.get('no_identitas')
         obj.save()
def jenisPelanggaran():
   getRow = MasterJenisPelanggaran.objects.filter(is_active='Y').all()
   data = []
   for row in getRow:
      data.append({
         'id' : row.id,
         'kode' : row.kode,
         'name' : row.nama,
      })
   return data
def sanksi():
   getRow = Sanksi.objects.filter(is_active=1, is_deleted=0).all()
   data = []
   for row in getRow:
      data.append({
         'id' : row.id,
         'kode' : row.kode,
         'name' : row.nama,
      })
   return data
def subSanksi():
   getRow = SubSanksi.objects.filter(is_active=1, is_deleted=0).all()
   data = []
   for row in getRow:
      data.append({
         'id' : row.id,
         'kode' : row.kode,
         'name' : row.nama,
      })
   return data
def tablePersentaseKelebihan():
    data = [
        {"id": 2, "name": "6 - 20"},
        {"id": 3, "name": "21 - 40"},
        {"id": 4, "name": "41 - 60"},
        {"id": 5, "name": "61 - 80"},
        {"id": 6, "name": "81 - 100"},
        {"id": 7, "name": ">100"},
    ]
    return data


