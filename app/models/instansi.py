from django.db import models

class Instansi(models.Model):
    id = models.AutoField(primary_key=True)
    jt_id = models.IntegerField()
    client_id = models.CharField(max_length=255)
    url_portal = models.CharField(max_length=255)
    nama_jt = models.CharField(max_length=100)
    alamat_jt = models.TextField()
    nama_kupt = models.CharField(max_length=40)
    pangkat = models.CharField(max_length=40)
    nip = models.CharField(max_length=20)
    toleransi_berat = models.IntegerField()
    toleransi_panjang = models.IntegerField()
    toleransi_tinggi = models.IntegerField()
    toleransi_lebar = models.IntegerField()

    def __str__(self):
        return self.nama_jt
    
    class Meta:
        managed = False
        db_table = 'penimbangan_instansi'