"use strict";
// Class Definition
let tableUppkb;
//CopyRight Input
$('#copyright').summernote({
    placeholder: 'Isi copyright situs ...',
    toolbar: [
        ['style', ['bold', 'italic', 'underline']], ['insert', ['link']], ['view', ['codeview']]
    ],
    height: 100, minHeight: null, maxHeight: null, dialogsInBody: false, focus: false, popatmouse: false, lang: 'id-ID'
});
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
//end::Dropify
const _loadEditSiteInfo = () => {
    $("#form-editSiteInfo")[0].reset(),
    $('#copyright').summernote('code', '');
    _loadDropifyFile('', '#login_bg');
    // _loadDropifyFile('', '#login_logo'),
    // _loadDropifyFile('', '#headbackend_logo'),
    // _loadDropifyFile('', '#headbackend_logo_dark'),
    // _loadDropifyFile('', '#headbackend_icon');
    // _loadDropifyFile('', '#headbackend_icon_dark');
    let target = document.querySelector('#institutionTabContent'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/site_info",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            $('#name').val(data.row.name),
            $('#short_name').val(data.row.short_name),
            $('#description').val(data.row.description);
            $('#address').val(data.row.address);
            //Summernote CopyRight
            let copyright = data.row.copyright;
            $('#copyright').summernote('code', copyright);
            _loadDropifyFile(data.row.login_bg_url, '#login_bg');
            // _loadDropifyFile(data.row.login_logo_url, '#login_logo'),
            // _loadDropifyFile(data.row.headbackend_logo_url, '#headbackend_logo'),
            // _loadDropifyFile(data.row.headbackend_logo_dark_url, '#headbackend_logo_dark'),
            // _loadDropifyFile(data.row.headbackend_icon_url, '#headbackend_icon');
            // _loadDropifyFile(data.row.headbackend_icon_dark_url, '#headbackend_icon_dark');
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
            blockUi.release(), blockUi.destroy();
        }
    });
}
// Handle Button Reset / Batal Form Site Info
$('#btn-resetFormSiteInfo').on('click', function (e) {
    e.preventDefault();
    _loadEditSiteInfo();
});
//Handle Enter Submit Form Edit Site Info
$("#form-editSiteInfo input").keyup(function(event) {
    if (event.keyCode == 13 || event.key === 'Enter') {
        $("#btn-saveSiteInfo").click();
    }
});
// Handle Button Save Form Site Info
$('#btn-saveSiteInfo').on('click', function (e) {
    e.preventDefault();
    $('#btn-saveSiteInfo').attr('data-kt-indicator', 'on').attr('disabled', true);
    let name = $('#name'),
        short_name = $('#short_name'),
        description = $('#description'),
        address = $('#address'),
        copyright = $('#copyright'),
        login_logo = $('#login_logo'), login_logo_preview = $('#iGroup-login_logo .dropify-preview .dropify-render').html(),
        login_bg = $('#login_bg'), login_bg_preview = $('#iGroup-login_bg .dropify-preview .dropify-render').html(),
        headbackend_logo = $('#headbackend_logo'), headbackend_logo_preview = $('#iGroup-headbackend_logo .dropify-preview .dropify-render').html(),
        headbackend_logo_dark = $('#headbackend_logo_dark'), headbackend_logo_dark_preview = $('#iGroup-headbackend_logo_dark .dropify-preview .dropify-render').html(),
        headbackend_icon = $('#headbackend_icon'), headbackend_icon_preview = $('#iGroup-headbackend_icon .dropify-preview .dropify-render').html(),
        headbackend_icon_dark = $('#headbackend_icon_dark'), headbackend_icon_dark_preview = $('#iGroup-headbackend_icon_dark .dropify-preview .dropify-render').html();

    if (name.val() == '') {
        toastr.error('Nama situs masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        name.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (short_name.val() == '') {
        toastr.error('Nama alias/ nama pendek situs masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        short_name.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (description.val() == '') {
        toastr.error('Deskripsi situs masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        description.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (address.val() == '') {
        toastr.error('Alamat lengkap masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        address.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (copyright.summernote('isEmpty')) {
        toastr.error('Copyright situs masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        copyright.summernote('focus');
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (login_logo_preview == '') {
        toastr.error('Logo login masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-login_logo .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('border-2 border-danger');
        });
        login_logo.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (login_bg_preview == '') {
        toastr.error('Gambar background login masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-login_bg .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('border-2 border-danger');
        });
        login_bg.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (headbackend_logo_preview == '') {
        toastr.error('Logo backend light mode masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-headbackend_logo .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('border-2 border-danger');
        });
        headbackend_logo.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (headbackend_logo_dark_preview == '') {
        toastr.error('Logo backend dark mode masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-headbackend_logo_dark .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('border-2 border-danger');
        });
        headbackend_logo_dark.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (headbackend_icon_preview == '') {
        toastr.error('Logo icon backend light mode masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-headbackend_icon .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('border-2 border-danger');
        });
        headbackend_icon.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    } if (headbackend_icon_dark_preview == '') {
        toastr.error('Logo icon backend dark mode masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-headbackend_icon_dark .dropify-wrapper').addClass('border-2 border-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('border-2 border-danger');
        });
        headbackend_icon_dark.focus();
        $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
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
            let target = document.querySelector('#institutionTabContent'), blockUi = new KTBlockUI(target, {message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($('#form-editSiteInfo')[0]),
                ajax_url= base_url+ "api/manage_siteinfo/update",
                get_copyright = formData.get('copyright');
            formData.set('copyright', encodeURIComponent(encodeURIComponent(get_copyright)));
            $.ajax({
                url: ajax_url,
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                dataType: "JSON",
                success: function (data) {
                    $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    if (data.status==true){
                        Swal.fire({title: "Success!", text: data.message, icon: "success", allowOutsideClick: false}).then(function (result) {
                            _loadEditSiteInfo();
                        });
                    } else {
                        Swal.fire({title: "Ooops!", text: data.message, icon: "warning", allowOutsideClick: false});
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false});
                }
            });
        }else{
            $('#btn-saveSiteInfo').removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
});
// Modal form
const openFormModal = (category) => {
    if(category == 'api'){
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            },
            success: function (data) {
                Swal.fire({
                    width: '60%',
                    height: '80%',
                    html: `
                        <div class="row mb-8">
                            <span class="fs-3 mb-3 fw-bolder "><i class="las la-pen text-dark fs-2 me-3"></i>Pengaturan URL Sinkronisasi</span>
                            <div class="col-lg-2">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="kode_api_pusat">Kode</label>
                                <input type="text" name="kode_api_pusat" id="kode_api_pusat" class="form-control input-sm" maxlength="100" placeholder="Kode " value="${data.row.kode_api_pusat}"/>
                            </div>
                            <div class="col-lg-10">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="url_api_pusat">URL Sinkronisasi</label>
                                <input type="text" name="url_api_pusat" id="url_api_pusat" class="form-control input-sm" maxlength="100" placeholder="URL Sinkronisasi" value="${data.row.url_api_pusat}"/>
                            </div>
                            <div class="col-lg-6">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="email_api_pusat">Email Pusat</label>
                                <input type="text" name="email_api_pusat" id="email_api_pusat" class="form-control input-sm" maxlength="100" placeholder="Email pusat " value="${data.row.email_api_pusat}"/>
                            </div>
                            <div class="col-lg-6">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="password_api_pusat">Password</label>
                                <input type="text" name="password_api_pusat" id="password_api_pusat" class="form-control input-sm" maxlength="100" placeholder="Password" value="${data.row.password_api_pusat}"/>
                            </div>
                            <div class="col-lg-12">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="access_token_api_pusat">Token</label>
                                <input type="text" name="access_token_api_pusat" id="access_token_api_pusat" class="form-control input-sm" placeholder="Token" value="${data.row.access_token_api_pusat}"/>
                            </div>
                        </div>
                    `,
                    confirmButtonText: '<i class="las la-save text-white fs-3 me-1 align-middle"></i> Simpan',
                    position: 'top',
                    focusConfirm: false,
                    allowOutsideClick: false,
                    showCancelButton: true,
                    cancelButtonText: 'Batal',
                    preConfirm: () => {
                        const kode_api_pusat = Swal.getPopup().querySelector('#kode_api_pusat').value
                        const url_api_pusat = Swal.getPopup().querySelector('#url_api_pusat').value
                        const email_api_pusat = Swal.getPopup().querySelector('#email_api_pusat').value
                        const password_api_pusat = Swal.getPopup().querySelector('#password_api_pusat').value
                        const access_token_api_pusat = Swal.getPopup().querySelector('#access_token_api_pusat').value
                        if (!kode_api_pusat || !url_api_pusat || !email_api_pusat || !password_api_pusat || !access_token_api_pusat) {
                            Swal.showValidationMessage(`Isi semua form yang tersedia`)
                        } return {
                            kode_api_pusat, url_api_pusat, email_api_pusat, password_api_pusat, access_token_api_pusat
                        }
                    }
                }).then((result) => {
                    let kode_api_pusat = `${result.value.kode_api_pusat}`;
                    let url_api_pusat = `${result.value.url_api_pusat}`;
                    let email_api_pusat = `${result.value.email_api_pusat}`;
                    let password_api_pusat = `${result.value.password_api_pusat}`;
                    let access_token_api_pusat = `${result.value.access_token_api_pusat}`;
                    // Load Ajax
                    $.ajax({
                        url: base_url+ "api/manage_siteinfo/update",
                        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                        type: "POST",
                        dataType: "JSON",
                        data: {
                            is_update_api: true,
                            kode_api_pusat: kode_api_pusat,
                            url_api_pusat: url_api_pusat,
                            email_api_pusat: email_api_pusat,
                            password_api_pusat: password_api_pusat,
                            access_token_api_pusat: access_token_api_pusat,
                        },
                        success: function(data){
                            Swal.fire({title: "Success!", html: data.message, icon: "success", allowOutsideClick: false}).then(function(result){
                                _loadProfileUppkb('api')
                            });
                        }, error: function (jqXHR, textStatus, errorThrown){
                            Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang...", icon: "error", allowOutsideClick: false}).then(function(result){
                                console.log("Update data is error!");
                                _loadProfileUppkb('api')
                            });
                        }
                    });
                });
                let output = '';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                $('#sdm_id').html(output).selectpicker('refresh');
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(category == 'api-balai'){
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            },
            success: function (data) {
                Swal.fire({
                    width: '60%',
                    height: '60%',
                    html: `
                        <div class="row mb-8">
                            <span class="fs-3 mb-3 fw-bolder "><i class="las la-pen text-dark fs-2 me-3"></i>Pengaturan URL Sinkronisasi Balai</span>
                            <div class="col-lg-1">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="jt_id_portal">ID JT</label>
                                <input type="text" name="jt_id_portal" id="jt_id_portal" class="form-control input-sm" maxlength="3" placeholder="ID JT" value="${data.row.jt_id_portal}"/>
                            </div>
                            <div class="col-lg-4">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="client_id_portal">Client ID</label>
                                <input type="text" name="client_id_portal" id="client_id_portal" class="form-control input-sm" maxlength="100" placeholder="Client ID " value="${data.row.client_id_portal}"/>
                            </div>
                            <div class="col-lg-7">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="url_portal">URL Sinkronisasi</label>
                                <input type="text" name="url_portal" id="url_portal" class="form-control input-sm" maxlength="100" placeholder="URL Sinkronisasi" value="${data.row.url_portal}"/>
                            </div>
                        </div>
                    `,
                    confirmButtonText: '<i class="las la-save text-white fs-3 me-1 align-middle"></i> Simpan',
                    position: 'top',
                    focusConfirm: false,
                    allowOutsideClick: false,
                    showCancelButton: true,
                    cancelButtonText: 'Batal',
                    preConfirm: () => {
                        const jt_id_portal = Swal.getPopup().querySelector('#jt_id_portal').value
                        const client_id_portal = Swal.getPopup().querySelector('#client_id_portal').value
                        const url_portal = Swal.getPopup().querySelector('#url_portal').value
                        if (!jt_id_portal || !client_id_portal || !url_portal) {
                            Swal.showValidationMessage(`Isi semua form yang tersedia`)
                        } return {
                            jt_id_portal, client_id_portal, url_portal
                        }
                    }
                }).then((result) => {
                    let jt_id_portal = `${result.value.jt_id_portal}`;
                    let client_id_portal = `${result.value.client_id_portal}`;
                    let url_portal = `${result.value.url_portal}`;
                    // Load Ajax
                    $.ajax({
                        url: base_url+ "api/manage_siteinfo/update",
                        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                        type: "POST",
                        dataType: "JSON",
                        data: {
                            is_update_api_balai: true,
                            jt_id_portal: jt_id_portal,
                            client_id_portal: client_id_portal,
                            url_portal: url_portal,
                        },
                        success: function(data){
                            Swal.fire({title: "Success!", html: data.message, icon: "success", allowOutsideClick: false}).then(function(result){
                                _loadProfileUppkb('api-balai')
                            });
                        }, error: function (jqXHR, textStatus, errorThrown){
                            Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang...", icon: "error", allowOutsideClick: false}).then(function(result){
                                console.log("Update data is error!");
                                _loadProfileUppkb('api-balai')
                            });
                        }
                    });
                });
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(category == 'uppkb'){
        $('#mdl-uppkb').modal('show');
        tableUppkb = $('#dt-uppkb').DataTable({
            searchDelay: 300,
            processing: true,
            serverSide: true,
            ajax: {
                url: base_url+ 'api/manage_siteinfo/show',
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: 'GET',
                data: function(d) {
                    d.is_show_list_uppkb_pusat = true
                }
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
                { data: 'action', name: 'action', width: "5%", className: "align-top text-center border px-2", orderable: false, searchable: false },
                { data: 'bptd', name: 'bptd', width: "15%", className: "align-top border px-2", searchable: false },
                { data: 'kab_kota', name: 'kab_kota', width: "15%", className: "align-top border px-2", orderable: false, searchable: true },
                { data: 'kode', name: 'kode', width: "5%", className: "align-top text-center border px-2", orderable: false, searchable: true },
                { data: 'nama', name: 'nama', width: "10%", className: "align-top border px-2", orderable: false, searchable: true },
                { data: 'alamat', name: 'alamat', width: "20%", className: "align-top border px-2", orderable: false, searchable: true },
                { data: 'koordinat', name: 'koordinat', width: "10%", className: "align-top border px-2", orderable: false, searchable: true },
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
                    tableUppkb.search(this.value).draw();
                    if ($(this).val().length > 0) {
                        $("#clear-searchData").show();
                    } else {
                        $("#clear-searchData").hide();
                    }
                });
                //Clear Search Table
                $("#clear-searchData").on("click", function () {
                    $("#search-data").val(""),
                    tableUppkb.search("").draw(),
                    $("#clear-searchData").hide();
                });
                //Custom Table
                $("#dt-uppkb_length select").selectpicker(),
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
        $("#dt-uppkb").css("width", "100%"),
        $("#search-data").val(""),
        $("#clear-searchData").hide();
    }if(category == 'korsatpel'){
        $.ajax({
            url: base_url+ "api/load_sdm",
            type: "GET",
            dataType: "JSON",
            data: {
                is_korsatpel: true,
            },
            success: function (data) {
                Swal.fire({
                    title: 'Pilih Wasatpel Baru',
                    html: `<form class="form">
                            <select class="show-tick form-select-solid" data-width="90%" data-style="btn-sm btn-light" name="sdm_id" id="sdm_id" data-container="body" title="Pilih Wasatpel baru ..."></select>
                    </form>`,
                    confirmButtonText: '<i class="las la-save text-white fs-3 me-1 align-middle"></i> Simpan',
                    position: 'top',
                    focusConfirm: false,
                    allowOutsideClick: false,
                    showCancelButton: true,
                    cancelButtonText: 'Batal',
                    willOpen: () => {
                        
                    },
                    preConfirm: () => {
                        const sdm_id = Swal.getPopup().querySelector('#sdm_id').value
                        if (!sdm_id) {
                            Swal.showValidationMessage(`SDM yang ingin dijadikan Wasatpel masih kosong`)
                        } return {
                            sdm_id
                        }
                    }
                }).then((result) => {
                    let sdm_id = `${result.value.sdm_id}`;
                    // Load Ajax
                    $.ajax({
                        url: base_url+ "api/manage_siteinfo/update",
                        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                        type: "POST",
                        dataType: "JSON",
                        data: {
                            is_update_korsatpel: true,
                            sdm_id: sdm_id,
                        },
                        success: function(data){
                            Swal.fire({title: "Success!", html: data.message, icon: "success", allowOutsideClick: false}).then(function(result){
                                _loadProfileUppkb('korsatpel')
                            });
                        }, error: function (jqXHR, textStatus, errorThrown){
                            Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang...", icon: "error", allowOutsideClick: false}).then(function(result){
                                console.log("Update data is error!");
                                _loadProfileUppkb('korsatpel')
                            });
                        }
                    });
                });
                let output = '';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                $('#sdm_id').html(output).selectpicker('refresh');
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(category == 'toleransi'){
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            },
            success: function (data) {
                Swal.fire({
                    width: '60%',
                    height: '60%',
                    html: `
                        <div class="row mb-8">
                            <span class="fs-3 mb-3 fw-bolder"><i class="las la-pen text-dark fs-2 me-3"></i>Tentukan Toleransi UPPKB</span>
                            <div class="col-lg-3">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="toleransi_berat">Berat (%)</label>
                                <input type="text" name="toleransi_berat" id="toleransi_berat" class="form-control input-sm" maxlength="100" placeholder="Berat" value="${data.row.toleransi_berat}"/>
                            </div>
                            <div class="col-lg-3">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="toleransi_panjang">Panjang (mm)</label>
                                <input type="text" name="toleransi_panjang" id="toleransi_panjang" class="form-control input-sm" maxlength="100" placeholder="Panjang" value="${data.row.toleransi_panjang}"/>
                            </div>
                            <div class="col-lg-3">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="toleransi_lebar">Lebar (mm)</label>
                                <input type="text" name="toleransi_lebar" id="toleransi_lebar" class="form-control input-sm" maxlength="100" placeholder="Lebar" value="${data.row.toleransi_lebar}"/>
                            </div>
                            <div class="col-lg-3">
                                <label class="col-form-label required fw-bold fs-6 text-left" for="toleransi_tinggi">Tinggi (%)</label>
                                <input type="text" name="toleransi_tinggi" id="toleransi_tinggi" class="form-control input-sm" maxlength="100" placeholder="Tinggi" value="${data.row.toleransi_tinggi}"/>
                            </div>
                        </div>
                    `,
                    confirmButtonText: '<i class="las la-save text-white fs-3 me-1 align-middle"></i> Simpan',
                    position: 'top',
                    focusConfirm: false,
                    allowOutsideClick: false,
                    showCancelButton: true,
                    cancelButtonText: 'Batal',
                    willOpen: () => {
                        
                    },
                    preConfirm: () => {
                        const toleransi_berat = Swal.getPopup().querySelector('#toleransi_berat').value
                        const toleransi_panjang = Swal.getPopup().querySelector('#toleransi_panjang').value
                        const toleransi_lebar = Swal.getPopup().querySelector('#toleransi_lebar').value
                        const toleransi_tinggi = Swal.getPopup().querySelector('#toleransi_tinggi').value
                        if (!toleransi_berat || !toleransi_panjang || !toleransi_lebar || !toleransi_tinggi) {
                            Swal.showValidationMessage(`Isi semua form yang tersedia`)
                        } return {
                            toleransi_berat, toleransi_panjang, toleransi_lebar, toleransi_tinggi
                        }
                    }
                }).then((result) => {
                    let toleransi_berat = `${result.value.toleransi_berat}`;
                    let toleransi_panjang = `${result.value.toleransi_panjang}`;
                    let toleransi_lebar = `${result.value.toleransi_lebar}`;
                    let toleransi_tinggi = `${result.value.toleransi_tinggi}`;
                    // Load Ajax
                    $.ajax({
                        url: base_url+ "api/manage_siteinfo/update",
                        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                        type: "POST",
                        dataType: "JSON",
                        data: {
                            is_update_toleransi: true,
                            toleransi_berat: toleransi_berat,
                            toleransi_panjang: toleransi_panjang,
                            toleransi_lebar: toleransi_lebar,
                            toleransi_tinggi: toleransi_tinggi,
                        },
                        success: function(data){
                            Swal.fire({title: "Success!", html: data.message, icon: "success", allowOutsideClick: false}).then(function(result){
                                _loadProfileUppkb('toleransi')
                            });
                        }, error: function (jqXHR, textStatus, errorThrown){
                            Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang...", icon: "error", allowOutsideClick: false}).then(function(result){
                                console.log("Update data is error!");
                                _loadProfileUppkb('toleransi')
                            });
                        }
                    });
                });
                let output = '';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                $('#sdm_id').html(output).selectpicker('refresh');
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }
}
const _pilihUppkb = (idp) => {
    let textSwal ='Lokasi ini sesuai dengan UPPKB anda?';
    Swal.fire({
        title: "",
        html: textSwal,
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Ya, Lanjutkan",
        cancelButtonText: "Tidak, Batalkan!"
    }).then(result => {
        if (result.value) {
            // Load Ajax
            $.ajax({
                url: base_url+ "api/manage_siteinfo/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_update_uppkb: true,
                    idp
                }, success: function (data) {
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        // $('#dt-users').DataTable().ajax.reload( null, false );
                        _loadProfileUppkb('uppkb'), _loadProfileUppkb('wilayah');
                        $('#mdl-uppkb').modal('hide');
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                    });
                }
            });
        }
    });
}
const _loadProfileUppkb = (category) =>{
    if(category == 'api'){
        let target = document.querySelector('#institutionTabContent .card-api'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
        blockUi.block(), blockUi.destroy(); 
        // Load Ajax
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            }, success: function (data) {
                blockUi.release(), blockUi.destroy();
                var row = data.row;
                var bodyContent = `
                <div class="row d-flex justify-content-between">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Sinkronisasi URL</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5"><strong>( ${row.kode_api_pusat} )</strong> ${row.url_api_pusat}</span>
                    </div>
                </div>`;
                $('#institutionTabContent .card-api .body-content').html(bodyContent);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
                blockUi.release(), blockUi.destroy();
            }
        });
    }if(category == 'api-balai'){
        let target = document.querySelector('#institutionTabContent .card-api-balai'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
        blockUi.block(), blockUi.destroy(); 
        // Load Ajax
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            }, success: function (data) {
                blockUi.release(), blockUi.destroy();
                var row = data.row;
                var bodyContent = `
                <div class="row d-flex justify-content-between">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Sinkronisasi URL</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5"><strong>( ${row.jt_id_portal} - ${row.client_id_portal})</strong> ${row.url_portal}</span>
                    </div>
                </div>`;
                $('#institutionTabContent .card-api-balai .body-content').html(bodyContent);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
                blockUi.release(), blockUi.destroy();
            }
        });
    }if(category == 'uppkb'){
        let target = document.querySelector('#institutionTabContent .card-uppkb'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
        blockUi.block(), blockUi.destroy(); 
        // Load Ajax
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            }, success: function (data) {
                blockUi.release(), blockUi.destroy();
                var row = data.row;
                var bodyContent = `<div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start"> 
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Nama UPPKB</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5"><strong>${row.nama}</strong></span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Kode UPPKB</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5"><strong>${row.kode}</strong></span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Alamat UPPKB</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.alamat}</span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Koordinat</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.koordinat}</span>
                    </div>
                </div>`;
                $('#institutionTabContent .card-uppkb .body-content').html(bodyContent);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
                blockUi.release(), blockUi.destroy();
            }
        });
    }if(category == 'wilayah'){
        let target = document.querySelector('#institutionTabContent .card-wilayah'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
        blockUi.block(), blockUi.destroy(); 
        // Load Ajax
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            }, success: function (data) {
                blockUi.release(), blockUi.destroy();
                var row = data.row;
                var bodyContent = `<div class="row d-flex justify-content-between border-bottom">
                        <div class="col-md-6 d-flex justify-content-start"> 
                            <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Provinsi</label>
                        </div>
                        <div class="col-md-6 d-flex justify-content-end">
                            <span class="fs-5">${row.provinsi}</span>
                        </div>
                    </div>
                    <div class="row d-flex justify-content-between border-bottom">
                        <div class="col-md-6 d-flex justify-content-start">
                            <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Kota /Kabupaten</label>
                        </div>
                        <div class="col-md-6 d-flex justify-content-end">
                            <span class="fs-5">${row.kota_kab}</span>
                        </div>
                    </div>
                    <div class="row d-flex justify-content-between border-bottom">
                        <div class="col-md-6 d-flex justify-content-start">
                            <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">BPTD</label>
                        </div>
                        <div class="col-md-6 d-flex justify-content-end">
                            <span class="fs-5">${row.bptd}</span>
                        </div>
                    </div>`;
                $('#institutionTabContent .card-wilayah .body-content').html(bodyContent);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
                blockUi.release(), blockUi.destroy();
            }
        });
    }if(category == 'korsatpel'){
        let target = document.querySelector('#institutionTabContent .card-korsatpel'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
        blockUi.block(), blockUi.destroy(); 
        // Load Ajax
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            }, success: function (data) {
                blockUi.release(), blockUi.destroy();
                var row = data.row;
                var bodyContent = `<div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start"> 
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Nama</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.nama_korsatpel}</span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">NIP</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.nip_korsatpel}</span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Pangkat / Golongan</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.pangkat_korsatpel}</span>
                    </div>
                </div>`;
                $('#institutionTabContent .card-korsatpel .body-content').html(bodyContent);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
                blockUi.release(), blockUi.destroy();
            }
        });
    }if(category == 'toleransi'){
        let target = document.querySelector('#institutionTabContent .card-toleransi'), blockUi = new KTBlockUI(target, {message: messageBlockUi});
        blockUi.block(), blockUi.destroy(); 
        // Load Ajax
        $.ajax({
            url: base_url+ "api/manage_siteinfo/show",
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_show_profile_uppkb: true,
            }, success: function (data) {
                blockUi.release(), blockUi.destroy();
                var row = data.row;
                var bodyContent = ` <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start"> 
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Toleransi Berat (%)</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.toleransi_berat} %</span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Toleransi Panjang (mm)</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.toleransi_panjang} mm</span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Toleransi Lebar (mm)</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.toleransi_lebar} mm</span>
                    </div>
                </div>
                <div class="row d-flex justify-content-between border-bottom">
                    <div class="col-md-6 d-flex justify-content-start">
                        <label class="col-lg-4 col-form-label fw-bold fs-6 text-gray-500">Toleransi Tinggi (mm)</label>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <span class="fs-5">${row.toleransi_tinggi} mm</span>
                    </div>
                </div>`;
                $('#institutionTabContent .card-toleransi .body-content').html(bodyContent);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
                blockUi.release(), blockUi.destroy();
            }
        });
    }
}
// =======================
// FORM KEJAKSAAN
// =======================
"use strict";
//Class Definition
let table;
var save_method_kejaksaan ;
//Load Datatables SDM
const _loadDtKejaksaan = () => {
    table = $('#dt-kejaksaan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/manage_siteinfo/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.is_show_kejaksaan = true;
            }
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
            { data: 'action', name: 'action', width: "10%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'is_active', name: 'is_active', width: "10%", className: "align-top text-center border px-2" },
            { data: 'provinsi', name: 'provinsi', width: "20%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'kab_kota', name: 'kab_kota', width: "15%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'kode', name: 'kode', width: "10%", className: "align-top border px-2 text-center", orderable: false, searchable: true },
            { data: 'nama', name: 'nama', width: "10%", className: "align-top border px-2" },
            { data: 'tipe', name: 'tipe', width: "10%", className: "align-top border px-2 text-center" },
            { data: 'no_telp', name: 'no_telp', width: "10%", className: "align-top border px-2 text-center", searchable: false },
            { data: 'alamat', name: 'alamat', width: "10%", className: "align-top border px-2", searchable: false },
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
            //Custom Table
            $("#dt-kejaksaan_length select").selectpicker(),
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
    $("#dt-kejaksaan").css("width", "100%");
}
//Close Content Card by Open Method
const _closeCardKejaksaan = (card) => {
    if(card=='form_data') {
        save_method_kejaksaan = '';
        _clearFormDataKejaksaan(), $('#card-form-kejaksaan .card-header .card-title').html('');
    }
    $('#card-form-kejaksaan').hide(), $('#card-data-kejaksaan').show();
}
//Clear Form Data Kejaksaan
const _clearFormDataKejaksaan = () => {
    if (save_method_kejaksaan == "" || save_method_kejaksaan == "add_data") {
        $("#form-data-kejaksaan")[0].reset(), $('[name="id_kejaksaan"]').val("");
        $('#iGroup-isActive').hide();
    } else {
        let idp = $('[name="id_kejaksaan"]').val();
        _editDataKejaksaan(idp);
    }
}
//Add Data
const _addDataKejaksaan = () => {
    save_method_kejaksaan = "add_data";
    _clearFormDataKejaksaan(),
    $("#card-form-kejaksaan .card-header .card-title").html(
        `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-window-plus fs-2 text-gray-900 me-2"></i>Form Tambah Data Kejaksaan</h3>`
    ),
    $("#card-data-kejaksaan").hide(), $("#card-form-kejaksaan").show();
}
//Edit Data
const _editDataKejaksaan = (idp) => {
    save_method_kejaksaan = "update_data";
    $('#form-data-kejaksaan')[0].reset(), $('#iGroup-isActiveKejaksaan').show();
    let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi });
    blockUi.block(), blockUi.destroy();
    //Ajax load from ajax
    $.ajax({
        url: base_url+ 'api/manage_siteinfo/show',
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: 'GET',
        dataType: 'JSON',
        data: {
            is_show_kejaksaan:true,
            idp,
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            if (data.status == true) {
                let row = data.row;
                $('[name="id_kejaksaan"]').val(row.id),
                $('#kode_kejaksaan').val(row.kode);
                $('#nama_kejaksaan').val(row.nama);
                $('#no_telepon').val(row.no_telp);
                $('#tipe').val(row.tipe);
                $('#alamat').val(row.alamat);

                if (row.is_active == 1) {
                    $('#is_active_kejaksaan').prop('checked', true),
                    $('#iGroup-isActiveKejaksaan .form-check-label').text('AKTIF');
                } else {
                    $('#is_active_kejaksaan').prop('checked', false),
                    $('#iGroup-isActiveKejaksaan .form-check-label').text('TIDAK AKTIF');
                }
                $("#card-form-kejaksaan .card-header .card-title").html(
                    `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-pencil-square fs-2 text-gray-900 me-2"></i>Form Edit Kejaksaan</h3>`
                ),
                $("#card-data-kejaksaan").hide(), $("#card-form-kejaksaan").show();
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
$("#btn-save-kejaksaan").on("click", function (e) {
    e.preventDefault();
    $("#btn-save-kejaksaan").attr('data-kt-indicator', 'on').attr('disabled', true);
    let kode_kejaksaan = $("#kode_kejaksaan"),
    nama_kejaksaan = $("#nama_kejaksaan"),
    no_telepon = $("#no_telepon"),
    tipe = $("#tipe"),
    alamat = $("#alamat");

    if (kode_kejaksaan.val() == '') {
        toastr.error('Kode kejaksaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        kode_kejaksaan.focus();
        $('#btn-save-kejaksaan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (nama_kejaksaan.val() == '') {
        toastr.error('Nama kejaksaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        nama_kejaksaan.focus();
        $('#btn-save-kejaksaan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (no_telepon.val() == '') {
        toastr.error('Nomor telepon kejaksaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_telepon.focus();
        $('#btn-save-kejaksaan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (tipe.val() == '') {
        toastr.error('Tipe kejaksaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        tipe.focus();
        $('#btn-save-kejaksaan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (alamat.val() == '') {
        toastr.error('Alamat kejaksaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        alamat.focus();
        $('#btn-save-kejaksaan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    let textConfirmSave = "Simpan perubahan data sekarang ?";
    if (save_method_kejaksaan == "add_data") {
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
            let target = document.querySelector("#card-form-kejaksaan"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($("#form-data-kejaksaan")[0]), ajax_url = base_url+ "api/manage_siteinfo/store";
            if(save_method_kejaksaan == 'update_data') {
                ajax_url = base_url+ "api/manage_siteinfo/update";
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
                    $("#btn-save-kejaksaan").removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    if (data.status == true) {
                        Swal.fire({title: "Success!", text: data.message, icon: "success", allowOutsideClick: false,
                        }).then(function (result) {
                            _closeCardKejaksaan('form_data');
                            $('#dt-kejaksaan').DataTable().ajax.reload( null, false );
                        });
                    } else {
                        Swal.fire({
                            title: "Ooops!",
                            html: data.message,
                            icon: "warning",
                            allowOutsideClick: false,
                        });
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    $("#btn-save-kejaksaan").removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false});
                }
            });
        } else {
            $("#btn-save-kejaksaan").removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
});
//Update Status Data Data
const _updateStatusKejaksaan = (idp, value) => {
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
            let target = document.querySelector('body'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/manage_siteinfo/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_form_kejaksaan: true,
                    is_status: true,
                    idp, value
                }, success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        $('#dt-kejaksaan').DataTable().ajax.reload( null, false );
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-kejaksaan').DataTable().ajax.reload( null, false );
                    });
                }
            });
        }
    });
}


// =======================
// FORM KEJAKSAAN
// =======================
"use strict";
//Class Definition
let table2;
var save_method_pengadilan ;
//Load Datatables Pengadilan
const _loadDtPengadilan = () => {
    table2 = $('#dt-pengadilan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/manage_siteinfo/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.is_show_pengadilan = true;
            }
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
            { data: 'action', name: 'action', width: "10%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'is_active', name: 'is_active', width: "10%", className: "align-top text-center border px-2" },
            { data: 'provinsi', name: 'provinsi', width: "20%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'kab_kota', name: 'kab_kota', width: "15%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'kode', name: 'kode', width: "10%", className: "align-top border px-2 text-center", orderable: false, searchable: true },
            { data: 'nama', name: 'nama', width: "10%", className: "align-top border px-2" },
            { data: 'no_telp', name: 'no_telp', width: "10%", className: "align-top border px-2 text-center", searchable: false },
            { data: 'lat_pos', name: 'lat_pos', width: "10%", className: "align-top border px-2", searchable: false },
            { data: 'lon_pos', name: 'lon_pos', width: "10%", className: "align-top border px-2", searchable: false },
            { data: 'alamat', name: 'alamat', width: "10%", className: "align-top border px-2", searchable: false },
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
            //Custom Table
            $("#dt-pengadilan_length select").selectpicker(),
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
    $("#dt-pengadilan").css("width", "100%");
}
//Close Content Card by Open Method
const _closeCardPengadilan = (card) => {
    if(card=='form_data') {
        save_method_pengadilan = '';
        _clearFormDataPengadilan(), $('#card-form-pengadilan .card-header .card-title').html('');
    }
    $('#card-form-pengadilan').hide(), $('#card-data-pengadilan').show();
}
//Clear Form Data Pengadilam
const _clearFormDataPengadilan = () => {
    if (save_method_pengadilan == "" || save_method_pengadilan == "add_data") {
        $("#form-data-pengadilan")[0].reset(), $('[name="id_pengadilan"]').val("");
        $('#iGroup-isActive').hide();
    } else {
        let idp = $('[name="id_pengadilan"]').val();
        _editDataPengadilan(idp);
    }
}
//Add Data
const _addDataPengadilan = () => {
    save_method_pengadilan = "add_data";
    _clearFormDataPengadilan(),
    $("#card-form-pengadilan .card-header .card-title").html(
        `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-window-plus fs-2 text-gray-900 me-2"></i>Form Tambah Data Pengadilan</h3>`
    ),
    $("#card-data-pengadilan").hide(), $("#card-form-pengadilan").show();
}
//Edit Data
const _editDataPengadilan = (idp) => {
    save_method_pengadilan = "update_data";
    $('#form-data-pengadilan')[0].reset(), $('#iGroup-isActivePengadilan').show();
    let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi });
    blockUi.block(), blockUi.destroy();
    //Ajax load from ajax
    $.ajax({
        url: base_url+ 'api/manage_siteinfo/show',
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: 'GET',
        dataType: 'JSON',
        data: {
            is_show_pengadilan:true,
            idp,
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            if (data.status == true) {
                let row = data.row;
                $('[name="id_pengadilan"]').val(row.id),
                $('#kode_pengadilan').val(row.kode);
                $('#nama_pengadilan').val(row.nama);
                $('#no_telepon_pengadilan').val(row.no_telp);
                $('#alamat_pengadilan').val(row.alamat);
                $('#koordinat_bujur').val(row.lat_pos);
                $('#koordinat_lintang').val(row.lon_pos);

                if (row.is_active == 1) {
                    $('#is_active_pengadilan').prop('checked', true),
                    $('#iGroup-isActivePengadilan .form-check-label').text('AKTIF');
                } else {
                    $('#is_active_pengadilan').prop('checked', false),
                    $('#iGroup-isActivePengadilan .form-check-label').text('TIDAK AKTIF');
                }
                $("#card-form-pengadilan .card-header .card-title").html(
                    `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-pencil-square fs-2 text-gray-900 me-2"></i>Form Edit Pengadilan</h3>`
                ),
                $("#card-data-pengadilan").hide(), $("#card-form-pengadilan").show();
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
$("#form-data-pengadilan input").keyup(function (event) {
    if (event.keyCode == 13 || event.key === "Enter") {
        $("#btn-save-pengadilan").click();
    }
});
//Save Data Form
$("#btn-save-pengadilan").on("click", function (e) {
    e.preventDefault();
    $("#btn-save-pengadilan").attr('data-kt-indicator', 'on').attr('disabled', true);
    let kode_pengadilan = $("#kode_pengadilan"),
    nama_pengadilan = $("#nama_pengadilan"),
    no_telepon_pengadilan = $("#no_telepon_pengadilan"),
    koordinat_bujur = $("#koordinat_bujur"),
    koordinat_lintang = $("#koordinat_lintang"),
    alamat_pengadilan = $("#alamat_pengadilan");

    if (kode_pengadilan.val() == '') {
        toastr.error('Kode pengadilan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        kode_pengadilan.focus();
        $('#btn-save-pengadilan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (nama_pengadilan.val() == '') {
        toastr.error('Nama pengadilan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        nama_pengadilan.focus();
        $('#btn-save-pengadilan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (no_telepon_pengadilan.val() == '') {
        toastr.error('Nomor telepon pengadilan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_telepon_pengadilan.focus();
        $('#btn-save-pengadilan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (koordinat_bujur.val() == '') {
        toastr.error('Koordinat bujur masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        koordinat_bujur.focus();
        $('#btn-save-pengadilan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (koordinat_lintang.val() == '') {
        toastr.error('Koordinat lintang masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        koordinat_lintang.focus();
        $('#btn-save-pengadilan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (alamat_pengadilan.val() == '') {
        toastr.error('Alamat pengadilan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        alamat_pengadilan.focus();
        $('#btn-save-pengadilan').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    let textConfirmSave = "Simpan perubahan data sekarang ?";
    if (save_method_kejaksaan == "add_data") {
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
            let target = document.querySelector("#card-form-pengadilan"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($("#form-data-pengadilan")[0]), ajax_url = base_url+ "api/manage_siteinfo/store";
            if(save_method_pengadilan == 'update_data') {
                ajax_url = base_url+ "api/manage_siteinfo/update";
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
                    $("#btn-save-pengadilan").removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    if (data.status == true) {
                        Swal.fire({title: "Success!", text: data.message, icon: "success", allowOutsideClick: false,
                        }).then(function (result) {
                            _closeCardPengadilan('form_data');
                            $('#dt-pengadilan').DataTable().ajax.reload( null, false );
                        });
                    } else {
                        Swal.fire({
                            title: "Ooops!",
                            html: data.message,
                            icon: "warning",
                            allowOutsideClick: false,
                        });
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    $("#btn-save-pengadilan").removeAttr('data-kt-indicator').attr('disabled', false);
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false});
                }
            });
        } else {
            $("#btn-save-pengadilan").removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
});
//Update Status Data Data
const _updateStatusPengadilan = (idp, value) => {
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
            let target = document.querySelector('body'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/manage_siteinfo/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_form_pengadilan: true,
                    is_status: true,
                    idp, value
                }, success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        $('#dt-pengadilan').DataTable().ajax.reload( null, false );
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-pengadilan').DataTable().ajax.reload( null, false );
                    });
                }
            });
        }
    });
}
// Class Initialization
jQuery(document).ready(function() {
    _loadProfileUppkb('api'), _loadProfileUppkb('api-balai'), _loadProfileUppkb('uppkb'), _loadProfileUppkb('wilayah'), _loadProfileUppkb('korsatpel'), _loadProfileUppkb('toleransi');
    //If Change Tab
    $('#institutionTabMenu li a').on('click', function (e) {
        e.preventDefault();
        let contentType = $(this).attr('href');
        if(contentType == '#profileAplikasi-tab') {
            _loadEditSiteInfo();
        }if(contentType == '#profileUppkb-tab') {
            _loadProfileUppkb('api'), _loadProfileUppkb('api-balai'), _loadProfileUppkb('uppkb'), _loadProfileUppkb('wilayah'), _loadProfileUppkb('korsatpel'), _loadProfileUppkb('toleransi');
        }if(contentType == '#kejaksaan-tab') {
            _loadDtKejaksaan();
        }if(contentType == '#pengadilan-tab') {
            _loadDtPengadilan();
        }
    });
});