// ============================================================
// PENIMBANGAN KENDARAAN - INIT JS
// Updated: Camera loading/fullscreen, LPR UI, History UI,
//          JS bug fixes, improved guards
// ============================================================

/**
 * Throttle: jalankan fn maksimal 1x per `limit` ms.
 * "Last-write-wins" — nilai terbaru selalu dipakai.
 */
const throttle = (fn, limit) => {
    let timer = null, lastArgs = null;
    return function (...args) {
        lastArgs = args;
        if (timer) return;
        timer = setTimeout(() => {
            fn.apply(this, lastArgs);
            timer = null; lastArgs = null;
        }, limit);
    };
};

let _antrianXhr  = null;
let _dimXhr      = null;
let _lprXhr      = null;

let _lastWeight        = -1;
let _lastViolationKey  = ''; 

// ── GUARDS — prevent duplicate intervals/sockets ──
let __socketWeight = null;
let __dimIntervalId = null;

let table, table2,
    weight = 0,
    jbi_kendaraan = 0,
    maxWeight = 0,
    panjang_kendaraan = 0,
    lebar_kendaraan = 0,
    tinggi_kendaraan = 0,
    toleransi_berat = 0,
    toleransi_panjang = 0,
    toleransi_lebar = 0,
    toleransi_tinggi = 0,
    is_input_weight = false,
    is_input_dimention = false,
    weight_input = 0,
    length_input = 0,
    width_input = 0,
    height_input = 0;
let is_form_pengemudi = true;

// PELANGGARAN
let is_melanggar_daya_angkut = false;
let is_melanggar_dimensi = false;

// VMS RESULTS
let vms_plat_nomor = '';
let vms_jbi = '0';
let vms_berat = '0';
let vms_lebih = '0';
let vms_persentase = '0';
let vms_tilang = '';

let lastPelanggaranState = {};

// ── HELPER: date validation (referenced in btn-save handler) ──
function isValidFullDate(str) {
    if (!str) return false;
    const parts = str.split('/');
    if (parts.length !== 3) return false;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y || y < 1900 || y > 2100) return false;
    const date = new Date(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
    return !isNaN(date.getTime()) && date.getDate() === d && date.getMonth() + 1 === m;
}

// ─────────────────────────────────────────
// DATATABLES
// ─────────────────────────────────────────
const _loadDtPenimbangan = () => {
    table = $('#dt-penimbanganKendaraan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url + 'api/penimbangan/show',
            headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
            type: 'GET',
        },
        scrollCollapse: true,
        pageLength: 10,
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
            { data: 'action', name: 'action', width: "5%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'status', name: 'status', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_kendaraan', name: 'no_kendaraan', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'waktu', name: 'waktu', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_uji', name: 'nouji', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'nama_pemilik', name: 'nama_pemilik', width: "10%", className: "align-top border px-2", orderable: false },
            { data: 'jbi_uji', name: 'jbi_uji', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'berat_timbang', name: 'berat_timbang', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'kelebihan_berat', name: 'kelebihan_berat', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'prosen_lebih', name: 'prosen_lebih', width: "10%", className: "align-top border px-2 text-center", orderable: false },
        ],
        oLanguage: {
            sEmptyTable: "Tidak ada Data yang dapat ditampilkan..",
            sInfo: "Menampilkan _START_ s/d _END_ dari _TOTAL_",
            sInfoEmpty: "Menampilkan 0 - 0 dari 0 entri.",
            sInfoFiltered: "",
            sProcessing: `<div class="d-flex justify-content-center align-items-center"><span class="spinner-border align-middle me-3"></span> Mohon Tunggu...</div>`,
            sZeroRecords: "Tidak ada Data yang dapat ditampilkan..",
            sLengthMenu: `<select class="mb-2 show-tick form-select-solid" data-width="fit" data-style="btn-sm btn-secondary" data-container="body">
                <option value="5" selected>5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>`,
            oPaginate: { sPrevious: "Sebelumnya", sNext: "Selanjutnya" },
        },
        fnDrawCallback: function(settings, display) {
            $("#search-DtPenimbangan").off("keyup.dtpen").on("keyup.dtpen", function() {
                table.search(this.value).draw();
                $("#clear-searchDtPenimbangan").toggle($(this).val().length > 0);
            });
            $("#clear-searchDtPenimbangan").off("click.dtpen").on("click.dtpen", function() {
                $("#search-DtPenimbangan").val("");
                table.search("").draw();
                $(this).hide();
            });
            $("#dt-penimbanganKendaraan_length select").selectpicker();
            $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
            $('.image-popup').magnificPopup({ type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true, image: { verticalFit: true } });
        },
    });
    $("#dt-penimbanganKendaraan").css("width", "100%");
    $("#search-DtPenimbangan").val("");
    $("#clear-searchDtPenimbangan").hide();
};

const _loadDtAntrianPenimbangan = () => {
    table2 = $('#dt-antrianKendaraan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url + 'api/penimbangan/show',
            headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
            type: 'GET',
            data: function(d) { d.is_antrian_data = true; }
        },
        scrollCollapse: true,
        pageLength: 10,
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
            { data: 'action', name: 'action', width: "5%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_kendaraan', name: 'no_kendaraan', width: "20%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'dokumen', name: 'dokumen', width: "20%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_uji', name: 'no_uji', width: "20%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'pemilik', name: 'pemilik', width: "40%", className: "align-top border px-2", orderable: false },
        ],
        oLanguage: {
            sEmptyTable: "Tidak ada Data yang dapat ditampilkan..",
            sInfo: "Menampilkan _START_ s/d _END_ dari _TOTAL_",
            sInfoEmpty: "Menampilkan 0 - 0 dari 0 entri.",
            sInfoFiltered: "",
            sProcessing: `<div class="d-flex justify-content-center align-items-center"><span class="spinner-border align-middle me-3"></span> Mohon Tunggu...</div>`,
            sZeroRecords: "Tidak ada Data yang dapat ditampilkan..",
            sLengthMenu: `<select class="mb-2 show-tick form-select-solid" data-width="fit" data-style="btn-sm btn-secondary" data-container="body">
                <option value="5" selected>5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>`,
            oPaginate: { sPrevious: "Sebelumnya", sNext: "Selanjutnya" },
        },
        fnDrawCallback: function(settings, display) {
            $("#search-DtAntrian").off("keyup.dtantrian").on("keyup.dtantrian", function() {
                table2.search(this.value).draw();
                $("#clear-searchDtAntrian").toggle($(this).val().length > 0);
            });
            $("#clear-searchDtAntrian").off("click.dtantrian").on("click.dtantrian", function() {
                $("#search-DtAntrian").val("");
                table2.search("").draw();
                $(this).hide();
            });
            $("#dt-antrianKendaraan_length select").selectpicker();
            $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
            $('.image-popup').magnificPopup({ type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true, image: { verticalFit: true } });
        },
    });
    $("#dt-antrianKendaraan").css("width", "100%");
    $("#search-DtAntrian").val("");
    $("#clear-searchDtAntrian").hide();
};

// ─────────────────────────────────────────
// ECHARTS GAUGE
// ─────────────────────────────────────────
var chartDom = document.getElementById('chart');
var chart = echarts.init(chartDom);
var option = {
    series: [{
        type: 'gauge',
        startAngle: 190, // Sudut sedikit diperlebar agar terlihat lebih melengkung mewah
        endAngle: -10,
        center: ['50%', '65%'], // Menggeser titik pusat sedikit ke bawah agar gauge terlihat lebih besar
        radius: '100%',         // Mengatur agar gauge memenuhi container
        min: 0,
        max: maxWeight,
        splitNumber: 5,
        axisLine: {
            lineStyle: {
                width: 15, // Garis indikator warna dipertebal sedikit
                color: [[0.8, '#55ce63'], [0.9, '#ffbc34'], [1, '#f62d51']]
            }
        },
        pointer: { 
            width: 6, 
            length: '70%',
            itemStyle: { color: 'auto' } 
        },
        axisTick: { distance: -15, length: 8, lineStyle: { color: '#fff', width: 2 } },
        splitLine: { distance: -15, length: 15, lineStyle: { color: '#fff', width: 3 } },
        axisLabel: { color: 'inherit', distance: 20, fontSize: 12 },
        detail: { 
            formatter: '{value} Kg', 
            fontSize: 22, // Angka detail diperbesar
            fontWeight: '800',
            offsetCenter: [0, '35%'], // Posisi angka relatif terhadap pusat
            color: 'inherit'
        },
        data: [{ value: 0 }]
    }]
};
chart.setOption(option);

// ─────────────────────────────────────────
// WEIGHING RESULTS
// ─────────────────────────────────────────
const loadWeighingResults = (value) => {
    const _updateChart = throttle((weight, colorZones, maxW) => {
        chart.setOption({
            series: [{
                max: maxW,
                axisLine: { lineStyle: { color: colorZones } },
                data: [{ value: weight }]
            }]
        });
    }, 100);

    const processWeight = (weight) => {
        // Skip jika berat tidak berubah (WS kadang kirim nilai yang sama)
        if (weight === _lastWeight) return;
        _lastWeight = weight;

        if (weight > jbi_kendaraan) maxWeight = weight + 500;

        const kelebihan_berat       = weight - jbi_kendaraan;
        const persentase_kelebihan  = jbi_kendaraan > 0
            ? (kelebihan_berat / jbi_kendaraan) * 100 : 0;
        const isViolation = jbi_kendaraan > 0
            && kelebihan_berat > 0
            && persentase_kelebihan > toleransi_berat;

        const colorZones = isViolation
            ? [[1, '#f62d51']]
            : [[0.8, '#55ce63'], [0.9, '#ffbc34'], [1, '#f62d51']];

        _updateChart(weight, colorZones, maxWeight);   // ← throttled

        $('[name="berat_kendaraan"]').val(weight);
        vms_berat = weight;

        is_melanggar_daya_angkut = isViolation;
        updateViolationUI(
            isViolation ? kelebihan_berat : 0,
            isViolation ? persentase_kelebihan.toFixed(0) : 0,
            isViolation
        );
    };

    const updateViolationUI = (kelebihan, persen, isViolation) => {
        // Skip DOM manipulation jika state tidak berubah
        const key = `${kelebihan}|${persen}|${isViolation}`;
        if (key === _lastViolationKey) return;
        _lastViolationKey = key;

        vms_lebih      = kelebihan;
        vms_persentase = persen;

        $('#indicator-berat .lebih_berat').html(`${kelebihan.toLocaleString("id-ID")} Kg`);
        $('#indicator-berat .persentase_kelebihan').html(`${persen} %`);
        $('[name="kelebihan_berat"]').val(kelebihan);
        $('[name="persentase_kelebihan"]').val(persen);

        $('#indicator-berat .pnb-stat').toggleClass('stat-overload', isViolation);
        $('#indicator-berat .kelebihan-border-buttom, #indicator-berat .persentase-border-buttom')
            .toggleClass('bg-danger', isViolation)
            .toggleClass('bg-success', !isViolation);
        $('#indicator-berat .lebih_berat, #indicator-berat .persentase_kelebihan')
            .toggleClass('text-overload', isViolation);

        if (isViolation) {
            vms_tilang = 'TILANG';
            $('#indicator-berat .weight-passed').html(
                `<span class="badge badge-danger fs-5"><i class="bi bi-x-circle me-2 text-white fs-2"></i>Not Pass</span>`
            );
        } else {
            vms_tilang = '';
            $('#indicator-berat .weight-passed').html(
                `<span class="badge badge-success fs-5"><i class="bi bi-check2-circle me-2 text-white fs-2"></i>Passed</span>`
            );
        }
    };

    if (!is_input_weight) {
        if (__socketWeight) { try { __socketWeight.close(); } catch (e) {} }
        __socketWeight = new WebSocket(ws_alat);
        __socketWeight.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                const w = is_input_weight ? weight_input : data.berat_timbangs;
                processWeight(w);
                $('#mdl-kendaraanBodong .weight-indicator').html(`${w} Kg`);
            } catch(e) { console.warn('Weight WS parse error:', e); }
        };
        processWeight(weight_input);
    } else {
        $('#mdl-kendaraanBodong .weight-indicator').html(`${weight_input} Kg`);
        processWeight(weight_input);
    }
};

// ─────────────────────────────────────────
// DIMENSION RESULTS
// ─────────────────────────────────────────
const loadDimentionsResults = (value) => {
    const fmt = (val) => `${Number(val || 0).toLocaleString("id-ID")} mm`;

    const updateMeasurements = (p, l, t) => {
        $('#indicator-dimentions .dimensi_panjang').html(fmt(p));
        $('#indicator-dimentions .dimensi_lebar').html(fmt(l));
        $('#indicator-dimentions .dimensi_tinggi').html(fmt(t));
        $('[name="panjang_p"]').val(p);
        $('[name="lebar_p"]').val(l);
        $('[name="tinggi_p"]').val(t);
    };

    const updateKelebihan = (dim, value, toleransi) => {
        const selInp = `[name="kelebihan_${dim}"]`;
        const selBorder = `#indicator-dimentions .${dim}-border-buttom`;
        const valid = value > 0;
        $(selInp).val(valid && value >= toleransi ? value : 0);
        $(selBorder).toggleClass('bg-danger', valid).toggleClass('bg-success', !valid);
    };

    const processDimension = (p, l, t) => {
        updateMeasurements(p, l, t);
        panjang_kendaraan = +$('#panjang_utama').val();
        lebar_kendaraan = +$('#lebar_utama').val();
        tinggi_kendaraan = +$('#tinggi_utama').val();

        if (panjang_kendaraan === 0 && lebar_kendaraan === 0 && tinggi_kendaraan === 0) {
            is_melanggar_dimensi = false;
            return false;
        }

        const kelebihan = {
            panjang: p - panjang_kendaraan,
            lebar: l - lebar_kendaraan,
            tinggi: t - tinggi_kendaraan
        };

        const hasViolation = [
            kelebihan.panjang > toleransi_panjang,
            kelebihan.lebar > toleransi_lebar,
            kelebihan.tinggi > toleransi_tinggi
        ].some(v => v);
        is_melanggar_dimensi = hasViolation;

        updateKelebihan('panjang', kelebihan.panjang, toleransi_panjang);
        updateKelebihan('lebar', kelebihan.lebar, toleransi_lebar);
        updateKelebihan('tinggi', kelebihan.tinggi, toleransi_tinggi);

        $('#indicator-dimentions .dimention-passed').html(
            hasViolation
                ? `<span class="badge badge-danger fs-5"><i class="bi bi-x-circle me-2 text-white fs-2"></i>Not Pass</span>`
                : `<span class="badge badge-success fs-5"><i class="bi bi-check2-circle me-2 text-white fs-2"></i>Passed</span>`
        );

        let img = 'passed-icons.png';
        const { panjang, lebar, tinggi } = kelebihan;
        if (panjang > 0 && lebar > 0 && tinggi > 0) img = 'melanggar-lebar-panjang-tinggi.png';
        else if (panjang > 0 && tinggi > 0) img = 'melanggar-panjang-tinggi.png';
        else if (panjang > 0 && lebar > 0) img = 'melanggar-lebar-panjang.png';
        else if (lebar > 0 && tinggi > 0) img = 'melanggar-lebar-tinggi.png';
        else if (lebar > 0) img = 'melanggar-lebar.png';
        else if (panjang > 0) img = 'melanggar-panjang.png';
        else if (tinggi > 0) img = 'melanggar-tinggi.png';
        $('#indicator-dimentions .img-information').attr('src', static_url + 'dist/img/dimention-icons/' + img);
    };

    if (!is_input_dimention) {
        const _checkRealtimeDimention = () => {
            if (_dimXhr) return;
            _dimXhr = $.ajax({
                url: base_url + "api/penimbangan/show",
                type: "GET", dataType: "JSON",
                data: { is_load_dimention: true },
                success: function(data) {
                    const row = data.row;
                    const p = is_input_dimention ? length_input : row.p;
                    const l = is_input_dimention ? width_input  : row.l;
                    const t = is_input_dimention ? height_input : row.t;
                    processDimension(p, l, t);
                    $('#mdl-kendaraanBodong .dimention-indicator').html(`${p} mm | ${l} mm | ${t} mm`);
                },
                error: function() { console.warn('Dimension realtime fetch error'); },
                complete: function() { _dimXhr = null; }
            });
        };
        if (__dimIntervalId) clearInterval(__dimIntervalId);
        __dimIntervalId = setInterval(_checkRealtimeDimention, 1000);
        processDimension(length_input, width_input, height_input);
    } else {
        $('#mdl-kendaraanBodong .dimention-indicator').html(`${length_input} mm | ${width_input} mm | ${height_input} mm`);
        processDimension(length_input, width_input, height_input);
    }
};

// LPR placeholder
const loadLprResults = () => {};

// ─────────────────────────────────────────
// SELECTPICKER LOADERS
// ─────────────────────────────────────────
const loadSelecpicker = (value, bodyId) => {
    const endpointMap = {
        '#sumbu_id': 'api/load_sumbu',
        '#jenis_kendaraan_id': 'api/load_jenis_kendaraan',
        '#kepemilikan_id': 'api/load_kepemilikan',
        '#gol_sim_id': 'api/load_gol_sim',
    };
    const url = endpointMap[bodyId];
    if (!url) return;
    $.ajax({
        url: base_url + url,
        type: "GET",
        dataType: "JSON",
        data: { is_selectrow: true },
        success: function(data) {
            const output = data.row.map(row => `<option value="${row.id}">${row.name}</option>`).join('');
            const val = (value !== null && value !== '') ? value.toString() : value;
            $(bodyId).html(output).selectpicker('refresh').selectpicker('val', val);
        },
        error: function() { console.warn('Selectpicker load error:', bodyId); }
    });
};

// ─────────────────────────────────────────
// PELANGGARAN HELPERS
// ─────────────────────────────────────────
const selectPelanggaranValue = (selector, id, text, action) => {
    const $el = $(selector);
    if (action === "add") {
        $el.find(`option[value="${id}"]`).remove();
        $el.append(new Option(text, id, true, true)).trigger("change");
    }
    if (action === "remove") {
        $el.find(`option[value="${id}"]`).remove();
        $el.trigger("change");
    }
};

const checkJenisPelanggaran = () => {
    const currentState = {
        masaBerlakuUji: $('#masa_berlaku_uji').val(),
        isMelanggarDayaAngkut: is_melanggar_daya_angkut,
        isMelanggarDimensi: is_melanggar_dimensi
    };
    if (JSON.stringify(lastPelanggaranState) === JSON.stringify(currentState)) return;
    lastPelanggaranState = currentState;

    const no_kendaraan = $('#no_kendaraan');
    if (no_kendaraan.val() === '') return;

    const masa_berlaku_uji = $('#masa_berlaku_uji');
    if (masa_berlaku_uji.val() !== '') {
        const today = new Date();
        const dateNow = new Date(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
        const [d, m, y] = masa_berlaku_uji.val().split('/');
        const masaAkhirUji = new Date(`${y}-${m}-${d}`);
        if (masaAkhirUji < dateNow) {
            $('#iGroup-masaBerlakuUji .masa_berlaku_uji').addClass('is-invalid');
            $('#iGroup-masaBerlakuUji .info-status').show();
            selectPelanggaranValue('#pelanggaran_id', 4, "DOKUMEN", "add");
        } else {
            $('#iGroup-masaBerlakuUji .masa_berlaku_uji').removeClass('is-invalid');
            $('#iGroup-masaBerlakuUji .info-status').hide();
            selectPelanggaranValue('#pelanggaran_id', 4, "DOKUMEN", "remove");
        }
    } else {
        selectPelanggaranValue('#pelanggaran_id', 4, "DOKUMEN", "remove");
    }

    if (is_melanggar_daya_angkut) {
        selectPelanggaranValue('#pelanggaran_id', 1, "DAYA ANGKUT", "add");
    } else {
        selectPelanggaranValue('#pelanggaran_id', 1, "DAYA ANGKUT", "remove");
    }

    if (is_melanggar_dimensi) {
        selectPelanggaranValue('#pelanggaran_id', 5, "TATA CARA MUAT", "add");
    } else {
        selectPelanggaranValue('#pelanggaran_id', 5, "TATA CARA MUAT", "remove");
    }
};

// ─────────────────────────────────────────
// CLEAR FORM
// ─────────────────────────────────────────
const _clearFormPenimbangan = () => {
    jbi_kendaraan = 0; panjang_kendaraan = 0; lebar_kendaraan = 0; tinggi_kendaraan = 0;
    is_input_dimention = false; is_input_weight = false;
    vms_plat_nomor = ''; vms_jbi = '0'; vms_berat = '0';
    vms_lebih = '0'; vms_persentase = '0'; vms_tilang = '';
    is_form_pengemudi = true;
    
    // Tambahkan 2 baris ini:
    is_melanggar_daya_angkut = false;
    is_melanggar_dimensi = false;

    $("#form-penimbangan")[0].reset();
    $('#no_kendaraan').focus();
    $('#btn-save').attr('disabled', true);
    $('#form-pengemudi').show();
    $('#vms-informations .status-melanggar').html('TIDAK MELANGGAR');
    $('#informasi-pelanggran').html('').hide();
    $('#vms-informations .lebih_berat').html('0 Kg');
    $('#vms-informations .persentase_kelebihan').html('0 %');
    $('#vms-informations .jbi').html('0 KG');
    $('#vms-informations .plate-number').html('XXXXXXXX');
    $('#iGroup-masaBerlakuUji .masa_berlaku_uji').removeClass('is-invalid');
    $('#iGroup-masaBerlakuUji .info-status').hide();
    $('#iGroup-isAlreadyTilang .form-check-label').text('TIDAK');
    $('#iGroup-isFormSuratTilang').hide();
    $('#iGroup-isGandengan .form-check-label').text('TIDAK');
    $('[name="melanggar_dokumen"]').val(0);
    ["#komoditi_id", "#asal_kota_id", "#tujuan_kota_id", "#pelanggaran_id"].forEach(sel => {
        $(sel).val(null).trigger("change");
    });
    lastPelanggaranState = {};
};

// ─────────────────────────────────────────
// SAVE PENIMBANGAN
// ─────────────────────────────────────────
$("#btn-save").on("click", function(e) {
    e.preventDefault();
    $("#btn-save").attr('data-kt-indicator', 'on').attr('disabled', true);

    const fields = {
        no_kendaraan: $("#no_kendaraan"),
        no_uji: $("#no_uji"),
        masa_berlaku_uji: $("#masa_berlaku_uji"),
        jenis_kendaraan_id: $("#jenis_kendaraan_id"),
        kepemilikan_id: $("#kepemilikan_id"),
        jbi: $("#jbi"),
        sumbu_id: $("#sumbu_id"),
        nama_pemilik: $("#nama_pemilik"),
        alamat_pemilik: $("#alamat_pemilik"),
        komoditi_id: $("#komoditi_id"),
        asal_kota_id: $("#asal_kota_id"),
        tujuan_kota_id: $("#tujuan_kota_id"),
        nomor_surat_jalan: $("#nomor_surat_jalan"),
        pemilik_komoditi: $("#pemilik_komoditi"),
        alamat_pemilik_komoditi: $("#alamat_pemilik_komoditi"),
    };

    const resetBtn = () => { $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false); };
    const errMsg = (msg, el) => {
        toastr.error(msg, 'Uuppss!', { "progressBar": true, "timeOut": 1500 });
        if (el) el.focus();
        resetBtn();
    };

    if (!fields.no_kendaraan.val()) return errMsg('Nomor kendaraan masih kosong...', fields.no_kendaraan);
    if (!fields.no_uji.val()) return errMsg('Nomor uji masih kosong...', fields.no_uji);
    if (!fields.masa_berlaku_uji.val()) return errMsg('Masa berlaku uji masih kosong...', fields.masa_berlaku_uji);
    if (!isValidFullDate(fields.masa_berlaku_uji.val())) return errMsg('Format tanggal tidak valid! Gunakan dd/mm/yyyy', fields.masa_berlaku_uji);
    if (!fields.jbi.val()) return errMsg('JBI masih kosong...', fields.jbi);
    if (!fields.jenis_kendaraan_id.val()) {
        $('#iGroup-jenisKendaraan button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function() { $(this).removeClass('btn-danger').addClass('btn-light').dequeue(); });
        return errMsg('Jenis Kendaraan masih kosong...', fields.jenis_kendaraan_id);
    }
    if (!fields.sumbu_id.val()) {
        $('#iGroup-sumbu button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function() { $(this).removeClass('btn-danger').addClass('btn-light').dequeue(); });
        return errMsg('Sumbu masih kosong...', fields.sumbu_id);
    }
    if (!fields.kepemilikan_id.val()) {
        $('#iGroup-kepemilikan button').removeClass('btn-light').addClass('btn-danger').stop().delay(1500).queue(function() { $(this).removeClass('btn-danger').addClass('btn-light').dequeue(); });
        return errMsg('Kepemilikan masih kosong...', fields.kepemilikan_id);
    }
    if (!fields.nama_pemilik.val()) return errMsg('Nama pemilik masih kosong...', fields.nama_pemilik);
    if (!fields.alamat_pemilik.val()) return errMsg('Alamat pemilik masih kosong...', fields.alamat_pemilik);
    if (!fields.komoditi_id.val()) return errMsg('Komoditi masih kosong...', fields.komoditi_id);
    if (!fields.asal_kota_id.val()) return errMsg('Asal kendaraan masih kosong...', fields.asal_kota_id);
    if (!fields.tujuan_kota_id.val()) return errMsg('Tujuan kendaraan masih kosong...', fields.tujuan_kota_id);
    if (!fields.nomor_surat_jalan.val()) return errMsg('Nomor surat jalan masih kosong...', fields.nomor_surat_jalan);
    if (!fields.pemilik_komoditi.val()) return errMsg('Pemilik komoditi masih kosong...', fields.pemilik_komoditi);
    if (!fields.alamat_pemilik_komoditi.val()) return errMsg('Alamat pemilik komoditi masih kosong...', fields.alamat_pemilik_komoditi);

    // if (is_form_pengemudi) {
    //     const drv = {
    //         nama: $("#nama_pengemudi"),
    //         alamat: $("#alamat_pengemudi"),
    //         jk: $("#jenis_kelamin_pengemudi"),
    //         umur: $("#umur_pengemudi"),
    //         telp: $("#no_telepon"),
    //         warna: $("#warna_kendaraan"),
    //         sim: $("#gol_sim_id"),
    //         no_id: $("#no_identitas"),
    //     };
    //     if (!drv.nama.val()) return errMsg('Nama pengemudi masih kosong...', drv.nama);
    //     if (!drv.alamat.val()) return errMsg('Alamat pengemudi masih kosong...', drv.alamat);
    //     if (!drv.jk.val()) return errMsg('Jenis kelamin masih kosong...', drv.jk);
    //     if (!drv.umur.val()) return errMsg('Umur pengemudi masih kosong...', drv.umur);
    //     if (!drv.telp.val()) return errMsg('Nomor telepon masih kosong...', drv.telp);
    //     if (!drv.warna.val()) return errMsg('Warna kendaraan masih kosong...', drv.warna);
    //     if (!drv.sim.val()) return errMsg('Gol SIM/Identitas masih kosong...', drv.sim);
    //     if (!drv.no_id.val()) return errMsg('Nomor SIM/Identitas masih kosong...', drv.no_id);
    // }

    Swal.fire({
        title: "", html: "Simpan Penimbangan ?", icon: "question",
        showCancelButton: true, allowOutsideClick: false,
        confirmButtonText: "Simpan", cancelButtonText: "Batal",
    }).then((result) => {
        if (result.value) {
            let target = document.querySelector("body"),
                blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            $.ajax({
                url: base_url + "api/penimbangan/store",
                headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
                type: "POST",
                data: new FormData($("#form-penimbangan")[0]),
                contentType: false,
                processData: false,
                dataType: "JSON",
                success: function(data) {
                    resetBtn();
                    blockUi.release(), blockUi.destroy();
                    if (data.status) {
                        Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false })
                        .then(function() {
                            _clearFormPenimbangan();
                            if (data.row.is_print_struk === 'Y') _printStruk('Y', data.row.idp_penimbangan);
                        });
                    } else {
                        Swal.fire({ title: "Ooops!", html: data.message, icon: "warning", allowOutsideClick: false });
                    }
                },
                error: function() {
                    resetBtn();
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan. Periksa koneksi jaringan.", icon: "error", allowOutsideClick: false });
                }
            });
        } else {
            resetBtn();
        }
    });
});

// ─────────────────────────────────────────
// DIMENSI MANUAL
// ─────────────────────────────────────────
const inputDimentions = () => {
    $("#panjang_custom").val(length_input);
    $("#lebar_custom").val(width_input);
    $("#tinggi_custom").val(height_input);
    $('#mdl-inputDimensi').modal('show');
};

const resetDimentions = () => {
    is_input_dimention = false;
    length_input = 0; width_input = 0; height_input = 0;
    loadDimentionsResults();
};

$("#btn-saveDimention").on("click", function(e) {
    e.preventDefault();
    $(this).attr('data-kt-indicator', 'on').attr('disabled', true);
    const p = $("#panjang_custom"), l = $("#lebar_custom"), t = $("#tinggi_custom");
    const reset = () => { $(this).removeAttr('data-kt-indicator').attr('disabled', false); };

    if (!p.val()) { toastr.error('Panjang masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); p.focus(); return reset(); }
    if (!l.val()) { toastr.error('Lebar masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); l.focus(); return reset(); }
    if (!t.val()) { toastr.error('Tinggi masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); t.focus(); return reset(); }

    is_input_dimention = true;
    length_input = parseInt(p.val());
    width_input = parseInt(l.val());
    height_input = parseInt(t.val());
    loadDimentionsResults();
    reset();
    $('#mdl-inputDimensi').modal('hide');
    $("#form-dimentions")[0].reset();
});

// ─────────────────────────────────────────
// BERAT MANUAL
// ─────────────────────────────────────────
const inputWeight = () => { $('#mdl-inputWight').modal('show'); };

function resetWeight() {
    if (__socketWeight) {
        try { __socketWeight.close(); } catch(e) {}
        __socketWeight = null;
    }
    is_input_weight = false;
    weight_input    = 0;
    _lastWeight     = -1;      // reset cache agar update pertama masuk
    _lastViolationKey = '';
    loadWeighingResults();
    toastr.info('Timbangan dikembalikan ke mode otomatis');
}

$("#btn-saveWight").on("click", function(e) {
    e.preventDefault();
    $(this).attr('data-kt-indicator', 'on').attr('disabled', true);
    const berat = $("#berat_custom");
    if (!berat.val()) {
        toastr.error('Berat timbangan masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 });
        berat.focus();
        $(this).removeAttr('data-kt-indicator').attr('disabled', false);
        return;
    }
    is_input_weight = true;
    weight_input = parseInt(berat.val());
    loadWeighingResults();
    $(this).removeAttr('data-kt-indicator').attr('disabled', false);
    $('#mdl-inputWight').modal('hide');
    $("#form-weights")[0].reset();
});

// ─────────────────────────────────────────
// PRINT STRUK
// ─────────────────────────────────────────
const _printStruk = (is_preview, idp_penimbangan) => {
    if (is_preview == 'Y') {
        $.ajax({
            url: base_url + "api/penimbangan/show", type: "GET", dataType: "JSON",
            data: { is_show_printer: true, idp_penimbangan },
            success: function(data) {
                const row = data.row;
                const row_fmt = (label, val) => `
                    <div class="d-flex justify-content-start mb-2">
                        <div class="fw-bolder fs-6 w-45">${label}</div>
                        <div class="fw-bolder fs-6 mx-2">:</div>
                        <div class="fw-bolder fs-6 w-50">${val}</div>
                    </div>`;
                $('#mdl-printStruk .body-content').html(`
                    <div class="d-print-none border border-dashed border-gray-300 card-rounded h-lg-100 min-w-md-350px p-9 bg-lighten" id="print-struk-area">
                        <div class="text-center"><span class="fw-bolder fs-6">${row.kode_trx}</span></div>
                        <div class="text-center mt-5"><span class="fw-bolder fs-6">STRUK PENIMBANGAN KENDARAAN BERMOTOR<br>${row.nama_jt}</span></div>
                        <hr>
                        <div class="text-left mt-5">
                            ${row_fmt('Tanggal Jam Timbang', row.tanggal_timbang + ' ' + row.jam_timbang)}
                            ${row_fmt('Nomor Kendaraan', row.noken)}
                            ${row_fmt('No.Uji', row.nouji)}
                            ${row_fmt('Masa Berlaku Uji', row.masa_akhir_uji)}
                            ${row_fmt('JBI. Kendaraan', row.jbi.toLocaleString("id-ID") + ' Kg')}
                            ${row_fmt('Berat Timbangan', row.berat_timbangan.toLocaleString("id-ID") + ' Kg')}
                            ${row_fmt('Kelebihan Berat', row.kelebihan_berat.toLocaleString("id-ID") + ' Kg')}
                            ${row_fmt('Persentase Kelebihan', row.persentase_kelebihan_berat + ' %')}
                            ${row_fmt('Asal', row.asal_kendaraan)}
                            ${row_fmt('Tujuan', row.tujuan_kendaraan)}
                            ${row_fmt('Komoditi', row.komoditi)}
                            ${row_fmt('Status Pelanggaran', row.status_melanggar)}
                        </div>
                        <div class="d-flex justify-content-center align-items-center" style="height:100px;"><div id="qrcode-penimbangan"></div></div>
                        <div class="text-left mt-7"><span class="fw-bolder fs-6"><i>*Struk Penimbangan Kendaraan Bermotor</i><br><i>*Dokumen Bukti Penimbangan Kendaraan Bermotor</i></span></div>
                    </div>`);
                $('#btn-printStruk').attr('onclick', `_printStruk('N', '${idp_penimbangan}')`);
                new QRCode(document.getElementById("qrcode-penimbangan"), {
                    text: row.kode_trx, width: 100, height: 100,
                    colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H
                });
                $('#mdl-printStruk').modal('show');
            },
            error: function() { console.warn('Load struk error'); }
        });
    } else {
        $('#btn-printStruk').attr('data-kt-indicator', 'on').attr('disabled', true);
        $.ajax({
            url: base_url + "print_struk_penimbangan", type: "GET", dataType: "JSON",
            data: { is_printer_struk: true, idp_penimbangan },
            success: function(data) {
                $('#btn-printStruk').removeAttr('data-kt-indicator').attr('disabled', false);
                if (data.row) {
                    (async () => {
                        const overlapMs = 150;
                        for (const file of data.row) {
                            const audio = new Audio(`/static/dist/audio/${file}`);
                            await new Promise(resolve => {
                                audio.play();
                                audio.onloadedmetadata = () => {
                                    const dur = Math.max(0, (audio.duration * 1000) - overlapMs);
                                    setTimeout(() => { audio.pause(); resolve(); }, dur);
                                };
                            });
                        }
                    })();
                }
                if (!data.status) {
                    Swal.fire({ title: "Ooops!", text: 'Koneksi printer gagal, periksa konfigurasi IP & Port printer!', icon: "warning", allowOutsideClick: false });
                }
            },
            error: function() {
                $('#btn-printStruk').removeAttr('data-kt-indicator').attr('disabled', false);
                Swal.fire({ title: "Ooops!", text: 'Koneksi printer gagal!', icon: "warning", allowOutsideClick: false });
            }
        });
    }
};

// ─────────────────────────────────────────
// SEARCH KENDARAAN
// ─────────────────────────────────────────
$("#no_kendaraan").keyup(function(event) {
    if (event.keyCode === 13 || event.key === "Enter") $("#btn-searchNoken").click();
});

$("#btn-searchNoken").on("click", function(e) {
    e.preventDefault();
    $("#pelanggaran_id").val(null).trigger("change");
    const no_kendaraan = $('#no_kendaraan');
    if (!no_kendaraan.val()) {
        toastr.error('Masukkan no kendaraan, contoh: B11111TYS', 'Uuppss!', { "progressBar": true, "timeOut": 1500 });
        no_kendaraan.focus();
        return;
    }
    let target = document.querySelector("body"),
        blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url + "api/penimbangan/show",
        type: "GET",
        dataType: "JSON",
        data: { is_check_noken: true, no_kendaraan: no_kendaraan.val() },
        success: function(data) {
            blockUi.release(), blockUi.destroy();
            const row = data.row;
            if (data.status) {
                lastPelanggaranState = {};
                vms_jbi = row.jbi;
                vms_plat_nomor = row.no_reg_kend;
                jbi_kendaraan = row.jbi;
                panjang_kendaraan = row.panjang_utama;
                lebar_kendaraan = row.lebar_utama;
                tinggi_kendaraan = row.tinggi_utama;
                toleransi_berat = row.toleransi_berat;
                toleransi_panjang = row.toleransi_panjang;
                toleransi_lebar = row.toleransi_lebar;
                toleransi_tinggi = row.toleransi_tinggi;
                maxWeight = row.jbi + 500;

                const fmt = (n) => n ? n.toLocaleString("id-ID") : 0;
                $('#dimentions-results .panjang-kendaraan').html(`${fmt(row.panjang_utama)} mm`);
                $('#dimentions-results .lebar-kendaraan').html(`${fmt(row.lebar_utama)} mm`);
                $('#dimentions-results .tinggi-kendaraan').html(`${fmt(row.tinggi_utama)} mm`);
                $('#dimentions-results .foh-kendaraan').html(`${fmt(row.julur_depan)} mm`);
                $('#dimentions-results .roh-kendaraan').html(`${fmt(row.julur_belakang)} mm`);
                $('#panjang_toleransi').val(row.toleransi_panjang);
                $('#lebar_toleransi').val(row.toleransi_lebar);
                $('#tinggi_toleransi').val(row.toleransi_tinggi);
                $('#foto_depan_url').val(row.foto_depan_url);
                $('#foto_belakang_url').val(row.foto_belakang_url);
                $('#foto_kiri_url').val(row.foto_kiri_url);
                $('#foto_kanan_url').val(row.foto_kanan_url);
                $('#jbb_uji').val(row.jbb);
                $('#jbkb_uji').val(row.jbkb);
                $('#mst_uji').val(row.mst);
                $('#jenis_kendaraan_nama').val(row.jenis_kend);
                $('#sumbu_nama').val(row.konfigurasi_sumbu);
                $('#tanggal_uji').val(row.tanggal_uji);
                $('#panjang_utama').val(row.panjang_utama);
                $('#lebar_utama').val(row.lebar_utama);
                $('#tinggi_utama').val(row.tinggi_utama);
                $('#julur_depan').val(row.julur_depan);
                $('#julur_belakang').val(row.julur_belakang);
                $('#no_kendaraan').val(row.no_reg_kend);
                $('#no_uji').val(row.no_uji);
                $('#nama_pemilik').val(row.nama_pemilik);
                $('#alamat_pemilik').val(row.alamat_pemilik);
                $('#jbi').val(row.jbi);
                loadSelecpicker(row.sumbu_id, '#sumbu_id');
                loadSelecpicker(row.jenis_kendaraan_id, '#jenis_kendaraan_id');
                loadSelecpicker(row.kepemilikan_id, '#kepemilikan_id');
                const dateObj = new Date(row.masa_berlaku_uji);
                $("#masa_berlaku_uji").val(dateObj.toLocaleDateString("en-GB"));
                $('#nomor_surat_jalan').val('0');
                $('#pemilik_komoditi').val(row.nama_pemilik);
                $('#alamat_pemilik_komoditi').val(row.alamat_pemilik);

                if (row.get_komoditi) {
                    is_form_pengemudi = false;
                    $('#form-pengemudi').show();
                    const k = row.get_komoditi;
                    $("#komoditi_id").append(new Option(k.komoditi_val, k.komoditi_id, true, true)).trigger("change");
                    $("#asal_kota_id").append(new Option(k.asal_kota_val, k.asal_kota_id, true, true)).trigger("change");
                    $("#tujuan_kota_id").append(new Option(k.tujuan_kota_val, k.tujuan_kota_id, true, true)).trigger("change");
                    $('#nomor_surat_jalan').val(k.no_surat_jalan);
                    $('#pemilik_komoditi').val(k.pemilik_komoditi);
                    $('#alamat_pemilik_komoditi').val(k.alamat_pemilik_komoditi);
                    $('#nama_pengemudi').val(k.nama_pengemudi);
                    $('#alamat_pengemudi').val(k.alamat_pengemudi);
                    $('#jenis_kelamin_pengemudi').selectpicker('refresh').selectpicker('val', k.jenis_kelamin);
                    $('#umur_pengemudi').val(k.umur_pengemudi);
                    $('#no_telepon').val(k.no_telepon);
                    $('#warna_kendaraan').val(k.warna_kendaraan);
                    loadSelecpicker(k.gol_sim_id, '#gol_sim_id');
                    $('#no_identitas').val(k.no_sim);
                } else {
                    is_form_pengemudi = true;
                    $('#form-pengemudi').show();
                }
                toastr.success(data.message, 'Success!', { "progressBar": true, "timeOut": 2500 });
            } else {
                toastr.error(data.message, 'Uuppss!', { "progressBar": true, "timeOut": 2500 });
                no_kendaraan.focus();
            }
        },
        complete: function() {
            // $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
            // $('.image-popup').magnificPopup({ type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true, image: { verticalFit: true, titleSrc: 'title' } });
        },
        error: function() { blockUi.release(), blockUi.destroy(); }
    });
});

// ─────────────────────────────────────────
// DELETE DATA
// ─────────────────────────────────────────
const _deleteData = (idp) => {
    Swal.fire({
        title: "", html: 'Yakin ingin menghapus data ini?', icon: "question",
        showCancelButton: true, allowOutsideClick: false,
        confirmButtonText: 'Ya, Lanjutkan', cancelButtonText: "Batal",
    }).then((result) => {
        if (result.value) {
            $.ajax({
                url: base_url + "api/penimbangan/delete", type: "GET", dataType: "JSON",
                data: { is_delete_data: true, idp },
                success: function(data) {
                    if (data.status) {
                        Swal.fire({ title: "Success!", text: data.message, icon: "success", allowOutsideClick: false })
                        .then(() => table.draw());
                    } else {
                        toastr.error(data.message, 'Uuppss!', { "progressBar": true, "timeOut": 2500 });
                        table.draw();
                    }
                },
                error: function() { console.warn('Delete error'); }
            });
        }
    });
};

// ─────────────────────────────────────────
// FORM VALIDATION WATCHER (throttled)
// ─────────────────────────────────────────
const _FORM_FIELDS = [
    "#no_kendaraan", "#no_uji", "#masa_berlaku_uji", "#jenis_kendaraan_id",
    "#kepemilikan_id", "#jbi", "#sumbu_id", "#nama_pemilik", "#alamat_pemilik",
    "#komoditi_id", "#asal_kota_id", "#tujuan_kota_id",
    "#nomor_surat_jalan", "#pemilik_komoditi", "#alamat_pemilik_komoditi",
];
function handleFormValidation() {
    const allFilled = _FORM_FIELDS.every(sel =>
        ($(sel).val() || "").toString().trim() !== ""
    );
    $("#btn-save").prop("disabled", !allFilled);
}

// ─────────────────────────────────────────
// PILIH KENDARAAN (ANTRIAN)
// ─────────────────────────────────────────
const pilihKendaraan = (kendaraan_id) => {
    $("#pelanggaran_id").val(null).trigger("change");
    $.ajax({
        url: base_url + "api/penimbangan/show", type: "GET", dataType: "JSON",
        data: { is_select_antrian: true, kendaraan_id },
        success: function(data) {
            const row = data.row;
            if (!data.status) {
                toastr.error(data.message, 'Uuppss!', { "progressBar": true, "timeOut": 2500 });
                return;
            }
            $('#mdl-antrian').modal('hide');
            lastPelanggaranState = {};
            vms_jbi = row.jbi;
            vms_plat_nomor = row.no_reg_kend;
            jbi_kendaraan = row.jbi;
            panjang_kendaraan = row.panjang_utama;
            lebar_kendaraan = row.lebar_utama;
            tinggi_kendaraan = row.tinggi_utama;
            toleransi_berat = row.toleransi_berat;
            toleransi_panjang = row.toleransi_panjang;
            toleransi_lebar = row.toleransi_lebar;
            toleransi_tinggi = row.toleransi_tinggi;
            maxWeight = row.jbi + 500;

            const fmt = (n) => n ? n.toLocaleString("id-ID") : 0;
            $('#dimentions-results .panjang-kendaraan').html(`${fmt(row.panjang_utama)} mm`);
            $('#dimentions-results .lebar-kendaraan').html(`${fmt(row.lebar_utama)} mm`);
            $('#dimentions-results .tinggi-kendaraan').html(`${fmt(row.tinggi_utama)} mm`);
            $('#panjang_toleransi').val(row.toleransi_panjang);
            $('#lebar_toleransi').val(row.toleransi_lebar);
            $('#tinggi_toleransi').val(row.toleransi_tinggi);
            $('#jbb_uji').val(row.jbb); $('#jbkb_uji').val(row.jbkb); $('#mst_uji').val(row.mst);
            $('#jenis_kendaraan_nama').val(row.jenis_kend); $('#sumbu_nama').val(row.konfigurasi_sumbu); $('#tanggal_uji').val(row.tanggal_uji);
            $('#panjang_utama').val(row.panjang_utama); $('#lebar_utama').val(row.lebar_utama); $('#tinggi_utama').val(row.tinggi_utama);
            $('#julur_depan').val(row.julur_depan); $('#julur_belakang').val(row.julur_belakang);
            $('#no_kendaraan').val(row.no_reg_kend); $('#no_uji').val(row.no_uji);
            $('#nama_pemilik').val(row.nama_pemilik); $('#alamat_pemilik').val(row.alamat_pemilik); $('#jbi').val(row.jbi);
            loadSelecpicker(row.sumbu_id, '#sumbu_id');
            loadSelecpicker(row.jenis_kendaraan_id, '#jenis_kendaraan_id');
            loadSelecpicker(row.kepemilikan_id, '#kepemilikan_id');

            if (row.is_surat_tilang === 'Y') {
                $('#is_already_tilang').prop('checked', true);
                $('#iGroup-isAlreadyTilang .form-check-label').text('YA');
                $('#iGroup-isFormSuratTilang').show();
                $('#nomor_surat_tilang').val(row.no_ba_tilang);
            } else {
                $('#is_already_tilang').prop('checked', false);
                $('#iGroup-isAlreadyTilang .form-check-label').text('TIDAK');
                $('#iGroup-isFormSuratTilang').hide();
                $('#nomor_surat_tilang').val('');
            }
            if (row.is_gandengan === 'Y') {
                $('#gandengan').prop('checked', true);
                $('#iGroup-isGandengan .form-check-label').text('YA');
            } else {
                $('#gandengan').prop('checked', false);
                $('#iGroup-isGandengan .form-check-label').text('TIDAK');
            }

            const dateObj = new Date(row.masa_berlaku_uji);
            $("#masa_berlaku_uji").val(dateObj.toLocaleDateString("en-GB"));
            $('#nomor_surat_jalan').val('0');
            $('#pemilik_komoditi').val(row.nama_pemilik);
            $('#alamat_pemilik_komoditi').val(row.alamat_pemilik);

            if (row.get_komoditi) {
                is_form_pengemudi = false;
                $('#form-pengemudi').show();
                const k = row.get_komoditi;
                $("#komoditi_id").append(new Option(k.komoditi_val, k.komoditi_id, true, true)).trigger("change");
                $("#asal_kota_id").append(new Option(k.asal_kota_val, k.asal_kota_id, true, true)).trigger("change");
                $("#tujuan_kota_id").append(new Option(k.tujuan_kota_val, k.tujuan_kota_id, true, true)).trigger("change");
                $('#nomor_surat_jalan').val(k.no_surat_jalan); $('#pemilik_komoditi').val(k.pemilik_komoditi); $('#alamat_pemilik_komoditi').val(k.alamat_pemilik_komoditi);
                $('#nama_pengemudi').val(k.nama_pengemudi); $('#alamat_pengemudi').val(k.alamat_pengemudi);
                $('#jenis_kelamin_pengemudi').selectpicker('refresh').selectpicker('val', k.jenis_kelamin);
                $('#umur_pengemudi').val(k.umur_pengemudi); $('#no_telepon').val(k.no_telepon); $('#warna_kendaraan').val(k.warna_kendaraan);
                loadSelecpicker(k.gol_sim_id, '#gol_sim_id'); $('#no_identitas').val(k.no_sim);
            } else {
                is_form_pengemudi = true;
                $('#form-pengemudi').show();
            }
            (row.pelanggaran || []).forEach(pel => {
                $("#pelanggaran_id").append(new Option(pel.name, pel.id, true, true)).trigger("change");
            });
        },
        complete: function() {
            // $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
            // $('.image-popup').magnificPopup({ type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true, image: { verticalFit: true } });
        },
        error: function() { console.warn('Pilih kendaraan error'); }
    });
};

const checkRealTimeAntrian = () => {
    if (_antrianXhr) return;
    _antrianXhr = $.ajax({
        url: base_url + "api/penimbangan/show",
        type: "GET", dataType: "JSON",
        data: { is_check_count_antrian: true },
        success: function(data) {
            const count = data.row;
            $('#btn-loadAntrian .notification').toggle(count > 0);
        },
        error: function() { console.warn('Antrian check error'); },
        complete: function() { _antrianXhr = null; }  // ← release guard
    });
};

// ─────────────────────────────────────────
// RIWAYAT HISTORY — REDESIGNED UI
// ─────────────────────────────────────────
const loadHistory = () => {
    let no_kendaraan = $("#no_kendaraan");
    if (no_kendaraan.val() == '') {
        toastr.error('Nomor kendaraan masih kosong...', 'Uuppss!', {
            "progressBar": true,
            "timeOut": 1500
        });
        no_kendaraan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    let target = document.querySelector("body"),
        blockUi = new KTBlockUI(target, {
            message: messageBlockUi,
            zIndex: 9
        });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url + "api/penimbangan/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_load_history: true,
            no_kendaraan: no_kendaraan.val(),
        },
        success: function(data) {
            blockUi.release(), blockUi.destroy();
            if (data.status == true) {
                var rows = data.row
                var bodyContent = '';
                rows.forEach(row => {
                    var out_pelanggaran = '';
                    row.pelanggaran.forEach(pelanggaran => {
                        out_pelanggaran += pelanggaran.name + ', ';
                    });
                    bodyContent += `
                        <div class="col-md-6">
                            <a href="javascript:void(0);" onclick='pilihHistory(${JSON.stringify(row)})' data-bs-toggle="tooltip" data-bs-placement="bottom" title="Timbang Kendaraan!" class="text-decoration-none">
                                <div class="card border-0 shadow-sm hover-elevate-up transition-all mb-4">
                                    <!-- Header dengan warna background -->
                                    <div class="card-header bg-primary text-white border-0 py-3">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <h5 class="mb-0 fw-bold text-light">${row.komoditi}</h5>
                                            <span class="badge badge-outline badge-primary fs-3">DT0185PX</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Body Card -->
                                    <div class="card-body p-5">
                                        <!-- Status Pelanggaran -->
                                        ${row.is_melanggar == 'Y' ? `
                                            <div class="alert alert-danger d-flex align-items-center p-4 mb-4">
                                                <i class="ki-duotone ki-shield-cross fs-2x text-danger me-3">
                                                    <span class="path1"></span>
                                                    <span class="path2"></span>
                                                </i>
                                                <div class="flex-grow-1">
                                                    <h6 class="mb-1 fw-bold text-danger">Kendaraan Melanggar!</h6>
                                                    <span class="text-gray-700 fs-7">${out_pelanggaran || 'Pelanggaran terdeteksi'}</span>
                                                </div>
                                            </div>
                                        ` : `
                                            <div class="alert alert-success d-flex align-items-center p-4 mb-4">
                                                <i class="ki-duotone ki-shield-tick fs-2x text-success me-3">
                                                    <span class="path1"></span>
                                                    <span class="path2"></span>
                                                </i>
                                                <div class="flex-grow-1">
                                                    <h6 class="mb-1 fw-bold text-success">Tidak Ada Pelanggaran</h6>
                                                    <span class="text-gray-700 fs-7">Kendaraan sesuai aturan</span>
                                                </div>
                                            </div>
                                        `}
                                        
                                        <!-- Tanggal Penimbangan -->
                                        <div class="d-flex align-items-center mb-4">
                                            <div class="symbol symbol-40px me-3">
                                                <span class="symbol-label bg-light-danger">
                                                    <i class="ki-duotone ki-calendar fs-2 text-danger">
                                                        <span class="path1"></span>
                                                        <span class="path2"></span>
                                                    </i>
                                                </span>
                                            </div>
                                            <div class="flex-grow-1">
                                                <span class="text-gray-500 fw-semibold d-block fs-7">Tanggal Penimbangan</span>
                                                <span class="text-gray-800 fw-bold d-block fs-6">${row.tgl_penimbangan}</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Divider -->
                                        <div class="separator separator-dashed my-4"></div>
                                        
                                        <!-- Asal & Tujuan -->
                                        <div class="d-flex align-items-start mb-3">
                                            <div class="symbol symbol-30px me-3 mt-1">
                                                <span class="symbol-label bg-light-primary">
                                                    <i class="ki-duotone ki-geolocation fs-4 text-primary">
                                                        <span class="path1"></span>
                                                        <span class="path2"></span>
                                                    </i>
                                                </span>
                                            </div>
                                            <div class="flex-grow-1">
                                                <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Asal & Tujuan</span>
                                                <span class="text-gray-800 fw-bold d-block fs-7">${row.asal_kendaraan} - ${row.tujuan_kendaraan}</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Pemilik Komoditi -->
                                        <div class="d-flex align-items-start mb-3">
                                            <div class="symbol symbol-30px me-3 mt-1">
                                                <span class="symbol-label bg-light-success">
                                                    <i class="ki-duotone ki-profile-user fs-4 text-success">
                                                        <span class="path1"></span>
                                                        <span class="path2"></span>
                                                        <span class="path3"></span>
                                                    </i>
                                                </span>
                                            </div>
                                            <div class="flex-grow-1">
                                                <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Pemilik Komoditi</span>
                                                <span class="text-gray-800 fw-bold d-block fs-7">${row.pemilik_komoditi}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Footer dengan action button -->
                                    <div class="card-footer bg-light border-0 py-3">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="text-muted fs-8">
                                                <i class="ki-duotone ki-information-2 fs-6 text-info">
                                                    <span class="path1"></span>
                                                    <span class="path2"></span>
                                                    <span class="path3"></span>
                                                </i>
                                                Klik untuk timbang
                                            </span>
                                            <i class="ki-duotone ki-arrow-right fs-3 text-danger">
                                                <span class="path1"></span>
                                                <span class="path2"></span>
                                            </i>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
                });
                $('#mdl-history .heade-content').html(`Riwayat Komoditi & Asal Tujuan <span class="text-primary">( ${rows.length} Riwayat ) - ${no_kendaraan.val()}</span>`)
                $('#mdl-history .body-content').html(bodyContent)
                $('#mdl-history').modal('show')
            } else {
                toastr.error(data.message, 'Uuppss!', {
                    "progressBar": true,
                    "timeOut": 2500
                });
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            blockUi.release(), blockUi.destroy();
            console.log('Load data is error');
        }
    });
}

// ─────────────────────────────────────────
// PILIH HISTORY
// ─────────────────────────────────────────
const pilihHistory = (kendaraan) => {
    let target = document.querySelector("body"),
        blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url + "api/penimbangan/show", type: "GET", dataType: "JSON",
        data: { is_check_noken: true, no_kendaraan: kendaraan.no_kendaraan },
        success: function(data) {
            blockUi.release(), blockUi.destroy();
            const row = data.row;
            if (!data.status) {
                toastr.error(data.message, 'Uuppss!', { "progressBar": true, "timeOut": 2500 });
                return;
            }
            lastPelanggaranState = {};
            vms_jbi = row.jbi;
            vms_plat_nomor = row.no_reg_kend;
            jbi_kendaraan = row.jbi;
            panjang_kendaraan = row.panjang_utama; lebar_kendaraan = row.lebar_utama; tinggi_kendaraan = row.tinggi_utama;
            toleransi_berat = row.toleransi_berat; toleransi_panjang = row.toleransi_panjang;
            toleransi_lebar = row.toleransi_lebar; toleransi_tinggi = row.toleransi_tinggi;
            maxWeight = row.jbi + 500;

            const fmt = (n) => n ? n.toLocaleString("id-ID") : 0;
            $('#dimentions-results .panjang-kendaraan').html(`${fmt(row.panjang_utama)} mm`);
            $('#dimentions-results .lebar-kendaraan').html(`${fmt(row.lebar_utama)} mm`);
            $('#dimentions-results .tinggi-kendaraan').html(`${fmt(row.tinggi_utama)} mm`);
            $('#dimentions-results .foh-kendaraan').html(`${fmt(row.julur_depan)} mm`);
            $('#dimentions-results .roh-kendaraan').html(`${fmt(row.julur_belakang)} mm`);
            $('#panjang_toleransi').val(row.toleransi_panjang); $('#lebar_toleransi').val(row.toleransi_lebar); $('#tinggi_toleransi').val(row.toleransi_tinggi);
            $('#foto_depan_url').val(row.foto_depan_url); $('#foto_belakang_url').val(row.foto_belakang_url);
            $('#foto_kiri_url').val(row.foto_kiri_url); $('#foto_kanan_url').val(row.foto_kanan_url);
            $('#jbb_uji').val(row.jbb); $('#jbkb_uji').val(row.jbkb); $('#mst_uji').val(row.mst);
            $('#jenis_kendaraan_nama').val(row.jenis_kend); $('#sumbu_nama').val(row.konfigurasi_sumbu); $('#tanggal_uji').val(row.tanggal_uji);
            $('#panjang_utama').val(row.panjang_utama); $('#lebar_utama').val(row.lebar_utama); $('#tinggi_utama').val(row.tinggi_utama);
            $('#julur_depan').val(row.julur_depan); $('#julur_belakang').val(row.julur_belakang);
            $('#no_kendaraan').val(row.no_reg_kend); $('#no_uji').val(row.no_uji);
            $('#nama_pemilik').val(row.nama_pemilik); $('#alamat_pemilik').val(row.alamat_pemilik); $('#jbi').val(row.jbi);
            loadSelecpicker(row.sumbu_id, '#sumbu_id');
            loadSelecpicker(row.jenis_kendaraan_id, '#jenis_kendaraan_id');
            loadSelecpicker(row.kepemilikan_id, '#kepemilikan_id');
            $("#masa_berlaku_uji").val(new Date(row.masa_berlaku_uji).toLocaleDateString("en-GB"));

            $('#nomor_surat_jalan').val(kendaraan.no_surat_jalan);
            $('#pemilik_komoditi').val(kendaraan.pemilik_komoditi);
            $('#alamat_pemilik_komoditi').val(kendaraan.alamat_pemilik_komoditi);
            $("#komoditi_id").append(new Option(kendaraan.komoditi, kendaraan.komoditi_id, true, true)).trigger("change");
            $("#asal_kota_id").append(new Option(kendaraan.asal_kendaraan, kendaraan.asal_kota_id, true, true)).trigger("change");
            $("#tujuan_kota_id").append(new Option(kendaraan.tujuan_kendaraan, kendaraan.tujuan_kota_id, true, true)).trigger("change");

            if (row.get_komoditi) {
                is_form_pengemudi = false;
                $('#form-pengemudi').show();
                const k = row.get_komoditi;
                $('#nama_pengemudi').val(k.nama_pengemudi); $('#alamat_pengemudi').val(k.alamat_pengemudi);
                $('#jenis_kelamin_pengemudi').selectpicker('refresh').selectpicker('val', k.jenis_kelamin);
                $('#umur_pengemudi').val(k.umur_pengemudi); $('#no_telepon').val(k.no_telepon); $('#warna_kendaraan').val(k.warna_kendaraan);
                loadSelecpicker(k.gol_sim_id, '#gol_sim_id'); $('#no_identitas').val(k.no_sim);
            } else {
                is_form_pengemudi = true;
                $('#form-pengemudi').show();
            }
            $('#mdl-history').modal('hide');
        },
        complete: function() {
            // $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
            // $('.image-popup').magnificPopup({ type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true, image: { verticalFit: true } });
        },
        error: function() { blockUi.release(), blockUi.destroy(); }
    });
};

// ─────────────────────────────────────────
// KENDARAAN BODONG
// ─────────────────────────────────────────
const loadKendaraanBodong = () => {
    const initSelect2Ajax = (selector, { placeholder, url, dropdownParent }) => {
        const $el = $(selector);
        if ($el.hasClass("select2-hidden-accessible")) { $el.select2("destroy"); $el.empty(); }
        $el.select2({
            placeholder, allowClear: true, width: "100%", dropdownParent: $(dropdownParent),
            minimumInputLength: 0,
            ajax: {
                url: base_url + url, dataType: "json", delay: 250,
                data: (params) => ({ q: params.term || "", page: params.page || 1 }),
                processResults: (data, params) => ({
                    results: (data.results || []).map(item => ({ id: item.id, text: item.name })),
                    pagination: { more: !!data.has_next }
                }),
                cache: true,
            },
        });
    };
    $("#mdl-kendaraanBodong").on("shown.bs.modal", function() {
        initSelect2Ajax("#komoditi_id_bd", { placeholder: "Pilih komoditi...", url: "api/load_komoditi", dropdownParent: "#mdl-kendaraanBodong" });
        initSelect2Ajax("#asal_kota_id_bd", { placeholder: "Pilih asal pengiriman...", url: "api/load_kab_kota", dropdownParent: "#mdl-kendaraanBodong" });
        initSelect2Ajax("#tujuan_kota_id_bd", { placeholder: "Pilih tujuan pengiriman...", url: "api/load_kab_kota", dropdownParent: "#mdl-kendaraanBodong" });
    });
    $('#mdl-kendaraanBodong').modal('show');
};

$("#btn-saveBodong").on("click", function(e) {
    e.preventDefault();
    $(this).attr('data-kt-indicator', 'on').attr('disabled', true);
    const reset = () => { $(this).removeAttr('data-kt-indicator').attr('disabled', false); };
    const no_kendaraan_bd = $("#no_kendaraan_bd"),
          komoditi_id_bd = $("#komoditi_id_bd"),
          asal_kota_id_bd = $("#asal_kota_id_bd"),
          tujuan_kota_id_bd = $("#tujuan_kota_id_bd");

    if (!no_kendaraan_bd.val()) { toastr.error('Nomor kendaraan masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); no_kendaraan_bd.focus(); return reset(); }
    if (!komoditi_id_bd.val()) { toastr.error('Komoditi masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); komoditi_id_bd.focus(); return reset(); }
    if (!asal_kota_id_bd.val()) { toastr.error('Asal kendaraan masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); asal_kota_id_bd.focus(); return reset(); }
    if (!tujuan_kota_id_bd.val()) { toastr.error('Tujuan kendaraan masih kosong...', 'Uuppss!', { "progressBar": true, "timeOut": 1500 }); tujuan_kota_id_bd.focus(); return reset(); }

    Swal.fire({
        title: "", html: "Simpan Kendaraan & Hasil Timbang?", icon: "question",
        showCancelButton: true, allowOutsideClick: false,
        confirmButtonText: "Simpan", cancelButtonText: "Batal",
    }).then((result) => {
        if (!result.value) { return reset(); }
        let target = document.querySelector("body"),
            blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
        blockUi.block(), blockUi.destroy();
        const formData = new FormData($("#form-kendaraan-bodong")[0]);
        formData.append('is_kendaraan_bodong', 1);
        formData.append('berat_kendaraan', $('[name="berat_kendaraan"]').val());
        formData.append('panjang_p', $('[name="panjang_p"]').val());
        formData.append('lebar_p', $('[name="lebar_p"]').val());
        formData.append('tinggi_p', $('[name="tinggi_p"]').val());
        $.ajax({
            url: base_url + "api/penimbangan/store",
            headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
            type: "POST", data: formData, contentType: false, processData: false, dataType: "JSON",
            success: function(data) {
                reset(); blockUi.release(), blockUi.destroy();
                if (data.status) {
                    Swal.fire({ title: "Success!", html: data.message, icon: "success", allowOutsideClick: false })
                    .then(() => {
                        $("#no_kendaraan_bd").val('');
                        $("#komoditi_id_bd,#asal_kota_id_bd,#tujuan_kota_id_bd").val(null).trigger("change");
                        $('#mdl-kendaraanBodong').modal('hide');
                        $('#table-kendaraanBodong').hide();
                    });
                } else {
                    Swal.fire({ title: "Ooops!", html: data.message, icon: "warning", allowOutsideClick: false });
                }
            },
            error: function() {
                reset(); blockUi.release(), blockUi.destroy();
                Swal.fire({ title: "Ooops!", text: "Terjadi kesalahan. Periksa koneksi jaringan.", icon: "error", allowOutsideClick: false });
            }
        });
    });
});

$("#btn-searchBodong").on("click", function(e) {
    e.preventDefault();
    const no_kendaraan_bd = $('#no_kendaraan_bd');
    if (!no_kendaraan_bd.val()) {
        toastr.error('Masukkan no kendaraan, contoh: B11111TYS', 'Uuppss!', { "progressBar": true, "timeOut": 1500 });
        no_kendaraan_bd.focus();
        return;
    }
    $.ajax({
        url: base_url + "api/penimbangan/show", type: "GET", dataType: "JSON",
        data: { is_check_noken_bodong: true, no_kendaraan_bd: no_kendaraan_bd.val() },
        success: function(data) {
            const rows = data.row;
            if (!data.status) { toastr.error(data.message, 'Uuppss!', { "progressBar": true, "timeOut": 2500 }); return; }
            const is_found = rows.is_found;
            const kendaraans = rows.kendaraan || [];
            let bodyElement = '';
            if (is_found) {
                kendaraans.forEach(k => {
                    bodyElement += `<tr>
                        <td class="text-center">${k.tgl_penimbangan}</td>
                        <td class="text-center"><span class="badge badge-modern bg-primary text-light">${k.no_kendaraan}</span></td>
                        <td class="text-center">${k.komoditi}</td>
                        <td class="text-center">${k.asal_kota}</td>
                        <td class="text-center">${k.tujuan_kota}</td>
                        <td class="text-center"><span class="badge badge-modern bg-success text-light">${k.berat_timbang} KG</span></td>
                    </tr>`;
                });
                toastr.success(data.message, 'Success!', { "progressBar": true, "timeOut": 2500 });
            } else {
                bodyElement = `<tr><td colspan="12" class="text-center fw-bold text-gray-600"><i>Kendaraan belum pernah melalui proses penimbangan.</i></td></tr>`;
                toastr.warning(data.message, 'Info!', { "progressBar": true, "timeOut": 2500 });
            }
            $('#table-kendaraanBodong .total-history').html(kendaraans.length);
            $('#table-kendaraanBodong').show();
            $('#table-kendaraanBodong .tbody-of-table').html(bodyElement);
        },
        error: function() { console.warn('Bodong search error'); }
    });
});

const maintenanceFitur = () => {
    Swal.fire({ title: "Ooops!", text: "Palang pintu tidak terhubung!", icon: "warning", allowOutsideClick: false });
};

// ─────────────────────────────────────────
// LPR BLUE — REDESIGNED UI
// ─────────────────────────────────────────
const _loadLprBlue = () => {
    let target = document.querySelector("body"),
        blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url + "api/penimbangan/show", type: "GET", dataType: "JSON",
        data: { is_load_lpr: true },
        success: function(data) {
            blockUi.release(), blockUi.destroy();
            if (!data.status) {
                toastr.error(data.message, 'Uuppss!', { "progressBar": true, "timeOut": 2500 });
                return;
            }
            const rows = data.row.is_found || [];
            let bodyContent = '';

            rows.forEach(row => {
                const masaBerlaku = new Date(row.masa_berlaku_uji);
                const isExpired = masaBerlaku < new Date();
                const formattedDate = masaBerlaku.toLocaleDateString("id-ID", { day:'2-digit', month:'long', year:'numeric' });
                const statusColor = isExpired ? '#dc2626' : '#15803d';
                const statusBg = isExpired ? '#fef2f2' : '#f0fdf4';
                const statusBorder = isExpired ? '#fca5a5' : '#86efac';
                const statusText = isExpired ? 'TIDAK AKTIF UJI' : 'AKTIF UJI';

                bodyContent += `
                <div class="col-md-6 mb-3">
                  <div onclick="pilihKeLpr('${row.no_reg_kend}')" style="cursor:pointer;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.07);transition:transform .15s,box-shadow .15s;"
                       onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 16px rgba(0,0,0,.12)';"
                       onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,.07)';">

                    <!-- Plate header -->
                    <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:14px 16px;text-align:center;position:relative;">
                      <div style="font-size:9px;color:rgba(255,255,255,.65);font-weight:600;letter-spacing:1px;text-transform:uppercase;">NOMOR REGISTRASI</div>
                      <div style="font-family:monospace;font-size:26px;font-weight:800;color:#fff;letter-spacing:5px;margin-top:3px;">${row.no_reg_kend}</div>
                    </div>

                    <!-- Info body -->
                    <div style="padding:12px 14px;">
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px;">
                        <div style="background:#f8fafc;border-radius:6px;padding:7px 9px;">
                          <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Jenis Kendaraan</div>
                          <div style="font-size:12px;font-weight:600;color:#0f172a;margin-top:2px;">${row.jenis_kend}</div>
                        </div>
                        <div style="background:#f8fafc;border-radius:6px;padding:7px 9px;">
                          <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">JBI</div>
                          <div style="font-size:14px;font-weight:700;color:#0f172a;font-family:monospace;margin-top:2px;">${Number(row.jbi).toLocaleString('id-ID')} Kg</div>
                        </div>
                      </div>

                      <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 9px;border-radius:6px;background:${statusBg};border:1px solid ${statusBorder};margin-bottom:8px;">
                        <div>
                          <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Masa Berlaku Uji</div>
                          <div style="font-size:12px;font-weight:600;color:#0f172a;margin-top:1px;">${formattedDate}</div>
                        </div>
                        <span style="padding:3px 9px;background:${statusBg};border:1px solid ${statusBorder};border-radius:20px;font-size:10px;font-weight:700;color:${statusColor};">${statusText}</span>
                      </div>

                      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid #f1f5f9;">
                        <span style="font-size:11px;color:#64748b;">Klik untuk timbang kendaraan ini</span>
                        <span style="font-size:11px;font-weight:700;color:#2563eb;">Pilih →</span>
                      </div>
                    </div>
                  </div>
                </div>`;
            });

            $('#mdl-lpr .body-content').html(bodyContent || '<div class="text-center text-muted py-4">Tidak ada data kendaraan terdeteksi.</div>');
            $('#mdl-lpr').modal('show');
        },
        complete: function() {
            // $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
        },
        error: function() { blockUi.release(), blockUi.destroy(); console.warn('LPR Blue error'); }
    });
};

const pilihKeLpr = (no_kendaraan) => {
    $("#no_kendaraan").val(no_kendaraan);
    $("#btn-searchNoken").click();
    $('#mdl-lpr').modal('hide');
};

// ─────────────────────────────────────────
// REALTIME LPR — FIXED var hoisting
// ─────────────────────────────────────────
let prev_no_reg_kend = null;
const _checkRealtimeLpr = () => {
    if (_lprXhr) return;
    _lprXhr = $.ajax({
        url: base_url + "api/penimbangan/show", type: "GET", dataType: "JSON",
        data: { is_load_lpr_realtime: true },
        success: function(data) {
            const rows = data.row;
            const is_found = rows.is_found;
            const no_reg_kend = rows.no_reg_kend;
            const jbi = rows.jbi;
            const jenis_kend = rows.jenis_kend;
            const masa_berlaku_uji = rows.masa_berlaku_uji;

            // FIX: use let instead of var inside if/else to avoid hoisting bugs
            let information, onclick_attr;
            if (is_found === 'Y') {
                information = `
                    <span style="font-size:11px;color:#15803d;font-weight:700;">✓ KENDARAAN ADA DI BLUE</span>
                    <span class="bullet-custom position-absolute bottom-0 w-100 h-4px bg-success"></span>
                `;
                onclick_attr = `onclick="pilihKeLpr('${no_reg_kend}')"`;
            } else {
                information = `
                    <span style="font-size:11px;color:#b91c1c;font-weight:700;">✗ KENDARAAN TIDAK ADA DI BLUE</span>
                    <span class="bullet-custom position-absolute bottom-0 w-100 h-4px bg-danger"></span>
                `;
                onclick_attr = '';
            }

            const bodyContent = `
                <a href="javascript:void(0);" ${onclick_attr}
                   class="nav-link active shadow-sm border rounded-3 px-5 py-4 d-flex flex-column align-items-center"
                   style="width:320px;position:relative;">
                    <div class="nav-icon">
                        <span class="nav-text text-gray-700 fw-bold fs-1" style="font-family:monospace;letter-spacing:3px;">${no_reg_kend}</span>
                    </div>
                    ${information}
                </a>`;
            $('#results-lpr').html(bodyContent);

            // MASA BERLAKU UJI
            const masaBerlaku = new Date(masa_berlaku_uji);
            const isExpired = masaBerlaku < new Date();
            const statusUji = isExpired ? '( TIDAK AKTIF UJI )' : '( AKTIF UJI )';
            const formattedDate = masaBerlaku.toLocaleDateString("en-GB");

            const updateNoRegKend = (newValue) => {
                if (prev_no_reg_kend !== null && prev_no_reg_kend !== newValue) {
                    if (is_found === 'Y') {
                        if (is_auto_lpr === 'Y') {
                            vms_plat_nomor = no_reg_kend;
                            vms_jbi = jbi;
                            pilihKeLpr(no_reg_kend);
                        }
                        Swal.fire({
                            title: `<div style="font-size:17px;font-weight:700;color:#1d4ed8;">KENDARAAN TERBACA — TERDAFTAR</div>`,
                            html: `
                                <div style="width:100%;">
                                    <div style="background:#1e3a8a;border-radius:8px;padding:12px;text-align:center;margin-bottom:10px;">
                                        <div style="color:rgba(255,255,255,.7);font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:4px;">NOMOR REGISTRASI</div>
                                        <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:4px;font-family:monospace;">${no_reg_kend}</div>
                                    </div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                                        <div style="background:#f8fafc;border-radius:7px;padding:10px;text-align:center;border:1px solid #e2e8f0;">
                                            <div style="color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px;">JBI MAKS.</div>
                                            <div style="color:#dc2626;font-size:18px;font-weight:800;font-family:monospace;">${Number(jbi).toLocaleString('id-ID')}<span style="font-size:10px;font-weight:600;"> Kg</span></div>
                                        </div>
                                        <div style="background:${isExpired ? '#fef2f2' : '#f0fdf4'};border-radius:7px;padding:10px;text-align:center;border:1px solid ${isExpired ? '#fca5a5' : '#86efac'};">
                                            <div style="color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px;">STATUS UJI</div>
                                            <div style="color:${isExpired ? '#dc2626' : '#15803d'};font-size:12px;font-weight:700;">${statusUji}</div>
                                        </div>
                                    </div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                                        <div style="background:#f8fafc;border-left:3px solid #1d4ed8;border-radius:5px;padding:8px;">
                                            <div style="color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:.4px;">JENIS KENDARAAN</div>
                                            <div style="color:#0f172a;font-size:12px;font-weight:600;margin-top:2px;">${jenis_kend}</div>
                                        </div>
                                        <div style="background:#f8fafc;border-left:3px solid ${isExpired ? '#dc2626' : '#15803d'};border-radius:5px;padding:8px;">
                                            <div style="color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:.4px;">MASA BERLAKU</div>
                                            <div style="color:#0f172a;font-size:12px;font-weight:600;margin-top:2px;">${formattedDate}</div>
                                        </div>
                                    </div>
                                </div>`,
                            showCancelButton: true,
                            confirmButtonText: '✓ Periksa Kendaraan',
                            cancelButtonText: '✕ Tutup',
                            allowOutsideClick: false,
                            width: 520,
                            customClass: { confirmButton: 'swal2-confirm-green', cancelButton: 'swal2-cancel-red' },
                            buttonsStyling: false,
                            didOpen: () => {
                                const confirmBtn = document.querySelector('.swal2-confirm-green');
                                const cancelBtn = document.querySelector('.swal2-cancel-red');
                                if (confirmBtn) {
                                    Object.assign(confirmBtn.style, { background:'#15803d',color:'#fff',padding:'9px 18px',borderRadius:'6px',fontSize:'13px',fontWeight:'700',border:'none',cursor:'pointer',margin:'0 4px' });
                                    confirmBtn.onmouseover = () => confirmBtn.style.background = '#166534';
                                    confirmBtn.onmouseout = () => confirmBtn.style.background = '#15803d';
                                }
                                if (cancelBtn) {
                                    Object.assign(cancelBtn.style, { background:'#475569',color:'#fff',padding:'9px 18px',borderRadius:'6px',fontSize:'13px',fontWeight:'700',border:'none',cursor:'pointer',margin:'0 4px' });
                                    cancelBtn.onmouseover = () => cancelBtn.style.background = '#334155';
                                    cancelBtn.onmouseout = () => cancelBtn.style.background = '#475569';
                                }
                            }
                        }).then((result) => {
                            if (result.isConfirmed) pilihKeLpr(no_reg_kend);
                        });
                    } else {
                        Swal.fire({
                            title: `<div style="font-size:17px;font-weight:700;color:#b91c1c;">KENDARAAN TERBACA — TIDAK TERDAFTAR</div>`,
                            html: `
                                <div style="text-align:center;padding:16px 0;">
                                    <div style="background:#fef2f2;border-radius:8px;padding:12px;display:inline-block;margin-bottom:12px;">
                                        <div style="font-family:monospace;font-size:20px;font-weight:800;color:#1d4ed8;letter-spacing:3px;">${no_reg_kend}</div>
                                    </div>
                                    <p style="color:#475569;font-size:13px;margin:0;">Data tidak ditemukan di basis data.<br>Lakukan pendataan secara manual.</p>
                                </div>`,
                            showCancelButton: true,
                            showConfirmButton: false,
                            cancelButtonText: "Tutup",
                            allowOutsideClick: false,
                            width: 400,
                        });
                    }
                }
                prev_no_reg_kend = newValue;
            };
            updateNoRegKend(no_reg_kend);
        },
        complete: function() {
            // $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" }).on("click", function() { $(this).tooltip("hide"); });
            _lprXhr = null;
        },
        error: function() { console.warn('Realtime LPR error'); }
    });
};

// ─────────────────────────────────────────
// CAMERA HELPERS — Loading + Fullscreen
// ─────────────────────────────────────────
const _setupCameraIframe = (id, src) => {
    const el = document.getElementById(id);
    if (!el || !src) return;
    const loader = el.closest('.cam-wrap').querySelector('.cam-loader');
    
    loader.style.display = 'flex';
    el.style.opacity = '0';
    
    el.onload = () => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; el.style.opacity = '1'; }, 300);
    };
    el.src = src;
};

const _reloadCameraIframe = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const wrap = el.closest('.cam-wrap');
    const loader = wrap ? wrap.querySelector('.cam-loader') : null;
    const src = el.src;

    if (loader) { loader.style.opacity = '1'; loader.style.display = 'flex'; }
    el.style.opacity = '0';
    el.src = '';

    setTimeout(() => {
        _setupCameraIframe(id, src);
    }, 200);
};

const _toggleCameraFullscreen = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Kita ambil pembungkusnya (cam-wrap) agar UI label & tombol ikut terbawa
    const wrap = el.closest('.cam-wrap');
    
    // Cek apakah saat ini sedang dalam mode fullscreen
    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.msFullscreenElement;

    if (!isFullscreen) {
        // JIKA TIDAK FULLSCREEN -> MASUK MODE FULLSCREEN
        if (wrap.requestFullscreen) {
            wrap.requestFullscreen();
        } else if (wrap.webkitRequestFullscreen) {
            wrap.webkitRequestFullscreen(); // Support Safari/Chrome lama
        } else if (wrap.msRequestFullscreen) {
            wrap.msRequestFullscreen(); // Support IE/Edge lama
        }
    } else {
        // JIKA SEDANG FULLSCREEN -> KELUAR (EXIT)
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};

// ─────────────────────────────────────────
// DOCUMENT READY
// ─────────────────────────────────────────
jQuery(document).ready(function() {
    // Intervals
    setInterval(checkJenisPelanggaran, 500);
    setInterval(checkRealTimeAntrian, 1000);

    $(_FORM_FIELDS.join(",")).on("input change", handleFormValidation);
    handleFormValidation();
    
    loadWeighingResults();
    if (is_lpr === 'Y') setInterval(_checkRealtimeLpr, 1000);
    loadDimentionsResults();


    // Tooltip: init sekali untuk elemen statis
    $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" });
    $(document).on("click", '[data-bs-toggle="tooltip"]', function() {
        $(this).tooltip("hide");
    });
    $(document).on("click", ".image-popup", function(e) {
        e.preventDefault();
        $.magnificPopup.open({
            items: { src: $(this).attr('href') || $(this).attr('src') },
            type: "image",
            closeOnContentClick: true,
            fixedContentPos: true,
            image: { verticalFit: true, titleSrc: function(item) { return item.el.attr('title') || ''; } }
        });
    });

    // JBI input sync
    $('#jbi').on('input', function() {
        if ($('#no_kendaraan').val().trim()) {
            jbi_kendaraan = parseInt(this.value) || 0;
            vms_jbi = parseInt(this.value) || 0;
        }
    });
    $('#indicator-berat .pnb-hd-btn.red').on('click', function() {
        resetWeight(); // Kembali ke pembacaan otomatis dari WebSocket
    });
    // Input masks
    $('.number-only').mask('00000000000');
    $("#masa_berlaku_uji").mask("99/99/9999", { placeholder: "dd/mm/yyyy" });

    // Image popup
    $('.image-popup').magnificPopup({
        type: 'image', closeOnContentClick: true, closeBtnInside: false,
        fixedContentPos: true, image: { verticalFit: true, titleSrc: 'title' }
    });

    // Selectpicker init
    loadSelecpicker('', '#sumbu_id');
    loadSelecpicker('', '#jenis_kendaraan_id');
    loadSelecpicker('', '#kepemilikan_id');
    loadSelecpicker(10, '#gol_sim_id');

    // Switch handlers
    $("#is_already_tilang").change(function() {
        const checked = this.checked;
        $('#iGroup-isAlreadyTilang .form-check-label').text(checked ? 'YA' : 'TIDAK');
        $('#iGroup-isFormSuratTilang').toggle(checked);
    });

    $("#gandengan").change(function() {
        $('#iGroup-isGandengan .form-check-label').text(this.checked ? 'YA' : 'TIDAK');
    });

    // Select2 init — reusable factory
    const initSelect2 = (id, placeholder, url) => {
        $(id).select2({
            placeholder,
            minimumInputLength: 0,
            ajax: {
                url: base_url + url, dataType: 'json', delay: 250,
                data: (params) => ({ q: params.term || '', page: params.page || 1 }),
                processResults: (data, params) => ({
                    results: (data.results || []).map(item => ({ id: item.id, text: item.name })),
                    pagination: { more: data.has_next }
                }),
                cache: true
            }
        });
    };
    initSelect2('#komoditi_id', 'Pilih komoditi...', 'api/load_komoditi');
    initSelect2('#asal_kota_id', 'Pilih asal pengiriman...', 'api/load_kab_kota');
    initSelect2('#tujuan_kota_id', 'Pilih tujuan pengiriman...', 'api/load_kab_kota');
    initSelect2('#pelanggaran_id', '-', 'api/load_jenis_pelanggaran');
    $('#pelanggaran_id').attr('data-control', 'select2');

    // Modal triggers
    $("#btn-loadAntrian").click(function() {
        _loadDtAntrianPenimbangan();
        $('#mdl-antrian').modal('show');
    });
    $("#btn-loadPenimbangan").click(function() {
        _loadDtPenimbangan();
        $('#mdl-penimbangan').modal('show');
    });

    // VMS WebSocket
    try {
        const ws = new WebSocket(ws_alat + "/input");
        let lastSent = null;
        ws.onopen = () => {
            console.log("KONEKSI WEBSOCKET VMS BERHASIL");
            setInterval(() => {
                const payload = { plat_nomor: vms_plat_nomor, jbi: vms_jbi, berat: vms_berat, berat_lebih: vms_lebih, persentase: vms_persentase, tilang: vms_tilang };
                const cmpStr = JSON.stringify({ plat_nomor: vms_plat_nomor, jbi: vms_jbi, berat_lebih: vms_lebih, persentase: vms_persentase, tilang: vms_tilang });
                if (cmpStr === lastSent) return;
                lastSent = cmpStr;
                if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
            }, 500);
        };
        ws.onerror = (err) => console.warn('VMS WS error:', err);
    } catch(e) { console.warn('VMS WebSocket init failed:', e); }

    // LPR button
    $("#btn-search-lpr").click(function() { _loadLprBlue(); });
    $("#btn-search-rfid").click(function() {
        Swal.fire({ title: "Ooops!", text: "Fitur ini sedang dalam proses pengembangan!", icon: "warning", allowOutsideClick: false });
    });

    // ── CAMERA INIT WITH LOADING PLACEHOLDERS ──
    _setupCameraIframe('camdepan', cam_depan_ws);
    _setupCameraIframe('cambelakang', cam_belakang_ws);
    if (is_lpr === 'Y') _setupCameraIframe('camlpr', cam_lpr_ws);

    // ── CAMERA RELOAD BUTTON ──
    const reloadBtn = document.getElementById("btn-reload-all");
    if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
            _reloadCameraIframe('camdepan');
            _reloadCameraIframe('cambelakang');
            if (is_lpr === 'Y') _reloadCameraIframe('camlpr');
        });
    }

    // ── CAMERA FULLSCREEN — double-click or button click ──
    document.querySelectorAll('.cam-wrap').forEach(wrap => {
        const iframe = wrap.querySelector('iframe');
        const fsBtn = wrap.querySelector('.cam-fs-btn');

        // Handle Klik Tombol
        if (fsBtn) {
            fsBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation(); // Agar tidak trigger double click di parent
                _toggleCameraFullscreen(iframe.id);
            };
        }

        // Handle Double Click pada area Kamera
        wrap.ondblclick = (e) => {
            _toggleCameraFullscreen(iframe.id);
        };
    });

    // Listener untuk merubah ikon tombol saat Fullscreen (Opsional)
    document.addEventListener('fullscreenchange', () => {
        const isFS = !!document.fullscreenElement;
        document.querySelectorAll('.cam-fs-btn').forEach(btn => {
            btn.innerHTML = isFS ? '✕' : '<svg width="11" height="11" ...>...</svg>'; // Ganti ikon
        });
    });

    // Exit fullscreen on ESC (for custom overlay fallback)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.querySelector('.cam-fs-overlay');
            if (overlay) document.body.removeChild(overlay);
        }
    });
});