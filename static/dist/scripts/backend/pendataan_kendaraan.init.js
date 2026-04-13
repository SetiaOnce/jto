let table2, save_method;
//Load Datatables Antrian Kendaraan
const _loadDtAntrianKendaraan = () => {
    table2 = $('#dt-antrianKendaraan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/pendataan/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.is_antrian_data = true;
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
            { data: 'action', name: 'action', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'melanggar', name: 'melanggar', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_kendaraan', name: 'no_kendaraan', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_uji', name: 'no_uji', width: "10%", className: "align-top border px-2 text-center", orderable: false },
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
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
            </select>`,
            oPaginate: {
                sPrevious: "Sebelumnya",
                sNext: "Selanjutnya",
            },
        },
        fnDrawCallback: function (settings, display) {
            $('[data-bs-toggle="tooltip"]').tooltip("dispose"), $(".tooltip").hide();
            //Search Table
            $("#search-dtAntrian").on("keyup", function () {
                table2.search(this.value).draw();
                if ($(this).val().length > 0) {
                    $("#clear-searchDtAntrian").show();
                } else {
                    $("#clear-searchDtAntrian").hide();
                }
            });
            //Clear Search Table
            $("#clear-searchDtAntrian").on("click", function () {
                $("#search-dtAntrian").val(""),
                table2.search("").draw(),
                $("#clear-searchDtAntrian").hide();
            });
            //Custom Table
            $("#dt-antrianKendaraan_length select").selectpicker(),
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
    $("#dt-antrianKendaraan").css("width", "100%"),
    $("#search-dtAntrian").val(""),
    $("#clear-searchDtAntrian").hide();
}
// Load all selectpicker
const loadSelecpicker = (value, bodyId) => {
    if(bodyId == '#sumbu_id'){
        $.ajax({
            url: base_url+ "api/load_sumbu",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true
            },
            success: function (data) {
                let rows = data.row;
                let output = '';
                rows.forEach(row => {
                    output += '<option value="' + row.id + '">' + row.name + '</option>';
                });
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $(bodyId).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(bodyId == '#komodity'){
        $.ajax({
            url: base_url+ "api/load_comodity",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true
            },
            success: function (data) {
                let rows = data.row;
                let output = '';
                rows.forEach(row => {
                    output += '<option value="' + row.id + '">' + row.name + '</option>';
                });
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $(bodyId).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(bodyId == '#jenis_kendaraan_id'){
        $.ajax({
            url: base_url+ "api/load_jenis_kendaraan",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true
            },
            success: function (data) {
                let rows = data.row;
                let output = '';
                rows.forEach(row => {
                    output += '<option value="' + row.id + '">' + row.name + '</option>';
                });
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $(bodyId).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(bodyId == '#kepemilikan_id'){
        $.ajax({
            url: base_url+ "api/load_kepemilikan",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true
            },
            success: function (data) {
                let rows = data.row;
                let output = '';
                rows.forEach(row => {
                    output += '<option value="' + row.id + '">' + row.name + '</option>';
                });
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $(bodyId).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }if(bodyId == '#gol_sim_id'){
        $.ajax({
            url: base_url+ "api/load_gol_sim",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true
            },
            success: function (data) {
                let rows = data.row;
                let output = '';
                rows.forEach(row => {
                    output += '<option value="' + row.id + '">' + row.name + '</option>';
                });
                if(value !== null && value !== '') {
                    value = value.toString();
                }
                $(bodyId).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }
}
//Clear Form Data
const _clearForm = () => {
    $("#form-data")[0].reset();
    loadSelecpicker('', '#sumbu_id');
    loadSelecpicker('', '#jenis_kendaraan_id');
    loadSelecpicker('', '#kepemilikan_id');
    loadSelecpicker('', '#gol_sim_id');
    $('#komoditi_id').val(null).trigger('change');
    $('#asal_kota_id').val(null).trigger('change');
    $('#tujuan_kota_id').val(null).trigger('change');
    $('#pelanggaran_id').val(null).trigger('change');
    $('#jenis_kelamin_pengemudi').selectpicker('refresh').selectpicker('val', 'LAKI-LAKI');
    $('#gambar-kendaraan .depan').html(`<a href="javascript:void(0);" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${base_url}static/dist/img/default-img.png" class="rounded" alt="foto-kendaraan-depan" title="Foto kendaraan depan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Depan</h6>`);
    $('#gambar-kendaraan .belakang').html(`<a href="javascript:void(0);" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${base_url}static/dist/img/default-img.png" class="rounded" alt="foto-kendaraan-belakang" title="Foto kendaraan belakang" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Belakang</h6>`);
    $('#gambar-kendaraan .kiri').html(`<a href="javascript:void(0);" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${base_url}static/dist/img/default-img.png" class="rounded" alt="foto-kendaraan-kiri" title="Foto kendaraan kiri" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kiri</h6>`);
    $('#gambar-kendaraan .kanan').html(`<a href="javascript:void(0);" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${base_url}static/dist/img/default-img.png" class="rounded" alt="foto-kendaraan-kanan" title="Foto kendaraan kanan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kanan</h6>`);
    $('#iGroup-isFormSuratTilang').hide();
}
//Save User by Enter
$("#form-data input").keyup(function (event) {
    if (event.keyCode == 13 || event.key === "Enter") {
        $("#btn-save").click();
    }
});
//Save User Form
$("#btn-save").on("click", function (e) {
    e.preventDefault();
    $("#btn-save").attr('data-kt-indicator', 'on').attr('disabled', true);
    let no_kendaraan = $("#no_kendaraan"),
        no_uji = $("#no_uji"),
        masa_berlaku_uji = $("#masa_berlaku_uji"),
        jenis_kendaraan_id = $("#jenis_kendaraan_id"),
        kepemilikan_id = $("#kepemilikan_id"),
        jbi = $("#jbi"),
        sumbu_id = $("#sumbu_id"),
        nama_pemilik = $("#nama_pemilik"),
        alamat_pemilik = $("#alamat_pemilik"),
        komoditi_id = $("#komoditi_id"),
        asal_kota_id = $("#asal_kota_id"),
        tujuan_kota_id = $("#tujuan_kota_id"),
        nomor_surat_jalan = $("#nomor_surat_jalan"),
        pemilik_komoditi = $("#pemilik_komoditi"),
        alamat_pemilik_komoditi = $("#alamat_pemilik_komoditi"),
        gandengan = $("#gandengan"),

        nama_pengemudi = $("#nama_pengemudi"),
        alamat_pengemudi = $("#alamat_pengemudi"),
        jenis_kelamin_pengemudi = $("#jenis_kelamin_pengemudi"),
        umur_pengemudi = $("#umur_pengemudi"),
        no_telepon = $("#no_telepon"),
        warna_kendaraan = $("#warna_kendaraan"),
        gol_sim_id = $("#gol_sim_id"),
        no_identitas = $("#no_identitas");

    if (no_kendaraan.val() == '') {
        toastr.error('Nomor kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_kendaraan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (no_uji.val() == '') {
        toastr.error('Nomor uji masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_uji.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (masa_berlaku_uji.val() == '') {
        toastr.error('Masa berlaku uji masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        masa_berlaku_uji.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (jbi.val() == '') {
        toastr.error('JBI masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        jbi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (jenis_kendaraan_id.val() == '') {
        toastr.error('Jenis Kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-jenisKendaraan button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger').addClass('btn-light');
        });
        jenis_kendaraan_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (sumbu_id.val() == '') {
        toastr.error('Sumbu masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-sumbu button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger').addClass('btn-light');
        });
        sumbu_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (kepemilikan_id.val() == '') {
        toastr.error('Kepemilikan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-kepemilikan button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger').addClass('btn-light');
        });
        kepemilikan_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (nama_pemilik.val() == '') {
        toastr.error('Nama pemilik masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        nama_pemilik.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (alamat_pemilik.val() == '') {
        toastr.error('Alamat pemilik masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        alamat_pemilik.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    
    // Validation KOmoditi dan asal tujuan
    if (komoditi_id.val() == '' || komoditi_id.val() == null) {
        toastr.error('Komoditi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-komoditi button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger').addClass('btn-light');
        });
        komoditi_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (asal_kota_id.val() == '' || asal_kota_id.val() == null) {
        toastr.error('Asal kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-asal button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger').addClass('btn-light');
        });
        asal_kota_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (tujuan_kota_id.val() == '' || tujuan_kota_id.val() == null) {
        toastr.error('Tujuan kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-asal button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger').addClass('btn-light');
        });
        tujuan_kota_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (nomor_surat_jalan.val() == '') {
        toastr.error('Nomor surat jalan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        nomor_surat_jalan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (pemilik_komoditi.val() == '') {
        toastr.error('Pemilik komoditi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        pemilik_komoditi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (alamat_pemilik_komoditi.val() == '') {
        toastr.error('Alamat pemilik komoditi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        alamat_pemilik_komoditi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    // Validation informasi pengemudi
    if (nama_pengemudi.val() == '') {
        toastr.error('Nama pengemudi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        nama_pengemudi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (alamat_pengemudi.val() == '') {
        toastr.error('Alamat pengemudi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        alamat_pengemudi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (jenis_kelamin_pengemudi.val() == '') {
        toastr.error('Jenis kelamin masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        jenis_kelamin_pengemudi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (umur_pengemudi.val() == '') {
        toastr.error('Umur pengemudi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        umur_pengemudi.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (no_telepon.val() == '') {
        toastr.error('Nomor telepon masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_telepon.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (warna_kendaraan.val() == '') {
        toastr.error('Warna kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        warna_kendaraan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (gol_sim_id.val() == '') {
        toastr.error('Gol SIM/Identitas masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        gol_sim_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (no_identitas.val() == '') {
        toastr.error('Nomor SIM/Identitas masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_identitas.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    // if (panjang_kendaraan.val() == '') {
    //     toastr.error('Panjang kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
    //     panjang_kendaraan.focus();
    //     $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
    //     return false;
    // }if (lebar_kendaraan.val() == '') {
    //     toastr.error('Lebar kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
    //     lebar_kendaraan.focus();
    //     $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
    //     return false;
    // }if (tinggi_kendaraan.val() == '') {
    //     toastr.error('Tinggi kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
    //     tinggi_kendaraan.focus();
    //     $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
    //     return false;
    // }

    let textConfirmSave = "Simpan antrian ?";
    let confirmButtonText = "Simpan";
    Swal.fire({
        title: "",
        html: textConfirmSave,
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: confirmButtonText,
        cancelButtonText: "Batal",
    }).then((result) => {
        if (result.value) {
            let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($("#form-data")[0]), ajax_url = base_url+ "api/pendataan/store";
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
                            _clearForm();
                        });
                    } else {
                        Swal.fire({
                            title: "Ooops!",
                            html: data.message,
                            icon: "warning",
                            allowOutsideClick: false,
                        }).then(function (result) {
  
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
//Check noken by Enter
$("#no_kendaraan").keyup(function (event) {
    if (event.keyCode == 13 || event.key === "Enter") {
        $("#btn-searchNoken").click();
    }
});
//Check Nomor Kendaraan
$("#btn-searchNoken").on("click", function (e) {
    e.preventDefault();
    var no_kendaraan = $('#no_kendaraan')
    if (no_kendaraan.val() == '') {
        toastr.error('Masukkan no kendaraan, contoh: B11111TYS', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        no_kendaraan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/pendataan/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_check_noken: true,
            no_kendaraan: $('#no_kendaraan').val()
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            var  row = data.row;
            if(data.status ==true){
                // Hidden form
                $('#foto_depan_url').val(row.foto_depan_url)
                $('#foto_belakang_url').val(row.foto_belakang_url)
                $('#foto_kiri_url').val(row.foto_kiri_url)
                $('#foto_kanan_url').val(row.foto_kanan_url)
                $('#jbb_uji').val(row.jbb)
                $('#jbkb_uji').val(row.jbkb)
                $('#mst_uji').val(row.mst)
                $('#jenis_kendaraan_nama').val(row.jenis_kend)
                $('#sumbu_nama').val(row.konfigurasi_sumbu)
                $('#tanggal_uji').val(row.tanggal_uji)
                // Informasi dimensi
                $('#panjang_utama').val(row.panjang_utama),
                $('#lebar_utama').val(row.lebar_utama),
                $('#tinggi_utama').val(row.tinggi_utama),
                $('#julur_depan').val(row.julur_depan),
                $('#julur_belakang').val(row.julur_belakang),
                // Informasi detail kendaraan
                $('#no_kendaraan').val(row.no_reg_kend),
                $('#no_uji').val(row.no_uji),
                $('#nama_pemilik').val(row.nama_pemilik),
                $('#alamat_pemilik').val(row.alamat_pemilik),
                $('#jbi').val(row.jbi),                
                loadSelecpicker(row.sumbu_id, '#sumbu_id');
                loadSelecpicker(row.jenis_kendaraan_id, '#jenis_kendaraan_id');
                loadSelecpicker(row.kepemilikan_id, '#kepemilikan_id');
                const dateObj = new Date(row.masa_berlaku_uji);
                const formattedDate = dateObj.toLocaleDateString("en-GB");
                $("#masa_berlaku_uji").flatpickr({
                    dateFormat: "d/m/Y",
                    defaultDate: formattedDate,
                });

                // KOMODITI ASAL TUJUAN & PENGEMUDI
                if(row.get_komoditi){
                    var komoditi = row.get_komoditi;
                    // KOMODITI ASAL TUJUAN
                    let komoditiSelected = new Option(komoditi.komoditi_val, komoditi.komoditi_id, true, true);
                    $("#komoditi_id").append(komoditiSelected).trigger("change");
                    let asalSelected = new Option(komoditi.asal_kota_val, komoditi.asal_kota_id, true, true);
                    $("#asal_kota_id").append(asalSelected).trigger("change");
                    let tujuanSelected = new Option(komoditi.tujuan_kota_val, komoditi.tujuan_kota_id, true, true);
                    $("#tujuan_kota_id").append(tujuanSelected).trigger("change");
                    $('#nomor_surat_jalan').val(komoditi.no_surat_jalan);
                    $('#pemilik_komoditi').val(komoditi.pemilik_komoditi);
                    $('#alamat_pemilik_komoditi').val(komoditi.alamat_pemilik_komoditi);
                    // SOPIR
                    $('#nama_pengemudi').val(komoditi.nama_pengemudi);
                    $('#alamat_pengemudi').val(komoditi.alamat_pengemudi);
                    $('#jenis_kelamin_pengemudi').selectpicker('refresh').selectpicker('val', komoditi.jenis_kelamin);
                    $('#umur_pengemudi').val(komoditi.umur_pengemudi);
                    $('#no_telepon').val(komoditi.no_telepon);
                    $('#warna_kendaraan').val(komoditi.warna_kendaraan);
                    loadSelecpicker(komoditi.gol_sim_id, '#gol_sim_id');
                    $('#no_identitas').val(komoditi.no_sim);
                }else{
                    console.log('KOMODITI TIDAK ADA');
                }
                
                $('#gambar-kendaraan .depan').html(`<a class="image-popup" href="${row.foto_depan_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_depan_url}" class="rounded" alt="foto-kendaraan-depan" title="Foto kendaraan depan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Depan</h6>`);
                $('#gambar-kendaraan .belakang').html(`<a class="image-popup" href="${row.foto_belakang_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_belakang_url}" class="rounded" alt="foto-kendaraan-belakang" title="Foto kendaraan belakang" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Belakang</h6>`);
                $('#gambar-kendaraan .kiri').html(`<a class="image-popup" href="${row.foto_kiri_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_kiri_url}" class="rounded" alt="foto-kendaraan-kiri" title="Foto kendaraan kiri" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kiri</h6>`);
                $('#gambar-kendaraan .kanan').html(`<a class="image-popup" href="${row.foto_kanan_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_kanan_url}" class="rounded" alt="foto-kendaraan-kanan" title="Foto kendaraan kanan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kanan</h6>`);
                
                toastr.success(data.message, 'Success!', {"progressBar": true, "timeOut": 2500});
            }else{
                _clearForm()
                toastr.error(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
                no_kendaraan.focus();
            }
        }, complete: function (jqXHR, textStatus, errorThrown) {
            $('[data-bs-toggle="tooltip"]').tooltip({
                trigger: "hover"
            }).on("click", function () {
                $(this).tooltip("hide");
            });
            $('.image-popup').magnificPopup({
                type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true,
                image: {
                    verticalFit: true
                }
            });
        }, error: function (jqXHR, textStatus, errorThrown) {
            blockUi.release(), blockUi.destroy();
            console.log('Load data is error');
        }
    });
})
// delete data Antrian
const deleteData = (idp) => {
    Swal.fire({
        title: "",
        html: 'Yakin ingin menghapus antrian ini?',
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: "Batal",
    }).then((result) => {
        if (result.value) {
            $.ajax({
                url: base_url+ "api/pendataan/delete",
                type: "GET",
                dataType: "JSON",
                data: {
                    is_delete_antrian: true,
                    idp: idp
                },
                success: function (data) {
                    if (data.status == true) {
                        Swal.fire({title: "Success!", text: data.message, icon: "success", allowOutsideClick: false,
                        }).then(function (result) {
                            $('#dt-antrianKendaraan').DataTable().ajax.reload( null, false );
                        });
                    }else{
                        toastr.error(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
                        $('#dt-antrianKendaraan').DataTable().ajax.reload( null, false );
                    }
                }, error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Load data is error');
                }
            });
        }
    });
}
//Class Initialization
jQuery(document).ready(function() {
    loadSelecpicker('', '#sumbu_id');
    loadSelecpicker('', '#jenis_kendaraan_id');
    loadSelecpicker('', '#kepemilikan_id');
    loadSelecpicker(10, '#gol_sim_id');
    // loadSelecpicker('', '#komodity');
    // $("#masa_berlaku_uji").flatpickr({
    //     dateFormat: "d/m/Y"
    // });
    $("#masa_berlaku_uji").mask("99/99/9999", {
        placeholder: "dd/mm/yyyy"
    });
    $('#komoditi_input').on('input', function(){
        if(this.value != '' || this.value != null){
            loadSelecpicker('', '#komodity');
        }
    })
    // mask
    $('.number-only').mask('00000000000');
    //Lock Space
	$('.no-space').on('keypress', function (e) {
		return e.which !== 32;
	});
    $('[data-bs-toggle="tooltip"]').tooltip({
        trigger: "hover"
    }).on("click", function () {
        $(this).tooltip("hide");
    });
    $('.image-popup').magnificPopup({
        type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true,
        image: {
            verticalFit: true
        }
    });
    //Change Check Switch
    $("#is_already_tilang").change(function() {
        if(this.checked) {
            $('#iGroup-isAlreadyTilang .form-check-label').text('YA');
            $('#iGroup-isFormSuratTilang').show();
        }else{
            $('#iGroup-isAlreadyTilang .form-check-label').text('TIDAK');
            $('#iGroup-isFormSuratTilang').hide();
        }
    });
    //Change Check Switch
    $("#gandengan").change(function() {
        if(this.checked) {
            $('#iGroup-isGandengan .form-check-label').text('YA');
        }else{
            $('#iGroup-isGandengan .form-check-label').text('TIDAK');
        }
    });
    // Load komoditi
    $('#komoditi_id').select2({
        placeholder: "Pilih komoditi...",
        minimumInputLength: 0,
        ajax: {
            url: base_url + "api/load_komoditi",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term || '',
                    page: params.page || 1
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data.results.map(item => ({
                        id: item.id,
                        text: item.name
                    })),
                    pagination: {
                        more: data.has_next
                    }
                };
            },
            cache: true
        }
    });
    // Load kota asal
    $('#asal_kota_id').select2({
        placeholder: "Pilih asal pengiriman...",
        minimumInputLength: 0,
        ajax: {
            url: base_url + "api/load_kab_kota",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term || '',
                    page: params.page || 1
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data.results.map(item => ({
                        id: item.id,
                        text: item.name
                    })),
                    pagination: {
                        more: data.has_next
                    }
                };
            },
            cache: true
        }
    });
    // Load kota tujuan
    $('#tujuan_kota_id').select2({
        placeholder: "Pilih tujuan pengiriman...",
        minimumInputLength: 0,
        ajax: {
            url: base_url + "api/load_kab_kota",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term || '',
                    page: params.page || 1
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data.results.map(item => ({
                        id: item.id,
                        text: item.name
                    })),
                    pagination: {
                        more: data.has_next
                    }
                };
            },
            cache: true
        }
    });
    // Load jenis pelangagran
    $('#pelanggaran_id').select2({
        placeholder: "-",
        minimumInputLength: 0,
        ajax: {
            url: base_url + "api/load_jenis_pelanggaran",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term || '',
                    page: params.page || 1
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data.results.map(item => ({
                        id: item.id,
                        text: item.name
                    })),
                    pagination: {
                        more: data.has_next
                    }
                };
            },
            cache: true
        }
    });
    // Load Pendataan
    $("#btn-loadPendataan").click(function() {
        _loadDtAntrianKendaraan();
        $('#mdl-pendataan').modal('show');
    });
});