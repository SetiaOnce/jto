from django.db import models

class Pengadilan(models.Model):
    lokasi_id = models.IntegerField(null=True, blank=True)
    kode_uppkb = models.CharField(max_length=30, null=True, blank=True)
    kode = models.CharField(max_length=30, null=True, blank=True)
    nama = models.CharField(max_length=255, null=True, blank=True)
    alamat = models.CharField(max_length=255, null=True, blank=True)
    lat_pos = models.CharField(max_length=30, null=True, blank=True)
    lon_pos = models.CharField(max_length=30, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    kota = models.ForeignKey('DataKotaKab', to_field='id', db_column='kota_kab_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    no_telp = models.CharField(max_length=30, null=True, blank=True)
    etilang_id = models.CharField(max_length=255, null=True, blank=True)

    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_pengadilan'
        verbose_name = 'Pengadilan'
        verbose_name_plural = 'Daftar Pengadilan'

    def __str__(self):
        return f"{self.nama} ({self.kode})"
