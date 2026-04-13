import requests
from app.models import DataLokasiUppkbPusat
from django.db import transaction

def sync_data_lokasi_uppkb():
    url = "https://jto.kemenhub.go.id/api/v2/v2pv/lokasi/publish/active"
    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzUyNjMyODI4LCJleHAiOjE3ODQxNjg4Mjh9.SaXuXhSbcFDWES1ere05k1VPbXJ-wo7RDCPXfelt_lM",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        json_data = response.json()

        if json_data.get("success"):
            uppkb_list = json_data.get("data", [])
            updated, created = 0, 0

            with transaction.atomic():
                for uppkb in uppkb_list:
                    obj, created_flag = DataLokasiUppkbPusat.objects.update_or_create(
                        id=uppkb.get("id"),
                        defaults={
                            "kota_kab_id": uppkb.get("kota_kab_id"),
                            "bptd_id": uppkb.get("bptd_id"),
                            "kode": uppkb.get("kode"),
                            "gen_kode": uppkb.get("gen_kode"),
                            "nama": uppkb.get("nama"),
                            "alamat_uppkb": uppkb.get("alamat_uppkb"),
                            "lat_pos": uppkb.get("lat_pos"),
                            "lon_pos": uppkb.get("lon_pos"),
                            "tahun_diresmikan": uppkb.get("tahun_diresmikan"),
                            "luas_lahan": uppkb.get("luas_lahan"),
                            "kapasitas_timbangan": uppkb.get("kapasitas_timbangan"),
                            "jml_sdm": uppkb.get("jml_sdm"),
                            "jml_pns": uppkb.get("jml_pns"),
                            "jml_ppns": uppkb.get("jml_ppns"),
                            "jml_ppnpn": uppkb.get("jml_ppnpn"),
                            "tahun_jto": uppkb.get("tahun_jto"),
                            "status_operasi": uppkb.get("status_operasi"),
                            "created_by": uppkb.get("created_by"),
                            "updated_by": uppkb.get("updated_by"),
                            "deleted_by": uppkb.get("deleted_by"),
                            "is_active": uppkb.get("is_active", True),
                            "is_deleted": uppkb.get("is_deleted", False),
                            "versi_lhr": uppkb.get("versi_lhr"),
                            "is_lhr": uppkb.get("is_lhr", False),
                            "is_wim": uppkb.get("is_wim", False),
                            "is_integrasi_etilang": uppkb.get("is_integrasi_etilang", False),
                            "created_at": uppkb.get("created_at"),
                            "updated_at": uppkb.get("updated_at"),
                            "deleted_at": uppkb.get("deleted_at"),
                        }
                    )
                    if created_flag:
                        created += 1
                    else:
                        updated += 1

            print(f"✅ Sinkronisasi selesai. Dibuat: {created}, Diperbarui: {updated}")
        else:
            print("⚠️ Response success=False dari server.")

    except requests.exceptions.RequestException as e:
        print(f"❌ Error saat request: {e}")