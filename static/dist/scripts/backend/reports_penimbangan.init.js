var table;
"use strict";
//Class Definition
const _loadWidget = () => {
    $.ajax({
        url: base_url+ 'api/laporan_penimbangan/show',
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: "GET",
        dataType: "JSON",
        data: {
            is_widget: true,
            search : $('#search-data').val(),
            filter_shift : $('#filter_shift').val(),
            filter_regu : $('#filter_regu').val(),
            filter_timbangan : $('#filter_timbangan').val(),
            filter_date : $('#filter_date').val(),
        },
        success: function(data){
            var rows = data.row
            $('#widget-01 .kendaraan_timbang').html(rows.kendaraan_timbang)
            $('#widget-01 .kendaraan_melanggar').html(rows.kendaraan_melanggar)
            $('#widget-01 .kendaraan_tidak_melanggar').html(rows.kendaraan_tidak_melanggar)
            $('#widget-01 .persentase_kendaraan_melanggar').html(`${rows.persentase_kendaraan_melanggar} %`)
            $('#widget-01 .persentase_kendaraan_tidak_melanggar').html(`${rows.persentase_kendaraan_tidak_melanggar} %`)
        }, error: function (jqXHR, textStatus, errorThrown){
            Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang...", icon: "error"}).then(function(result){
                console.log("Load data is error!");
            });
        }
    });
}
const _loadDtKendaraan = () => {
    table = $('#dt-penimbangan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/laporan_penimbangan/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.filter_shift = $('#filter_shift').val();
                d.filter_regu = $('#filter_regu').val();
                d.filter_timbangan = $('#filter_timbangan').val();
                d.filter_date = $('#filter_date').val();
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
            // { data: 'action', name: 'action', className: "align-top border px-2 text-center", width: "5%", orderable: false },
            { data: 'status', name: 'status', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'melanggar', name: 'melanggar', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'waktu', name: 'waktu', className: "align-top border px-2 text-center", width: "10%" },
            { data: 'timbangan', name: 'timbangan', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'foto_depan', name: 'foto_depan', className: "align-top border px-2 text-center", width: "10%", orderable: false },
            { data: 'foto_belakang', name: 'foto_belakang', className: "align-top border px-2 text-center", width: "10%", orderable: false },
            { data: 'no_kendaraan', name: 'no_kendaraan', className: "align-top border px-2 text-center", width: "8%" },
            { data: 'no_uji', name: 'no_uji', className: "align-top border px-2 text-center", width: "8%" },
            { data: 'masa_berlaku_uji', name: 'masa_berlaku_uji', className: "align-top border px-2 text-center", width: "8%" },
            { data: 'jenis_kendaraan', name: 'jenis_kendaraan', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'sumbu', name: 'sumbu', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'jbi', name: 'jbi', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'berat_timbang', name: 'berat_timbang', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'kelebihan_berat', name: 'kelebihan_berat', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'prosen_lebih', name: 'prosen_lebih', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'toleransi', name: 'toleransi', className: "align-top border px-2 text-center", width: "5%" },

            { data: 'panjang_utama', name: 'panjang_utama', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'lebar_utama', name: 'lebar_utama', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'tinggi_utama', name: 'tinggi_utama', className: "align-top border px-2 text-center", width: "5%" },
            
            { data: 'panjang_ukur', name: 'panjang_ukur', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'lebar_ukur', name: 'lebar_ukur', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'tinggi_ukur', name: 'tinggi_ukur', className: "align-top border px-2 text-center", width: "5%" },
            
            { data: 'panjang_lebih', name: 'panjang_lebih', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'lebar_lebih', name: 'lebar_lebih', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'tinggi_lebih', name: 'tinggi_lebih', className: "align-top border px-2 text-center", width: "5%" },

            { data: 'komoditi', name: 'komoditi', className: "align-top border px-2", width: "6%" },
            { data: 'asal_tujuan', name: 'asal_tujuan', className: "align-top border px-2", width: "6%" },
            { data: 'pelanggaran', name: 'pelanggaran', className: "align-top border px-2", width: "6%" },
            { data: 'regu', name: 'regu', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'shift', name: 'shift', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'operator', name: 'operator', className: "align-top border px-2 text-center", width: "7%" },
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
            $("#search-data").on("keyup", function () {
                table.search(this.value).draw();
                _loadWidget()
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
                _loadWidget()
                $("#clear-searchData").hide();
            });
            //Custom Table
            $("#dt-penimbangan_length select").selectpicker(),
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
    $("#dt-penimbangan").css("width", "100%"),
    $("#search-data").val(""),
    $("#clear-searchData").hide();
}
const loadSelectpicker = (value, element_id) => {
    if (element_id == '#filter_regu') {   
        $.ajax({
            url: base_url+ "api/load_regu",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true,
                is_regu: true
            },
            success: function (data) {
                let i;
                var output;
                output += '<option value="ALL">SEMUA</option>';
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
    }if (element_id == '#filter_regu_penindakan') {   
        $.ajax({
            url: base_url+ "api/load_regu",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true,
                is_regu: true
            },
            success: function (data) {
                let i;
                var output;
                output += '<option value="ALL">SEMUA</option>';
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
    }if(element_id == '#filter_shift'){
        $.ajax({
            url: base_url+ "api/load_shift",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true,
                is_shift: true
            },
            success: function (data) {
                let i;
                var output;
                output += '<option value="ALL">SEMUA</option>';
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
    }if(element_id == '#filter_timbangan'){
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
                output += '<option value="ALL">SEMUA</option>';
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
    }if(element_id == '#filter_sanksi_penindakan'){
        $.ajax({
            url: base_url+ "api/load_sanksi",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true
            },
            success: function (data) {
                let rows = data.results;
                let output = '';
                output += '<option value="ALL">SEMUA</option>';
                rows.forEach(row => {
                    output += '<option value="' + row.id + '">' + row.name + '</option>';
                });
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
const sendDataPenimbangan = (idp_penimbangan) => {
    let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/send_data/send",
        type: "GET",
        dataType: "JSON",
        data: {
            is_send_penimbangan: true,
            kendaraan_id: idp_penimbangan
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            if(data.status ==true){
                table.draw();
                toastr.success(data.message, 'Success!', {"progressBar": true, "timeOut": 2500});
            }else{
                toastr.error(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            blockUi.release(), blockUi.destroy();
            console.log('Load data is error');
        }
    });
}
// Class Initialization
jQuery(document).ready(function() {
    // Export Excel
    $("#export_excel").on("click", function () {
        var search = $('#search-data').val();
        var filter_shift = $('#filter_shift').val();
        var filter_regu = $('#filter_regu').val();
        var filter_timbangan = $('#filter_timbangan').val();
        var filter_date = $('#filter_date').val();
        const url = `${base_url}laporan_penimbangan/export?export_type=excel&search=${search}&filter_shift=${filter_shift}&filter_regu=${filter_regu}&filter_timbangan=${filter_timbangan}&filter_date=${filter_date}`;
        window.location.href = url;
    });
    // Export pdf
    $("#export_pdf").on("click", function () {
        var search = $('#search-data').val();
        var filter_shift = $('#filter_shift').val();
        var filter_regu = $('#filter_regu').val();
        var filter_timbangan = $('#filter_timbangan').val();
        var filter_date = $('#filter_date').val();
        const url = `${base_url}laporan_penimbangan/export?export_type=pdf&search=${search}&filter_shift=${filter_shift}&filter_regu=${filter_regu}&filter_timbangan=${filter_timbangan}&filter_date=${filter_date}`;
        window.location.href = url;
    });

    // Selectpicker
    loadSelectpicker(0, '#filter_shift')
    loadSelectpicker(0, '#filter_regu')
    loadSelectpicker(0, '#filter_timbangan')
    loadSelectpicker(0, '#filter_regu_penindakan')
    loadSelectpicker(0, '#filter_sanksi_penindakan')
    // Custom Filter Date + Time
    var start = moment().startOf('day');   // hari ini jam 00:00
    var end   = moment().endOf('day');     // hari ini jam 23:59
    function cb(start, end) {
        $("#filter_date").html(
            start.format("DD/MM/YYYY HH:mm") + " - " + end.format("DD/MM/YYYY HH:mm")
        );
    }
    $("#filter_date").daterangepicker({
        startDate: start,
        endDate: end,
        timePicker: true,              // 🔥 aktifkan jam
        timePicker24Hour: true,        // format 24 jam
        timePickerIncrement: 1,        // interval menit
        locale: {
            format: "DD/MM/YYYY HH:mm"
        },
        ranges: {
            "Hari Ini": [
                moment().startOf('day'),
                moment().endOf('day')
            ],
            "Kemarin": [
                moment().subtract(1, "days").startOf('day'),
                moment().subtract(1, "days").endOf('day')
            ],
            "7 Hari Terakhir": [
                moment().subtract(6, "days").startOf('day'),
                moment().endOf('day')
            ],
            "30 Hari Terakhir": [
                moment().subtract(29, "days").startOf('day'),
                moment().endOf('day')
            ],
            "Bulan Ini": [
                moment().startOf("month").startOf('day'),
                moment().endOf("month").endOf('day')
            ],
            "Bulan Lalu": [
                moment().subtract(1, "month").startOf("month").startOf('day'),
                moment().subtract(1, "month").endOf("month").endOf('day')
            ]
        }
    }, cb);
    cb(start, end);

    setTimeout(function () {
        $("#filter-penimbangan-reload").click();
    }, 100); 
    $('#filter-penimbangan-reload').click(_loadDtKendaraan);
    $('#filter-penimbangan-reload').click(_loadWidget);
});