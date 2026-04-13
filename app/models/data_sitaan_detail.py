import uuid
from django.db import models

class DataSitaanDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kode_penindakan = models.CharField(max_length=30, null=True, blank=True)
    kode_trx = models.CharField(max_length=30, null=True, blank=True)
    no_kendaraan = models.CharField(max_length=30, null=True, blank=True)
    sitaan_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    kode_uppkb = models.CharField(max_length=30, null=True, blank=True)
    lokasi_id = models.IntegerField(null=True, blank=True)
    tgl_penindakan = models.DateField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "jt_detail_penindakan_sitaan"
        verbose_name = "Detail Penindakan Sitaan"
        verbose_name_plural = "Detail Penindakan Sitaan"

    def __str__(self):
        return f"{self.kode_penindakan or ''} - {self.no_kendaraan or ''}"
