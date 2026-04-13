function loadLaporanKomoditi() {
    const $tbody = $("#dt-reports tbody");
    const target = document.querySelector("#dt-reports");
    const blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block();

    $.ajax({
        url: base_url + "api/laporan_komoditi/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_show_laporan: true,
            filter_date: $('#filter_date').val()
        },
        success: function (res) {
            blockUi.release(), blockUi.destroy();

            if (!res || res.status !== true) {
                $tbody.html(`<tr><td colspan="4" class="text-center text-muted py-6">Data tidak tersedia</td></tr>`);
                return;
            }

            const payload = res.row || {};
            const groups = payload.groups || [];
            const grandTotal = payload.grand_total ?? 0;

            if (!groups.length) {
                $tbody.html(`
                    <tr><td colspan="4" class="text-center text-warning py-6">Tidak ada komoditi yang dapat di tampilkan ...</td></tr>
                    <tr class="bg-light-primary">
                    <td colspan="3" class="text-center fw-bolder">GRAND TOTAL</td>
                    <td class="text-center fw-bolder">${grandTotal}</td>
                    </tr>
                `);
                return;
            }

            let html = "";

            groups.forEach(g => {
            const items = g.items || [];
            const rowspan = items.length || 1;

            // header grup
            html += `
                <tr class="fw-bolder text-uppercase bg-light">
                    <td></td>
                    <td colspan="3">${g.title || ""}</td>
                </tr>
            `;

            // item rows
            items.forEach((it, idx) => {
                html += `<tr>`;

                if (idx === 0) {
                html += `<td class="text-center fw-bolder" rowspan="${rowspan}">${g.code || ""}</td>`;
                }

                html += `
                    <td class="text-center">${it.no ?? ""}</td>
                    <td>${it.name ?? ""}</td>
                    <td class="text-center fw-bolder">${it.total ?? 0}</td>
                </tr>
                `;
            });

            // total per grup
            html += `
                <tr class="bg-light-secondary">
                <td colspan="3" class="text-center fw-bolder">TOTAL ${g.title || ""}</td>
                <td class="text-center fw-bolder">${g.total ?? 0}</td>
                </tr>
            `;
            });

            // grand total
            html += `
                <tr class="bg-light-primary">
                    <td colspan="3" class="text-center fw-bolder">GRAND TOTAL</td>
                    <td class="text-center fw-bolder">${grandTotal}</td>
                </tr>
            `;

            $tbody.html(html);
        }, error: function () {
            blockUi.release();
            blockUi.destroy();
            $tbody.html(`<tr><td colspan="4" class="text-center text-danger py-6">Gagal memuat data</td></tr>`);
        }
    });
}
// Class Initialization
jQuery(document).ready(function() {
    // Export Excel
    $("#export_excel").on("click", function () {
        var filter_date     = $('#filter_date').val();
        const url = `${base_url}laporan_komoditi/export?export_type=excel&filter_date=${filter_date}`;
        window.location.href = url;
    });
    // Export pdf
    $("#export_pdf").on("click", function () {
        var filter_date     = $('#filter_date').val();
        const url = `${base_url}laporan_komoditi/export?export_type=pdf&filter_date=${filter_date}`;
        window.location.href = url;
    });

    $('#filter-reports-reload').click(loadLaporanKomoditi);
    var start = moment().startOf('day');
    var end   = moment().endOf('day');
    function cb(start, end) {
        $("#filter_date").val(
            start.format("YYYY-MM-DD HH:mm") + " - " + end.format("YYYY-MM-DD HH:mm")
        );
    }
    $("#filter_date").daterangepicker({
        startDate: start,
        endDate: end,
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 1,
        locale: {
            format: "YYYY-MM-DD HH:mm"
        },
        ranges: {
            "Hari Ini": [moment().startOf('day'), moment().endOf('day')],
            "Kemarin": [moment().subtract(1,'days').startOf('day'), moment().subtract(1,'days').endOf('day')],
            "7 Hari Terakhir": [moment().subtract(6,'days').startOf('day'), moment().endOf('day')],
            "30 Hari Terakhir": [moment().subtract(29,'days').startOf('day'), moment().endOf('day')],
            "Bulan Ini": [moment().startOf('month'), moment().endOf('month')],
            "Bulan Lalu": [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')]
        }
    }, cb);
    cb(start, end);

    setTimeout(function () {
        loadLaporanKomoditi()
    }, 200); 
});