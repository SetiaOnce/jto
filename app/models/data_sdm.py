from django.db import models

class DataSdm(models.Model):
    id = models.AutoField(primary_key=True)
    nip = models.CharField(max_length=20)
    name = models.CharField(max_length=120)
    email = models.CharField(max_length=150)
    pangkat = models.CharField(max_length=250)
    jabatan = models.CharField(max_length=250)
    no_skep = models.CharField(max_length=100)
    no_telepon = models.CharField(max_length=20)
    no_reg_penguji = models.CharField(max_length=100)
    # regu_id= models.IntegerField()
    # shift_id= models.IntegerField()
    regu = models.ForeignKey('MasterRegu', to_field='id', db_column='regu_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    shift = models.ForeignKey('MasterShift', to_field='id', db_column='shift_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    keterangan = models.CharField(max_length=250)
    address = models.CharField(max_length=250)
    foto = models.TextField()
    is_deleted = models.CharField(max_length=1, default='N')
    deleted_at = models.DateTimeField()
    deleted_by= models.IntegerField()
    is_active = models.CharField(max_length=1, default='Y')
    is_korsatpel = models.CharField(max_length=1, default='N')
    is_penguji = models.CharField(max_length=1, default='N')
    is_ppns = models.CharField(max_length=1, default='N')
    is_danru = models.CharField(max_length=1, default='N')
    ttd_ppns = models.TextField(null=True)
    ttd_korsatpel = models.TextField(null=True)
    ttd_danru = models.TextField(null=True)
    sync_to_pusat = models.CharField(max_length=1, default='N')
    sync_from_pusat = models.CharField(max_length=1, default='N')
    is_development = models.CharField(max_length=1, default='N')
    status = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'jt_data_sdm'