from django.db import models

class AksesMenu(models.Model):
    id = models.AutoField(primary_key=True)
    nama = models.CharField(max_length=100) 
    icon = models.CharField(max_length=100) 
    url = models.CharField(max_length=100) 
    need_shift_regu_platform = models.CharField(max_length=1) 
    order = models.IntegerField() 
    is_mobile = models.CharField(max_length=1)
    is_active = models.CharField(max_length=1)
    akses_level = models.CharField(max_length=255)

    def __str__(self):
        return self.nama
    
    class Meta:
        managed = False
        db_table = 'jt_akses_menu'