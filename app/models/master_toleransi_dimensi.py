from django.db import models

class MasterToleransiDimensi(models.Model):
    kode_uppkb = models.CharField(max_length=50, null=True, blank=True)

    prosen_pjg = models.IntegerField()
    prosen_lebar = models.IntegerField()
    prosen_tinggi = models.IntegerField()
    prosen_foh = models.IntegerField()
    prosen_roh = models.IntegerField()

    keterangan = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Toleransi Dimensi {self.kode_uppkb}"

    class Meta:
        managed = False
        db_table = 'jt_toleransi_dimensi'