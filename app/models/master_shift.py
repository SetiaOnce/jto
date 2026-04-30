from django.db import models

class MasterShift(models.Model):
    id = models.AutoField(primary_key=True)
    kode = models.CharField(max_length=100) 
    nama = models.CharField(max_length=100) 
    jam_mulai = models.CharField(max_length=100) 
    jam_selesai = models.CharField(max_length=100) 
    is_active = models.CharField(max_length=1) 

    def __str__(self):
        return self.nama
    
    class Meta:
        managed = False
        db_table = 'jt_shift'