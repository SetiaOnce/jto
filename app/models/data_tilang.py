from django.db import models

class DataTilang(models.Model):
    id = models.AutoField(primary_key=True)
    pelanggaran_id = models.IntegerField()
    id_transaksi = models.CharField(max_length=20)
    no_tilang = models.CharField(max_length=50)
    tgl_sidang = models.DateField()
    nama_ppns = models.CharField(max_length=120, null=True, blank=True)
    nip_ppns = models.CharField(max_length=30, null=True, blank=True)
    lokasi_sidang = models.CharField(max_length=250, null=True, blank=True)
    catatan = models.CharField(max_length=200, null=True, blank=True)
    sts_data = models.IntegerField()
    created_at = models.DateTimeField()

    def __str__(self):
        return self.noken
    
    class Meta:
        managed = False
        db_table = 'penimbangan_data_tilang'