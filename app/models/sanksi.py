from django.db import models

class Sanksi(models.Model):
    kode = models.CharField(max_length=30, null=True, blank=True)
    nama = models.CharField(max_length=255, null=True, blank=True)
    deskripsi = models.CharField(max_length=255, null=True, blank=True)
    keterangan = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_sanksi'
        verbose_name = 'Sanksi'
        verbose_name_plural = 'Daftar Sanksi'

    def __str__(self):
        return f"{self.kode} - {self.nama}"
