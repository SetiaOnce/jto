var table;
"use strict";
//Class Definition
const _loadDtKendaraan = () => {
    table = $('#dt-penindakan').DataTable({
        searchDelay: 300,
        processing: true,
        serverSide: true,
        ajax: {
            url: base_url+ 'api/laporan_penindakan/show',
            headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
            type: 'GET',
            data: function(d) {
                d.filter_shift = $('#filter_shift').val();
                d.filter_regu = $('#filter_regu').val();
                d.filter_sanksi = $('#filter_sanksi').val();
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
            { data: 'sink', name: 'sink', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'action', name: 'action', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'waktu', name: 'waktu', className: "align-top border px-2 text-center", width: "10%" },
            { data: 'no_kendaraan', name: 'no_kendaraan', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'nama_pengemudi', name: 'nama_pengemudi', className: "align-top border px-2", width: "10%", orderable: false },
            { data: 'alamat_pengemudi', name: 'alamat_pengemudi', className: "align-top border px-2", width: "10%", orderable: false },
            { data: 'asal_tujuan', name: 'asal_tujuan', className: "align-top border px-2", width: "8%" },
            { data: 'no_uji', name: 'no_uji', className: "align-top border px-2 text-center", width: "8%" },
            { data: 'pelanggaran', name: 'pelanggaran', className: "align-top border px-2", width: "8%" },
            { data: 'sanksi', name: 'sanksi', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'sanksi_tambahan', name: 'sanksi_tambahan', className: "align-top border px-2", width: "5%" },
            { data: 'sitaan', name: 'sitaan', className: "align-top border px-2", width: "6%" },
            { data: 'tgl_sidang', name: 'tgl_sidang', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'jam_sidang', name: 'jam_sidang', className: "align-top border px-2 text-center", width: "6%" },
            { data: 'pengadilan', name: 'pengadilan', className: "align-top border px-2", width: "5%" },
            { data: 'ppns', name: 'ppns', className: "align-top border px-2", width: "5%" },
            { data: 'no_skep', name: 'no_skep', className: "align-top border px-2 text-center", width: "5%" },
            { data: 'keterangan', name: 'keterangan', className: "align-top border px-2", width: "5%" },
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
    }if(element_id == '#filter_sanksi'){
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
const sendDataPenindakan = (idp_penindakan) => {
    let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    $.ajax({
        url: base_url+ "api/send_data/send",
        type: "GET",
        dataType: "JSON",
        data: {
            is_send_penindakan: true,
            penindakan_id: idp_penindakan
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
const _printSuratPeringatan = (is_preview, idp_penimbangan) =>  {
    if(is_preview == 'Y'){
        $.ajax({
            url: base_url+ "api/penindakan/show",
            type: "GET",
            dataType: "JSON",
            data: {
                is_select_kendaraan: true,
                is_show_surat_peringatan: true,
                kendaraan_id: idp_penimbangan
            },
            success: function (data) {
                if (data.status == true) {
                    var row = data.row;
                    // KOMODITI ASAL TUJUAN & PENGEMUDI
                    if(row.get_komoditi){
                        var komoditi = row.get_komoditi;
                        var asal_kota_val = komoditi.asal_kota_val;
                        var tujuan_kota_val = komoditi.tujuan_kota_val;
                        var komoditi_val = komoditi.komoditi_val;
                    }else{
                        var asal_kota_val = '-';
                        var tujuan_kota_val = '-';
                        var komoditi_val = '-';
                    }
                    if(row.get_komoditi){
                        var komoditi = row.get_komoditi;
                        var asal_kota_val = komoditi.asal_kota_val;
                        var tujuan_kota_val = komoditi.tujuan_kota_val;
                        var komoditi_val = komoditi.komoditi_val;
                    }else{
                        var asal_kota_val = '-';
                        var tujuan_kota_val = '-';
                        var komoditi_val = '-';
                    }
                    
                    var pelanggarans = row.pelanggarans;
                    var outputPelanggaran = '';
                    pelanggarans.forEach((pelanggaran, index) => {
                        const isChecked = pelanggaran.is_melanggar === 'Y' ? 'ck_1' : '';
                        outputPelanggaran += `
                            <div class="xC_0x">
                                <span>${index + 1}) ${pelanggaran.name}</span>
                                <span class="bx ${isChecked}"></span>
                            </div>
                        `;
                    });
                    var outputTtdPpns = `<div class="kS">
                        <div>Penyidik Pegawai Negeri Sipil</div>
                        <div class="nm">`+row.nama_ppns+`.</div>
                        <div class="id">NIP. `+row.nip_ppns+`</div>
                    </div>`
                    if(row.ttd_ppns){
                        var outputTtdPpns = `<div class="kS">
                            <div>Penyidik Pegawai Negeri Sipil</div>
                            <img src="`+row.ttd_ppns+`" alt="">
                            <div class="">`+row.nama_ppns+`.</div>
                            <div class="id">NIP. `+row.nip_ppns+`</div>
                        </div>`
                    }
                    var pelanggaran = row.dt_peringatan
                    $('#mdl-printStruk .body-content').html(`
                        <div class="kX_9pQ">
                            <!-- HEADER -->
                            <table class="hQ_0v7" aria-label="Header Surat">
                                <tr>
                                    <td class="cA_8m1">
                                        <div class="pL_4s2">
                                            <div class="lG_77p" aria-label="Logo">
                                                <img src="`+static_url+`dist/img/perhubungan.png" alt="Logo" />
                                            </div>
                                            <div class="hD_2k8">
                                                <div class="uU_1">DIREKTORAT JENDERAL PERHUBUNGAN DARAT</div>
                                                <div class="uU_2">KEMENTERIAN PERHUBUNGAN</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="cB_8m2">
                                        <div class="bX_4q1">
                                            <table>
                                            <tr>
                                                <td class="cL_1">Nomor Formulir</td>
                                                <td class="cL_2">:</td>
                                                <td class="cL_3">`+pelanggaran.nomor_formulir+`</td>
                                            </tr>
                                            <tr>
                                                <td class="cL_1">Tgl. Disahkan</td>
                                                <td class="cL_2">:</td>
                                                <td class="cL_3">`+pelanggaran.tgl_disahkan+`</td>
                                            </tr>
                                            <tr>
                                                <td class="cL_1">Tgl. Revisi</td>
                                                <td class="cL_2">:</td>
                                                <td class="cL_3">`+pelanggaran.tgl_revisi+`</td>
                                            </tr>
                                            <tr>
                                                <td class="cL_1">Tgl. Diberlakukan</td>
                                                <td class="cL_2">:</td>
                                                <td class="cL_3">`+pelanggaran.tgl_diberlakukan+`</td>
                                            </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <!-- TITLE BAR -->
                            <div class="zZ_88h">SURAT PERINGATAN ATAS PELANGGARAN TERTENTU</div>
                            <!-- META + ADDRESS -->
                            <div class="mN_5s0">
                                <div class="pL_0a0">
                                    <div class="qQ_2d2">
                                    <div class="rW_0"><div class="k1">Nomor</div><div class="k2">:</div><div class="k3">`+pelanggaran.nomor+`</div></div>
                                    <div class="rW_0"><div class="k1">Klasifikasi</div><div class="k2">:</div><div class="k3">RAHASIA</div></div>
                                    <div class="rW_0"><div class="k1">Lampiran</div><div class="k2">:</div><div class="k3">1 (Satu) Berkas</div></div>
                                    <div class="rW_0"><div class="k1">Perihal</div><div class="k2">:</div><div class="k3 sB_9">SURAT PERINGATAN</div></div>
                                    </div>
                                </div>
                                <div class="pR_0b0">
                                    <div class="aD_7y7">
                                    <div>`+row.nama_kota+`,</div>
                                    <div class="tC">Kepada,</div>
                                    <div class="b">Yth. Pemilik Kendaraan/ Perusahaan</div>
                                    <div>di Tempat</div>
                                    </div>
                                </div>
                            </div>
                            <!-- CONTENT -->
                            <div class="cN_6f6">
                                <div class="sE_1">
                                    <span class="nU_1">1.&nbsp;Dasar:</span>
                                    <ol>
                                        <li>
                                            Undang - undang Nomor 22 Tahun 2009 tentang Lalu Lintas dan Angkutan Jalan Pasal 307
                                            - Setiap orang yang mengemudikan Kendaraan Bermotor Angkutan Umum Barang yang tidak mematuhi
                                            ketentuan tata cara pemuatan, daya angkut, dimensi kendaraan sebagaimana dimaksud dalam Pasal 169 ayat (1)
                                            dipidana dengan pidana kurungan paling lama 2 (dua) bulan atau denda paling banyak Rp500.000,00
                                            (lima ratus ribu rupiah); Pasal 286 bahwa kendaraan bermotor roda empat atau lebih di jalan yang tidak memenuhi
                                            persyaratan laik jalan.
                                            <div class="iN_33">
                                            <div class="sU">(1) Pengemudi dan/atau Perusahaan Angkutan Umum barang wajib mematuhi ketentuan mengenai tata cara pemuatan, daya angkut, dimensi, persyaratan laik jalan dan kelas jalan.</div>
                                            <div class="sU">(2) Untuk mengawasi pemenuhan terhadap ketentuan sebagaimana dimaksud pada ayat (1) dilakukan pengawasan muatan angkutan barang..</div>
                                            <div class="sU">(3) Pengawasan muatan angkutan barang dilakukan dengan menggunakan alat penimbangan.</div>
                                            <div class="sU">(4) Alat penimbangan sebagaimana dimaksud pada ayat (3) terdiri atas:</div>
                                            <div class="sU">&nbsp;&nbsp;a. alat penimbangan yang dipasang secara tetap; atau</div>
                                            <div class="sU">&nbsp;&nbsp;b. alat penimbangan yang dapat dipindahkan.</div>
                                            </div>
                                        </li>
                                        <li>
                                            Peraturan Pemerintah Nomor 80 Tahun 2012 tentang Tata Cara Pemeriksaan Kendaraan Bermotor di Jalan
                                            dan Penindakan Pelanggaran Lalu Lintas dan Angkutan Jalan; dan;
                                        </li>
                                        <li>
                                            Peraturan Menteri Perhubungan Nomor PM. 18 Tahun 2021 tentang Pengawasan Muatan Angkutan Barang
                                            Dan Penyelenggaraan Penimbangan Kendaraan Bermotor Di Jalan.
                                        </li>
                                        <li>
                                            Peraturan Menteri Perhubungan Nomor PM. 19 Tahun 2021 Tentang Pengujian Berkala Kendaraan Bermotor.
                                        </li>
                                    </ol>
                                </div>
                                <div class="sE_1">
                                    <span class="nU_1">2.</span>
                                    Bahwa Saudara telah melakukan <b>PELANGGARAN TERTENTU</b> sebagaimana Pasal 286 (3) jo. Ps. 106
                                    <div style="margin-left:10px; margin-top:-10px;">
                                        <br/>Pada tanggal, <b>`+row.tanggal_timbang+`</b> di Satpel UPPKB Cekik, dengan data sebagai berikut :
                                    </div>
                                    <div style="margin-left:15px;">
                                        <div class="dT_3p3">
                                            <div class="r0">
                                                <div class="a">a. Nama Pemilik kendaraan</div>
                                                <div class="b">:</div>
                                                <div class="c">`+row.nama_pemilik+`</div>
                                            </div>
                                            <div class="r0">
                                                <div class="a">b. Alamat</div>
                                                <div class="b">:</div>
                                                <div class="c">`+row.alamat_pemilik+`</div>
                                            </div>
                                            <div class="r0">
                                                <div class="a">c. Nomor Kendaraan</div>
                                                <div class="b">:</div>
                                                <div class="c">`+row.no_reg_kend+`</div>
                                            </div>
                                            <div class="r0">
                                                <div class="a">d. Komoditi</div>
                                                <div class="b">:</div>
                                                <div class="c">`+komoditi_val+`</div>
                                            </div>
                                            <div class="r0">
                                                <div class="a">e. Asal Perjalanan</div>
                                                <div class="b">:</div>
                                                <div class="c">`+asal_kota_val+`</div>
                                            </div>
                                            <div class="r0">
                                                <div class="a">f. Tujuan Perjalanan</div>
                                                <div class="b">:</div>
                                                <div class="c">`+tujuan_kota_val+`</div>
                                            </div>
                                            <div class="r0">
                                                <div class="a">g. Nama Pengemudi</div>
                                                <div class="b">:</div>
                                                <div class="c">`+row.nama_pengemudi+`</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="sE_1">
                                    <span class="nU_1">3.</span>
                                    <b>TINDAK PIDANA</b> sebagaimana dimaksud butir 2 (dua) :
                                    <div style="margin-left:15px;">
                                        <div class="cB_9k9">
                                            <div class="lF">
                                                ${outputPelanggaran}
                                            </div>
                                            <div class="rF"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="sE_1 pW_2m2">
                                    <span class="nU_1">4.</span>
                                    <b>PERINGATAN</b> ini disampaikan kepada Saudara agar dalam melaksanakan Penyelenggaraan Angkutan Barang
                                    wajib mematuhi ketentuan perundang-undangan dan diberikan waktu selama 1 (satu) bulan sejak diterbitkannya
                                    surat peringatan ini untuk memperbaiki pelanggaran.
                                </div>
                            </div>
                            <!-- SIGNATURES -->
                            <div class="sG_8r8">
                                <div class="kS">
                                    <div>Pengemudi</div>
                                    <div class="nm">`+row.nama_pengemudi+`</div>
                                </div>
                                `+outputTtdPpns+`
                            </div>
                            <!-- TEMBUSAN -->
                            <div class="tM_1y1">
                                <div class="b">Tembusan</div>
                                <ol>
                                    <li>Direktur Prasarana Transportasi Jalan;</li>
                                    <li>Direktur Sarana Transportasi Jalan</li>
                                    <li>Direktur Lalu Lintas Jalan; dan</li>
                                    <li>Kepala `+row.nama_bptd+`</li>
                                </ol>
                            </div>
                            <div class="fT_9x9">
                                "<b>Peringatan : `+pelanggaran.jumlah_proteksi+` </b> Apabila kendaraan melanggar lagi akan dikenakan sanksi tilang!"
                            </div>
                        </div>
                    `);
                    console.log(row.ttd_ppns);
                    console.log(row.nama_ppns);
                    
                    // $('#mdl-printStruk').modal('show')
                    const modalContent = document.getElementById('print-struk-area');
                    const printArea = document.createElement('div');
                    printArea.id = 'printableArea';
                    printArea.innerHTML = modalContent.innerHTML;
                    document.body.appendChild(printArea);

                    // tunggu 0.5 detik baru print
                    setTimeout(() => {
                        window.print();
                        document.body.removeChild(printArea);
                    }, 200);
                }else{
                    console.log('Credentials Error');
                }
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }else{
        const modalContent = document.getElementById('print-struk-area');
        const printArea = document.createElement('div');
        printArea.id = 'printableArea';
        printArea.innerHTML = modalContent.innerHTML;

        document.body.appendChild(printArea);
        window.print();
        printArea.remove();
    }
}
const _printSuratTilang = (is_preview, idp_penimbangan) =>  {
    if(is_preview == 'Y'){
        $.ajax({
            url: base_url+ "api/penindakan/show",
            type: "GET",
            dataType: "JSON",
            data: {
                is_select_kendaraan: true,
                is_show_surat_tilang: true,
                kendaraan_id: idp_penimbangan
            },
            success: function (data) {
                if (data.status == true) {
                    var row = data.row;
                    var penindakan = row.data_penindakan;
                    console.log(penindakan);
                    
                    // JENIS KENDARAAN
                    if(penindakan.kategori_jenis_kendaraan_id == 1){
                        var category_jenis_kendaraan = '<div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:141.2mm; top:calc(23mm + var(--yC));">X</div>';
                    }else{
                        var category_jenis_kendaraan = '<div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:161.2mm; top:calc(23mm + var(--yC));">X</div> ';
                        // <div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:145.6mm; top:calc(25.9mm + var(--yC));">X</div>
                        // <div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:168.2mm; top:calc(25.9mm + var(--yC));">X</div> 
                        // <div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:192.2mm; top:calc(25.9mm + var(--yC));">X</div> 
                        // <div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:213.2mm; top:calc(25.9mm + var(--yC));">X</div> 
                    }

                    // JENIS  GOL SIM SIM
                    var golongan_sim_check = '<div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:85.5mm; top:calc(38.5mm + var(--yD));">X</div>'
                    var umum_tidak_umum = '';
                    if(penindakan.gol_sim_id == 1 || penindakan.gol_sim_id == 4){
                        var golongan_sim_check = '<div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:58mm; top:calc(38.5mm + var(--yD));">X</div>';
                        var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:103.5mm; top:calc(38.5mm + var(--yD));">_____</div>';
                        if(penindakan.gol_sim_id == 4){
                            var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:116mm; top:calc(38.5mm + var(--yD));">________</div>';
                        }
                    }
                    if(penindakan.gol_sim_id == 2 || penindakan.gol_sim_id == 5){
                        var golongan_sim_check = '<div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:66mm; top:calc(38.5mm + var(--yD));">X</div> ';
                        var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:103.5mm; top:calc(38.5mm + var(--yD));">_____</div>';
                        if(penindakan.gol_sim_id == 5){
                            var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:116mm; top:calc(38.5mm + var(--yD));">________</div>';
                        }
                    }
                    if(penindakan.gol_sim_id == 3 || penindakan.gol_sim_id == 6){
                        var golongan_sim_check = '<div class="u1__Tx0pLr zZ__b0ldR pP__fS41x" style="left:74mm; top:calc(38.5mm + var(--yD));">X</div> ';
                        var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:103.5mm; top:calc(38.5mm + var(--yD));">_____</div>';
                        if(penindakan.gol_sim_id == 6){
                            var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:116mm; top:calc(38.5mm + var(--yD));">________</div>';
                        }
                    }
                    // var umum_tidak_umum = '<div class="u1__Tx0pLr zZ__b0ldR" style="left:116mm; top:calc(38.5mm + var(--yD));">________</div>';
                    
                    $('#print-surat-tilang .body-content').html(`
                        <div class="k9__pQ7aZx" style="left:-20mm; top:calc(20mm + var(--yA));">
                            <div class="mM__gR9dBg"></div>
                            <!-- BARIS ATAS -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:47.8mm; top:calc(2.5mm + var(--yA));">${penindakan.hari_penindakan}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:79.2mm; top:calc(2.5mm + var(--yA));">${penindakan.tgl_penindakan}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:109.3mm; top:calc(2.5mm + var(--yA));">${penindakan.jam_penindakan}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:148.2mm; top:calc(2.5mm + var(--yA));">${penindakan.nama_ppns}</div>

                            <!-- BARIS 2 -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:44.3mm; top:calc(6.9mm + var(--yB));">${penindakan.pangkat_ppns}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:98.9mm; top:calc(6.9mm + var(--yB));">${penindakan.nip_ppns}</div>

                            <!-- BARIS 3 -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS33x" style="left:87.2mm; top:calc(12mm + var(--yB));">${penindakan.ham_nomor}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:151.6mm; top:calc(12mm + var(--yB));">${penindakan.nama_bptd}</div>

                            <!-- UPPKB -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:105.3mm; top:calc(18mm + var(--yB));">${penindakan.nama_uppkb}</div>

                            <!-- BLOK TENGAH -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:57.5mm; top:calc(22.8mm + var(--yC));">${penindakan.no_kendaraan}</div>
                            ${category_jenis_kendaraan}
                            
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:57.5mm; top:calc(27.7mm + var(--yC));">${penindakan.nama_pemilik}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x aL__split2"style="left:141.6mm; top:calc(27.7mm + var(--yC));">${penindakan.alamat_pemilik}</div>

                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:57.5mm; top:calc(33mm + var(--yD));">${penindakan.nama_pengemudi}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:119.8mm; top:calc(33mm + var(--yD));">${penindakan.umur_pengemudi}</div>
                            ${golongan_sim_check}
                            ${umum_tidak_umum}
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:57.5mm; top:calc(44.4mm + var(--yD));">${penindakan.no_sim}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:57.5mm; top:calc(50mm + var(--yD));">${penindakan.alamat_pengemudi}</div>

                            <!-- PASAL -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:39.8mm; top:calc(65mm + var(--yE));">${penindakan.pasal}</div>

                            <!-- SIDANG -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:49.1mm; top:calc(76mm  + var(--yE));">${penindakan.hari_sidang}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:69.4mm; top:calc(76mm  + var(--yE));">${penindakan.tgl_sidang}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:108.4mm; top:calc(76mm  + var(--yE));">${penindakan.jam_sidang}</div>

                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:141mm; top:calc(70.3mm + var(--yE));">${penindakan.pengadilan}</div>

                            <!-- NOMOR / MASA -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:120.2mm; top:calc(85mm + var(--yF));">${penindakan.no_uji}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:156.2mm; top:calc(85mm + var(--yF));">${penindakan.tanggal_uji}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:194.3mm; top:calc(85mm + var(--yF));">${penindakan.masa_berlaku_uji}</div>

                            <!-- TTD -->
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS33x" style="left:33.1mm; top:calc(122.8mm + var(--yG));">${penindakan.nama_pengemudi}</div>

                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS33x" style="left:146.8mm; top:calc(122.8mm + var(--yG));">${penindakan.nama_ppns}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS33x" style="left:146.8mm; top:calc(126.8mm + var(--yG));">NIP. ${penindakan.nip_ppns}</div>

                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:90.2mm; top:calc(136.3mm + var(--yA));">${penindakan.pengadilan}</div>
                            <div class="u1__Tx0pLr zZ__b0ldR pP__fS37x" style="left:90.2mm; top:calc(141.3mm + var(--yA));">${penindakan.kejaksaan}</div>
                        </div>
                    `);
                    const modalContent = document.getElementById('print-tilang-area');
                    const printArea = document.createElement('div');
                    printArea.id = 'printableArea';
                    printArea.innerHTML = modalContent.innerHTML;
                    document.body.appendChild(printArea);

                    setTimeout(() => {
                        window.print();
                        document.body.removeChild(printArea);
                    }, 200);
                }else{
                    console.log('Credentials Error');
                }
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }else{
        const modalContent = document.getElementById('print-tilang-area');
        const printArea = document.createElement('div');
        printArea.id = 'printableArea';
        printArea.innerHTML = modalContent.innerHTML;
        document.body.appendChild(printArea);

        // tunggu 0.5 detik baru print
        setTimeout(() => {
            window.print();
            document.body.removeChild(printArea);
        }, 200);
    }
}
// Class Initialization
jQuery(document).ready(function() {
    // Export Excel
    $("#export_excel").on("click", function () {
        var search = $('#search-data').val();
        var filter_shift = $('#filter_shift').val();
        var filter_regu = $('#filter_regu').val();
        var filter_sanksi = $('#filter_sanksi').val();
        var filter_date = $('#filter_date').val();
        const url = `${base_url}laporan_penindakan/export?export_type=excel&search=${search}&filter_shift=${filter_shift}&filter_regu=${filter_regu}&filter_sanksi=${filter_sanksi}&filter_date=${filter_date}`;
        window.location.href = url;
    });
    // Export pdf
    $("#export_pdf").on("click", function () {
        var search = $('#search-data').val();
        var filter_shift = $('#filter_shift').val();
        var filter_regu = $('#filter_regu').val();
        var filter_sanksi = $('#filter_sanksi').val();
        var filter_date = $('#filter_date').val();
        const url = `${base_url}laporan_penindakan/export?export_type=pdf&search=${search}&filter_shift=${filter_shift}&filter_regu=${filter_regu}&filter_sanksi=${filter_sanksi}&filter_date=${filter_date}`;
        window.location.href = url;
    });

    // Selectpicker
    loadSelectpicker(0, '#filter_shift')
    loadSelectpicker(0, '#filter_regu')
    loadSelectpicker(0, '#filter_sanksi')
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