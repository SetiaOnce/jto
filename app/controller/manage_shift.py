from django.shortcuts import render
from app.models import MasterShift, LokasiUppkb
from .utils import json_response
from django.utils import timezone
from django.db import IntegrityError
import json

def index(request):
    lokasi = LokasiUppkb.objects.first()
    context = {
        'app_name': lokasi.nama,
        'title': 'Manajemen Shift',
        'active_menu': 'manage_shift',
    }
    return render(request, 'backend/manage_shift.html', context)

def list_data(request):
    """Get all shifts"""
    rows = MasterShift.objects.all()
    data = []
    for row in rows:
        data.append({
            'id': row.id,
            'kode': row.kode,
            'nama': row.nama,
            'jam_mulai': str(row.jam_mulai),
            'jam_selesai': str(row.jam_selesai),
            'is_active': row.is_active,
        })
    return json_response(status=True, data=data)

def show(request):
    """Get single shift by ID"""
    id = request.GET.get('id')
    if not id:
        return json_response(status=False, message="ID tidak diberikan")
    
    row = MasterShift.objects.filter(id=id).first()
    if row:
        data = {
            'id': row.id,
            'kode': row.kode,
            'nama': row.nama,
            'jam_mulai': str(row.jam_mulai),
            'jam_selesai': str(row.jam_selesai),
            'is_active': row.is_active,
        }
        return json_response(status=True, data=data)
    return json_response(status=False, message="Data tidak ditemukan")

def store(request):
    """Create or Update shift"""
    try:
        id = request.POST.get('id', '').strip()
        kode = request.POST.get('kode', '').strip()
        nama = request.POST.get('nama', '').strip()
        jam_mulai = request.POST.get('jam_mulai', '').strip()
        jam_selesai = request.POST.get('jam_selesai', '').strip()
        is_active = request.POST.get('is_active')

        # Validasi input
        if not kode:
            return json_response(status=False, message="Kode shift harus diisi")
        if not nama:
            return json_response(status=False, message="Nama shift harus diisi")
        if not jam_mulai:
            return json_response(status=False, message="Jam mulai harus diisi")
        if not jam_selesai:
            return json_response(status=False, message="Jam selesai harus diisi")

        # if jam_mulai >= jam_selesai:
        #     return json_response(status=False, message="Jam mulai harus lebih kecil dari jam selesai")

        if id:  # Update existing
            shift = MasterShift.objects.filter(id=id).first()
            if not shift:
                return json_response(status=False, message="Data shift tidak ditemukan")
            
            # Check kode uniqueness if kode changed
            if shift.kode != kode:
                if MasterShift.objects.filter(kode=kode).exists():
                    return json_response(status=False, message="Kode shift sudah digunakan")
            
            shift.kode = kode
            shift.nama = nama
            shift.jam_mulai = jam_mulai
            shift.jam_selesai = jam_selesai
            shift.is_active = 'Y' if is_active else 'N'
            shift.save()
            action = "diperbarui"
        else:  # Create new
            # Check kode uniqueness
            if MasterShift.objects.filter(kode=kode).exists():
                return json_response(status=False, message="Kode shift sudah digunakan")
            
            shift = MasterShift.objects.create(
                kode=kode,
                nama=nama,
                jam_mulai=jam_mulai,
                jam_selesai=jam_selesai,
                is_active='Y' if is_active else 'N'
            )
            action = "dibuat"

        return json_response(status=True, message=f"Data shift berhasil {action}")
    
    except IntegrityError:
        return json_response(status=False, message="Kode shift sudah digunakan")
    except ValueError as e:
        return json_response(status=False, message=f"Format data tidak valid: {str(e)}")
    except Exception as e:
        return json_response(status=False, message=f"Error: {str(e)}")

def delete(request):
    """Delete shift"""
    try:
        id = request.POST.get('id')
        if not id:
            return json_response(status=False, message="ID tidak diberikan")
        
        shift = MasterShift.objects.filter(id=id).first()
        if not shift:
            return json_response(status=False, message="Data shift tidak ditemukan")
        
        # Check if shift is used in other tables (optional - add if needed)
        # from app.models import DetailShift
        # if DetailShift.objects.filter(shift_id=id).exists():
        #     return json_response(status=False, message="Shift masih digunakan, tidak dapat dihapus")
        
        kode = shift.kode
        shift.delete()
        return json_response(status=True, message=f"Data shift {kode} berhasil dihapus")
    
    except Exception as e:
        return json_response(status=False, message=f"Gagal menghapus data: {str(e)}")