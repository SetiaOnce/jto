from django.db import models

class LokasiUppkb(models.Model):
    id = models.AutoField(primary_key=True)
    id_update = models.IntegerField(null=True, blank=True)
    kota_kab = models.ForeignKey('DataKotaKab', on_delete=models.SET_NULL, null=True, blank=True)
    kode = models.CharField(max_length=30, null=True, blank=True)
    nama = models.CharField(max_length=255, null=True, blank=True)
    lat_pos = models.CharField(max_length=30, null=True, blank=True)
    lon_pos = models.CharField(max_length=30, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)
    gen_kode = models.CharField(max_length=30, null=True, blank=True)
    alamat_uppkb = models.CharField(max_length=255, null=True, blank=True)
    is_operasi = models.BooleanField(default=False)
    bptd = models.ForeignKey('DataBptd', on_delete=models.SET_NULL, null=True, blank=True)
    is_sinkron = models.BooleanField(default=False)
    url_api_sinkron = models.CharField(max_length=255, null=True, blank=True)
    tahun_diresmikan = models.IntegerField(null=True, blank=True)
    luas_lahan = models.CharField(max_length=255, null=True, blank=True)
    kapasitas_timbangan = models.CharField(max_length=255, null=True, blank=True)
    jml_sdm = models.IntegerField(null=True, blank=True)
    jml_pns = models.IntegerField(null=True, blank=True)
    jml_ppns = models.IntegerField(null=True, blank=True)
    jml_ppnpn = models.IntegerField(null=True, blank=True)
    tahun_jto = models.IntegerField(null=True, blank=True)
    status_operasi = models.IntegerField(
        null=True,
        blank=True,
        help_text="1=beroperasi, 2=tidak beroperasi, 3=perbaikan"
    )
    korsatpel_id = models.IntegerField(null=True, blank=True)
    nama_korsatpel = models.CharField(max_length=150, null=True, blank=True)
    pangkat = models.CharField(max_length=250, null=True, blank=True)
    nip = models.CharField(max_length=250, null=True, blank=True)
    jt_id_portal = models.IntegerField(null=True, blank=True)
    client_id_portal = models.CharField(max_length=250, null=True, blank=True)
    url_portal = models.CharField(max_length=250, null=True, blank=True)
    toleransi_berat = models.IntegerField(null=True, blank=True)
    toleransi_panjang = models.IntegerField(null=True, blank=True)
    toleransi_lebar = models.IntegerField(null=True, blank=True)
    toleransi_tinggi = models.IntegerField(null=True, blank=True)
    kode_api_pusat = models.CharField(max_length=255, null=True, blank=True)
    url_api_pusat = models.CharField(max_length=255, null=True, blank=True)
    email_api_pusat = models.CharField(max_length=255, null=True, blank=True)
    password_api_pusat = models.CharField(max_length=255, null=True, blank=True)
    access_token_api_pusat = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'jt_lokasi_uppkb'