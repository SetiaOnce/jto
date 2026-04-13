from django.db import models

class Pasal(models.Model):
    no_pasal = models.IntegerField(null=True, blank=True)
    pasal = models.TextField(null=True, blank=True)
    desk_pasal = models.TextField(null=True, blank=True)
    denda_maks = models.FloatField(default=0)
    keterangan = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    etilang_id = models.CharField(max_length=255, null=True, blank=True)
    etilang_section = models.CharField(max_length=255, null=True, blank=True)
    etilang_article = models.CharField(max_length=255, null=True, blank=True)
    etilang_year = models.CharField(max_length=30, null=True, blank=True)
    etilang_detention = models.CharField(max_length=255, null=True, blank=True)
    etilang_fine = models.CharField(max_length=255, null=True, blank=True)

    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    class Meta:
        db_table = 'jt_pasal'
        verbose_name = 'Pasal'
        verbose_name_plural = 'Daftar Pasal'

    def __str__(self):
        return f"Pasal {self.no_pasal} - {self.pasal[:50]}..."
