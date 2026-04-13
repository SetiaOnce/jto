from django.db import models

class MasterSumbu(models.Model):
    konfig_sumbu = models.CharField(max_length=30, null=True, blank=True)
    jml_sumbu = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    
    is_deleted = models.BooleanField(default=False)
    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_sumbu'
        verbose_name = 'Konfigurasi Sumbu'
        verbose_name_plural = 'Konfigurasi Sumbu'

    def __str__(self):
        return f"{self.konfig_sumbu} - {self.jml_sumbu} sumbu"
