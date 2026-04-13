from django.db import models

class KonfigurasiAlat(models.Model):
    id = models.AutoField(primary_key=True)
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
    ip_printer_penimbangan = models.CharField(max_length=30)
    port_printer_penimbangan = models.CharField(max_length=10)
    is_ip_access_timbang = models.CharField(max_length=1)
    ip_timbang_allowed = models.CharField(max_length=20)

    def __str__(self):
        return self.indikator
    
    class Meta:
        managed = False
        db_table = 'penimbangan_konfigurasi_alat'