from django.db import models

class DataBptd(models.Model):
    id = models.IntegerField(primary_key=True)
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
    alamat = models.CharField(max_length=255, null=True, blank=True)
    lat_pos = models.CharField(max_length=30, null=True, blank=True)
    lon_pos = models.CharField(max_length=30, null=True, blank=True)

    class Meta:
        db_table = 'jt_bptd'