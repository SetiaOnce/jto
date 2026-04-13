from django.db import models

class Dokumen(models.Model):
    kode = models.CharField(max_length=10, null=True, blank=True)
    nama = models.CharField(max_length=255, null=True, blank=True)
    is_optional = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)

    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_by = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'jt_dokumen'
        verbose_name = 'Dokumen'
        verbose_name_plural = 'Daftar Dokumen'

    def __str__(self):
        return f"{self.kode} - {self.nama}"
