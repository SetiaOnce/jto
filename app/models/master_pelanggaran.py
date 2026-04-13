from django.db import models

class MasterPelanggaran(models.Model):
    id = models.AutoField(primary_key=True)
    tilang_id = models.IntegerField()
    nama_tilang = models.CharField(max_length=100)

    def __str__(self):
        return self.nama_tilang
    
    class Meta:
        managed = False
        db_table = 'penimbangan_master_pelanggaran'