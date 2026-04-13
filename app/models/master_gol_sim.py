from django.db import models

class MasterGolSim(models.Model):
    kode = models.CharField(max_length=10)
    nama = models.CharField(max_length=255)
    keterangan = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'jt_gol_sim'
        verbose_name = 'Golongan SIM'
        verbose_name_plural = 'Golongan SIM'

    def __str__(self):
        return self.nama
