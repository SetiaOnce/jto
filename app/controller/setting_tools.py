import random
import os
from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from app.models import LokasiUppkb, MasterTimbangan
from .utils import json_response, generate_encryption_filename, print_error_box, print_success_box, is_rtsp_camera_active, is_printer_connected
from urllib.parse import unquote
import serial
import serial.tools.list_ports
from serial.serialutil import SerialException
import re, time

def index(request):
    lokasi = LokasiUppkb.objects.first()
    # Get COM Port on Computer
    ports = serial.tools.list_ports.comports()
    available_ports = [
        {'device': port.device, 'description': port.description}
        for port in ports
    ]
    context = {
        'title': 'Konfigurasi Alat',
        'active_menu': 'setting_tools',
        'app_name': lokasi.nama,
        'available_ports': available_ports
    }
    ports = serial.tools.list_ports.comports()
    return render(request, 'backend/setting_tools.html', context)

def show(request):
   timbangan_id = request.GET.get('timbangan_id')
   getRow = MasterTimbangan.objects.filter(id=timbangan_id).first()
   results = {
      'rs' : getRow.rs,
      'port' : getRow.port,
      'baudrate' : getRow.baudrate,
      'parity' : getRow.parity,
      'stopbits' : getRow.stopbits,
      'bytesize' : getRow.bytesize,
      'rtsp_camera_1' : getRow.rtsp_camera_1,
      'rtsp_camera_2' : getRow.rtsp_camera_2,
      'ip_printer_penimbangan' : getRow.ip_printer_penimbangan,
      'port_printer_penimbangan' : getRow.port_printer_penimbangan,
      'is_ip_access_timbang' : getRow.is_ip_access_timbang,
      'ip_timbang_allowed' : getRow.ip_timbang_allowed,
   }
   return json_response(status=True, message='Success', data=results)

def update(request):
    try:
        timbangan_id = request.POST.get('timbangan_id')
        alat = MasterTimbangan.objects.filter(id=timbangan_id).first()

        if alat:
            category = request.POST.get('category')
            print(category)
            # Update
            if category == 'INDICATOR':
                alat.rs = request.POST.get('rs').upper()
                alat.port = request.POST.get('port').upper()
                alat.baudrate = request.POST.get('baudrate')
                alat.parity = request.POST.get('parity')
                alat.stopbits = request.POST.get('stopbits')
                alat.bytesize = request.POST.get('bytesize')
            elif category == 'CAMERA':
                alat.rtsp_camera_1 = request.POST.get('rtsp_camera_1')
                alat.rtsp_camera_2 = request.POST.get('rtsp_camera_2')
            elif category == 'PRINTER_STRUK':
                alat.ip_printer_penimbangan = request.POST.get('ip_printer_penimbangan')
                alat.port_printer_penimbangan = request.POST.get('port_printer_penimbangan')
            elif category == 'AKSES_PENIMBANGAN':
                alat.is_ip_access_timbang = 'Y' if request.POST.get('is_ip_access_timbang') else 'N'
                alat.ip_timbang_allowed = request.POST.get('ip_timbang_allowed')

            # save
            alat.save()
            results = {
                'category' : category,
                'timbangan_id' : timbangan_id
            }
            return json_response(status=True, message="Konfigurasi alat berhasil diperbarui", data=results)
        else:
            return json_response(status=False, message="Credentials error")
    except Exception as e:
        return json_response(status=False, message=str(e), code=401)
    
def test_setting_tools(request):
    category = request.GET.get('category')
    if category == 'INDICATOR':
        rs = request.GET.get('rs')
        port = request.GET.get('port')
        baudrate = request.GET.get('baudrate')
        parity = request.GET.get('parity')
        stopbits = request.GET.get('stopbits')
        bytesize = request.GET.get('bytesize')
        print(f'{port} : {baudrate} : {parity} : {stopbits} : {bytesize}')
        try:
            baudrate = int(baudrate)
            stopbits = getattr(serial, stopbits)
            bytesize = getattr(serial, bytesize)
            parity = getattr(serial, parity)
            
            # Coba buka koneksi serial
            ser = serial.Serial(
                port=port,
                baudrate=baudrate,
                parity=parity,
                stopbits=stopbits,
                bytesize=bytesize,
                timeout=1
            )

            if ser.is_open:
                time.sleep(1)
                if ser.inWaiting() > 0:
                    read_serial = ser.read(ser.inWaiting())
                else:
                    read_serial = ser.readline()
                ser.close()
                current_weight = 0
                data = read_serial[7:14].decode('utf-8').replace(".", "")
                data = re.sub(r'\D', '', data)
                print(f'INI ADALAH DATA : {data}');
                if data.isnumeric():
                    if len(data) >= 6:
                        data_numeric = int(data)
                        current_weight = data_numeric

                print_success_box("KONEKSI SERIAL BERHASIL", f"Terhubung ke port {port} dengan baudrate {baudrate}")
                return json_response(status=True, message=f'Berhasil terhubung ke indikator. <br><br><br> Out RS: <b>{read_serial}</b> <br> Hasil Timbang: <b>{current_weight}</b>')
            else:
                print_error_box("GAGAL MEMBUKA PORT SERIAL", str(e), color='\033[91m')#Tesk warna merah
                return json_response(status=False, message='Gagal membuka port serial.')
        except SerialException as e:
            print_error_box("GAGAL MEMBUKA PORT SERIAL", str(e), color='\033[91m')#Tesk warna merah
            return json_response(status=False, message=f'Gagal terhubung: {str(e)}')
        except PermissionError as e:
            print_error_box("PERMISSION ERROR", f"{str(e)}\nPORT SEDANG DIGUNAKAN OLEH APLIKASI LAIN?", color='\033[93m')#Tesk warna kuning
            return json_response(status=False, message=f'Parameter salah: {str(e)}')
        except Exception as e:
            print_error_box("KESALAHAN TIDAK DIKETAHUI", str(e))
            return json_response(status=False, message=f'Error tidak diketahui: {str(e)}')
    elif category == 'CAMERA':
        rtsp_camera_1 = request.GET.get('rtsp_camera_1')
        rtsp_camera_2 = request.GET.get('rtsp_camera_2')
        print(f'RTSP 1 : {rtsp_camera_1} ------- RTSP 2 :{rtsp_camera_2}')

        status_1 = is_rtsp_camera_active(rtsp_camera_1) if rtsp_camera_1 else None
        status_2 = is_rtsp_camera_active(rtsp_camera_2) if rtsp_camera_2 else None

        camera_1 = (
            "<span class='text-success'>Aktif</span>" if status_1
            else "<span class='text-danger'>Tidak Aktif</span>" if status_1 is not None
            else "<span class='text-warning'>Tidak Diberikan</span>"
        )
        camera_2 = (
            "<span class='text-success'>Aktif</span>" if status_2
            else "<span class='text-danger'>Tidak Aktif</span>" if status_2 is not None
            else "<span class='text-warning'>Tidak Diberikan</span>"
        )

        # Deteksi jika salah satu kamera tidak aktif
        if status_1 is False or status_2 is False:
            print_error_box("KAMERA TIDAK TERHUBUNG", f"CAMERA 1 : {camera_1} <br> CAMERA 2 : {camera_2}")
            return json_response(
                status=False,
                message=f'CAMERA 1 : <b>{camera_1}</b><br> CAMERA 2 : <b>{camera_2}</b>',
            )

        # Semua kamera aktif / valid
        print_success_box("KONEKSI KAMERA BERHASIL", f"Terhubung ke : {rtsp_camera_1 or '-'} dan {rtsp_camera_2 or '-'}")
        return json_response(
            status=True,
            message=f'CAMERA 1 : <b>{camera_1}</b><br> CAMERA 2 : <b>{camera_2}</b>',
        )
    elif category == 'PRINTER_STRUK':
        ip_printer_penimbangan = request.GET.get('ip_printer_penimbangan')
        port_printer_penimbangan = request.GET.get('port_printer_penimbangan')

        if not ip_printer_penimbangan or not port_printer_penimbangan:
            return json_response(status=False, message="IP atau port printer belum diberikan")

        is_connected = is_printer_connected(ip_printer_penimbangan, port_printer_penimbangan)

        if is_connected:
            print_success_box("KONEKSI PRINTER BERHASIL", f"Terhubung ke {ip_printer_penimbangan}:{port_printer_penimbangan}")
            return json_response(status=True, message="Printer terhubung")
        else:
            print_error_box("PRINTER TIDAK TERHUBUNG", f"Gagal terhubung ke {ip_printer_penimbangan}:{port_printer_penimbangan}")
            return json_response(status=False, message="Gagal terhubung ke printer")