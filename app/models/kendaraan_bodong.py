from django.db import models
import uuid

class KendaraanBodong(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kode_trx = models.CharField(max_length=30)
    timbangan_id = models.IntegerField(null=True, blank=True)
    regu_id = models.IntegerField(null=True, blank=True)
    shift_id = models.IntegerField(null=True, blank=True)
    petugas_id = models.IntegerField(null=True, blank=True)
    no_kendaraan = models.CharField(max_length=30, null=True, blank=True)
    
    berat_timbang = models.FloatField(default=0)
    panjang_ukur = models.FloatField(default=0)
    lebar_ukur = models.FloatField(default=0)
    tinggi_ukur = models.FloatField(default=0)
    
    komoditi_id = models.IntegerField(null=True, blank=True)
    kategori_komoditi_id = models.IntegerField(null=True, blank=True)
    komoditi = models.CharField(max_length=255, null=True, blank=True)

    asal_kode_kota = models.CharField(max_length=30, null=True, blank=True)
    asal_kota_id = models.IntegerField(null=True, blank=True)
    asal_kota = models.CharField(max_length=255, null=True, blank=True)

    tujuan_kode_kota = models.CharField(max_length=30, null=True, blank=True)
    tujuan_kota_id = models.IntegerField(null=True, blank=True)
    tujuan_kota = models.CharField(max_length=255, null=True, blank=True)

    tgl_penimbangan = models.DateTimeField(auto_now_add=True)

    foto_depan = models.CharField(max_length=255, null=True, blank=True)
    foto_depan_url = models.CharField(max_length=255, null=True, blank=True)
    foto_belakang = models.CharField(max_length=255, null=True, blank=True)
    foto_belakang_url = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jt_kendaraan_bodong'
        verbose_name = 'Kendaraan Bodong'
        verbose_name_plural = 'Daftar Kendaraan Bodong'

    def __str__(self):
        return f"{self.id} - {self.kode_trx}"
