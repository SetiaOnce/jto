from django.db import models
import uuid

class KomoditiAsalTujuanPengemudi(models.Model):
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    no_kendaraan = models.CharField(max_length=20)
    komoditi_id = models.IntegerField()
    kategori_komoditi_id = models.IntegerField()
    asal_kota_id = models.IntegerField()
    tujuan_kota_id = models.IntegerField()
    no_surat_jalan = models.CharField(max_length=255, default='0')
    pemilik_komoditi = models.CharField(max_length=255, default='-')
    alamat_pemilik_komoditi = models.CharField(max_length=255)
    nama_pengemudi = models.CharField(max_length=255, default='-')
    alamat_pengemudi = models.CharField(max_length=255, default='-')
    jenis_kelamin = models.CharField(max_length=255, default='LAKI-LAKI')
    umur_pengemudi = models.CharField(max_length=255, default='0')
    no_telepon = models.CharField(max_length=255, default='0')
    warna_kendaraan = models.CharField(max_length=255, default='-')
    gol_sim_id = models.IntegerField(default=0)
    no_sim = models.CharField(max_length=255, default='0')

    class Meta:
        db_table = 'jt_komoditi_asaltujuan_pengemudi'
        verbose_name = 'Komoditi Asal Tujuan Pengemudi'
        verbose_name_plural = 'Komoditi Asal Tujuan Pengemudi'

    def __str__(self):
        return f"{self.no_kendaraan} - {self.nama_pengemudi}"