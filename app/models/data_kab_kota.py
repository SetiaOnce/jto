from django.db import models

class DataKotaKab(models.Model):
    id = models.AutoField(primary_key=True)
    provinsi = models.ForeignKey('DataProvinsi', on_delete=models.SET_NULL, null=True, blank=True)
    kode = models.CharField(max_length=30, null=True, blank=True)
    nama = models.CharField(max_length=255, null=True, blank=True)
    lat_pos = models.CharField(max_length=30, null=True, blank=True)
    lon_pos = models.CharField(max_length=30, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_kota_kab'