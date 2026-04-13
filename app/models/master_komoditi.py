from django.db import models

class MasterKomoditi(models.Model):
    kategori_komoditi = models.ForeignKey(
        'KategoriKomoditi',
        on_delete=models.SET_NULL,
        null=True,
        db_column='kategori_komoditi_id'
    )
    kode = models.CharField(max_length=30, blank=True, null=True)
    nama = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.IntegerField(blank=True, null=True)
    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_komoditi'