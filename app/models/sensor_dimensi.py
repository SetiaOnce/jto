from django.db import models

class SensorDimensi(models.Model):
    timbangan_id = models.CharField(max_length=11, blank=True, null=True)
    panjang = models.CharField(max_length=11, blank=True, null=True)
    tinggi = models.CharField(max_length=11, blank=True, null=True)
    lebar = models.CharField(max_length=11, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'sensor_dimensi'
        db_table_comment = 'APP DIMENSI'