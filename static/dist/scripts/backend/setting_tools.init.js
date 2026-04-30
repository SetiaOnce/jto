"use strict";
// Class Definition
const _loadSettingTools = (timbangan_id) => {
    $("#form-editTools")[0].reset();
    let target = document.querySelector('#card-settingTools'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
    blockUi.block();
    
    $.ajax({
        url: base_url+ "api/setting_tools/show",
        type: "GET",
        dataType: "JSON",
        data: { timbangan_id: timbangan_id },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            
            // Tab UMUM
            $('#nama').val(data.row.nama);
            $('#ws_alat').val(data.row.ws_alat);
            $('#is_active').prop('checked', data.row.is_active === 'Y');
            $('#is_voice').prop('checked', data.row.is_voice === 'Y');

            // Tab INDICATOR
            $('#rs').selectpicker('refresh').selectpicker('val', data.row.rs);
            $('#baudrate').selectpicker('refresh').selectpicker('val', data.row.baudrate.toString());
            $('#parity').selectpicker('refresh').selectpicker('val', data.row.parity);
            $('#stopbits').selectpicker('refresh').selectpicker('val', data.row.stopbits);
            $('#bytesize').selectpicker('refresh').selectpicker('val', data.row.bytesize);
            $('#port').val(data.row.port);

            // Tab CAMERA
            $('#rtsp_camera_1').val(data.row.rtsp_camera_1);
            $('#rtsp_camera_2').val(data.row.rtsp_camera_2);
            $('#cam_depan_url').val(data.row.cam_depan_url);
            $('#cam_depan_username').val(data.row.cam_depan_username);
            $('#cam_depan_password').val(data.row.cam_depan_password);
            $('#cam_depan_ws').val(data.row.cam_depan_ws);
            $('#cam_belakang_url').val(data.row.cam_belakang_url);
            $('#cam_belakang_username').val(data.row.cam_belakang_username);
            $('#cam_belakang_password').val(data.row.cam_belakang_password);
            $('#cam_belakang_ws').val(data.row.cam_belakang_ws);

            // Tab PRINTER
            $('#is_print_struk').prop('checked', data.row.is_print_struk === 'Y');
            $('#ip_printer_penimbangan').val(data.row.ip_printer_penimbangan);
            $('#port_printer_penimbangan').val(data.row.port_printer_penimbangan);

            // Tab LPR & RFID
            $('#is_lpr').prop('checked', data.row.is_lpr === 'Y');
            $('#is_auto_lpr').prop('checked', data.row.is_auto_lpr === 'Y');
            $('#is_rfid').prop('checked', data.row.is_rfid === 'Y');
            $('#ip_rfid').val(data.row.ip_rfid);
            if (data.row.is_rfid === 'Y') { $('#rfid_ip_container').show(); } else { $('#rfid_ip_container').hide(); }
            $('#ip_camera_lpr').val(data.row.ip_camera_lpr);
            $('#username_camera_lpr').val(data.row.username_camera_lpr);
            $('#password_camera_lpr').val(data.row.password_camera_lpr);
            $('#cam_lpr_ws').val(data.row.cam_lpr_ws);

            // Tab GATE (Baru)
            $('#is_gate').prop('checked', data.row.is_gate === 'Y');
            $('#ip_pintu_antrian').val(data.row.ip_pintu_antrian);
            $('#port_pintu_antrian').val(data.row.port_pintu_antrian);
            $('#addr_ibg_antrian').val(data.row.addr_ibg_antrian);
            $('#ip_pintu_penimbangan').val(data.row.ip_pintu_penimbangan);
            $('#port_pintu_penimbangan').val(data.row.port_pintu_penimbangan);
            $('#addr_ibg_penimbangan').val(data.row.addr_ibg_penimbangan);
            // Trigger tampilan Gate
            if (data.row.is_gate === 'Y') { $('#gate_container').show(); } else { $('#gate_container').hide(); }

            // Tab DIMENSI (LiDAR)
            $('#is_lidar').prop('checked', data.row.is_lidar === 'Y');
            $('#api_url_sensor_dim').val(data.row.api_url_sensor_dim);
            if (data.row.is_lidar === 'Y') { 
                $('#lidar_url_container').show(); 
            } else { 
                $('#lidar_url_container').hide(); 
            }
            
            // Tab AKSES
            if (data.row.is_ip_access_timbang === 'Y') {
                $('#is_ip_access_timbang').prop('checked', true);
                $('#iGroup-isIp .form-check-label').text('IP');
                $('.isIpAddress-hide').show();
            } else {
                $('#is_ip_access_timbang').prop('checked', false);
                $('#iGroup-isIp .form-check-label').text('SEMUA');
                $('.isIpAddress-hide').hide();
            }
            $('#ip_timbang_allowed').val(data.row.ip_timbang_allowed);

        }, error: function () {
            blockUi.release(), blockUi.destroy();
            toastr.error('Gagal memuat data', 'Uuppss!');
        }
    });
}

// Handle Button Reset / Batal Form 
$('.btn-reset').on('click', function (e) {
    e.preventDefault();
    var category = $(this).data('reset');
    var timbangan_id = $('#timbangan_id');
    if (timbangan_id.val() == '') {
        toastr.error('Pilih platform timbangan', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        timbangan_id.focus();
    }else{
        _loadSettingTools($('#timbangan_id').val());
    }
});
//Handle Enter Submit Form
$("#form-editTools input").keyup(function(event) {
    if (event.keyCode == 13 || event.key === 'Enter') {
        $(".btn-save").click();
    }
});
// Handle Button Save
$('.btn-save').on('click', function (e) {
    e.preventDefault();
    $('.btn-save').attr('data-kt-indicator', 'on').attr('disabled', true);
    var timbangan_id = $('#timbangan_id');
    
    if (timbangan_id.val() == '') {
        toastr.error('Pilih platform timbangan', 'Uuppss!');
        timbangan_id.focus();
        $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    var category = $(this).data('save');
    
    // Validasi Basic (Bisa ditambah sesuai kebutuhan wajib isi)
    if(category == 'UMUM') {
        if ($('#nama').val() == '') {
            toastr.error('Nama platform tidak boleh kosong', 'Uuppss!');
            $('#nama').focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    } else if(category == 'INDICATOR'){
        if ($('#port').val() == '') {
            toastr.error('Port masih kosong...', 'Uuppss!');
            $('#port').focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    }
    // Lanjutkan ke block Swal.fire (Seperti file asli)
    Swal.fire({
        title: "", text: "Simpan perubahan sekarang?", icon: "question", showCancelButton: true, confirmButtonText: "Ya", cancelButtonText: "Batal"
    }).then(result => {
        if (result.value) {
            let formData = new FormData($('#form-editTools')[0]);
            formData.append('timbangan_id', timbangan_id.val());
            formData.append('category', category);
            
            $.ajax({
                url: base_url+ "api/setting_tools/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST", data: formData, contentType: false, processData: false, dataType: "JSON",
                success: function (data) {
                    $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
                    if (data.status) {
                        Swal.fire("Success!", data.message, "success");
                    } else {
                        Swal.fire("Ooops!", data.message, "warning");
                    }
                }
            });
        } else {
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
});
// Handle Test Konfigurasi Alat
$('.btn-test').on('click', function (e) {
    e.preventDefault();
    $('.btn-test').attr('data-kt-indicator', 'on').attr('disabled', true);
    var timbangan_id = $('#timbangan_id');
    if (timbangan_id.val() == '') {
        toastr.error('Pilih platform timbangan', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        timbangan_id.focus();
        $('.btn-test').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    var category = $(this).data('test');
    var ajax_url = base_url+ "api/setting_tools/test_tool?category=" + category;
    var params = '';
    if(category == 'INDICATOR'){
        let rs = $('#rs').val(),
            port = $('#port').val(),
            baudrate = $('#baudrate').val(),
            parity = $('#parity').val(),
            stopbits = $('#stopbits').val(),
            bytesize = $('#bytesize').val();
        params = `&rs=${rs}&port=${port}&baudrate=${baudrate}&parity=${parity}&stopbits=${stopbits}&bytesize=${bytesize}`
    }else if(category == 'CAMERA'){
        let rtsp_camera_1 = $('#rtsp_camera_1').val(),
            rtsp_camera_2 = $('#rtsp_camera_2').val();
        params = `&rtsp_camera_1=${rtsp_camera_1}&rtsp_camera_2=${rtsp_camera_2}`
    }else if(category == 'PRINTER_STRUK'){
        let ip_printer_penimbangan = $('#ip_printer_penimbangan').val(),
            port_printer_penimbangan = $('#port_printer_penimbangan').val();
        params = `&ip_printer_penimbangan=${ip_printer_penimbangan}&port_printer_penimbangan=${port_printer_penimbangan}`
        
    }
    ajax_url = ajax_url + params
    console.log(ajax_url);
    $.ajax({
        url: ajax_url,
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            $('.btn-test').removeAttr('data-kt-indicator').attr('disabled', false);
            if (data.status == true) {
                Swal.fire({title: "Success!", html: data.message, icon: "success", allowOutsideClick: false});
            }else{
                Swal.fire({title: "Ooops!", html: data.message, icon: "warning", allowOutsideClick: false});
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('TEST TOOLS IS ERROR');
            $('.btn-test').removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
    
});
const loadSelectpicker = (value, element_id) => {
    if (element_id == '#timbangan_id') {   
        $.ajax({
            url: base_url+ "api/load_timbangan",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true,
                is_shift: true
            },
            success: function (data) {
                let i;
                var output;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $(element_id).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }
}
// Handle Test Koneksi WebSocket (WS)
$('.btn-test-ws').on('click', function (e) {
    e.preventDefault();
    let btn = $(this);
    let ws_url = $('#ws_alat').val();

    // Validasi input
    if (ws_url == '') {
        toastr.error('URL WebSocket Alat masih kosong', 'Uuppss!', {"timeOut": 2000});
        $('#ws_alat').focus();
        return false;
    }

    // Aktifkan indikator loading
    btn.attr('data-kt-indicator', 'on').attr('disabled', true);

    try {
        // Deklarasi object WebSocket
        let ws = new WebSocket(ws_url);
        
        // Buat timeout (Batas waktu tunggu koneksi: 5 detik)
        let timeout = setTimeout(function() {
            if (ws.readyState !== 1) { // Jika status bukan OPEN
                ws.close();
                btn.removeAttr('data-kt-indicator').attr('disabled', false);
                Swal.fire({title: "Ooops!", text: "Koneksi Timeout. Pastikan alamat IP, Port, dan jaringan server WebSocket aktif.", icon: "warning"});
            }
        }, 5000);

        // Jika berhasil terhubung
        ws.onopen = function() {
            clearTimeout(timeout);
            btn.removeAttr('data-kt-indicator').attr('disabled', false);
            Swal.fire({title: "Berhasil!", text: "Koneksi ke WebSocket (" + ws_url + ") berhasil tersambung!", icon: "success"});
            
            // Segera tutup koneksi karena ini hanya untuk testing
            ws.close(); 
        };

        // Jika terjadi error saat mencoba terhubung
        ws.onerror = function(error) {
            clearTimeout(timeout);
            btn.removeAttr('data-kt-indicator').attr('disabled', false);
            Swal.fire({title: "Gagal!", text: "Koneksi ditolak oleh server WebSocket. Pastikan URL benar.", icon: "error"});
        };

    } catch (error) {
        // Menangkap error format penulisan (misal tidak pakai ws://)
        btn.removeAttr('data-kt-indicator').attr('disabled', false);
        Swal.fire({title: "Format Salah!", text: "Pastikan format URL benar (harus diawali dengan ws:// atau wss://)", icon: "error"});
    }
});
// Class Initialization
jQuery(document).ready(function() {
    const cookie_timbangan_id = (getCookie('timbangan_id')) ? getCookie('timbangan_id') : 0;
    if (cookie_timbangan_id) {
        _loadSettingTools(cookie_timbangan_id);
    }
    loadSelectpicker(cookie_timbangan_id, '#timbangan_id')
    // Timbangan Change
    $('#timbangan_id').change(function() {
        var value = this.value
        _loadSettingTools(value);
    });
    //Change Check Switch
    $('#is_ip_access_timbang').change(function() {
        if(this.checked) {
            $('#iGroup-isIp .form-check-label').text('IP');
            $('.isIpAddress-hide').show();
        }else{
            $('#iGroup-isIp .form-check-label').text('SEMUA');
            $('.isIpAddress-hide').hide();
        }
    });
    $('#is_rfid').on('change', function() {
        if($(this).is(':checked')) {
            $('#rfid_ip_container').slideDown();
        } else {
            $('#rfid_ip_container').slideUp();
            $('#ip_rfid').val(''); // Opsional: Kosongkan field jika dimatikan
        }
    });

    $('#is_gate').on('change', function() {
        if($(this).is(':checked')) {
            $('#gate_container').slideDown();
        } else {
            $('#gate_container').slideUp();
        }
    });
    $('#is_lidar').on('change', function() {
        if($(this).is(':checked')) {
            $('#lidar_url_container').slideDown();
        } else {
            $('#lidar_url_container').slideUp();
        }
    });
});