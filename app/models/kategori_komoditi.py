from django.db import models

class KategoriKomoditi(models.Model):
    kode = models.CharField(max_length=30)
    nama = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'jt_kategori_komoditi'
        verbose_name = 'Kategori Komoditi'
        verbose_name_plural = 'Kategori Komoditi'

    def __str__(self):
        return f"{self.kode} - {self.nama}"