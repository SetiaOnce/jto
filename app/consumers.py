import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'penimbangan.settings')
import asyncio, json, re, serial
from channels.generic.websocket import AsyncWebsocketConsumer
from serial.serialutil import SerialException
from controller.utils import print_error_box, print_success_box
import django

django.setup()
from app.models import KonfigurasiAlat

class SerialConsumer(AsyncWebsocketConsumer):
    pass
    # async def connect(self):
    #     await self.accept()
    #     self.keep_reading = True
    #     asyncio.create_task(self.read_serial())

    # async def disconnect(self, close_code):
    #     self.keep_reading = False

    # async def read_serial(self):
    #     try:
    #         config = KonfigurasiAlat.objects.get(id=1)
    #         ser = serial.Serial(
    #             port=config.port,
    #             baudrate=config.baudrate,
    #             parity=getattr(serial, config.parity),
    #             stopbits=getattr(serial, config.stopbits),
    #             bytesize=getattr(serial, config.bytesize),
    #             timeout=1
    #         )
    #         print_success_box("KONEKSI SERIAL BERHASIL", f"Terhubung ke port {config.port} dengan baudrate {config.baudrate}")

    #         while self.keep_reading:
    #             if ser.in_waiting > 0:
    #                 raw = ser.read(ser.in_waiting)[7:14].decode('utf-8', errors='ignore').replace('.', '')
    #                 raw = re.sub(r'\D', '', raw)

    #                 if raw.isnumeric() and len(raw) >= 6:
    #                     berat = int(raw)
    #                     await self.send(text_data=json.dumps({
    #                         "berat_timbang": berat
    #                     }))
    #             await asyncio.sleep(0.1)

    #         ser.close()

    #     except SerialException as e:
    #         print_error_box("GAGAL MEMBUKA PORT SERIAL", str(e), color='\033[91m')
    #     except PermissionError as e:
    #         print_error_box("PERMISSION ERROR", f"{str(e)}\nPORT SEDANG DIGUNAKAN OLEH APLIKASI LAIN?", color='\033[93m')
    #     except Exception as e:
    #         print_error_box("KESALAHAN TIDAK DIKETAHUI", str(e))
