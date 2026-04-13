"use strict";
// Class Definition
const _loadSettingTools = (timbangan_id) => {
    $("#form-editTools")[0].reset();
    let target = document.querySelector('#card-settingTools'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/setting_tools/show",
        type: "GET",
        dataType: "JSON",
        data: {
            timbangan_id: timbangan_id,
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            $('#rs').selectpicker('refresh').selectpicker('val', data.row.rs.toString());
            // $('#port').selectpicker('refresh').selectpicker('val', data.row.port.toString());
            $('#baudrate').selectpicker('refresh').selectpicker('val', data.row.baudrate.toString());
            $('#parity').selectpicker('refresh').selectpicker('val', data.row.parity);
            $('#stopbits').selectpicker('refresh').selectpicker('val', data.row.stopbits);
            $('#bytesize').selectpicker('refresh').selectpicker('val', data.row.bytesize);
            
            $('#port').val(data.row.port.toString());
            $('#rtsp_camera_1').val(data.row.rtsp_camera_1);
            $('#rtsp_camera_2').val(data.row.rtsp_camera_2);
            $('#ip_printer_penimbangan').val(data.row.ip_printer_penimbangan);
            $('#port_printer_penimbangan').val(data.row.port_printer_penimbangan);

            //is Public
            if (data.row.is_ip_access_timbang == 'Y') {
                $('#is_ip_access_timbang').prop('checked', true),
                $('#iGroup-isIp .form-check-label').text('IP');
                $('.isIpAddress-hide').show();
            } else {
                $('#is_public').prop('checked', false),
                $('#iGroup-isIp .form-check-label').text('SEMUA');
                $('.isIpAddress-hide').hide();
            }
            $('#ip_timbang_allowed').val(data.row.ip_timbang_allowed);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
            blockUi.release(), blockUi.destroy();
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
    // Menentukan timbangan yang ingin dirubah
    var timbangan_id = $('#timbangan_id');
    if (timbangan_id.val() == '') {
        toastr.error('Pilih platform timbangan', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        timbangan_id.focus();
        $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    // Untuk validasi inputam
    var category = $(this).data('save');
    if(category == 'INDICATOR'){
        let rs = $('#rs'),
            port = $('#port'),
            baudrate = $('#baudrate'),
            parity = $('#parity'),
            stopbits = $('#stopbits'),
            bytesize = $('#bytesize');
    
        if (rs.val() == '') {
            toastr.error('Jenis RS232 masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            rs.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (port.val() == '') {
            toastr.error('Port masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            port.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (baudrate.val() == '') {
            toastr.error('Baudrate masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            baudrate.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (parity.val() == '') {
            toastr.error('Parity masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            parity.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (stopbits.val() == '') {
            toastr.error('Stopbits masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            stopbits.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (bytesize.val() == '') {
            toastr.error('Bytesize masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            bytesize.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } 
    }else if(category == 'CAMERA'){
        let rtsp_camera_1 = $('#rtsp_camera_1'),
            rtsp_camera_2 = $('#rtsp_camera_2');
        
        if (rtsp_camera_1.val() == '') {
            toastr.error('RTSP Camera 1 masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            rtsp_camera_1.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (rtsp_camera_2.val() == '') {
            toastr.error('RTSP Camera 2 masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            rtsp_camera_2.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } 
    }else if(category == 'PRINTER_STRUK'){
        let ip_printer_penimbangan = $('#ip_printer_penimbangan'),
            port_printer_penimbangan = $('#port_printer_penimbangan');
        
        if (ip_printer_penimbangan.val() == '') {
            toastr.error('IP Printer penimbangan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            ip_printer_penimbangan.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (port_printer_penimbangan.val() == '') {
            toastr.error('Port Printer penimbangan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            port_printer_penimbangan.focus();
            $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } 
    }else if(category == 'AKSES_PENIMBANGAN'){
        if($('#is_ip_access_timbang').is(':checked')) {
            let ip_timbang_allowed = $('#ip_timbang_allowed');
            if (ip_timbang_allowed.val() == '') {
                toastr.error('IP Address yang diijinkan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
                ip_timbang_allowed.focus();
                $('.btn-save').html('<i class="las la-save fs-1 me-3"></i>Simpan').attr('disabled', false);
                return false;
            }
        }
    }

    Swal.fire({
        title: "",
        text: "Simpan perubahan sekarang ?",
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal"
    }).then(result => {
        if (result.value) {
            let target = document.querySelector('#card-settingTools'), blockUi = new KTBlockUI(target, {message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($('#form-editTools')[0]), ajax_url= base_url+ "api/setting_tools/update";
            formData.append('timbangan_id', timbangan_id.val());
            formData.append('category', category);
            $.ajax({
                url: ajax_url,
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                dataType: "JSON",
                success: function (data) {
                    $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    if (data.status==true){
                        Swal.fire({title: "Success!", text: data.message, icon: "success", allowOutsideClick: false}).then(function (result) {
                            _loadSettingTools(data.row.timbangan_id);
                        });
                    } else {
                        Swal.fire({title: "Ooops!", text: data.message, icon: "warning", allowOutsideClick: false});
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    $('.btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false});
                }
            });
        }else{
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
});