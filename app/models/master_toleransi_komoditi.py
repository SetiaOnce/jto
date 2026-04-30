from django.db import models

class MasterToleransiKomoditi(models.Model):
    kategori_komoditi_id = models.IntegerField()
    prosen_toleransi = models.IntegerField()
    tgl_mulai = models.DateField()
    tgl_selesai = models.DateField(null=True, blank=True)
    durasi = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Toleransi {self.prosen_toleransi}%"

    class Meta:
        managed = False
        db_table = 'jt_toleransi_komoditi'