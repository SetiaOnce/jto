"use strict";

// ============ TABLE RENDERER - MODERN DESIGN ============
const TableRenderer = {
    tables: {
        bptd: {
            container: '#table-bptd-container',
            search: '#search-bptd',
            reload: '#reload-bptd',
            badge: '#badge-bptd',
            length: '#length-bptd',
            api: 'api/sync_pusat/data_bptd',
            pageSize: 25,
            highlightColumns: [],
            columns: [
                { key: 'id', label: 'No.', width: '5%', align: 'center', highlight: false },
                { key: 'kode', label: 'Kode', width: '20%' },
                { key: 'nama', label: 'Nama BPTD', width: '40%' },
                { key: 'alamat', label: 'Alamat', width: '35%' }
            ]
        },
        lokasi: {
            container: '#table-lokasi-container',
            search: '#search-lokasi',
            reload: '#reload-lokasi',
            badge: '#badge-lokasi',
            length: '#length-lokasi',
            api: 'api/sync_pusat/data_lokasi',
            pageSize: 25,
            highlightColumns: ['bptd'],
            columns: [
                { key: 'id', label: 'No.', width: '5%', align: 'center' },
                { key: 'kode', label: 'Kode', width: '12%' },
                { key: 'nama', label: 'Nama Lokasi', width: '25%' },
                { key: 'bptd', label: 'BPTD', width: '18%', highlight: true },
                { key: 'alamat', label: 'Alamat', width: '20%' },
                { key: 'kapasitas', label: 'Kapasitas', width: '12%', type: 'number' },
                { key: 'is_active', label: 'Status', width: '8%', type: 'badge' }
            ]
        },
        kategori: {
            container: '#table-kategori-container',
            search: '#search-kategori',
            reload: '#reload-kategori',
            badge: '#badge-kategori',
            length: '#length-kategori',
            api: 'api/sync_pusat/data_kategori',
            pageSize: 25,
            highlightColumns: ['nama'],
            columns: [
                { key: 'id', label: 'No.', width: '5%', align: 'center' },
                { key: 'kode', label: 'Kode', width: '15%' },
                { key: 'nama', label: 'Nama Kategori', width: '50%', highlight: true },
                { key: 'created_at', label: 'Dibuat', width: '20%' },
                { key: 'is_active', label: 'Status', width: '10%', type: 'badge' }
            ]
        },
        komoditi: {
            container: '#table-komoditi-container',
            search: '#search-komoditi',
            reload: '#reload-komoditi',
            badge: '#badge-komoditi',
            length: '#length-komoditi',
            api: 'api/sync_pusat/data_komoditi',
            pageSize: 25,
            highlightColumns: ['kode'],
            columns: [
                { key: 'id', label: 'No.', width: '5%', align: 'center' },
                { key: 'kode', label: 'Kode', width: '15%', highlight: true },
                { key: 'nama', label: 'Nama Komoditi', width: '40%' },
                { key: 'kategori', label: 'Kategori', width: '20%' },
                { key: 'created_at', label: 'Dibuat', width: '12%' },
                { key: 'is_active', label: 'Status', width: '8%', type: 'badge' }
            ]
        },
        // ✅ FIX #3: Tambah kendaraan ke TableRenderer.tables
        kendaraan: {
            container: '#table-kendaraan-container',
            search: '#search-kendaraan',
            reload: '#reload-kendaraan',
            badge: '#badge-kendaraan',
            length: '#length-kendaraan',
            api: 'api/sync_pusat/data_kendaraan',
            pageSize: 25,
            highlightColumns: ['merek'],
            columns: [
                { key: 'id', label: 'No.', width: '5%', align: 'center' },
                { key: 'kode', label: 'Kode', width: '12%' },
                { key: 'merek', label: 'Merek', width: '20%', highlight: true },
                { key: 'tipe', label: 'Tipe', width: '25%' },
                { key: 'isi_silinder', label: 'Silinder', width: '13%', type: 'number' },
                { key: 'created_at', label: 'Dibuat', width: '15%' },
                { key: 'is_active', label: 'Status', width: '10%', type: 'badge' }
            ]
        }
    },

    currentPage: {
        bptd: 1,
        lokasi: 1,
        kategori: 1,
        komoditi: 1,
        kendaraan: 1,  // ✅ FIX #3: Tambah kendaraan ke currentPage
    },

    async loadTable(type, page = 1) {
        const config = this.tables[type];
        const search = $(config.search).val().trim();

        // Show loading
        $(config.container).html('<div class="text-center py-10"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');

        try {
            const response = await $.get(base_url + config.api, {
                page: page,
                search: search
            });

            if (!response.status) throw new Error(response.message);

            // ✅ FIX #1: Gunakan response.row (sesuai Python backend yang return key 'row')
            if (!response.row || !response.row.pagination || !response.row.items) {
                throw new Error("Format response dari server tidak valid");
            }

            this.renderTable(type, response.row.items, response.row.pagination);
            this.currentPage[type] = page;

        } catch (error) {
            console.error('Error loading table:', error);
            $(config.container).html(`<div class="alert alert-danger"><i class="la la-warning me-2"></i>${error.message}</div>`);
        }
    },

    renderTable(type, data, pagination) {
        const config = this.tables[type];
        const $container = $(config.container);
        let rowNumber = (pagination.current_page - 1) * 25 + 1;

        // Update badge
        $(config.badge).text(pagination.total.toLocaleString('id-ID'));

        // Build table HTML
        let html = '<div class="modern-table-wrapper">';
        html += '<table class="modern-table">';
        html += '<thead><tr>';

        // Header
        config.columns.forEach(col => {
            const style = col.align ? `text-align: ${col.align};` : '';
            html += `<th style="width: ${col.width}; ${style}">${col.label}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Rows
        if (data.length === 0) {
            html += `<tr><td colspan="${config.columns.length}" class="no-data-message">`;
            html += '<div class="no-data-icon">📭</div>';
            html += '<div>Tidak ada data</div>';
            html += '</td></tr>';
        } else {
            data.forEach(row => {
                html += '<tr>';
                config.columns.forEach(col => {
                    let value = row[col.key];
                    
                    let cellClass = '';
                    let cellStyle = `width: ${col.width};`;
                    
                    if (col.align) {
                        cellStyle += `text-align: ${col.align};`;
                    }
                    
                    if (col.key === 'id' || col.label === 'No.') {
                        cellClass = 'no-column';
                        value = rowNumber++;
                    }
                    
                    if (col.highlight) {
                        cellClass += ' highlight-column';
                    }
                    
                    let cellContent = '';
                    
                    if (col.type === 'badge') {
                        const badgeClass = value ? 'status-badge success' : 'status-badge danger';
                        const badgeText = value ? '✓ Aktif' : '✗ Tidak Aktif';
                        cellContent = `<span class="${badgeClass}">${badgeText}</span>`;
                    } else if (col.type === 'number') {
                        cellContent = value ? parseInt(value).toLocaleString('id-ID') : '-';
                    } else {
                        cellContent = value || '-';
                    }
                    
                    html += `<td class="${cellClass}" style="${cellStyle}">${cellContent}</td>`;
                });
                html += '</tr>';
            });
        }

        html += '</tbody></table></div>';

        // Pagination
        html += '<div class="pagination-wrapper">';
        html += `<div class="pagination-info">Menampilkan <strong>${data.length}</strong> dari <strong>${pagination.total}</strong> data</div>`;
        
        if (pagination.total_pages > 1) {
            html += '<ul class="pagination">';
            
            if (pagination.current_page > 1) {
                html += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-type="${type}" data-page="1">« Pertama</a></li>`;
                html += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-type="${type}" data-page="${pagination.current_page - 1}">‹ Sebelumnya</a></li>`;
            }
            
            for (let i = 1; i <= pagination.total_pages; i++) {
                const isActive = i === pagination.current_page ? 'active' : '';
                html += `<li class="page-item ${isActive}"><a class="page-link pagination-btn" href="#" data-type="${type}" data-page="${i}">${i}</a></li>`;
            }
            
            if (pagination.current_page < pagination.total_pages) {
                html += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-type="${type}" data-page="${pagination.current_page + 1}">Berikutnya ›</a></li>`;
                html += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-type="${type}" data-page="${pagination.total_pages}">Terakhir »</a></li>`;
            }
            
            html += '</ul>';
        }
        html += '</div>';

        $container.html(html);
    }
};

$(document).ready(function() {

    // ========== SINKRONISASI BUTTONS (BPTD, LOKASI, KATEGORI) ==========
    $('.btn-sync').on('click', function(e) {
        e.preventDefault();
        var btn = $(this);
        var type = btn.data('type');
        var url = "";

        if (type === 'BPTD') {
            url = base_url + "api/sync_pusat/bptd";
        } else if (type === 'LOKASI') {
            url = base_url + "api/sync_pusat/lokasi";
        } else if (type === 'JENIS_KENDARAAN') {
            url = base_url + "api/sync_pusat/jeniskendaraan";
        } else if (type === 'SUMBU') {
            url = base_url + "api/sync_pusat/sumbu";
        } else if (type === 'GOL_SIM') {
            url = base_url + "api/sync_pusat/golsim";
        } else if (type === 'TOLERANSI_KOMODITI') {
            url = base_url + "api/sync_pusat/toleransikomoditi";
        } else if (type === 'TOLERANSI_DIMENSI') {
            url = base_url + "api/sync_pusat/toleransidimensi";
        } else if (type === 'KATEGORI_KEPEMILIKAN') {
            url = base_url + "api/sync_pusat/kategorikepemilikan";
        } else if (type === 'DOKUMEN') {
            url = base_url + "api/sync_pusat/dokumen";
        } else if (type === 'JENIS_PELANGGARAN') {
            url = base_url + "api/sync_pusat/jenispelanggaran";
        } else if (type === 'SANKSI') {
            url = base_url + "api/sync_pusat/sanksi";
        } else if (type === 'SUBSANKSI') {
            url = base_url + "api/sync_pusat/subsanksi";
        } else if (type === 'SITAAN') {
            url = base_url + "api/sync_pusat/sitaan";
        } else if (type === 'PASAL') {
            url = base_url + "api/sync_pusat/pasal";
        } else if (type === 'PROVINSI') {
            url = base_url + "api/sync_pusat/provinsi";
        } else if (type === 'KOTAKAB') {
            url = base_url + "api/sync_pusat/kotakab";
        } else if (type === 'KATEGORI_KOMODITI') {
            url = base_url + "api/sync_pusat/kategorikomoditi";
        }

        Swal.fire({
            title: "Konfirmasi Sinkronisasi",
            text: "Apakah Anda yakin ingin melakukan sinkronisasi data " + type + " dari pusat?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Sinkronkan",
            cancelButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                btn.attr('data-kt-indicator', 'on').attr('disabled', true);

                $.ajax({
                    url: url,
                    type: "POST",
                    headers: {"X-CSRFToken": $('meta[name="csrf-token"]').attr("content")},
                    dataType: "JSON",
                    success: function(data) {
                        btn.removeAttr('data-kt-indicator').attr('disabled', false);
                        if (data.status) {
                            Swal.fire("Berhasil!", data.message, "success");
                            
                            const tableType = type === 'BPTD' ? 'bptd' : 
                                            type === 'LOKASI' ? 'lokasi' : 'kategori';
                            TableRenderer.loadTable(tableType);
                        } else {
                            Swal.fire("Gagal!", data.message, "error");
                        }
                    },
                    error: function(xhr) {
                        btn.removeAttr('data-kt-indicator').attr('disabled', false);
                        const errorMsg = xhr.responseJSON?.message || "Terjadi kesalahan sistem saat sinkronisasi.";
                        Swal.fire("Error!", errorMsg, "error");
                    }
                });
            }
        });
    });

    // ========== SINKRONISASI BESAR (KOMODITI & KENDARAAN) ==========
    $('.btn-sync-large').on('click', async function() {
        var btn = $(this);
        var type = btn.data('type');

        let progContainer = $('#progress-container');
        let progressBar = $('#sync-progress-bar');
        let statusText = $('#sync-status');
        let percentText = $('#sync-percent');
        let detailText = $('#sync-detail');
        
        Swal.fire({
            title: "Konfirmasi Sinkronisasi Besar",
            text: "Proses ini akan memakan waktu ~5-15 menit. Pastikan koneksi stabil. Lanjutkan?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Mulai",
            cancelButtonText: "Batal"
        }).then(async (result) => {
            if (result.isConfirmed) {
                btn.attr('disabled', true);
                progContainer.removeClass('d-none');
                progressBar.css('width', '0%').text('0%');
                
                try {
                    // ✅ FIX #2: Deklarasi meta di outer scope (fix "meta is not defined")
                    let meta = null;
                    let metaUrl = "";
                    let pageUrl = "";
                    
                    if (type === 'KOMODITI') {
                        metaUrl = base_url + "api/sync_pusat/komoditi/metadata";
                        pageUrl = base_url + "api/sync_pusat/komoditi/page";
                    } else if (type === 'KENDARAAN') {
                        metaUrl = base_url + "api/sync_pusat/kendaraan/metadata";
                        pageUrl = base_url + "api/sync_pusat/kendaraan/page";
                    } else {
                        throw new Error("Tipe sinkronisasi tidak dikenal: " + type);
                    }
                    
                    statusText.html('<span class="badge badge-light-info">Mengambil Metadata...</span>');
                    
                    // Fetch metadata
                    meta = await $.get(metaUrl);
                    
                    // Validasi response metadata - gunakan 'row' sesuai Python backend
                    if (!meta.status) throw new Error(meta.message || "Gagal mengambil metadata");
                    if (!meta.row || !meta.row.total_pages) {
                        throw new Error("Struktur metadata dari server tidak valid atau kosong.");
                    }

                    let totalPages = meta.row.total_pages;
                    let totalRecords = meta.row.total_records;

                    statusText.html('<span class="badge badge-light-info">Menyinkronkan...</span>');
                    detailText.text(`Total: ${totalRecords} data (${totalPages} halaman)`);

                    // Loop fetch data per page
                    for (let i = 1; i <= totalPages; i++) {
                        detailText.text(`Halaman ${i} dari ${totalPages} (Total: ${totalRecords} data)`);

                        let res = await $.get(pageUrl, { page: i });
                        
                        if (!res.status) {
                            console.warn(`Halaman ${i} gagal: ${res.message}`);
                            // Lanjut ke halaman berikutnya meski ada error
                            continue;
                        }

                        let percent = Math.round((i / totalPages) * 100);
                        progressBar.css('width', percent + '%').text(percent + '%');
                        percentText.text(percent + '%');

                        // Jeda kecil agar browser tidak freeze
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    let namaData = type === 'KOMODITI' ? 'komoditi' : 'kendaraan';
                    statusText.html('<span class="badge badge-light-success">Selesai ✓</span>');
                    Swal.fire("Berhasil!", `Seluruh data ${namaData} telah disinkronkan (${totalRecords} records).`, "success");
                    
                    setTimeout(() => {
                        if (type === 'KOMODITI') {
                            TableRenderer.loadTable('komoditi');
                        } else if (type === 'KENDARAAN') {
                            // ✅ FIX #3: Aktifkan load table kendaraan
                            TableRenderer.loadTable('kendaraan');
                        }
                    }, 1000);

                } catch (error) {
                    statusText.html('<span class="badge badge-light-danger">Error</span>');
                    Swal.fire("Error", "Gagal sinkronisasi: " + error.message, "error");
                    console.error("Sync error details:", error);
                } finally {
                    btn.attr('disabled', false);
                }
            }
        });
    });

    // ========== TABLE EVENTS ==========

    // Load tables on tab change
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        let target = $(e.target).attr('href');
        
        if (target === '#kt_tab_bptd_table') {
            TableRenderer.loadTable('bptd');
        } else if (target === '#kt_tab_lokasi_table') {
            TableRenderer.loadTable('lokasi');
        } else if (target === '#kt_tab_kategori_table') {
            TableRenderer.loadTable('kategori');
        } else if (target === '#kt_tab_komoditi_table') {
            TableRenderer.loadTable('komoditi');
        } else if (target === '#kt_tab_kendaraan_table') {
            // ✅ FIX #3: Tambah event untuk tab kendaraan
            TableRenderer.loadTable('kendaraan');
        }
    });

    // Reload buttons
    $('#reload-bptd').on('click', () => TableRenderer.loadTable('bptd'));
    $('#reload-lokasi').on('click', () => TableRenderer.loadTable('lokasi'));
    $('#reload-kategori').on('click', () => TableRenderer.loadTable('kategori'));
    $('#reload-komoditi').on('click', () => TableRenderer.loadTable('komoditi'));
    $('#reload-kendaraan').on('click', () => TableRenderer.loadTable('kendaraan')); // ✅ FIX #3

    // Search events (debounced)
    let searchTimeout;
    $('#search-bptd, #search-lokasi, #search-kategori, #search-komoditi, #search-kendaraan').on('keyup', function() {
        clearTimeout(searchTimeout);
        const type = $(this).attr('id').split('-')[1];
        
        searchTimeout = setTimeout(() => {
            TableRenderer.currentPage[type] = 1;
            TableRenderer.loadTable(type);
        }, 500);
    });

    // Pagination click handler (delegated)
    $(document).on('click', '.pagination-btn', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        const type = $(this).data('type');
        TableRenderer.loadTable(type, page);
    });
});