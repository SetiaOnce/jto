from django.db import models

class MasterJenisKendaraan(models.Model):
    kode = models.CharField(max_length=30)
    nama = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_jenis_kendaraan'
        verbose_name = 'Jenis Kendaraan'
        verbose_name_plural = 'Jenis Kendaraan'

    def __str__(self):
        return self.nama