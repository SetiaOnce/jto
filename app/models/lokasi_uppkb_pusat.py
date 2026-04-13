from django.db import models

class DataLokasiUppkbPusat(models.Model):
    id = models.IntegerField(primary_key=True)
    kab_kota = models.ForeignKey('DataKotaKab', to_field='id', db_column='kota_kab_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    bptd = models.ForeignKey('DataBptd', to_field='id', db_column='bptd_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    kode = models.CharField(max_length=30)
    gen_kode = models.CharField(max_length=50)
    nama = models.CharField(max_length=255)
    alamat_uppkb = models.CharField(max_length=255)
    lat_pos = models.CharField(max_length=30)
    lon_pos = models.CharField(max_length=30)
    tahun_diresmikan = models.IntegerField(null=True, blank=True)
    luas_lahan = models.CharField(max_length=100, null=True, blank=True)
    kapasitas_timbangan = models.CharField(max_length=100, null=True, blank=True)
    jml_sdm = models.IntegerField(null=True, blank=True)
    jml_pns = models.IntegerField(null=True, blank=True)
    jml_ppns = models.IntegerField(null=True, blank=True)
    jml_ppnpn = models.IntegerField(null=True, blank=True)
    tahun_jto = models.IntegerField(null=True, blank=True)
    status_operasi = models.IntegerField(null=True, blank=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    versi_lhr = models.CharField(max_length=10, null=True, blank=True)
    is_lhr = models.BooleanField(default=False)
    is_wim = models.BooleanField(default=False)
    is_integrasi_etilang = models.BooleanField(default=False)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'jt_lokasi_uppkb_pusat'