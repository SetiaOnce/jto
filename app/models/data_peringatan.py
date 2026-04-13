import uuid
from django.db import models

class DataPeringatan(models.Model):
    no_kendaraan = models.CharField(max_length=50, null=True, blank=True)
    tgl_peringatan = models.DateTimeField(auto_now_add=True)
    kode_penindakan = models.CharField(max_length=30, null=True, blank=True)
    nomor_formulir = models.CharField(max_length=255, null=True, blank=True)
    nomor = models.CharField(max_length=255, null=True, blank=True)
    tgl_disahkan = models.CharField(max_length=50, null=True, blank=True)
    tgl_diberlakukan = models.CharField(max_length=50, null=True, blank=True)
    tgl_revisi = models.CharField(max_length=50, null=True, blank=True)
    is_protection = models.CharField(max_length=1, default='Y')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jt_peringatan'
        verbose_name = 'Peringatan'
        verbose_name_plural = 'Daftar Peringatan'

    def __str__(self):
        return f"{self.nomor_formulir} - {self.no_kendaraan}"
