"use strict";
//Class Definition
let table;
var save_method ;
//Load Datatables SDM
const _loadDtSdm = () => {
    table = $('#dt-sdm').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/data_sdm/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
        },
        destroy: true,
        draw: true,
        deferRender: true,
        responsive: false,
        autoWidth: false,
        LengthChange: true,
        paginate: true,
        pageResize: true,
        columns: [
            { data: 'no', name: 'no', width: "5%", className: "align-top text-center border px-2", searchable: false },
            { data: 'action', name: 'action', width: "10%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'is_active', name: 'is_active', width: "10%", className: "align-top text-center border px-2" },
            { data: 'regu', name: 'regu', width: "10%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'name', name: 'name', width: "20%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'email', name: 'email', width: "15%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'pangkat', name: 'pangkat', width: "10%", className: "align-top border px-2" },
            { data: 'jabatan', name: 'jabatan', width: "10%", className: "align-top border px-2" },
            { data: 'danru', name: 'danru', width: "10%", className: "align-top text-center border px-2", searchable: false },
            { data: 'ppns', name: 'ppns', width: "10%", className: "align-top text-center border px-2", searchable: false },
            { data: 'penguji', name: 'penguji', width: "10%", className: "align-top text-center border px-2", searchable: false },
            { data: 'korsatpel', name: 'korsatpel', width: "10%", className: "align-top text-center border px-2", searchable: false },
        ],
        oLanguage: {
            sEmptyTable: "Tidak ada Data yang dapat ditampilkan..",
            sInfo: "Menampilkan _START_ s/d _END_ dari _TOTAL_",
            sInfoEmpty: "Menampilkan 0 - 0 dari 0 entri.",
            sInfoFiltered: "",
            sProcessing: `<div class="d-flex justify-content-center align-items-center"><span class="spinner-border align-middle me-3"></span> Mohon Tunggu...</div>`,
            sZeroRecords: "Tidak ada Data yang dapat ditampilkan..",
            sLengthMenu: `<select class="mb-2 show-tick form-select-solid" data-width="fit" data-style="btn-sm btn-secondary" data-container="body">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="-1">Semua</option>
            </select>`,
            oPaginate: {
                sPrevious: "Sebelumnya",
                sNext: "Selanjutnya",
            },
        },
        fnDrawCallback: function (settings, display) {
            $('[data-bs-toggle="tooltip"]').tooltip("dispose"), $(".tooltip").hide();
            //Search Table
            $("#search-data").on("keyup", function () {
                table.search(this.value).draw();
                if ($(this).val().length > 0) {
                    $("#clear-searchData").show();
                } else {
                    $("#clear-searchData").hide();
                }
            });
            //Clear Search Table
            $("#clear-searchData").on("click", function () {
                $("#search-data").val(""),
                table.search("").draw(),
                $("#clear-searchData").hide();
            });
            //Custom Table
            $("#dt-sdm_length select").selectpicker(),
            $('[data-bs-toggle="tooltip"]').tooltip({
                trigger: "hover"
            }).on("click", function () {
                $(this).tooltip("hide");
            });
            //Image PopUp
            $('.image-popup').magnificPopup({
                type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true,
                image: {
                    verticalFit: true
                }
            });
        },
    });
    $("#dt-sdm").css("width", "100%"),
    $("#search-data").val(""),
    $("#clear-searchData").hide();
}
//Load File Dropify
const _loadDropifyFile = (url_file, paramsId) => {
    if (url_file == "") {
        let drEvent1 = $(paramsId).dropify({
            defaultFile: '',
        });
        drEvent1 = drEvent1.data('dropify');
        drEvent1.resetPreview();
        drEvent1.clearElement();
        drEvent1.settings.defaultFile = '';
        drEvent1.destroy();
        drEvent1.init();
    } else {
        let drEvent1 = $(paramsId).dropify({
            defaultFile: url_file,
        });
        drEvent1 = drEvent1.data('dropify');
        drEvent1.resetPreview();
        drEvent1.clearElement();
        drEvent1.settings.defaultFile = url_file;
        drEvent1.destroy();
        drEvent1.init();
    }
}
//begin::Dropify
$('.dropify-upl').dropify({
    messages: {
        'default': '<span class="btn btn-sm btn-secondary">Drag/ drop file atau Klik disini</span>',
        'replace': '<span class="btn btn-sm btn-primary"><i class="fas fa-upload"></i> Drag/ drop atau Klik untuk menimpa file</span>',
        'remove':  '<span class="btn btn-sm btn-danger"><i class="las la-trash-alt"></i> Reset</span>',
        'error':   'Ooops, Terjadi kesalahan pada file input'
    }, error: {
        'fileSize': 'Ukuran file terlalu besar, Max. ( {{ value }} )',
        'minWidth': 'Lebar gambar terlalu kecil, Min. ( {{ value }}}px )',
        'maxWidth': 'Lebar gambar terlalu besar, Max. ( {{ value }}}px )',
        'minHeight': 'Tinggi gambar terlalu kecil, Min. ( {{ value }}}px )',
        'maxHeight': 'Tinggi gambar terlalu besar, Max. ( {{ value }}px )',
        'imageFormat': 'Format file tidak diizinkan, Hanya ( {{ value }} )'
    }
});
//Load Selectpicker Regu
const loadSelectpicker_regu = (value, position) => {
    $.ajax({
        url: base_url+ "api/load_regu",
        type: "GET",
        dataType: "JSON",
        data: {
            is_selectrow: true,
            is_regu: true
        },
        success: function (data) {
            if (position == 'filter') {
                let output = '';
                output += '<option value="ALL">SEMUA</option>';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                $('#filter_regu').html(output).selectpicker('refresh').selectpicker('val', value);
            }else{
                let output = '';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $('#regu_id').html(output).selectpicker('refresh').selectpicker('val', value);
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
//Load Selectpicker Shift
const loadSelectpicker_shift = (value, position) => {
    $.ajax({
        url: base_url+ "api/load_shift",
        type: "GET",
        dataType: "JSON",
        data: {
            is_selectrow: true,
            is_shift: true
        },
        success: function (data) {
            if (position == 'filter') {
                let output = '';
                output += '<option value="ALL">SEMUA</option>';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                $('#filter_shift').html(output).selectpicker('refresh').selectpicker('val', value);
            }else{
                let output = '';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $('#shift_id').html(output).selectpicker('refresh').selectpicker('val', value);
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
//Close Content Card by Open Method
const _closeCard = (card) => {
    if(card=='form_data') {
        save_method = '';
        _clearFormData(), $('#card-form .card-header .card-title').html('');
    }
    $('#card-form').hide(), $('#card-data').show();
}
//Clear Form Data
const _clearFormData = () => {
    if (save_method == "" || save_method == "add_data") {
        $("#form-data")[0].reset(), $('[name="id"]').val(""), loadSelectpicker_regu('', 'form'), loadSelectpicker_shift('', 'form'), 
        _loadDropifyFile('', '#ttdppns'),
        _loadDropifyFile('', '#ttdwasatpel'),
        _loadDropifyFile('', '#ttddandru');

        $('#is_ppns').selectpicker('refresh').selectpicker('val', '0');
        $('#is_penguji').selectpicker('refresh').selectpicker('val', '0');
        $('#is_korsatpel').selectpicker('refresh').selectpicker('val', '0');
        $('#is_danru').selectpicker('refresh').selectpicker('val', '0');

        $('#iGroup-isActive').hide();
        $('#iGroup-ttdppns').hide();
        $('#iGroup-ttdwasatpel').hide();
        $('#iGroup-ttddandru').hide();
    } else {
        let idp = $('[name="id"]').val();
        _editData(idp);
    }
}
//Add Data
const _addData = () => {
    save_method = "add_data";
    _clearFormData(),
    $("#card-form .card-header .card-title").html(
        `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-window-plus fs-2 text-gray-900 me-2"></i>Form Tambah Data SDM</h3>`
    ),
    $("#card-data").hide(), $("#card-form").show();
}
//Edit Data
const _editData = (idp) => {
    save_method = "update_data";
    $('#form-data')[0].reset(), $('.password-group').hide(), $('#iGroup-isActive').show();
    let target = document.querySelector("#card-form"), blockUi = new KTBlockUI(target, { message: messageBlockUi });
    blockUi.block(), blockUi.destroy();
    //Ajax load from ajax
    $.ajax({
        url: base_url+ 'api/data_sdm/show',
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: 'GET',
        dataType: 'JSON',
        data: {
            idp,
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            if (data.status == true) {
                let row = data.row;
                $('[name="id"]').val(row.id),
                loadSelectpicker_regu(row.regu_id, 'form');
                loadSelectpicker_shift(row.shift_id, 'form');
                $('#nip').val(row.nip);
                $('#nama').val(row.nama);
                $('#no_telepon').val(row.no_telepon);
                $('#email').val(row.email);
                $('#pangkat').val(row.pangkat);
                $('#jabatan').val(row.jabatan);
                $('#no_skep').val(row.no_skep);
                $('#no_reg_penguji').val(row.no_reg_penguji);
                $('#keterangan').val(row.keterangan);

                var value_is_korsatpel = (row.is_korsatpel === 'Y') ? 1 : 0;
                var value_is_penguji = (row.is_penguji === 'Y') ? 1 : 0;
                var value_is_ppns = (row.is_ppns === 'Y') ? 1 : 0;
                var value_is_danru = (row.is_danru === 'Y') ? 1 : 0;
                $('#is_korsatpel').selectpicker('val', value_is_korsatpel.toString()).selectpicker('refresh');
                $('#is_penguji').selectpicker('val', value_is_penguji.toString()).selectpicker('refresh');
                $('#is_ppns').selectpicker('val', value_is_ppns.toString()).selectpicker('refresh');
                $('#is_danru').selectpicker('val', value_is_danru.toString()).selectpicker('refresh');
                
                if(row.is_korsatpel === 'Y'){
                    _loadDropifyFile(row.ttd_korsatpel, '#ttdwasatpel');
                    $('#iGroup-ttdwasatpel').show();
                }if(row.is_ppns === 'Y'){
                    _loadDropifyFile(row.ttd_ppns, '#ttdppns');
                    $('#iGroup-ttdppns').show();
                }if(row.is_danru === 'Y'){
                    _loadDropifyFile(row.ttd_danru, '#ttddandru');
                    $('#iGroup-ttddandru').show();
                }

                if (row.is_active == 'Y') {
                    $('#is_active').prop('checked', true),
                    $('#iGroup-isActive .form-check-label').text('AKTIF');
                } else {
                    $('#is_active').prop('checked', false),
                    $('#iGroup-isActive .form-check-label').text('TIDAK AKTIF');
                }
                $("#card-form .card-header .card-title").html(
                    `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-pencil-square fs-2 text-gray-900 me-2"></i>Form Edit SDM</h3>`
                ),
                $("#card-data").hide(), $("#card-form").show();
            } else {
                Swal.fire({title: "Ooops!", text: data.message, icon: "warning", allowOutsideClick: false});
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            blockUi.release(), blockUi.destroy();
            console.log("load data is error!");
            Swal.fire({
                title: "Ooops!",
                text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.",
                icon: "error",
                allowOutsideClick: false,
            });
        },
    });
}
//Save Data by Enter
$("#form-data input").keyup(function (event) {
    if (event.keyCode == 13 || event.key === "Enter") {
        $("#btn-save").click();
    }
});
//Save Data Form
$("#btn-save").on("click", function (e) {
    e.preventDefault();
    $("#btn-save").attr('data-kt-indicator', 'on').attr('disabled', true);
    let regu_id = $("#regu_id"),
        shift_id = $("#shift_id"),
        nip = $("#nip"),
        nama = $("#nama"),
        no_telepon = $("#no_telepon"),
        email = $("#email"),
        pangkat = $("#pangkat"),
        jabatan = $("#jabatan"),
        is_ppns = $("#is_ppns"),
        is_penguji = $("#is_penguji"),
        no_reg_penguji = $("#no_reg_penguji"),
        is_korsatpel = $("#is_korsatpel"),
        is_danru = $("#is_danru"),
        keterangan = $("#keterangan");

    if (nama.val() == '') {
        toastr.error('Nama masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        nama.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (email.val() == '') {
        toastr.error('Email masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        email.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (regu_id.val() == '') {
        toastr.error('Regu masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-regu button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
			$(this).removeClass('btn-danger').addClass('btn-light');
		});
        regu_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (shift_id.val() == '') {
        toastr.error('Shift masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-shift button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
			$(this).removeClass('btn-danger').addClass('btn-light');
		});
        shift_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (pangkat.val() == '') {
        toastr.error('Pangkat masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        pangkat.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (jabatan.val() == '') {
        toastr.error('Jabatan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        jabatan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    
    if (is_ppns.val() == 1) {
        var no_skep = $("#no_skep"),
        ttdppns = $('#ttdppns'), ttdppns_preview = $('#iGroup-ttdppns .dropify-preview .dropify-render').html();
        if (no_skep.val() == '') {
            toastr.error('No SKEP masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            no_skep.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (ttdppns_preview == '') {
            toastr.error('TTD PPNS masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            $('#iGroup-ttdppns .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
                $(this).removeClass('border-2 border-danger');
            });
            ttdppns.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    }
    if (is_korsatpel.val() == 1) {
        var ttdwasatpel = $('#ttdwasatpel'), ttdwasatpel_preview = $('#iGroup-ttdwasatpel .dropify-preview .dropify-render').html();
        if (ttdwasatpel_preview == '') {
            toastr.error('TTD Wasatpel masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            $('#iGroup-ttdwasatpel .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
                $(this).removeClass('border-2 border-danger');
            });
            ttdwasatpel.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    }
    if (is_danru.val() == 1) {
        var ttddandru = $('#ttddandru'), ttddandru_preview = $('#iGroup-ttddandru .dropify-preview .dropify-render').html();
        if (ttddandru_preview == '') {
            toastr.error('TTD Komandan Regu masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            $('#iGroup-ttddandru .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
                $(this).removeClass('border-2 border-danger');
            });
            ttddandru.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    }

    let textConfirmSave = "Simpan perubahan data sekarang ?";
    if (save_method == "add_data") {
        textConfirmSave = "Tambahkan data sekarang ?";
    }

    Swal.fire({
        title: "",
        text: textConfirmSave,
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
    }).then((result) => {
        if (result.value) {
            let target = document.querySelector("#card-form"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($("#form-data")[0]), ajax_url = base_url+ "api/data_sdm/store";
            if(save_method == 'update_data') {
                ajax_url = base_url+ "api/data_sdm/update";
            }
            $.ajax({
                url: ajax_url,
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                dataType: "JSON",
                success: function (data) {
                    $("#btn-save").removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    if (data.status == true) {
                        Swal.fire({title: "Success!", text: data.message, icon: "success", allowOutsideClick: false,
                        }).then(function (result) {
                            _closeCard('form_data');
                            $('#dt-sdm').DataTable().ajax.reload( null, false );
                        });
                    } else {
                        Swal.fire({
                            title: "Ooops!",
                            html: data.message,
                            icon: "warning",
                            allowOutsideClick: false,
                        }).then(function (result) {
                            if (data.row.error_code == "pegawai_available") {
                                fid_sdm.focus();
                            }if (data.row.error_code == "username_available") {
                                username.focus();
                            }
                        });
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    $("#btn-save").removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false});
                }
            });
        } else {
            $("#btn-save").removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
});
//Update Status Data Data
const _updateStatus = (idp, value) => {
    let textLbl = 'Nonaktifkan';
    if(value=='Y') {
        textLbl = 'Aktifkan';
    }
    let textSwal = textLbl+ ' data sekarang ?';
    Swal.fire({
        title: "",
        html: textSwal,
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak, Batalkan!"
    }).then(result => {
        if (result.value) {
            let target = document.querySelector('#card-data'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/data_sdm/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_status: true,
                    idp, value
                }, success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        $('#dt-sdm').DataTable().ajax.reload( null, false );
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-sdm').DataTable().ajax.reload( null, false );
                    });
                }
            });
        }
    });
}
//Delete Data
const _deleteData = (idp) => {
    let textSwal ='Hapus data ini sekarang ?';
    Swal.fire({
        title: "",
        html: textSwal,
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak, Batalkan!"
    }).then(result => {
        if (result.value) {
            let target = document.querySelector('#card-data'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/data_sdm/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_deleted: true,
                    idp
                }, success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        $('#dt-sdm').DataTable().ajax.reload( null, false );
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-sdm').DataTable().ajax.reload( null, false );
                    });
                }
            });
        }
    });
}
//Sinkronisasi data SDM
const _sincroneSdm = (idp, value) => {
    Swal.fire({
        title: "",
        html: "Data SDM akan di sincronisasi pada pusat data SDM Portal",
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak, Batalkan!"
    }).then(result => {
        if (result.value) {
            let target = document.querySelector('#card-data'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/data_sdm/sincrone",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    if(data.status == true){
                        Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                            $('#dt-sdm').DataTable().ajax.reload( null, false );
                        });
                    }else{
                        Swal.fire({ title: "Ooopss!", html: data.message, icon: "warning", allowOutsideClick: false }).then(function (result) {
                            $('#dt-sdm').DataTable().ajax.reload( null, false );
                        });
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-sdm').DataTable().ajax.reload( null, false );
                    });
                }
            });
        }
    });
}
//Class Initialization
jQuery(document).ready(function() {
    _loadDtSdm(); 
    //Change Check Switch
    $("#is_active").change(function() {
        if(this.checked) {
            $('#iGroup-isActive .form-check-label').text('AKTIF');
        }else{
            $('#iGroup-isActive .form-check-label').text('TIDAK AKTIF');
        }
    });
    $("#is_ppns").change(function() {
        if(this.value == 1) {
            $('#iGroup-ttdppns').show();
        }else{
            $('#iGroup-ttdppns').hide();
        }
    });
    $("#is_korsatpel").change(function() {
        if(this.value == 1) {
            $('#iGroup-ttdwasatpel').show();
        }else{
            $('#iGroup-ttdwasatpel').hide();
        }
    });
    $("#is_danru").change(function() {
        if(this.value == 1) {
            $('#iGroup-ttddandru').show();
        }else{
            $('#iGroup-ttddandru').hide();
        }
    });
});
