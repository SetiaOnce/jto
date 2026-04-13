from django.db import models

class SensorLpr(models.Model):
    id = models.AutoField(primary_key=True)
    plate_nomor = models.CharField(max_length=15)
    capture = models.CharField(max_length=255)
    datetime = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'data_plat_nomor'