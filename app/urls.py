from django.contrib.auth.decorators import login_required
from decorator_include import decorator_include
from django.urls import path
from . import views
from django.shortcuts import redirect
from .controller import (
    common, 
    auth, 
    dashboard,
    data_sdm, 
    manage_site_info,
    pendataan_kendaraan,
    penimbangan_kendaraan, 
    penindakan_kendaraan,
    reports_pengawasan,
    reports_kelebihan,
    reports_send_data,
    users_access,
    setting_tools,
    mobile_dashboard,
    reports_penimbangan,
    reports_penindakan,
    reports_komoditi,
    reports_kendaraan_bodong
)

urlpatterns = [
    # path('', views.index, name='home'),
    path('', lambda request: redirect('auth')),
    path('contact', views.contact_form, name='contact_form'),
    
    # Login
    path('auth', auth.index, name='auth'),
    path('logout', auth.logout_request, name='logout'),

    path(
        '',
        decorator_include(
            login_required(login_url='auth'),
            [
                path('dashboard', dashboard.index, name='dashboard'),
                path('users_access', users_access.index, name='users_access'),
                path('setting_tools', setting_tools.index, name='setting_tools'),
                path('data_sdm', data_sdm.index, name='data_sdm'),
                path('manage_site_info', manage_site_info.index, name='manage_site_info'),
                path('pendataan', pendataan_kendaraan.index, name='pendataan_kendaraan'),
                path('penindakan', penindakan_kendaraan.index, name='penindakan_kendaraan'),
                path('penimbangan', penimbangan_kendaraan.index, name='penimbangan_kendaraan'),
                path('laporan_penimbangan', reports_penimbangan.index, name='laporan_penimbangan'),
                path('laporan_pengawasan', reports_pengawasan.index, name='laporan_pengawasan'),
                path('laporan_kelebihan', reports_kelebihan.index, name='laporan_kelebihan'),
                path('laporan_penindakan', reports_penindakan.index, name='laporan_penindakan'),
                path('laporan_komoditi', reports_komoditi.index, name='laporan_komoditi'),
                path('laporan_kendaraan_bodong', reports_kendaraan_bodong.index, name='laporan_kendaraan_bodong'),
                path('send_data', reports_send_data.index, name='send_data'),
                # path('stream_camera1', penimbangan_kendaraan.stream_camera_1, name='stream_camera_1'),
                # path('stream_camera2', penimbangan_kendaraan.stream_camera_2, name='stream_camera_2'),
                # path('stream_camera_lpr', penimbangan_kendaraan.stream_camera_lpr, name='stream_camera_lpr'),
                path('print_struk_penimbangan', penimbangan_kendaraan.print_struk, name='print_struk_penimbangan'),
                # path('print_surat_tilang', penindakan_kendaraan.print_surat_tilang, name='print_surat_tilang'),
                # MOBILE
                path('mobile', mobile_dashboard.index, name='mobile_dashboard'),
            ]
        ),
    ),

    # Auth
    path('api/auth/request', auth.request, name='auth_request'),
    # Dashboard
    path('api/dashboard/show', dashboard.show, name='show_dashboard'),
    # Common
    path('api/site_info', common.site_info, name='site_info'),
    path('api/load_akses_menu/', common.load_akses_menu, name='load_akses_menu'),
    # path('api/load_weight', common.load_weight, name='load_weight'),
    path('api/load_dimention', common.load_dimention, name='load_dimention'),
    path('api/load_lpr', common.load_lpr, name='load_lpr'),
    path('api/load_kab_kota', common.load_kab_kota, name='load_kab_kota'),
    path('api/load_komoditi', common.load_komoditi, name='load_komoditi'),
    path('api/load_sumbu', common.load_sumbu, name='load_sumbu'),
    path('api/load_level', common.load_level, name='load_level'),
    path('api/load_shift', common.load_shift, name='load_shift'),
    path('api/load_regu', common.load_regu, name='load_regu'),
    path('api/load_sdm', common.load_sdm, name='load_sdm'),
    path('api/load_gol_sim', common.load_gol_sim, name='load_gol_sim'),
    path('api/load_pasal', common.load_pasal, name='load_pasal'),
    path('api/load_sanksi', common.load_sanksi, name='load_sanksi'),
    path('api/load_sub_sanski', common.load_sub_sanski, name='load_sub_sanski'),
    path('api/load_sitaan', common.load_sitaan, name='load_sitaan'),
    path('api/load_timbangan', common.load_timbangan, name='load_timbangan'),
    path('api/load_pengadilan', common.load_pengadilan, name='load_pengadilan'),
    path('api/load_kejaksaan', common.load_kejaksaan, name='load_pengadilan'),
    path('api/load_jenis_kendaraan', common.load_jenis_kendaraan, name='load_jenis_kendaraan'),
    path('api/load_jenis_kendaraan_tilang', common.load_jenis_kendaraan_tilang, name='load_jenis_kendaraan_tilang'),
    path('api/load_kepemilikan', common.load_kepemilikan, name='load_kepemilikan'),
    path('api/load_jenis_pelanggaran', common.load_jenis_pelanggaran, name='load_jenis_pelanggaran'),
    path('api/load_antrian_kendaraan', common.load_antrian_kendaraan, name='load_antrian_kendaraan'),
    # Site Info
    path('api/manage_siteinfo/show', manage_site_info.show, name='show_site_info'),
    path('api/manage_siteinfo/update', manage_site_info.update, name='update_site_info'),
    path('api/manage_siteinfo/store', manage_site_info.store, name='store_site_info'),
    # Users access
    path('api/users_access/show', users_access.show, name='show_users_show'),
    path('api/users_access/update', users_access.update, name='show_users_update'),
    path('api/users_access/store', users_access.store, name='show_users_store'),
    # Data SDM
    path('api/data_sdm/show', data_sdm.show, name='show_data_sdm'),
    path('api/data_sdm/sincrone', data_sdm.sincrone, name='sincrone_data_sdm'),
    path('api/data_sdm/update', data_sdm.update, name='show_data_sdm'),
    path('api/data_sdm/store', data_sdm.store, name='show_data_sdm'),
    # Setting Tools
    path('api/setting_tools/show', setting_tools.show, name='show_setting_tools'),
    path('api/setting_tools/update', setting_tools.update, name='update_setting_tools'),
    path('api/setting_tools/test_tool', setting_tools.test_setting_tools, name='test_setting_tools'),
    # Pendataan
    path('api/pendataan/show', pendataan_kendaraan.show, name='show_pendataan'),
    path('api/pendataan/store', pendataan_kendaraan.store, name='store_pendataan'),
    path('api/pendataan/delete', pendataan_kendaraan.delete, name='delete_pendataan'),
    # Penimbangan
    path('api/penimbangan/show', penimbangan_kendaraan.show, name='show_penimbangan'),
    path('api/penimbangan/store', penimbangan_kendaraan.store, name='store_penimbangan'),
    path('api/penimbangan/delete', penimbangan_kendaraan.delete, name='delete_penimbangan'),
    # path('api/suara/<int:berat>/', penimbangan_kendaraan.suara_berat, name='suara_berat_laporan_penimbangan'),
    # Penindakan
    path('api/penindakan/show', penindakan_kendaraan.show, name='show_penindakan'),
    path('api/penindakan/store', penindakan_kendaraan.store, name='store_penindakan'),
    path('api/penindakan/update', penindakan_kendaraan.update, name='update_penindakan'),
    # Laporan Penimbangan
    path('api/laporan_penimbangan/show', reports_penimbangan.show, name='show_laporan_penimbangan'),
    path('laporan_penimbangan/export', reports_penimbangan.export, name='export_laporan_penimbangan'),
    # Laporan Pengawasan
    path('api/laporan_pengawasan/show', reports_pengawasan.show, name='show_laporan_pengawasan'),
    path('laporan_pengawasan/export', reports_pengawasan.export, name='export_laporan_pengawasan'),
    # Laporan Pengawasan
    path('api/laporan_kelebihan/show', reports_kelebihan.show, name='show_laporan_kelebihan'),
    path('laporan_kelebihan/export', reports_kelebihan.export, name='export_laporan_kelebihan'),
    # Laporan Penindakan
    path('api/laporan_penindakan/show', reports_penindakan.show, name='show_laporan_penindakan'),
    path('laporan_penindakan/export', reports_penindakan.export, name='export_laporan_penindakan'),
    # Laporan Komoditi
    path('api/laporan_komoditi/show', reports_komoditi.show, name='show_laporan_komoditi'),
    path('laporan_komoditi/export', reports_komoditi.export, name='export_laporan_komoditi'),
    # Laporan Kendaraan Bodong
    path('api/laporan_kendaraan_bodong/show', reports_kendaraan_bodong.show, name='show_laporan_kendaraan_bodong'),
    path('laporan_kendaraan_bodong/export', reports_kendaraan_bodong.export, name='export_laporan_kendaraan_bodong'),
    # Send Data
    path('api/send_data/show', reports_send_data.show, name='show_send_data'),
    path('api/send_data/send', reports_send_data.send, name='send_send_data'),
]