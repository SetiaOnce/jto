from django.db import models

class MasterKategoriKepemilikan(models.Model):
    kode = models.CharField(max_length=30)
    nama = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'jt_kategori_kepemilikan'
        verbose_name = 'Kategori Kepemilikan'
        verbose_name_plural = 'Kategori Kepemilikan'

    def __str__(self):
        return self.nama
