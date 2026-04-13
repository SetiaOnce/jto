from django.db import models

class SubSanksi(models.Model):
    sanksi = models.ForeignKey(
        'Sanksi',
        on_delete=models.CASCADE,
        db_column='sanksi_id',
        related_name='sub_sanksi'
    )
    kode = models.CharField(max_length=30, null=True, blank=True)
    nama = models.CharField(max_length=255, null=True, blank=True)
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
        db_table = 'jt_sub_sanksi'
        verbose_name = 'Sub Sanksi'
        verbose_name_plural = 'Daftar Sub Sanksi'

    def __str__(self):
        return f"{self.kode} - {self.nama}"
