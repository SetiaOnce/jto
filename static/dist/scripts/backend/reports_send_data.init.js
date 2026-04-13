var table, table2;
const _loadDtKendaraan = () => {
    table = $('#dt-penimbangan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/send_data/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.filter_tujuan = $('#filter_tujuan').val();
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
            { data: 'action', name: 'action', className: "align-top border px-2 text-center", width: "5%", orderable: false },
            // { data: 'status', name: 'status', className: "align-top border px-2 text-center", width: "5%" },
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
            { data: 'komoditi', name: 'komoditi', className: "align-top border px-2", width: "6%" },
            { data: 'asal_tujuan', name: 'asal_tujuan', className: "align-top border px-2", width: "6%" },
            { data: 'pelanggaran', name: 'pelanggaran', className: "align-top border px-2 text-center", width: "6%" },
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
            $("#search-dt").on("keyup", function () {
                table.search(this.value).draw();
                if ($(this).val().length > 0) {
                    $("#clear-searchDt").show();
                } else {
                    $("#clear-searchDt").hide();
                }
            });
            //Clear Search Table
            $("#clear-searchDt").on("click", function () {
                $("#search-dt").val(""),
                table.search("").draw(),
                $("#clear-searchDt").hide();
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
    $("#search-dt").val(""),
    $("#clear-searchDt").hide();
}
const _loadDtPenindakan = () => {
    table2 = $('#dt-penindakan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/send_data/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.is_show_penindakan = true
                d.filter_tujuan = $('#filter_tujuan_penindakan').val();
                d.filter_date = $('#filter_date_penindakan').val()
                d.filter_regu = $('#filter_regu_penindakan').val()
                d.filter_sanksi = $('#filter_sanksi_penindakan').val()
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
            { data: 'action', name: 'action', width: "5%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_kendaraan', name: 'no_kendaraan', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'waktu', name: 'waktu', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'sanksi', name: 'sanksi', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'regu', name: 'regu', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'kategori_jenis_kendaraan', name: 'kategori_jenis_kendaraan', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'nama_ppns', name: 'nama_ppns', width: "10%", className: "align-top border px-2", orderable: false },
            { data: 'pelanggaran', name: 'pelanggaran', width: "30%", className: "align-top border px-2", orderable: false },
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
            $("#search-dtPenimbangan").on("keyup", function () {
                table2.search(this.value).draw();
                if ($(this).val().length > 0) {
                    $("#clear-searchDtPenimbangan").show();
                } else {
                    $("#clear-searchDtPenimbangan").hide();
                }
            });
            //Clear Search Table
            $("#clear-searchDtPenimbangan").on("click", function () {
                $("#search-dtPenimbangan").val(""),
                table2.search("").draw(),
                $("#clear-searchDtPenimbangan").hide();
            });
            //Custom Table
            $("#dt-penindakan_length select").selectpicker(),
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
    $("#dt-penindakan").css("width", "100%"),
    $("#search-dt").val(""),
    $("#clear-searchDt").hide();
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
            filter_tujuan: $('#filter_tujuan').val(),
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
const sendDataPenindakan = (idp_penindakan) => {
    let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/send_data/send",
        type: "GET",
        dataType: "JSON",
        data: {
            is_send_penindakan: true,
            filter_tujuan: $('#filter_tujuan_penindakan').val(),
            penindakan_id: idp_penindakan
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            if(data.status ==true){
                table2.draw();
                toastr.success(data.message, 'Success!', {"progressBar": true, "timeOut": 2500});
            }else{
                toastr.error(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
                no_kendaraan.focus();
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            blockUi.release(), blockUi.destroy();
            console.log('Load data is error');
        }
    });
}
// Class Initialization
jQuery(document).ready(function() {
    // Selectpicker
    loadSelectpicker(0, '#filter_shift')
    loadSelectpicker(0, '#filter_regu')
    loadSelectpicker(0, '#filter_timbangan')
    loadSelectpicker(0, '#filter_regu_penindakan')
    loadSelectpicker(0, '#filter_sanksi_penindakan')
    // Custom Filter Date
    var start = moment().subtract(29, "days");
    var end = moment();
    function cb(start, end) {
        $("#filter_date, #filter_date_penindakan").html(start.format("DD/MM/YYYY") + " - " + end.format("DD/MM/YYYY"));
    }
    $("#filter_date, #filter_date_penindakan").daterangepicker({
        startDate: start,
        endDate: end,
        locale: {
            format: "DD/MM/YYYY"
        },
        ranges: {
            "Hari Ini": [moment(), moment()],
            "Kemarin": [moment().subtract(1, "days"), moment().subtract(1, "days")],
            "7 Hari Terakhir": [moment().subtract(6, "days"), moment()],
            "30 Hari Terakhir": [moment().subtract(29, "days"), moment()],
            "Bulan Ini": [moment().startOf("month"), moment().endOf("month")],
            "Bulan lalu": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
        }
    }, cb);
    cb(start, end);
    setTimeout(function () {
        $("#filter-penimbangan-reload").click();
        $("#filter-penindaakan-reload").click();
    }, 100); 
    $('#filter-penimbangan-reload').click(_loadDtKendaraan);
    $('#filter-penindaakan-reload').click(_loadDtPenindakan);
});



