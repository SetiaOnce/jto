"use strict";
//Class Definition
var AppDashboard = function() {
    var _loadWidget = function() {
        $.ajax({
            url: base_url+ 'api/dashboard/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: "GET",
            dataType: "JSON",
            data: {
                is_widget: true,
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
    function getBaseChartOptions() {
        return {
        series: [],
        chart: {
            fontFamily: "inherit",
            type: "line",
            height: 230,

            // ✅ ini yang bikin export ikut biru (bukan putih)
            background: "#074799",
            foreColor: "#ffffff",

            toolbar: {
            show: true,
            tools: { download: true }
            },
            zoom: { enabled: false }
        },

        stroke: {
            show: true,
            curve: "smooth",
            width: 2
        },

        markers: { size: 0 },

        dataLabels: {
            enabled: true,
            textAnchor: "start",
            formatter: (val) => val,
            offsetX: 0,
            style: { fontSize: "10px" }
        },

        xaxis: {
            categories: [],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
            style: { colors: "#ffffff", fontSize: "9px" }
            }
        },

        yaxis: {
            labels: {
            style: { colors: "#ffffff", fontSize: "9px" },
            formatter: (val) => val
            }
        },

        legend: {
            labels: { colors: "#ffffff" }
        },

        grid: {
            borderColor: "rgba(255,255,255,0.25)",
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },

        fill: { opacity: 1 },

        tooltip: {
            style: { fontSize: "9px" },
            theme: "dark",
            y: { formatter: (val) => val }
        }
        };
    }
    function loadTrendChart(chartInstance, targetDivId, requestParams) {
        $.ajax({
            url: base_url + 'api/dashboard/show',
            headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
            type: "GET",
            dataType: "JSON",
            data: requestParams,
            success: function (data) {
                let rows = data.row;
                let options = {
                    series: rows.chart,
                    title: {
                        text: rows.title,
                        align: 'center',
                        style: {
                            fontSize: '15px',
                            fontWeight: 'bold',
                            color: '#ffffff'
                        }
                    },
                    xaxis: {
                        categories: rows.categories.data || rows.categories,
                        labels: { style: { colors: '#ffffff' } }
                    },
                    yaxis: {
                        labels: { style: { colors: '#ffffff' } }
                    },
                    legend: {
                        labels: { colors: '#ffffff' }
                    },
                    tooltip: {
                        style: { fontSize: '12px', color: '#ffffff' }
                    }
                };
                chartInstance.updateOptions(options);
            },
            error: function () {
                Swal.fire({
                    title: "Ooops!",
                    text: "Terjadi kesalahan, mohon hubungi pengembang...",
                    icon: "error"
                });
            }
        });
    }
    return {
        // public functions
        init: function() {
            _loadWidget();
            // Init and render chart 01
            let chart01 = new ApexCharts(document.getElementById('chart_trend01'), getBaseChartOptions());
            chart01.render();
            loadTrendChart(chart01, 'chart_trend01', {
                is_trend: true,
                is_riwayat_today: true
            });

            // Init and render chart 02
            let chart02 = new ApexCharts(document.getElementById('chart_trend02'), getBaseChartOptions());
            chart02.render();
            loadTrendChart(chart02, 'chart_trend02', {
                is_trend: true,
                is_riwayat_pengawasan: true
            });

            // Init and render chart 03
            let chart03 = new ApexCharts(document.getElementById('chart_trend03'), getBaseChartOptions());
            chart03.render();
            loadTrendChart(chart03, 'chart_trend03', {
                is_trend: true,
                is_riwayat_pelanggaran: true
            });
            // Public Functions
        },
    };
}();
//Load Selectpicker
const loadSelectpicker = (value, element_id) => {
    if (element_id == '#regu_id') {   
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
    }else if(element_id == '#shift_id'){
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
    }else{
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
//Load Akses Menu
const loadAksesMenu = () => {
    $.ajax({
        url: base_url+ "api/load_akses_menu",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            var outputAksesMenu = ``;
            var rows = data.row;
            rows.forEach(row => {
                outputAksesMenu += `
                    <li class="nav-item mb-1 me-0" role="presentation">
                        <a href="javascript:void(0);" onclick="redirectMenu('${row.url}', '${row.need_shift_regu_platform}')" class="nav-link nav-link-border-solid btn btn-outline btn-flex border-hover-3-light flex-column flex-stack pt-6 pb-7 page-bg hover-elevate-up" style="width: 138px;height: 180px" aria-selected="true" role="tab">
                            <div class="nav-icon mb-1">
                                <img src="${row.icon}" class="w-100px" alt="${row.nama}">  
                            </div>
                            <div class="p-1">
                                <span class="text-light fw-bold fs-3 d-block t text-hover-light">${row.nama}</span>
                            </div>                       
                        </a>
                    </li>
                `;
            });
            $('#menus-access').html(outputAksesMenu);
        },complete: function() {

        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
// Redirect Menu
const redirectMenu = (url, need_shift_regu_platform) => {
    var shift_id        =  getCookie('shift_id')
    var regu_id         =  getCookie('regu_id')
    var timbangan_id    =  getCookie('timbangan_id')
    
    if(need_shift_regu_platform == 'Y'){
        if (shift_id == null || regu_id == null || timbangan_id == null) {
            var message = ''
            if (shift_id == null) {
                message = 'shift'
            }else if(regu_id == null){
                message = 'regu'
            }else{
                message = 'platform'
            }
            toastr.error('Kamu belum memilih '+message+'', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        }else{
            window.location.href = base_url+ url
        }
    }else{
        window.location.href = base_url+ url
    }
}
// Class Initialization
jQuery(document).ready(function() {
    loadAksesMenu();
    // Selectpicker
    loadSelectpicker((getCookie('shift_id')) ? getCookie('shift_id') : 0, '#shift_id')
    loadSelectpicker((getCookie('regu_id')) ? getCookie('regu_id') : 0, '#regu_id')
    loadSelectpicker((getCookie('timbangan_id')) ? getCookie('timbangan_id') : 0, '#timbangan_id')
    AppDashboard.init();
    $('#regu_id').change(function(){
        var value = this.value
        setCookie('regu_id', value)
    })
    $('#shift_id').change(function(){
        var value = this.value
        setCookie('shift_id', value)
    });
    $('#timbangan_id').change(function(){
        var value = this.value
        setCookie('timbangan_id', value)
    });
})