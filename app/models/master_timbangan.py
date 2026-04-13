from django.db import models

class MasterTimbangan(models.Model):
    id = models.AutoField(primary_key=True)
    nama = models.CharField(max_length=100)
    rs = models.CharField(max_length=50) 
    port = models.CharField(max_length=50)
    baudrate = models.IntegerField()
    parity = models.CharField(max_length=50, choices=[
        ('PARITY_NONE', 'PARITY_NONE'),
        ('PARITY_ODD', 'PARITY_ODD'),
        ('PARITY_EVEN', 'PARITY_EVEN'),
        ('PARITY_MARK', 'PARITY_MARK'),
        ('PARITY_SPACE', 'PARITY_SPACE'),
    ])
    stopbits = models.CharField(max_length=50, choices=[
        ('STOPBITS_ONE', 'STOPBITS_ONE'),
        ('STOPBITS_ONE_POINT_FIVE', 'STOPBITS_ONE_POINT_FIVE'),
        ('STOPBITS_TWO', 'STOPBITS_TWO'),
    ])
    bytesize = models.CharField(max_length=50, choices=[
        ('FIVEBITS', 'FIVEBITS'),
        ('SIXBITS', 'SIXBITS'),
        ('SEVENBITS', 'SEVENBITS'),
        ('EIGHTBITS', 'EIGHTBITS'),
    ])
    rtsp_camera_1 = models.CharField(max_length=255)
    rtsp_camera_2 = models.CharField(max_length=255)
    cam_depan_url = models.CharField(max_length=255)
    cam_belakang_url = models.CharField(max_length=255)
    cam_depan_username = models.CharField(max_length=255)
    cam_depan_password = models.CharField(max_length=255)
    cam_belakang_username = models.CharField(max_length=255)
    cam_belakang_password = models.CharField(max_length=255)
    cam_depan_ws = models.CharField(max_length=255)
    cam_belakang_ws = models.CharField(max_length=255)
    cam_lpr_ws = models.CharField(max_length=255)
    is_print_struk = models.CharField(max_length=1)
    ip_printer_penimbangan = models.CharField(max_length=30)
    port_printer_penimbangan = models.CharField(max_length=10)
    is_ip_access_timbang = models.CharField(max_length=1)
    ip_timbang_allowed = models.CharField(max_length=20)
    is_active = models.CharField(max_length=1)
    ws_alat = models.CharField(max_length=250)
    is_voice = models.CharField(max_length=1)
    is_lpr = models.CharField(max_length=1)
    is_auto_lpr = models.CharField(max_length=1)
    username_camera_lpr = models.CharField(max_length=250)
    password_camera_lpr = models.CharField(max_length=250)
    ip_camera_lpr = models.CharField(max_length=250)
    is_rfid = models.CharField(max_length=1)

    def __str__(self):
        return self.nama
    
    class Meta:
        managed = False
        db_table = 'jt_timbangan'