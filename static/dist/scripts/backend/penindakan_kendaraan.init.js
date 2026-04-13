var table, is_tilang = false;
var selected_no_reg_kend = null;
//Load Datatables penindakan
const _loadDtPenindakan = () => {
  table = $('#dt-penindakanKendaraan').DataTable({
      searchDelay: 300,
      processing: true,
      serverSide: true,
      ajax: {
        url: base_url+ 'api/penindakan/show',
        headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
        type: 'GET',
        data: function(d) {
            d.filter_date = $('#filter_date').val();
            d.filter_sanksi = $('#filter_sanksi').val();
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
            { data: 'action', name: 'action', width: "15%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_kendaraan', name: 'no_kendaraan', width: "7%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'waktu', name: 'waktu', width: "8%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'no_uji', name: 'nouji', width: "10%", className: "align-top border px-2 text-center", orderable: false },
            { data: 'nama_pemilik', name: 'nama_pemilik', width: "10%", className: "align-top border px-2", orderable: false },
            { data: 'pelanggaran', name: 'pelanggaran', width: "30%", className: "align-top border px-2", orderable: false },
            { data: 'sanksi', name: 'sanksi', width: "10%", className: "align-top border px-2 text-center", orderable: false },
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
              <option value="100">100</option>
          </select>`,
          oPaginate: {
              sPrevious: "Sebelumnya",
              sNext: "Selanjutnya",
          },
      },
      fnDrawCallback: function (settings, display) {
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
          $("#dt-penindakanKendaraan_length select").selectpicker(),
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
  $("#dt-penindakanKendaraan").css("width", "100%"),
  $("#search-dt").val(""),
  $("#clear-searchDt").hide();
}
const _clearFormPenindakan = () => {
    $("#form-penindakan")[0].reset();
    $('#hiddenFormTilang').hide();
    $("#tilang_information").hide();

    $("#no_kendaraan").val(null).trigger("change");  
    $("#komoditi_id").val(null).trigger("change");  
    $("#asal_kota_id").val(null).trigger("change");
    $("#tujuan_kota_id").val(null).trigger("change");
    $("#pelanggaran_id").val(null).trigger("change");

    $("#sanksi_id").val(null).trigger("change");
    $("#pasal_id").val(null).trigger("change");
    $("#sub_sanksi_id").val(null).trigger("change");
    $("#sitaan_id").val(null).trigger("change");
    $("#kat_jenis_kendaraan").val(null).trigger("change");
    $("#kejaksaan_id").val(null).trigger("change");
    $("#pengadilan_id").val(null).trigger("change");
    $("#ppns_id").val(null).trigger("change");
    loadSelecpicker('', '#gol_sim_id');
    loadSelecpicker('', '#ppns_id');
    $('#jenis_kelamin_pengemudi').selectpicker('refresh').selectpicker('val', '');

    
    // DIMENSI
    $('#dimentions-results .panjang-kendaraan').html(`0 mm`)
    $('#dimentions-results .panjang-pengukuran').html(`0 mm`)
    $('#dimentions-results .panjang-toleransi').html(`0 mm`)
    $('#dimentions-results .panjang-kelebihan').html(`0 mm`)
    $('#dimentions-results .lebar-kendaraan').html(`0 mm`)
    $('#dimentions-results .lebar-pengukuran').html(`0 mm`)
    $('#dimentions-results .lebar-toleransi').html(`0 mm`)
    $('#dimentions-results .lebar-kelebihan').html(`0 mm`)
    $('#dimentions-results .tinggi-kendaraan').html(`0 mm`)
    $('#dimentions-results .tinggi-pengukuran').html(`0 mm`)
    $('#dimentions-results .tinggi-toleransi').html(`0 mm`)
    $('#dimentions-results .tinggi-kelebihan').html(`0 mm`)
    selected_no_reg_kend = null
}
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
    }if(bodyId == '#ppns_id'){
        $.ajax({
            url: base_url+ "api/load_sdm",
            type: "GET",
            dataType: "JSON",
            data: {
                is_selectrow: true,
                is_ppns: true,
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
    }if(bodyId == '#filter_sanksi'){
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
                $(bodyId).html(output).selectpicker('refresh').selectpicker('val', value);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    }
}
const _tindakKendaraan  = (idp_penimbangan) => {
    _clearFormPenindakan()
    $.ajax({
        url: base_url+ "api/penindakan/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_show_detail: true,
            idp_penimbangan
        },
        success: function (data) {
            if(data.status == true){
                var row = data.row;
                var datatilang = row.data_tilang
                $('[name="idp_penimbangan"]').val(row.idp_penimbangan)
                $('#mdl-penindakanKendaraan .detail-data-penimbangan').html(`
                    <h3 class="modal-title"><i class="ki-solid ki-notepad fs-3 text-dark"></i> Detail Kendaraan</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-rounded table-row-bordered border px-3">
                                <tbody>
                                    <tr>
                                        <td style="width: 60px">ID Transaksi</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.id_transaksi}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Nomor Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.noken}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Nomor STUK/KIR</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.nouji}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Masa Berlaku Uji</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.masa_akhir_uji}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Nama Pemilik</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.nama_pemilik}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Alamat</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.alamat_pemilik}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">JBI</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jbi}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">JBB</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jbb}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">MST</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.mst}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Jumlah Sumbu</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jumlah_sumbu}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Asal Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.asal_kendaraan}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Tujuan Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.tujuan_kendaraan}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Komoditi</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.komoditi}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Jenis Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jenis_kendaraan_text}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-rounded table-row-bordered border px-3">
                                <tbody>
                                    <tr>
                                        <td style="width: 60px">Tgl.Penimbangan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.tgl_timbang}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Berat Timbangan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.berat_timbangan} Kg</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Kelebihan Berat</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.kelebihan_berat} Kg</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Persen Kelebihan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.persentase_kelebihan_berat} %</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Panjang Pengukuran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.panjang_pengukuran} mm</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Lebar Pengukuran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.lebar_pengukuran} mm</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Tinggi Pengukuran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.tinggi_pengukuran} mm</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Jenis Pelanggaran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.pelanggaran}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Foto Penimbangan</td>
                                        <td style="width: 120px" class="foto-penimbangan" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!">
                                            <a class="image-popup" href="${row.foto_penimbangan1}">
                                                <img src="${row.foto_penimbangan1}" class="rounded" alt="foto-penimbangan1" title="FOTO PENIMBANGAN - 1" width="72px">
                                            </a>
                                            <a class="image-popup" href="${row.foto_penimbangan2}">
                                                <img src="${row.foto_penimbangan2}" class="rounded" alt="foto-penimbangan1" title="FOTO PENIMBANGAN - 2" width="72px">
                                            </a>
                                            <small class="text-danger">Klik untuk melihat gambar</small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="informasi-penilangan">
                            </div>
                        </div>
                    </div>
                `)
                if(datatilang){
                    $("#btn-edit").show().attr('onclick', '_editData(' + row.idp_penimbangan + ')'), $("#btn-print").show().attr('onclick', '_printSuratPeringatan("Y", ' + row.idp_penimbangan + ')');
                    $("#btn-save").attr('disabled', true).hide();

                    $("#form-penindakan").find("input, select, textarea").prop("disabled", true);
                    $('#status_tilang').prop('disabled', true).addClass('disabled-selectpicker').selectpicker('refresh');
                    $('#mdl-penindakanKendaraan .detail-data-penimbangan .informasi-penilangan').html(`
                        <div class="row notice d-flex bg-light-danger rounded border-danger border border-dashed p-3">
                            <h6 class="fs-5">Kendaraan sudah ditilang :</h6>
                            <div class="row">
                                <div class="col-md-5">Pelanggaran</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${row.pelanggaran}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">No.Tilang</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.no_tilang}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Tgl.Sidang</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.tgl_sidang}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Nama PPNS</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.nama_ppns}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">NIP PPNS</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.nip_ppns}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Lokasi Sidang</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.lokasi_sidang}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Catatan</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.catatan}</span></div>
                            </div>
                        </div>
                    `)
                }
                $('#mdl-penindakanKendaraan').modal('show')
                $('#mdl-penindakanKendaraan').on('shown.bs.modal', function () {
                    //Flatpicker
                    $("#tanggal_sidang").flatpickr({
                        dateFormat: "d/m/Y",
                        appendTo: document.querySelector("#mdl-penindakanKendaraan")
                    });
                    // MagnificPopup
                    $('#mdl-penindakanKendaraan .foto-penimbangan').magnificPopup({
                        delegate: 'a',
                        type: 'image',
                        tLoading: 'Sedang memuat foto #%curr%...',
                        mainClass: 'mfp-img-mobile',
                        gallery: {
                            enabled: true,
                            navigateByImgClick: false,
                            preload: [0,1]
                        },
                        image: {
                            tError: '<a href="%url%">Foto #%curr%</a> tidak dapat dimuat...',
                            titleSrc: function(item) {
                                return item.el.attr('title');
                            }
                        }
                    });
                    // Tooltip
                    $('[data-bs-toggle="tooltip"]').tooltip({
                        trigger: "hover"
                    }).on("click", function () {
                        $(this).tooltip("hide");
                    });
                });
            }else{
                console.log('Credentials Error.');
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
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
                                    Bahwa Saudara telah melakukan <b>PELANGGARAN TERTENTU</b> sebagaimana Pasal : `+row.pasal+`
                                    <div style="margin-left:10px; margin-top:-10px;">
                                        <br/>Pada tanggal, <b>`+row.tanggal_timbang+`</b> di Satpel `+data.row.nama_jt+`, dengan data sebagai berikut :
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
                                    <div style="margin-left:15px;">
                                        <div class="dT_3p3">
                                            <div class="r0">
                                                <div class="a">Keterangan Tindakan</div>
                                                <div class="b">:</div>
                                                <div class="c">`+row.keterangan_tindakan+`</div>
                                            </div>
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
const _editData = (idp_penimbangan) => {
    _clearFormPenindakan()
    $.ajax({
        url: base_url+ "api/penindakan/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_show_detail: true,
            idp_penimbangan
        },
        success: function (data) {
            if(data.status == true){
                var row = data.row;
                var datatilang = row.data_tilang
                $('[name="idp_penimbangan"]').val(row.idp_penimbangan)
                $('#mdl-penindakanKendaraan .detail-data-penimbangan').html(`
                    <h3 class="modal-title"><i class="ki-solid ki-notepad fs-3 text-dark"></i> Detail Kendaraan</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-rounded table-row-bordered border px-3">
                                <tbody>
                                    <tr>
                                        <td style="width: 60px">ID Transaksi</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.id_transaksi}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Nomor Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.noken}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Nomor STUK/KIR</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.nouji}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Masa Berlaku Uji</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.masa_akhir_uji}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Nama Pemilik</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.nama_pemilik}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Alamat</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.alamat_pemilik}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">JBI</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jbi}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">JBB</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jbb}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">MST</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.mst}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Jumlah Sumbu</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.jumlah_sumbu}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Asal Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.asal_kendaraan}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Tujuan Kendaraan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.tujuan_kendaraan}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Komoditi</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.komoditi}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-rounded table-row-bordered border px-3">
                                <tbody>
                                    <tr>
                                        <td style="width: 60px">Tgl.Pnimbangan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.tgl_timbang}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Berat Timbangan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.berat_timbangan} Kg</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Kelebihan Berat</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.kelebihan_berat} Kg</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Persen Kelebihan</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.persentase_kelebihan_berat} %</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Panjang Pengukuran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.panjang_pengukuran} mm</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Lebar Pengukuran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.lebar_pengukuran} mm</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Tinggi Pengukuran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.tinggi_pengukuran} mm</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Jenis Pelanggaran</td>
                                        <td style="width: 120px"><span class="me-2">:</span> <span>${row.pelanggaran}</span></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 60px">Foto Penimbangan</td>
                                        <td style="width: 120px" class="foto-penimbangan" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!">
                                            <a class="image-popup" href="${row.foto_penimbangan1}">
                                                <img src="${row.foto_penimbangan1}" class="rounded" alt="foto-penimbangan1" title="FOTO PENIMBANGAN - 1" width="72px">
                                            </a>
                                            <a class="image-popup" href="${row.foto_penimbangan2}">
                                                <img src="${row.foto_penimbangan2}" class="rounded" alt="foto-penimbangan1" title="FOTO PENIMBANGAN - 2" width="72px">
                                            </a>
                                            <small class="text-danger">Klik untuk melihat gambar</small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="informasi-penilangan">
                            </div>
                        </div>
                    </div>
                `)
                if(datatilang){
                    $('#status_tilang').selectpicker('refresh').selectpicker('val', datatilang.status_tilang);
                    $('#no_tilang').val(datatilang.no_tilang);
                    $('#tanggal_sidang').val(datatilang.tgl_sidang);
                    $('#catatan').val(datatilang.catatan);
                    $('#lokasi_sidang').val(datatilang.lokasi_sidang);
                    is_tilang = true
                    $('#mdl-penindakanKendaraan .hidden-forms').show()
                    $('#mdl-penindakanKendaraan .detail-data-penimbangan .informasi-penilangan').html(`
                        <div class="row notice d-flex bg-light-danger rounded border-danger border border-dashed p-3">
                            <h6 class="fs-5">Kendaraan sudah ditilang :</h6>
                            <div class="row">
                                <div class="col-md-5">Pelanggaran</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${row.pelanggaran}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">No.Tilang</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.no_tilang}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Tgl.Sidang</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.tgl_sidang}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Nama PPNS</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.nama_ppns}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">NIP PPNS</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.nip_ppns}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Lokasi Sidang</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.lokasi_sidang}</span></div>
                            </div>
                            <div class="row">
                                <div class="col-md-5">Catatan</div>
                                <div class="col-md-7"><span class="me-2">:</span><span>${datatilang.catatan}</span></div>
                            </div>
                        </div>
                    `)
                }
                $('#mdl-penindakanKendaraan').modal('show')
                $('#mdl-penindakanKendaraan').on('shown.bs.modal', function () {
                    //Flatpicker
                    $("#tanggal_sidang").flatpickr({
                        dateFormat: "d/m/Y",
                        appendTo: document.querySelector("#mdl-penindakanKendaraan")
                    });
                    // MagnificPopup
                    $('#mdl-penindakanKendaraan .foto-penimbangan').magnificPopup({
                        delegate: 'a',
                        type: 'image',
                        tLoading: 'Sedang memuat foto #%curr%...',
                        mainClass: 'mfp-img-mobile',
                        gallery: {
                            enabled: true,
                            navigateByImgClick: false,
                            preload: [0,1]
                        },
                        image: {
                            tError: '<a href="%url%">Foto #%curr%</a> tidak dapat dimuat...',
                            titleSrc: function(item) {
                                return item.el.attr('title');
                            }
                        }
                    });
                    // Tooltip
                    $('[data-bs-toggle="tooltip"]').tooltip({
                        trigger: "hover"
                    }).on("click", function () {
                        $(this).tooltip("hide");
                    });
                });
            }else{
                console.log('Credentials Error.');
            }
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
$("#btn-save").on("click", function (e) {
    e.preventDefault();
    $("#btn-save").attr('data-kt-indicator', 'on').attr('disabled', true);
    let no_kendaraan = $("#no_kendaraan"),

        nama_pengemudi = $("#nama_pengemudi"),
        alamat_pengemudi = $("#alamat_pengemudi"),
        jenis_kelamin_pengemudi = $("#jenis_kelamin_pengemudi"),
        umur_pengemudi = $("#umur_pengemudi"),
        no_telepon = $("#no_telepon"),
        warna_kendaraan = $("#warna_kendaraan"),
        gol_sim_id = $("#gol_sim_id"),
        no_identitas = $("#no_identitas"),
    
        sanksi_id = $("#sanksi_id"),
        pasal_id = $("#pasal_id"),
        sub_sanksi_id = $("#sub_sanksi_id"),
        sitaan_id = $("#sitaan_id"),
        kat_jenis_kendaraan = $("#kat_jenis_kendaraan"),
        tanggal_sidang = $("#tanggal_sidang"),
        jam_sidang = $("#jam_sidang"),
        pengadilan_id = $("#pengadilan_id"),
        kejaksaan_id = $("#kejaksaan_id"),
        ppns_id = $("#ppns_id"),
        no_skep = $("#no_skep");

    // Validation kendaraan
    if (no_kendaraan.val() == '' || no_kendaraan.val() == null) {
        toastr.error('Kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        $('#iGroup-nomorKendaraan button').removeClass('btn-light text-dark').addClass('btn-danger text-light').stop().delay(1500).queue(function () {
            $(this).removeClass('btn-danger text-light').addClass('btn-light text-dark');
        });
        no_kendaraan.focus();
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

    // Validation Penindakan
    if (sanksi_id.val() == '' || sanksi_id.val() == null) {
        toastr.error('Sanksi masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        sanksi_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (kat_jenis_kendaraan.val() == '' || kat_jenis_kendaraan.val() == null) {
        toastr.error('Kategori jenis kendaraan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        kat_jenis_kendaraan.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }if (ppns_id.val() == '' || ppns_id.val() == null) {
        toastr.error('PPNS masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
        ppns_id.focus();
        $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }

    if(sanksi_id.val() == 11){
        if (pasal_id.val() == '' || pasal_id.val() == null) {
            toastr.error('Pasal masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            pasal_id.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (sitaan_id.val() == '' || sitaan_id.val() == null) {
            toastr.error('Sitaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            sitaan_id.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (tanggal_sidang.val() == '') {
            toastr.error('Tanggal sidang masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            tanggal_sidang.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (jam_sidang.val() == '') {
            toastr.error('Jam sidang masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            jam_sidang.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (pengadilan_id.val() == '' || pengadilan_id.val() == null) {
            toastr.error('Pengadilan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            pengadilan_id.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }if (kejaksaan_id.val() == '' || kejaksaan_id.val() == null) {
            toastr.error('Kejaksaan masih kosong...', 'Uuppss!', {"progressBar": true, "timeOut": 1500});
            kejaksaan_id.focus();
            $('#btn-save').removeAttr('data-kt-indicator').attr('disabled', false);
            return false;
        }
    }

    let textConfirmSave = "Simpan data penindakan kendaraan!";
    Swal.fire({
        title: "",
        html: textConfirmSave,
        icon: "question",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Ya, Lanjutkan!',
        cancelButtonText: "Batal",
    }).then((result) => {
        if (result.value) {
            let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            let formData = new FormData($("#form-penindakan")[0]), ajax_url = base_url+ "api/penindakan/store";
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
                            _clearFormPenindakan();
                            if (data.row.sanksi_id == 11) {
                                _printSuratTilang('Y', data.row.idp_penimbangan)
                            }else{
                                _printSuratPeringatan('Y', data.row.idp_penimbangan)
                            }
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
                    blockUi.release(), blockUi.destroy();
                    $("#btn-save").removeAttr('data-kt-indicator').attr('disabled', false);
                    Swal.fire({
                        title: "Ooops!", 
                        text: "Terjadi kesalahan yang tidak diketahui, Periksa koneksi jaringan internet lalu coba kembali. Mohon hubungi pengembang jika masih mengalami masalah yang sama.", 
                        icon: "error", 
                        allowOutsideClick: false
                    });
                }
            });
        } else {
            $("#btn-save").removeAttr('data-kt-indicator').attr('disabled', false);
        }
    });
});
const checkRealTimeAntrian = () => {
    $.ajax({
        url: base_url+ "api/penindakan/show",
        type: "GET",
        dataType: "JSON",
        data: {
            is_check_count_kendaraan: true,
        },
        success: function (data) {
            var count = data.row;
            $('#jml-kendaraan').html(count)
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
}
// Helper function untuk inisialisasi select2
function initSelect2(selector, url, placeholder, extraData = {}) {
    $(selector).select2({
        placeholder: placeholder,
        minimumInputLength: 0,
        minimumResultsForSearch: false,
        ajax: {
            url: base_url + url,
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return Object.assign({
                    q: params.term || '',
                    page: params.page || 1
                }, extraData); // merge dengan data tambahan
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
}
// Validation form 
function handleFormValidation() {
    var buttonSelector = "#btn-save"
    let fields = [
        "#no_kendaraan",

        "#nama_pengemudi",
        "#alamat_pengemudi",
        "#jenis_kelamin_pengemudi",
        "#umur_pengemudi",
        "#no_telepon",
        "#warna_kendaraan",
        "#gol_sim_id",
        "#no_identitas",
        
        "#sanksi_id",
        "#kat_jenis_kendaraan",
        "#ppns_id",
        "#no_skep",
    ];
    const $btn = $(buttonSelector);
    function checkForm() {
        let allFilled = fields.every(sel => {
            let val = ($(sel).val() || "").toString().trim();
            return val !== "" && val !== null; // anggap "0" (dropdown default) = kosong
        });
        $btn.prop("disabled", !allFilled);
    }
    checkForm();
    $(fields.join(",")).on("input change", checkForm);
}
// Scanner
function initQRScanner(options = {}) {
    const {
    allowWhenTyping = true,
    gapResetMs = 80,
    endScanTimeoutMs = 250,
    onScan = () => {},
    } = options;

    let buffer = "";
    let lastTime = 0;
    let timer = null;

    function reset() {
        buffer = "";
        lastTime = 0;
        if (timer) clearTimeout(timer);
        timer = null;
    }

    function commitScan(code) {
        code = (code || "").trim();
        if (!code) return;
        onScan(code);
    }
    document.addEventListener("keydown", function (e) {
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        const typingField = ["input", "textarea", "select"].includes(tag);
        if (!allowWhenTyping && typingField) return;

        const now = Date.now();
        const gap = now - lastTime;
        lastTime = now;

        if (gap > gapResetMs) buffer = "";

        if (e.key === "Enter") {
            e.preventDefault();
            commitScan(buffer);
            reset();
            return;
        }

        if (e.key.length === 1) {
            buffer += e.key;

            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
            commitScan(buffer);
            reset();
            }, endScanTimeoutMs);
        }
    });
}

function applyChoice(value) {
  const textarea = document.getElementById('keterangan_penindakan');
  if (value) {
    textarea.value = value;
    document.getElementById('choice_segment').value = ''; // reset dropdown
  }
}
//Class Initialization
jQuery(document).ready(function() {
    setInterval(checkRealTimeAntrian, 1000);
    setInterval(handleFormValidation, 200);
    loadSelecpicker('', '#sumbu_id'), loadSelecpicker('', '#jenis_kendaraan_id'), loadSelecpicker('', '#kepemilikan_id'), loadSelecpicker('', '#ppns_id'), loadSelecpicker('', '#gol_sim_id'), loadSelecpicker('', '#filter_sanksi');

    initQRScanner({
        allowWhenTyping: true,
        onScan: (code) => {
            if ((code ?? "").trim().length > 2) {      
                console.log("OUTPUT SCAN QR:", code);
                var kode_trx = code;
                // var kode_trx = 'T01GVZWVD1KAVL/CKI00911/1225';
                let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
                blockUi.block(), blockUi.destroy();
                $.ajax({
                    url: base_url+ "api/penindakan/show",
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        is_qr_kendaraan: true,
                        kode_trx
                    },
                    success: function (data) {
                        blockUi.release(), blockUi.destroy();
                        var  row = data.row;
                        if(data.status ==true){
                            toastr.success(data.message, 'Success!', {"progressBar": true, "timeOut": 2500});
                            // Hidden form
                            let no_kendaraan_selected = new Option(row.no_reg_kend, row.id, true, true);
                            $("#no_kendaraan").append(no_kendaraan_selected).trigger("change");
    
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
                            $('#no_uji').val(row.no_uji),
                            $('#nama_pemilik').val(row.nama_pemilik),
                            $('#alamat_pemilik').val(row.alamat_pemilik),
                            $('#jbi').val(row.jbi),                
                            $('#berat_timbang').val(row.berat_timbang),                
                            $('#kelebihan_berat').val(row.kelebihan_berat),                
                            $('#persentase_kelebihan').val(row.prosen_lebih),                
                            loadSelecpicker(row.sumbu_id, '#sumbu_id');
                            loadSelecpicker(row.jenis_kendaraan_id, '#jenis_kendaraan_id');
                            loadSelecpicker(row.kepemilikan_id, '#kepemilikan_id');
                            // PELANGGARAN DOKUMEN
                            var masa_berlaku_uji = row.masa_berlaku_uji;
                            $("#masa_berlaku_uji").flatpickr({
                                dateFormat: "d/m/Y",
                                defaultDate: masa_berlaku_uji,
                            });
    
                            $('#gambar-kendaraan .depan').html(`<a class="image-popup" href="${row.foto_depan_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_depan_url}" class="rounded" alt="foto-kendaraan-depan" title="Foto kendaraan depan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Depan</h6>`);
                            $('#gambar-kendaraan .belakang').html(`<a class="image-popup" href="${row.foto_belakang_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_belakang_url}" class="rounded" alt="foto-kendaraan-belakang" title="Foto kendaraan belakang" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Belakang</h6>`);
                            $('#gambar-kendaraan .kiri').html(`<a class="image-popup" href="${row.foto_kiri_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_kiri_url}" class="rounded" alt="foto-kendaraan-kiri" title="Foto kendaraan kiri" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kiri</h6>`);
                            $('#gambar-kendaraan .kanan').html(`<a class="image-popup" href="${row.foto_kanan_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_kanan_url}" class="rounded" alt="foto-kendaraan-kanan" title="Foto kendaraan kanan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kanan</h6>`);
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
    
                            // DIMENSI
                            $('#dimentions-results .panjang-kendaraan').html(`${row.panjang_utama} mm`)
                            $('#dimentions-results .panjang-pengukuran').html(`${row.panjang_ukur} mm`)
                            $('#dimentions-results .panjang-toleransi').html(`${row.panjang_toleransi} mm`)
                            $('#dimentions-results .panjang-kelebihan').html(`${row.panjang_lebih} mm`)
                            $('#dimentions-results .lebar-kendaraan').html(`${row.lebar_utama} mm`)
                            $('#dimentions-results .lebar-pengukuran').html(`${row.lebar_ukur} mm`)
                            $('#dimentions-results .lebar-toleransi').html(`${row.lebar_toleransi} mm`)
                            $('#dimentions-results .lebar-kelebihan').html(`${row.lebar_lebih} mm`)
                            $('#dimentions-results .tinggi-kendaraan').html(`${row.tinggi_utama} mm`)
                            $('#dimentions-results .tinggi-pengukuran').html(`${row.tinggi_ukur} mm`)
                            $('#dimentions-results .tinggi-toleransi').html(`${row.tinggi_toleransi} mm`)
                            $('#dimentions-results .tinggi-kelebihan').html(`${row.tinggi_lebih} mm`)
                            // PELANGGARAN
                            $("#pelanggaran_id").val(null).trigger("change");
                            var pelanggaran = row.pelanggaran
                            pelanggaran.forEach(pel => {
                                let pelanggaran = new Option(pel.name, pel.id, true, true);
                                $("#pelanggaran_id").append(pelanggaran).trigger("change");
                            });

                            var protection = row.jumlah_proteksi;
                            if (!$("#s2-style").length) {
                                $("head").append(`
                                    <style id="s2-style">
                                    .select2-readonly .select2-selection{
                                        pointer-events:none;
                                        background:#f8f8f8;
                                    }
                                    </style>
                                `);
                            }
                            const $sanksi = $("#sanksi_id");
                            if (protection >= 2) {
                                $sanksi.empty()
                                    .append(new Option("TILANG", 11, true, true))
                                    .trigger("change");

                                $sanksi.data("select2").$container.addClass("select2-readonly");
                                $("#tilang_information").show();
                            } else {
                                $sanksi.empty()
                                    .append(new Option("-", 0, true, true))
                                    .trigger("change");

                                $sanksi.data("select2").$container.removeClass("select2-readonly");
                                $("#tilang_information").hide();
                            }
                        }else{
                            console.log(data.row);
                            var is_tindakan = data.row.is_tindakan
                            if (is_tindakan == true) {
                                toastr.warning(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
                            }else{
                                toastr.error(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
                                $("#no_kendaraan").select2("open");
                            }
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
            }
        }
    });
    $('#no_kendaraan').change(function(){
        var kendaraan_id = this.value;
        let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
        blockUi.block(), blockUi.destroy();
        $.ajax({
            url: base_url+ "api/penindakan/show",
            type: "GET",
            dataType: "JSON",
            data: {
                is_select_kendaraan: true,
                kendaraan_id
            },
            success: function (data) {
                blockUi.release(), blockUi.destroy();
                // _clearFormPenindakan()
                var  row = data.row;
                if(data.status ==true){
                    // Hidden form
                    selected_no_reg_kend = row.no_reg_kend
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
                    $('#no_uji').val(row.no_uji),
                    $('#nama_pemilik').val(row.nama_pemilik),
                    $('#alamat_pemilik').val(row.alamat_pemilik),
                    $('#jbi').val(row.jbi),                
                    $('#berat_timbang').val(row.berat_timbang),                
                    $('#kelebihan_berat').val(row.kelebihan_berat),                
                    $('#persentase_kelebihan').val(row.prosen_lebih),                
                    loadSelecpicker(row.sumbu_id, '#sumbu_id');
                    loadSelecpicker(row.jenis_kendaraan_id, '#jenis_kendaraan_id');
                    loadSelecpicker(row.kepemilikan_id, '#kepemilikan_id');
                    // PELANGGARAN DOKUMEN
                    var masa_berlaku_uji = row.masa_berlaku_uji;
                    $("#masa_berlaku_uji").flatpickr({
                        dateFormat: "d/m/Y",
                        defaultDate: masa_berlaku_uji,
                    });

                    $('#gambar-kendaraan .depan').html(`<a class="image-popup" href="${row.foto_depan_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_depan_url}" class="rounded" alt="foto-kendaraan-depan" title="Foto kendaraan depan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Depan</h6>`);
                    $('#gambar-kendaraan .belakang').html(`<a class="image-popup" href="${row.foto_belakang_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_belakang_url}" class="rounded" alt="foto-kendaraan-belakang" title="Foto kendaraan belakang" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Belakang</h6>`);
                    $('#gambar-kendaraan .kiri').html(`<a class="image-popup" href="${row.foto_kiri_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_kiri_url}" class="rounded" alt="foto-kendaraan-kiri" title="Foto kendaraan kiri" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kiri</h6>`);
                    $('#gambar-kendaraan .kanan').html(`<a class="image-popup" href="${row.foto_kanan_url}" data-bs-toggle="tooltip" title="Klik untuk melihat gambar!"><img src="${row.foto_kanan_url}" class="rounded" alt="foto-kendaraan-kanan" title="Foto kendaraan kanan" width="132px"></a><h6 class="text-gray-700 text-center mt-1 fs-7 ">Foto Kanan</h6>`);
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

                    // DIMENSI
                    $('#dimentions-results .panjang-kendaraan').html(`${row.panjang_utama} mm`)
                    $('#dimentions-results .panjang-pengukuran').html(`${row.panjang_ukur} mm`)
                    $('#dimentions-results .panjang-toleransi').html(`${row.panjang_toleransi} mm`)
                    $('#dimentions-results .panjang-kelebihan').html(`${row.panjang_lebih} mm`)
                    $('#dimentions-results .lebar-kendaraan').html(`${row.lebar_utama} mm`)
                    $('#dimentions-results .lebar-pengukuran').html(`${row.lebar_ukur} mm`)
                    $('#dimentions-results .lebar-toleransi').html(`${row.lebar_toleransi} mm`)
                    $('#dimentions-results .lebar-kelebihan').html(`${row.lebar_lebih} mm`)
                    $('#dimentions-results .tinggi-kendaraan').html(`${row.tinggi_utama} mm`)
                    $('#dimentions-results .tinggi-pengukuran').html(`${row.tinggi_ukur} mm`)
                    $('#dimentions-results .tinggi-toleransi').html(`${row.tinggi_toleransi} mm`)
                    $('#dimentions-results .tinggi-kelebihan').html(`${row.tinggi_lebih} mm`)
                    // PELANGGARAN
                    $("#pelanggaran_id").val(null).trigger("change");
                    var pelanggaran = row.pelanggaran
                    pelanggaran.forEach(pel => {
                        let pelanggaran = new Option(pel.name, pel.id, true, true);
                        $("#pelanggaran_id").append(pelanggaran).trigger("change");
                    });

                    var protection = row.jumlah_proteksi;
                    if (!$("#s2-style").length) {
                        $("head").append(`
                            <style id="s2-style">
                            .select2-readonly .select2-selection{
                                pointer-events:none;
                                background:#f8f8f8;
                            }
                            </style>
                        `);
                    }

                    const $sanksi = $("#sanksi_id");
                    if (protection >= 2) {
                        $sanksi.empty()
                            .append(new Option("TILANG", 11, true, true))
                            .trigger("change");

                        $sanksi.data("select2").$container.addClass("select2-readonly");
                        $("#tilang_information").show();
                    } else {
                        $sanksi.empty()
                            .append(new Option("-", 0, true, true))
                            .trigger("change");

                        $sanksi.data("select2").$container.removeClass("select2-readonly");
                        $("#tilang_information").hide();
                    }
                }else{
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
    });
    $('#sanksi_id').change(function(){
        var sanksi_id = this.value
        if(parseInt(sanksi_id) == 11){
            $('#hiddenFormTilang').show();
            initSelect2('#sub_sanksi_id', 'api/load_sub_sanski', "-", {
                sanksi_id: sanksi_id
            });
            initSelect2('#sitaan_id', 'api/load_sitaan', "-", {
                sanksi_id: sanksi_id
            });
        }else{
            $('#hiddenFormTilang').hide();
        }
    });
    $("#ppns_id").change(function() {
        var idp = this.value
        $.ajax({
            url: base_url+ "api/load_sdm",
            type: "GET",
            dataType: "JSON",
            data:{
                idp
            },success: function (data) {
                var row = data.row
                $('#no_skep').val(row.no_skep)
                $('#nama_ppns').val(row.name)
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Load data is error');
            }
        });
    });
    $("#filter_date").change(function() {
        _loadDtPenindakan();
    });
    $("#filter_sanksi").change(function() {
        _loadDtPenindakan();
    });
    $("#filter_date").flatpickr({
        dateFormat: "d/m/Y",
        appendTo: document.getElementById("mdl-penimbangan")
    });
    $("#tanggal_sidang").flatpickr({
        dateFormat: "d/m/Y",
        minDate: "today" 
    });
    $("#jam_sidang").flatpickr({
        enableTime: true,
        noCalendar: true,
        time_24hr: true,
        dateFormat: "H:i",
    });
	$('.no-space').on('keypress', function (e) {
		return e.which !== 32;
	});
    $('.number-only').mask('0000000000000000');
    initSelect2('#no_kendaraan', 'api/penindakan/show', "Cari nomor kendaraan...", {show_kendaraan_melanggar: true});
    initSelect2('#komoditi_id', 'api/load_komoditi', "-");
    initSelect2('#asal_kota_id', 'api/load_kab_kota', "-");
    initSelect2('#tujuan_kota_id', 'api/load_kab_kota', "-");
    initSelect2('#pelanggaran_id', 'api/load_jenis_pelanggaran', "-");
    initSelect2('#pasal_id', 'api/load_pasal', "-");
    initSelect2('#sanksi_id', 'api/load_sanksi', "-");
    initSelect2('#sub_sanksi_id', 'api/load_sub_sanski', "-");
    initSelect2('#sitaan_id', 'api/load_sitaan', "-");
    initSelect2('#pengadilan_id', 'api/load_pengadilan', "-");
    initSelect2('#kejaksaan_id', 'api/load_kejaksaan', "-");
    initSelect2('#kat_jenis_kendaraan', 'api/load_jenis_kendaraan_tilang', "-");
    // Load Penindakan
    $("#btn-loadPenindakan").click(function() {
        _loadDtPenindakan();
        $('#mdl-penimbangan').modal('show');
    });
    $("#btn-check-history").click(function() {
        function checkHistoryKendaraan(no_kendaraan) {
            let target = document.querySelector("body"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
            blockUi.block(), blockUi.destroy();
            // Load Ajax
            $.ajax({
                url: base_url+ "api/penindakan/show",
                type: "GET",
                dataType: "JSON",
                data: {
                    is_show_history: true,
                    no_kendaraan: no_kendaraan,
                },
                success: function(data){
                    blockUi.release(), blockUi.destroy();
                    if (data.status == true) {
                        var rows = data.row
                        var bodyContent = '';
                        rows.forEach(row => {
                            console.log(row);
                            bodyContent += `
                                <div class="col-md-6">
                                    <a data-bs-toggle="tooltip" data-bs-placement="bottom" title="Timbang Kendaraan!" class="text-decoration-none">
                                        <div class="card border-0 shadow-sm mb-4">
                                            <!-- Header dengan warna background -->
                                            <div class="card-header bg-primary text-white border-0 py-3">
                                                <div class="d-flex align-items-center justify-content-between">
                                                    <h5 class="mb-0 fw-bold text-light">${row.no_kendaraan}</h5>
                                                </div>
                                            </div>
                                            
                                            <!-- Body Card -->
                                            <div class="card-body p-5">
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Asal & Tujuan</span>
                                                        <span class="text-gray-800 fw-bold d-block fs-7">${row.asal_tujuan}</span>
                                                    </div>
                                                </div>
                                                
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Komoditi</span>
                                                        <span class="text-gray-800 fw-bold d-block fs-7">${row.komoditi}</span>
                                                    </div>
                                                </div>
        
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Sanksi</span>
                                                        <span class="text-gray-800 fw-bold d-block fs-7">${row.sanksi}</span>
                                                    </div>
                                                </div>
        
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Nama Pengemudi</span>
                                                        <span class="text-gray-800 fw-bold d-block fs-7">${row.nama_pengemudi}</span>
                                                    </div>
                                                </div>
        
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Tanggal Penindakan</span>
                                                        <span class="text-gray-800 fw-bold d-block fs-7">${row.waktu_penindakan}</span>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Pelanggaran</span>
                                                        <span class="text-gray-800 fw-bold d-block fs-7">${row.pelanggaran}</span>
                                                    </div>
                                                </div>
        
                                                <div class="d-flex align-items-start mb-3">
                                                    <div class="flex-grow-1">
                                                        <span class="text-gray-500 fw-semibold d-block fs-8 mb-1">Foto Penimbangan</span>
                                                        ${row.foto_depan}
                                                        ${row.foto_belakang}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            `;
                        });
                        $('#mdl-history .heade-content').html(`Riwayat Penindakan Kendaraan <span class="text-primary">( ${rows.length} Riwayat ) - ${no_kendaraan}</span>`)
                        $('#mdl-history .body-content').html(bodyContent)
                        $('#mdl-history').modal('show')
                    }else{
                        Swal.fire({
                            title: "Ooops!",
                            html: 'Riwayat kendaraan tidak ditemukan!',
                            icon: "warning",
                            allowOutsideClick: false,
                        }).then(function (result) {
                            
                        });
                    }
                }, complete: function (jqXHR, textStatus, errorThrown) {
                    //Image PopUp
                    $('.image-popup').magnificPopup({
                        type: 'image',
                        closeOnContentClick: true,
                        closeBtnInside: false,
                        fixedContentPos: true,
                        image: {
                            verticalFit: true
                        }
                    });
                }, error: function (jqXHR, textStatus, errorThrown){
                    blockUi.release(), blockUi.destroy();
                    Swal.fire({title: "Ooops!", text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang...", icon: "error", allowOutsideClick: false}).then(function(result){
                        console.log("Load data is error!");
                    });
                }
            });
        }
        if (selected_no_reg_kend == '' || selected_no_reg_kend == null) {
            Swal.fire({
                width: '40%',
                height: '40%',
                html: `
                    <div class="row mb-8">
                        <span class="fs-3 mb-3 fw-bolder "><i class="las la-pen text-dark fs-2 me-3"></i>Check Riwayat Kendaraan</span>
                        <div class="col-lg-12">
                            <input type="text" name="no_kendaraan_riwayat" id="no_kendaraan_riwayat" class="form-control input-sm" maxlength="50" placeholder="NO KENDARAAN" style="text-transform: uppercase;"/>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Check Riwayat',
                position: 'top',
                focusConfirm: false,
                allowOutsideClick: false,
                showCancelButton: true,
                cancelButtonText: 'Batal',
                preConfirm: () => {
                    const no_kendaraan = Swal.getPopup().querySelector('#no_kendaraan_riwayat').value
                    if (!no_kendaraan) {
                        Swal.showValidationMessage(`Isi semua form yang tersedia`)
                    } return {
                        no_kendaraan
                    }
                }
            }).then((result) => {
                let no_kendaraan = `${result.value.no_kendaraan}`;
                checkHistoryKendaraan(no_kendaraan)
            });
        }else{
            checkHistoryKendaraan(selected_no_reg_kend)
        }
    });
    // $('#print-surat-tilang').modal('show');
});