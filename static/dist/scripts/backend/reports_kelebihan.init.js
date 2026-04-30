const _loadDtLaporan = () => {
    let target = document.querySelector("#dt-reports"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/laporan_kelebihan/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_show_laporan: true,
            filter_interval: $('#filter_interval').val(),
            filter_month: $('#filter_month').val(),
            filter_year: $('#filter_year').val(),
        },
        success: function (data) {
            blockUi.release(), blockUi.destroy();
            var rows = data.row
            var bodyContent = ''
            rows.forEach(row => {
                var bg_secondary = (row.is_selected_column) ? 'bg-secondary' : ''
                // Body kelebihan muatan
                var tbodyKelebihanMuatan = ''
                var dt_kelebihan = row.dt_kelebihan
                dt_kelebihan.forEach(pl => {
                    tbodyKelebihanMuatan += `<td class="text-center ${bg_secondary}">${pl.total}</td>`
                });
                bodyContent += `
                    <tr class="${bg_secondary}">
                        <td class="text-center" width="20%">${row.time}</td>
                        <td class="text-center">${row.kendaraan_under}</td>
                        ${tbodyKelebihanMuatan}
                        <td class="text-center">${row.kendaraan_melanggar}</td>
                    </tr>
                `;
            });
             $('#dt-reports .tbody-of-table').html(bodyContent)
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
        var filter_interval     = $('#filter_interval').val();
        var filter_month        = $('#filter_month').val();
        var filter_year         = $('#filter_year').val();
        const url = `${base_url}laporan_kelebihan/export?export_type=excel&filter_interval=${filter_interval}&filter_month=${filter_month}&filter_year=${filter_year}`;
        window.location.href = url;
    });
    // Export pdf
    $("#export_pdf").on("click", function () {
        var filter_interval     = $('#filter_interval').val();
        var filter_month        = $('#filter_month').val();
        var filter_year         = $('#filter_year').val();
        const url = `${base_url}laporan_kelebihan/export?export_type=pdf&filter_interval=${filter_interval}&filter_month=${filter_month}&filter_year=${filter_year}`;
        window.location.href = url;
    });
    $('#filter_interval').change(function(){
        var category = this.value
        if(category == 'MONTH'){
            $('#dt-reports .waktu-name').html('TANGGAL')
            $('#form-filters .filter-tahun').show(), $('#form-filters .filter-bulan').show();
        }else{
            $('#dt-reports .waktu-name').html('BULAN')
            $('#form-filters .filter-tahun').show(), $('#form-filters .filter-bulan').hide();
        }
    })
    $('#filter-reports-reload').click(_loadDtLaporan);
    $('#filter_year').datepicker({
        format: "yyyy",
        viewMode: "years",
        minViewMode: "years",
        autoclose: true,
        language: "id"
    }).datepicker('setDate', new Date());
    $('#filter_month').datepicker({
        format: "mm",
        startView: "months",
        minViewMode: "months",
        autoclose: true,
        language: "id"
    }).datepicker('setDate', new Date()); 
    _loadDtLaporan()
});