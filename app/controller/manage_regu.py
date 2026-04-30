from django.shortcuts import render
from app.models import MasterRegu, LokasiUppkb
from .utils import json_response
from django.utils import timezone
from django.db import IntegrityError
import json

def index(request):
    lokasi = LokasiUppkb.objects.first()
    context = {
        'app_name': lokasi.nama,
        'title': 'Manajemen Regu',
        'active_menu': 'manage_regu',
    }
    return render(request, 'backend/manage_regu.html', context)

def list_data(request):
    """Get all regus"""
    rows = MasterRegu.objects.all()
    data = []
    for row in rows:
        data.append({
            'id': row.id,
            'kode': row.kode,
            'nama': row.nama,
            'is_active': row.is_active,
        })
    return json_response(status=True, data=data)

def show(request):
    """Get single regu by ID"""
    id = request.GET.get('id')
    if not id:
        return json_response(status=False, message="ID tidak diberikan")
    
    row = MasterRegu.objects.filter(id=id).first()
    if row:
        data = {
            'id': row.id,
            'kode': row.kode,
            'nama': row.nama,
            'is_active': row.is_active,
        }
        return json_response(status=True, data=data)
    return json_response(status=False, message="Data tidak ditemukan")

def store(request):
    """Create or Update regu"""
    try:
        id = request.POST.get('id', '').strip()
        kode = request.POST.get('kode', '').strip()
        nama = request.POST.get('nama', '').strip()
        is_active = request.POST.get('is_active')

        # Validasi input
        if not kode:
            return json_response(status=False, message="Kode regu harus diisi")
        if not nama:
            return json_response(status=False, message="Nama regu harus diisi")

        if id:  # Update existing
            regu = MasterRegu.objects.filter(id=id).first()
            if not regu:
                return json_response(status=False, message="Data regu tidak ditemukan")
            
            # Check kode uniqueness if kode changed
            if regu.kode != kode:
                if MasterRegu.objects.filter(kode=kode).exists():
                    return json_response(status=False, message="Kode regu sudah digunakan")
            
            regu.kode = kode
            regu.nama = nama
            regu.is_active = 'Y' if is_active else 'N'
            regu.save()
            action = "diperbarui"
        else:  # Create new
            # Check kode uniqueness
            if MasterRegu.objects.filter(kode=kode).exists():
                return json_response(status=False, message="Kode regu sudah digunakan")
            
            regu = MasterRegu.objects.create(
                kode=kode,
                nama=nama,
                is_active='Y' if is_active else 'N'
            )
            action = "dibuat"

        return json_response(status=True, message=f"Data regu berhasil {action}")
    
    except IntegrityError:
        return json_response(status=False, message="Kode regu sudah digunakan")
    except ValueError as e:
        return json_response(status=False, message=f"Format data tidak valid: {str(e)}")
    except Exception as e:
        return json_response(status=False, message=f"Error: {str(e)}")

def delete(request):
    """Delete regu"""
    try:
        id = request.POST.get('id')
        if not id:
            return json_response(status=False, message="ID tidak diberikan")
        
        regu = MasterRegu.objects.filter(id=id).first()
        if not regu:
            return json_response(status=False, message="Data regu tidak ditemukan")
        
        kode = regu.kode
        regu.delete()
        return json_response(status=True, message=f"Data regu {kode} berhasil dihapus")
    
    except Exception as e:
        return json_response(status=False, message=f"Gagal menghapus data: {str(e)}")