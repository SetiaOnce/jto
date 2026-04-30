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
    
    if not getRow:
        return json_response(status=False, message='Data tidak ditemukan')

    results = {
        # Tab UMUM
        'nama': getRow.nama,
        'is_active': getRow.is_active,
        'is_voice': getRow.is_voice,
        'ws_alat': getRow.ws_alat,
        
        # Tab INDICATOR
        'rs' : getRow.rs,
        'port' : getRow.port,
        'baudrate' : getRow.baudrate,
        'parity' : getRow.parity,
        'stopbits' : getRow.stopbits,
        'bytesize' : getRow.bytesize,
        
        # Tab CAMERA
        'rtsp_camera_1' : getRow.rtsp_camera_1,
        'rtsp_camera_2' : getRow.rtsp_camera_2,
        'cam_depan_url' : getRow.cam_depan_url,
        'cam_depan_username' : getRow.cam_depan_username,
        'cam_depan_password' : getRow.cam_depan_password,
        'cam_depan_ws' : getRow.cam_depan_ws,
        'cam_belakang_url' : getRow.cam_belakang_url,
        'cam_belakang_username' : getRow.cam_belakang_username,
        'cam_belakang_password' : getRow.cam_belakang_password,
        'cam_belakang_ws' : getRow.cam_belakang_ws,
        
        # Tab PRINTER
        'is_print_struk' : getRow.is_print_struk,
        'ip_printer_penimbangan' : getRow.ip_printer_penimbangan,
        'port_printer_penimbangan' : getRow.port_printer_penimbangan,
        
        # Tab LPR & RFID
        'is_lpr' : getRow.is_lpr,
        'username_camera_lpr' : getRow.username_camera_lpr,
        'password_camera_lpr' : getRow.password_camera_lpr,
        'ip_camera_lpr' : getRow.ip_camera_lpr,
        'cam_lpr_ws' : getRow.cam_lpr_ws,
        'is_auto_lpr' : getRow.is_auto_lpr,
        'is_rfid' : getRow.is_rfid,
        'ip_rfid' : getRow.ip_rfid,

        # Tambahan Tab GATE
        'is_gate' : getRow.is_gate,
        'ip_pintu_antrian' : getRow.ip_pintu_antrian,
        'port_pintu_antrian' : getRow.port_pintu_antrian,
        'addr_ibg_antrian' : getRow.addr_ibg_antrian,
        'ip_pintu_penimbangan' : getRow.ip_pintu_penimbangan,
        'port_pintu_penimbangan' : getRow.port_pintu_penimbangan,
        'addr_ibg_penimbangan' : getRow.addr_ibg_penimbangan,
        # Tambahan Tab DIMENSI
        'is_lidar' : getRow.is_lidar,
        'api_url_sensor_dim' : getRow.api_url_sensor_dim,

        # Tab AKSES
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
            
            if category == 'UMUM':
                alat.nama = request.POST.get('nama')
                alat.ws_alat = request.POST.get('ws_alat')
                alat.is_active = 'Y' if request.POST.get('is_active') else 'N'
                alat.is_voice = 'Y' if request.POST.get('is_voice') else 'N'
                
            elif category == 'INDICATOR':
                alat.rs = request.POST.get('rs').upper()
                alat.port = request.POST.get('port').upper()
                alat.baudrate = request.POST.get('baudrate')
                alat.parity = request.POST.get('parity')
                alat.stopbits = request.POST.get('stopbits')
                alat.bytesize = request.POST.get('bytesize')
                
            elif category == 'CAMERA':
                alat.rtsp_camera_1 = request.POST.get('rtsp_camera_1')
                alat.rtsp_camera_2 = request.POST.get('rtsp_camera_2')
                alat.cam_depan_url = request.POST.get('cam_depan_url')
                alat.cam_depan_username = request.POST.get('cam_depan_username')
                alat.cam_depan_password = request.POST.get('cam_depan_password')
                alat.cam_depan_ws = request.POST.get('cam_depan_ws')
                alat.cam_belakang_url = request.POST.get('cam_belakang_url')
                alat.cam_belakang_username = request.POST.get('cam_belakang_username')
                alat.cam_belakang_password = request.POST.get('cam_belakang_password')
                alat.cam_belakang_ws = request.POST.get('cam_belakang_ws')
                
            elif category == 'PRINTER_STRUK':
                alat.is_print_struk = 'Y' if request.POST.get('is_print_struk') else 'N'
                alat.ip_printer_penimbangan = request.POST.get('ip_printer_penimbangan')
                alat.port_printer_penimbangan = request.POST.get('port_printer_penimbangan')

            elif category == 'LPR_RFID':
                alat.is_lpr = 'Y' if request.POST.get('is_lpr') else 'N'
                alat.is_auto_lpr = 'Y' if request.POST.get('is_auto_lpr') else 'N'
                alat.is_rfid = 'Y' if request.POST.get('is_rfid') else 'N'
                alat.ip_rfid = request.POST.get('ip_rfid')
                alat.ip_camera_lpr = request.POST.get('ip_camera_lpr')
                alat.username_camera_lpr = request.POST.get('username_camera_lpr')
                alat.password_camera_lpr = request.POST.get('password_camera_lpr')
                alat.cam_lpr_ws = request.POST.get('cam_lpr_ws')
            elif category == 'GATE':
                alat.is_gate = 'Y' if request.POST.get('is_gate') else 'N'
                alat.ip_pintu_antrian = request.POST.get('ip_pintu_antrian')
                alat.port_pintu_antrian = request.POST.get('port_pintu_antrian')
                alat.addr_ibg_antrian = request.POST.get('addr_ibg_antrian')
                alat.ip_pintu_penimbangan = request.POST.get('ip_pintu_penimbangan')
                alat.port_pintu_penimbangan = request.POST.get('port_pintu_penimbangan')
                alat.addr_ibg_penimbangan = request.POST.get('addr_ibg_penimbangan')
            elif category == 'DIMENSI': # <-- Kategori Simpan Baru
                alat.is_lidar = 'Y' if request.POST.get('is_lidar') else 'N'
                alat.api_url_sensor_dim = request.POST.get('api_url_sensor_dim')
            elif category == 'AKSES_PENIMBANGAN':
                alat.is_ip_access_timbang = 'Y' if request.POST.get('is_ip_access_timbang') else 'N'
                alat.ip_timbang_allowed = request.POST.get('ip_timbang_allowed')

            alat.save()
            results = {'category' : category, 'timbangan_id' : timbangan_id}
            return json_response(status=True, message="Konfigurasi berhasil diperbarui", data=results)
        else:
            return json_response(status=False, message="Platform timbangan tidak ditemukan")
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