from django.http import JsonResponse
from django.templatetags.static import static
from django.urls import reverse
from django.utils.timezone import now, make_aware
from django.utils.text import slugify
from datetime import datetime, timedelta, timezone, date
import time, random, string, bcrypt, socket
from pathlib import Path
import cv2
from app.models import DataPenimbangan, DataPenindakan, KendaraanBodong, DataPeringatan
import pytz
from datetime import datetime, timezone as dt_timezone
from django.utils import timezone as timezone_utils
import edge_tts
from pydub import AudioSegment
from pydub.playback import play
import os

def json_response(status=True, message="Success", code=200, data=None):
    return JsonResponse({
        "status": status,
        "message": message,
        "row": data
    }, status=code)

def getUser(request):
    user = request.user
    return {
        'id': user.id,
        'nama': user.nama,
        'email': user.email,
        'username': user.username,
        'alamat': user.alamat,
        'pangkat': user.pangkat,
        'nip': user.nip,
        'level': user.level,
        'level_id': user.level_id,
    }
    
def addToLog(desc):
    log = []
    ipAddress = True
    if(ipAddress):
        log['ip_address'] = ipAddress
        log['description'] = desc
        log['fid_user'] = 'Yoga Setiaonce'
    return True

def time_ago(datetime_obj, full=False):
    # Pastikan datetime_obj NAIVE dengan membuang tzinfo-nya
    if datetime_obj.tzinfo is not None:
        datetime_obj = datetime_obj.replace(tzinfo=None)

    # now() di sini akan mereturn naive local time karena USE_TZ=False
    current_time = now()
    if current_time.tzinfo is not None:
         current_time = current_time.replace(tzinfo=None)

    time_difference = current_time - datetime_obj
    seconds = time_difference.total_seconds()

    # Konversi waktu ke unit lainnya
    minutes = round(seconds / 60)
    hours = round(seconds / 3600)
    days = round(seconds / 86400)
    weeks = round(seconds / 604800)
    months = round(seconds / 2629440)
    years = round(seconds / 31553280)

    if seconds <= 60:
        return "Baru Saja"
    elif minutes <= 60:
        return f"{minutes} Menit yang lalu" if minutes > 1 else "1 Menit yang lalu"
    elif hours <= 24:
        return f"{hours} Jam yang lalu" if hours > 1 else "1 Jam yang lalu"
    elif days <= 7:
        return f"{days} Hari yang lalu" if days > 1 else "Kemarin"
    elif weeks <= 4.3:
        return f"{weeks} Minggu yang lalu" if weeks > 1 else "1 Minggu yang lalu"
    elif months <= 12:
        return f"{months} Bulan yang lalu" if months > 1 else "1 Bulan yang lalu"
    else:
        return f"{years} Tahun yang lalu" if years > 1 else "1 Tahun yang lalu"

def generate_encryption_filename(name_input, file_origin_name, file_extension):
    slugified_name = slugify(name_input)
    file_name_without_extension = Path(file_origin_name).stem
    hashed_name = bcrypt.hashpw(file_name_without_extension.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_file_name = f"{slugified_name}{hashed_name}{int(time.time())}{file_extension}"
    return new_file_name

def generateIdTransaksi():
    timestamp = now().strftime("%Y%m%d%H%M%S")
    return f"{timestamp}"

def get_device_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_datetimenow(dt: datetime = None) -> datetime:
    from .common import get_site_info 
    site_info = get_site_info()
    
    if dt is None:
        # Gunakan utcnow() yang menghasilkan naive datetime secara natural
        dt = datetime.utcnow()

    # Hitung waktu lokal dengan manipulasi timedelta biasa
    # Ini menjaga hasil akhirnya tetap naive (tidak ada benturan USE_TZ=False)
    target_time = dt + timedelta(hours=site_info['timezone'])
    return target_time

def convert_timezone(dt, tz_value):
    if not dt:
        return None

    # Pastikan aware UTC untuk proses konversi
    if timezone_utils.is_naive(dt):
        dt = timezone_utils.make_aware(dt, dt_timezone.utc)

    tz = None

    # Coba sebagai nama timezone dulu (e.g. "Asia/Makassar")
    try:
        tz = pytz.timezone(str(tz_value))
    except pytz.exceptions.UnknownTimeZoneError:
        pass

    # Fallback: coba sebagai integer offset (e.g. "8")
    if tz is None:
        try:
            offset = int(tz_value)
            tz = pytz.FixedOffset(offset * 60)
        except (ValueError, TypeError):
            pass

    # Last resort fallback ke Asia/Makassar
    if tz is None:
        tz = pytz.timezone('Asia/Makassar')

    # Konversi ke lokal, LALU copot tzinfo-nya agar menjadi naive
    local_dt = timezone_utils.localtime(dt, tz)
    return local_dt.replace(tzinfo=None)

# def convert_timezone(dt, tz_value):
#     if not dt:
#         return None

#     # pastikan aware UTC
#     if timezone_utils.is_naive(dt):
#         dt = timezone_utils.make_aware(dt, dt_timezone.utc)

#     try:
#         offset = int(tz_value)  # misal "7"
#         tz = pytz.FixedOffset(offset * 60)
#     except Exception:
#         tz = pytz.UTC

#     return timezone_utils.localtime(dt, tz)

RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BOLD = "\033[1m"
def print_error_box(title, message, color=RED):
    border = "=" * 60
    print(f"{color}{BOLD}")
    print(border)
    print(f"{title.center(60)}")
    print("-" * 60)
    print(message)
    print(border)
    print(RESET)

def print_success_box(title, message):
    border = "=" * 60
    print("\033[92m")
    print(border)
    print(f"{title.center(60)}")
    print("-" * 60)
    print(message)
    print(border)
    print(RESET)

def is_rtsp_camera_active(rtsp_url, timeout=3):
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        cap.release()
        return False
    
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    success, _ = cap.read()
    cap.release()
    return success

def is_printer_connected(ip: str, port: int, timeout: float = 3.0) -> bool:
    try:
        with socket.create_connection((ip, int(port)), timeout=timeout):
            return True
    except (socket.timeout, socket.error):
        return False
    
def generate_kode_trx(kode_uppkb='TCI', bulan_tahun=None):
    prefix = 'T01'
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=11))

    today = now()
    first_day = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if today.month == 12:
        next_month = today.replace(year=today.year+1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month+1, day=1)

    last_number = DataPenimbangan.objects.filter(
        tgl_penimbangan__gte=first_day,
        tgl_penimbangan__lt=next_month
    ).count()
    nomor_urut = str(last_number + 1).zfill(5)
    kode_lokasi = f"{kode_uppkb}{nomor_urut}"

    # format bulan/tahun
    if not bulan_tahun:
        bulan_tahun_fmt = now().strftime('%m%y')
    else:
        try:
            parsed_date = datetime.strptime(bulan_tahun, '%Y-%m-%d')
            bulan_tahun_fmt = parsed_date.strftime('%m%y')
        except Exception:
            bulan_tahun_fmt = now().strftime('%m%y')

    return f"{prefix}{random_str}/{kode_lokasi}/{bulan_tahun_fmt}"

def generate_kode_trx_bodong(kode_uppkb='TCI', bulan_tahun=None):
    prefix = 'T01'
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=11))

    today = now()
    first_day = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if today.month == 12:
        next_month = today.replace(year=today.year+1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month+1, day=1)

    last_number = KendaraanBodong.objects.filter(
        tgl_penimbangan__gte=first_day,
        tgl_penimbangan__lt=next_month
    ).count()
    nomor_urut = str(last_number + 1).zfill(5)
    kode_lokasi = f"{kode_uppkb}{nomor_urut}"

    # format bulan/tahun
    if not bulan_tahun:
        bulan_tahun_fmt = now().strftime('%m%y')
    else:
        try:
            parsed_date = datetime.strptime(bulan_tahun, '%Y-%m-%d')
            bulan_tahun_fmt = parsed_date.strftime('%m%y')
        except Exception:
            bulan_tahun_fmt = now().strftime('%m%y')

    return f"{prefix}{random_str}/{kode_lokasi}/{bulan_tahun_fmt}"

def generate_kode_penindakan(kode_uppkb='TCI', bulan_tahun=None):
    prefix = 'T02'
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=11))

    today = now()
    first_day = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if today.month == 12:
        next_month = today.replace(year=today.year+1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month+1, day=1)

    last_number = DataPenindakan.objects.filter(
        tgl_penindakan__gte=first_day,
        tgl_penindakan__lt=next_month
    ).count()
    nomor_urut = str(last_number + 1).zfill(5)
    kode_lokasi = f"{kode_uppkb}{nomor_urut}"

    # format bulan/tahun
    if not bulan_tahun:
        bulan_tahun_fmt = now().strftime('%m%y')
    else:
        try:
            parsed_date = datetime.strptime(bulan_tahun, '%Y-%m-%d')
            bulan_tahun_fmt = parsed_date.strftime('%m%y')
        except Exception:
            bulan_tahun_fmt = now().strftime('%m%y')

    return f"{prefix}{random_str}/{kode_lokasi}/{bulan_tahun_fmt}"

def format_hari_indonesia(tanggal):
    hari_id = ["SENIN","SELASA","RABU","KAMIS","JUM'AT","SABTU","MINGGU"]

    if isinstance(tanggal, (date, datetime)):
        return hari_id[tanggal.weekday()]

    dt = datetime.strptime(tanggal, "%Y-%m-%d")
    return hari_id[dt.weekday()]

def generate_nomor_formulir(kodeBidang="HUB.01"):
    today = now()

    # Awal & akhir hari (AMAN)
    day_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)

    # Awal & akhir bulan (AMAN)
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if today.month == 12:
        month_end = month_start.replace(year=today.year + 1, month=1)
    else:
        month_end = month_start.replace(month=today.month + 1)

    # Urutan harian
    count_today = DataPeringatan.objects.filter(
        tgl_peringatan__gte=day_start,
        tgl_peringatan__lt=day_end
    ).count()
    noUrut = str(count_today + 1).zfill(3)

    # Urutan bulanan
    count_month = DataPeringatan.objects.filter(
        tgl_peringatan__gte=month_start,
        tgl_peringatan__lt=month_end
    ).count()
    noForm = str(count_month + 1).zfill(3)

    return f"FORM-{noForm}/{noUrut}/SOP/{kodeBidang}/{today:%m}/{today:%Y}"

def generate_nomor_um(unit: str = "UPPKB SIMULASI"):
    today = now()

    first_day = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if today.month == 12:
        next_month = first_day.replace(year=today.year + 1, month=1)
    else:
        next_month = first_day.replace(month=today.month + 1)

    last_number = DataPeringatan.objects.filter(
        tgl_peringatan__gte=first_day,
        tgl_peringatan__lt=next_month
    ).count()

    bulan_romawi = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

    no_str = str(last_number + 1)
    kode_um = f'UM.{today.month:02d}'
    bulan = bulan_romawi[today.month]
    tahun = today.year

    return f"{no_str}/{kode_um}/{unit}/{bulan}/{tahun}"

AUDIO_DIR = "static/dist/audio"
def play_voice(file_name):
    file_path = os.path.join(AUDIO_DIR, file_name)
    audio = AudioSegment.from_file(file_path, format="mp3")
    play(audio)

def convertMp3():
    for file in os.listdir(AUDIO_DIR):
        if file.endswith(".mp3"):
            mp3_path = os.path.join(AUDIO_DIR, file)
            wav_path = mp3_path.replace(".mp3", ".wav")
            if not os.path.exists(wav_path):
                sound = AudioSegment.from_mp3(mp3_path)
                sound.export(wav_path, format="wav")

def play_combined_voices(file_names):
    combined = AudioSegment.empty()

    for i, file_name in enumerate(file_names):
        file_path = os.path.join(AUDIO_DIR, file_name)
        sound = AudioSegment.from_file(file_path.replace(".mp3", ".wav"), format="wav")

        if len(sound) > 150:
            sound = sound[:-150]
        combined += sound
    play(combined)

async def generate_voice(text, filename):
    os.makedirs(AUDIO_DIR, exist_ok=True)
    output_path = os.path.join(AUDIO_DIR, filename)

    if not os.path.exists(output_path):
        communicate = edge_tts.Communicate(text, "id-ID-GadisNeural")
        await communicate.save(output_path)
        print(f"✅ File disimpan: {output_path}")
    else:
        print(f"🎵 File sudah ada, tidak perlu generate ulang: {output_path}")
    return output_path