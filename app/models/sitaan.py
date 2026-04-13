from django.db import models

class Sitaan(models.Model):
    sanksi = models.ForeignKey(
        'Sanksi',
        on_delete=models.CASCADE,
        db_column='sanksi_id',
        related_name='sitaan'
    )
    dokumen = models.ForeignKey(
        'Dokumen',
        on_delete=models.CASCADE,
        db_column='dokumen_id',
        related_name='sitaan'
    )
    keterangan = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_sitaan'
        verbose_name = 'Sitaan'
        verbose_name_plural = 'Daftar Sitaan'

    def __str__(self):
        return f"{self.keterangan} (Sanksi: {self.sanksi.kode}, Dokumen: {self.dokumen.kode})"
