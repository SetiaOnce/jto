import uuid
from django.db import models

class DataPenindakan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shift_id = models.IntegerField(null=True, blank=True)
    regu_id = models.IntegerField(null=True, blank=True)
    petugas_id = models.IntegerField(null=True, blank=True)
    kode_trx = models.CharField(max_length=30, null=True, blank=True)
    kode_penindakan = models.CharField(max_length=30, null=True, blank=True)
    ppns_id = models.IntegerField(null=True, blank=True)
    nama_ppns = models.CharField(max_length=100, null=True, blank=True)
    no_skep = models.CharField(max_length=30, null=True, blank=True)
    nip_ppns = models.CharField(max_length=30, null=True, blank=True)
    pangkat_ppns = models.CharField(max_length=255, null=True, blank=True)
    ham_nomor = models.CharField(max_length=255, null=True, blank=True)
    tgl_sidang = models.DateField(null=True, blank=True)
    jam_sidang = models.CharField(max_length=30, null=True, blank=True)
    pengadilan_id = models.IntegerField(null=True, blank=True)
    gol_sim_id = models.IntegerField(null=True, blank=True)
    no_sim = models.CharField(max_length=60, null=True, blank=True)
    nama_pengemudi = models.CharField(max_length=255, null=True, blank=True)
    alamat_pengemudi = models.CharField(max_length=255, null=True, blank=True)
    umur_pengemudi = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.IntegerField(null=True, blank=True)
    updated_by = models.IntegerField(null=True, blank=True)
    deleted_by = models.IntegerField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    no_kendaraan = models.CharField(max_length=30, null=True, blank=True)
    kode_uppkb = models.CharField(max_length=30, null=True, blank=True)
    lokasi_id = models.IntegerField(null=True, blank=True)
    tgl_penindakan = models.DateTimeField(auto_now_add=True)

    asal_kota_id = models.IntegerField(null=True, blank=True)
    tujuan_kota_id = models.IntegerField(null=True, blank=True)

    is_tilang = models.BooleanField(default=False)
    is_transfer_muat = models.BooleanField(default=False)
    is_over_dimensi = models.BooleanField(default=False)

    no_ba_tilang = models.CharField(max_length=30, null=True, blank=True)
    no_ba_transfer = models.CharField(max_length=30, null=True, blank=True)
    no_ba_over_dim = models.CharField(max_length=30, null=True, blank=True)

    sanksi_id = models.IntegerField(null=True, blank=True)
    kode_briva = models.CharField(max_length=60, null=True, blank=True)
    status_penindakan = models.IntegerField(default=0)
    bptd_id = models.IntegerField(null=True, blank=True)

    no_telp_pengemudi = models.CharField(max_length=30, null=True, blank=True)
    kejaksaan_id = models.IntegerField(null=True, blank=True)
    kejaksaan_kode = models.CharField(max_length=30, null=True, blank=True)

    jenis_kelamin = models.CharField(max_length=100, null=True, blank=True)
    warna_kendaraan = models.CharField(max_length=100, null=True, blank=True)
    etilang_ticket_id = models.CharField(max_length=255, null=True, blank=True)
    pengadilan_kode = models.CharField(max_length=30, null=True, blank=True)

    sync_to_pusat = models.BooleanField(default=False)
    sync_from_pusat = models.BooleanField(default=False)

    keterangan_tindakan = models.CharField(max_length=255, null=True, blank=True)
    kategori_jenis_kendaraan = models.CharField(max_length=255, null=True, blank=True)
    kategori_jenis_kendaraan_id = models.IntegerField(null=True, blank=True)

    pasal = models.CharField(max_length=100, null=True, blank=True)
    sanksi_tambahan = models.CharField(max_length=100, null=True, blank=True)
    sitaan = models.CharField(max_length=100, null=True, blank=True)
    is_send_to_pusat = models.CharField(max_length=1, default='N')
    is_send_to_balai = models.CharField(max_length=1, default='N')
    class Meta:
        db_table = 'jt_penindakan'
        verbose_name = 'Penindakan'
        verbose_name_plural = 'Daftar Penindakan'

    def __str__(self):
        return f"{self.kode_trx} - {self.no_kendaraan}"
