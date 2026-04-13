from django.db import models

class DataPelanggaran(models.Model):
    kode_trx = models.CharField(max_length=30, blank=True, null=True)
    kode_uppkb = models.CharField(max_length=30, blank=True, null=True)
    jenis_pelanggaran = models.ForeignKey('MasterJenisPelanggaran', to_field='id', db_column='jenis_pelanggaran_id', on_delete=models.SET_NULL, blank=True, null=True)
    kode_pelanggaran = models.CharField(max_length=30, blank=True, null=True)
    deskripsi = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)
    deleted_by = models.IntegerField(blank=True, null=True)
    is_active = models.CharField(max_length=1, default='N')
    is_deleted = models.CharField(max_length=1, default='N')
    no_kendaraan = models.CharField(max_length=30, blank=True, null=True)
    tgl_penimbangan = models.DateField(blank=True, null=True)
    is_send_to_pusat = models.CharField(max_length=1, default='N')
    is_send_to_balai = models.CharField(max_length=1, default='N')
    
    class Meta:
        db_table = 'jt_pelanggaran'