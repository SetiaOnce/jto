from django.db import models

class MasterKendaraan(models.Model):
    id = models.AutoField(primary_key=True)
    no_reg_kend = models.CharField(max_length=30, null=True, blank=True)
    no_uji = models.CharField(max_length=60, null=True, blank=True)
    nama_pemilik = models.CharField(max_length=255, null=True, blank=True)
    alamat_pemilik = models.CharField(max_length=255, null=True, blank=True)
    lokasi_uji = models.CharField(max_length=255, null=True, blank=True)
    tanggal_uji = models.DateField(null=True, blank=True)
    masa_berlaku_uji = models.DateField(null=True, blank=True)
    jenis_kend = models.CharField(max_length=255, null=True, blank=True)
    konfigurasi_sumbu = models.CharField(max_length=30, null=True, blank=True)
    berat_kosong = models.IntegerField(default=0)
    jbb = models.IntegerField(default=0)
    jbkb = models.IntegerField(default=0)
    jbi = models.IntegerField(default=0)
    jbki = models.IntegerField(default=0)
    panjang_utama = models.IntegerField(default=0)
    lebar_utama = models.IntegerField(default=0)
    tinggi_utama = models.IntegerField(default=0)
    julur_depan = models.IntegerField(default=0)
    julur_belakang = models.IntegerField(default=0)

    foto_depan = models.TextField(null=True, blank=True)
    foto_kanan = models.TextField(null=True, blank=True)
    foto_kiri = models.TextField(null=True, blank=True)
    foto_belakang = models.TextField(null=True, blank=True)

    nomor_rangka = models.CharField(max_length=100, null=True, blank=True)
    merek = models.CharField(max_length=100, null=True, blank=True)
    bahan_bakar = models.CharField(max_length=60, null=True, blank=True)
    daya_angkut_orang = models.CharField(max_length=30, default="1")
    daya_angkut_barang = models.CharField(max_length=30, default="0")
    kelas = models.CharField(max_length=30, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)

    is_masa_berlaku = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    foto_depan_url = models.CharField(max_length=255, null=True, blank=True)
    foto_belakang_url = models.CharField(max_length=255, null=True, blank=True)
    foto_kanan_url = models.CharField(max_length=255, null=True, blank=True)
    foto_kiri_url = models.CharField(max_length=255, null=True, blank=True)

    jenis_kendaraan_id = models.IntegerField(null=True, blank=True)
    sumbu_id = models.IntegerField(null=True, blank=True)
    blue_id = models.IntegerField(null=True, blank=True)

    no_srut = models.CharField(max_length=100, null=True, blank=True)
    tgl_srut = models.DateTimeField(null=True, blank=True)
    no_mesin = models.CharField(max_length=100, null=True, blank=True)
    tipe = models.CharField(max_length=100, null=True, blank=True)
    tahun_rakit = models.CharField(max_length=30, null=True, blank=True)
    isi_silinder = models.CharField(max_length=30, null=True, blank=True)
    daya_motor = models.CharField(max_length=30, null=True, blank=True)
    ukuran_ban = models.CharField(max_length=30, null=True, blank=True)

    keterangan_hasil_uji = models.CharField(max_length=255, null=True, blank=True)
    petugas_penguji = models.CharField(max_length=255, null=True, blank=True)
    nrp_petugas_penguji = models.CharField(max_length=255, null=True, blank=True)
    kepala_dinas = models.CharField(max_length=255, null=True, blank=True)
    pangkat_kepala_dinas = models.CharField(max_length=255, null=True, blank=True)
    nip_kepala_dinas = models.CharField(max_length=255, null=True, blank=True)
    unit_pelaksana_teknis = models.CharField(max_length=255, null=True, blank=True)
    direktur = models.CharField(max_length=255, null=True, blank=True)
    pangkat_direktur = models.CharField(max_length=255, null=True, blank=True)
    nip_direktur = models.CharField(max_length=255, null=True, blank=True)

    etl_date = models.DateTimeField(null=True, blank=True)

    jarak_sumbu_1_2 = models.CharField(max_length=30, default="0")
    jarak_sumbu_2_3 = models.CharField(max_length=30, default="0")
    jarak_sumbu_3_4 = models.CharField(max_length=30, default="0")

    dimensi_bak_tangki = models.CharField(max_length=30, null=True, blank=True)
    mst = models.FloatField(default=0)

    kepemilikan_id = models.IntegerField(null=True, blank=True)
    kepemilikan_val = models.CharField(max_length=255, null=True, blank=True)

    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)
    is_blue = models.SmallIntegerField(default=0, help_text="0=Tidak Ada Di Blue; 1=Blue Kemenhub; 2=Blue Pihak 3")

    rfid = models.CharField(max_length=255, null=True, blank=True)
    vcode = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "jt_kendaraan"
        verbose_name = "Kendaraan"
        verbose_name_plural = "Daftar Kendaraan"

    def __str__(self):
        return f"{self.no_reg_kend or ''} - {self.nama_pemilik or ''}"
