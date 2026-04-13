"use strict";
//Class Definition
let save_method;
let table;
//Load Datatables Users
const _loadDtUsers = () => {
    table = $('#dt-users').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/users_access/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.filter_roles = $('#filter_roles').val();
                d.filter_regu = $('#filter_regu').val();
                d.filter_shift = $('#filter_shift').val();
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
            { data: 'no', name: 'no', width: "5%", className: "align-top text-center border px-2", searchable: false },
            { data: 'action', name: 'action', width: "10%", className: "align-top text-center border px-2", orderable: false, searchable: false },
            { data: 'is_active', name: 'is_active', width: "5%", className: "align-top text-center border px-2", searchable: false },
            { data: 'level', name: 'level', width: "5%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'pengguna', name: 'pengguna', width: "20%", className: "align-top border px-2", orderable: false, searchable: true },
            { data: 'regu', name: 'regu', width: "5%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'shift', name: 'shift', width: "5%", className: "align-top text-center border px-2", orderable: false, searchable: true },
            { data: 'nip', name: 'nip', width: "10%", className: "align-top border px-2 text-center" },
            { data: 'last_login', name: 'last_login', width: "10%", className: "align-top border px-2 text-center" },
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
            $("#search-dtUsers").on("keyup", function () {
                table.search(this.value).draw();
                if ($(this).val().length > 0) {
                    $("#clear-searchDtUsers").show();
                } else {
                    $("#clear-searchDtUsers").hide();
                }
            });
            //Clear Search Table
            $("#clear-searchDtUsers").on("click", function () {
                $("#search-dtUsers").val(""),
                table.search("").draw(),
                $("#clear-searchDtUsers").hide();
            });
            //Custom Table
            $("#dt-users_length select").selectpicker(),
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
    $("#dt-users").css("width", "100%"),
    $("#search-dtUsers").val(""),
    $("#clear-searchDtUsers").hide();
}
//Load Selectpicker Role
const loadSelectpicker_role = (value, position) => {
    $.ajax({
        url: base_url+ "api/load_level",
        type: "GET",
        dataType: "JSON",
        data: {
            is_selectrow: true,
            is_roles: true
        },
        success: function (data) {
            if (position == 'filter') {
                let output = '';
                output += '<option value="ALL">SEMUA</option>';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                $('#filter_roles').html(output).selectpicker('refresh').selectpicker('val', value);
            }else{
                let output = '';
                let i;
                for (i = 0; i < data.row.length; i++) {
                    output += '<option value="' + data.row[i].id + '">' + data.row[i].name + '</option>';
                }
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $('#role').html(output).selectpicker('refresh').selectpicker('val', value);
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
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
                $('#regu').html(output).selectpicker('refresh').selectpicker('val', value);
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
                $('#shift').html(output).selectpicker('refresh').selectpicker('val', value);
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
//Load Selectpicker sdm
const loadSelectpicker_sdm = (value) => {
    $.ajax({
        url: base_url+ "api/load_sdm",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            let output = '';
            let i;
            for (i = 0; i < data.row.length; i++) {
                output += '<option value="' + data.row[i].id + '">' + data.row[i].name + ' | ' + data.row[i].jabatan + '</option>';
            }
            if(value !== null && value !== '') {
                value = value.toString();
            }
            $('#fid_sdm').html(output).selectpicker('refresh').selectpicker('val', value);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
//Load detail SDM
const loadDetailSdm = (idp) => {
    $.ajax({
        url: base_url+ "api/load_sdm",
        type: "GET",
        dataType: "JSON",
        data:{
            idp
        },success: function (data) {
            var row = data.row
            var pegawaiFoto = row.foto;
            $(`#detailPegawai`).html(`
                <span class="fs-4 fw-bold text-gray-700"><i class="bi bi-info-circle fs-4 me-1 text-gray-700 align-middle"></i>Informasi Detail Pegawai</span>
                <table class="table table-rounded table-row-bordered bg-light-primary rounded border-primary border border-dashed">
                    <tbody>
                        <tr>
                            <td style="width: 40px">Nama</td>
                            <td style="width: 600px">: `+ row.name +`</td>
                        </tr>
                        <tr>
                            <td style="width: 40px">Email</td>
                            <td style="width: 600px">: `+ row.email +`</td>
                        </tr>
                        <tr>
                            <td style="width: 40px">Pangkat</td>
                            <td style="width: 600px">: `+ row.pangkat +`</td>
                        </tr>
                        <tr>
                            <td style="width: 40px">Jabatan</td>
                            <td style="width: 600px">: `+ row.jabatan +`</td>
                        </tr>
                        <tr>
                            <td style="width: 40px">NIP</td>
                            <td style="width: 600px">: `+ row.nip +`</td>
                        </tr>
                        <tr>
                            <td style="width: 40px">Regu</td>
                            <td style="width: 600px">: `+ row.regu +`</td>
                        </tr>
                        <tr>
                            <td style="width: 40px">Shift</td>
                            <td style="width: 600px">: `+ row.shift +`</td>
                        </tr>
                    </tbody>
                </table>
            `);
        }, complete: function () {
            //Image PopUp
            $('.image-popup').magnificPopup({
                type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true,
                image: {
                    verticalFit: true
                }
            });
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
//Close Content Card by Open Method
const _closeCard = (card) => {
    if(card=='form_user') {
        save_method = '';
        _clearFormUser(), $('#card-formUser .card-header .card-title').html('');
    }
    $('#card-formUser').hide(), $('#card-dtUsers').show();
}
//Clear Form User
const _clearFormUser = () => {
    $('#detailPegawai').html(``);
    if (save_method == "" || save_method == "add_user") {
        $("#form-user")[0].reset(), $('[name="id"]').val(""), loadSelectpicker_role('', 'form'), loadSelectpicker_regu('', 'form');
        $('.password-group').show(), $('#iGroup-isActive').hide();
    } else {
        let idp = $('[name="id"]').val();
        _editUser(idp);
    }
}
//Add User
const _addUser = () => {
    save_method = "add_user";
    _clearFormUser(),
    $("#card-formUser .card-header .card-title").html(
        `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-window-plus fs-2 text-gray-900 me-2"></i>Form Tambah Akses Pengguna</h3>`
    ),
    $("#card-dtUsers").hide(), $("#card-formUser").show();
}
//Edit User
const _editUser = (idp) => {
    save_method = "update_user";
    $('#form-user')[0].reset(), $('.password-group').hide(), $('#iGroup-isActive').show();
    let target = document.querySelector("#card-formUser"), blockUi = new KTBlockUI(target, { message: messageBlockUi });
    blockUi.block(), blockUi.destroy();
    //Ajax load from ajax
    $.ajax({
        url: base_url+ 'api/users_access/show',
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: 'GET',
        dataType: 'JSON',
        data: {
            idp,
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            if (data.status == true) {
                let userInfo = data.row;
                $('[name="id"]').val(userInfo.id),
                loadSelectpicker_role(userInfo.level_id, 'form');
                loadSelectpicker_sdm(userInfo.sdm_id), loadDetailSdm(userInfo.sdm_id);
                $('#username').val(userInfo.username);
                if (userInfo.is_active == 'Y') {
                    $('#is_active').prop('checked', true),
                    $('#iGroup-isActive .form-check-label').text('AKTIF');
                } else {
                    $('#is_active').prop('checked', false),
                    $('#iGroup-isActive .form-check-label').text('TIDAK AKTIF');
                }
                $("#card-formUser .card-header .card-title").html(
                    `<h3 class="fw-bolder fs-2 text-gray-900"><i class="bi bi-pencil-square fs-2 text-gray-900 me-2"></i>Form Edit Akses Pengguna</h3>`
                ),
                $("#card-dtUsers").hide(), $("#card-formUser").show();
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
//Save User by Enter
$("#form-user input").keyup(function (event) {
    if (event.keyCode == 13 || event.key === "Enter") {
        $("#btn-save").click();
    }
});
//Save User Form
$("#btn-save").on("click", function (e) {
    e.preventDefault();
    $("#btn-save").attr('data-kt-indicator', 'on').attr('disabled', true);
    let role = $("#role"),
        fid_sdm = $("#fid_sdm"),
        username = $("#username");

    if (role.val() == '') {
        toastr.error('Role user masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-role button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
			$(this).removeClass('btn-danger').addClass('btn-light');
		});
        role.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (username.val() == '') {
        toastr.error('Username masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        username.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (fid_sdm.val() == '') {
        toastr.error('Pegawai masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-pegawai button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
			$(this).removeClass('btn-danger').addClass('btn-light');
		});
        fid_sdm.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    if(save_method == 'add_user') {
        let pass = $('#pass_user'), repass = $('#repass_user');
        if (pass.val() == '') {
            toastr.error('Password masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            pass.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (pass.val().length < 6) {
            toastr.error('Password tidak boleh kurang dari 6 karakter...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            pass.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (repass.val() == '') {
            toastr.error('Ulangi Password...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            repass.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        } if (pass.val() != repass.val()) {
            toastr.error('Ulangi Password harus sama...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            repass.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    }

    let textConfirmSave = "Simpan perubahan data sekarang ?";
    if (save_method == "add_user") {
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
            let target = document.querySelector("#card-formUser"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($("#form-user")[0]), ajax_url = base_url+ "api/users_access/store";
            if(save_method == 'update_user') {
                ajax_url = base_url+ "api/users_access/update";
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
                            _closeCard('form_user');
                            $('#dt-users').DataTable().ajax.reload( null, false );
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
//Update Status Data User
const _updateStatus = (idp, value) => {
    let textLbl = 'Nonaktifkan';
    if(value=='Y') {
        textLbl = 'Aktifkan';
    }
    let textSwal = textLbl+ ' user sekarang ?';
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
            let target = document.querySelector('#card-dtUsers'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/users_access/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_status: true,
                    idp, value
                }, success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        $('#dt-users').DataTable().ajax.reload( null, false );
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-users').DataTable().ajax.reload( null, false );
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
            let target = document.querySelector('#card-dtUsers'), blockUi = new KTBlockUI(target, { message: messageBlockUi });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/users_access/update",
                headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                type: "POST",
                dataType: "JSON",
                data: {
                    is_deleted: true,
                    idp
                }, success: function (data) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false }).then(function (result) {
                        $('#dt-users').DataTable().ajax.reload( null, false );
                    });
                }, error: function (jqXHR, textStatus, errorThrown) {
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false }).then(function (result) {
                        console.log("Update data is error!");
                        $('#dt-users').DataTable().ajax.reload( null, false );
                    });
                }
            });
        }
    });
}
//Reset User Password
const _resetUserPass = (idp) => {
    $("#form-resetPassword")[0].reset()
    $('#mdl-resetPassword').modal('show'), $('[name="idp_user"]').val(idp);
}
//Save User Form
$("#btn-saveResetPassword").on("click", function (e) {
    e.preventDefault();
    $("#btn-saveResetPassword").attr('data-kt-indicator', 'on').attr('disabled', true);
    let new_password = $("#new_password");

    if (new_password.val() == '') {
        toastr.error('Password baru masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        new_password.focus();
        $('#btn-saveResetPassword').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    let formData = new FormData($("#form-resetPassword")[0]), ajax_url = base_url+ "api/users_access/update";
    $.ajax({
        url: ajax_url,
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        dataType: "JSON",
        success: function (data) {
            $("#btn-saveResetPassword").removeAttr('data-kt-indicator').attr('disabled', false);
            if (data.status == true) {
                Swal.fire({title: "Success!", html: data.message, icon: "success", allowOutsideClick: false,
                }).then(function (result) {
                    $('#mdl-resetPassword').modal('hide');
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
            $("#btn-saveResetPassword").removeAttr('data-kt-indicator').attr('disabled', false);
            Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", icon: "error", allowOutsideClick: false});
        }
    });
});
//Class Initialization
jQuery(document).ready(function() {
    _loadDtUsers(); 
    loadSelectpicker_role('', 'filter'), loadSelectpicker_regu('', 'filter'), loadSelectpicker_shift('', 'filter'),loadSelectpicker_sdm('');
    //Filter Change
    $("#filter_roles").change(function() {
        $('#dt-users').DataTable().ajax.reload( null, false );
    });
    $("#filter_regu").change(function() {
        $('#dt-users').DataTable().ajax.reload( null, false );
    });
    $("#filter_shift").change(function() {
        $('#dt-users').DataTable().ajax.reload( null, false );
    });
    //Filter Change
    $("#fid_sdm").change(function() {
        var value = this.value
        loadDetailSdm(value)
    });
    //Change Check Switch
    $("#is_active").change(function() {
        if(this.checked) {
            $('#iGroup-isActive .form-check-label').text('AKTIF');
        }else{
            $('#iGroup-isActive .form-check-label').text('TIDAK AKTIF');
        }
    });
    //Lock Space Username
	$('.no-space').on('keypress', function (e) {
		return e.which !== 32;
	});
    //Remove White Space in Input No-Space
    $('.no-space').bind('input change', function(){
        $(this).val(function(_, v){
            return v.replace(/\s+/g, '');
        });
    });
    /* [ Show pass ] */
    let showPass = 0;
    $(document).on("mouseenter mouseleave", ".btn-showPass", function (e) {
        if (e.type == "mouseenter") {
            $('.password').attr('type', 'text');
            $('.btn-showPass i').removeClass('las la-eye-slash').addClass('las la-eye');
            $('.btn-showPass').attr('title', 'Tampilkan password');
            showPass = 1;
        } else {
            $('.password').attr('type', 'password');
            $('.btn-showPass i').removeClass('las la-eye').addClass('las la-eye-slash');
            $('.btn-showPass').attr('title', 'Sembunyikan password');
            showPass = 0;
        }
    });
    //Image PopUp
    $('.image-popup').magnificPopup({
        type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true,
        image: {
            verticalFit: true
        }
    });
});
