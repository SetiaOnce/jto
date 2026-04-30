"use strict";

$(document).ready(function() {
    _loadTable();
    _setupFormValidation();
});

/**
 * Load shifts table data
 */
function _loadTable() {
    $.ajax({
        url: base_url + "api/manage_shift/list",
        type: "GET",
        dataType: "JSON",
        success: function(res) {
            console.log(res.row);
            
            if (res.status && res.row) {
                let html = '';
                res.row.forEach(row => {
                    const statusBadge = row.is_active == 'Y' 
                        ? '<span class="badge badge-light-success">AKTIF</span>' 
                        : '<span class="badge badge-light-danger">TIDAK AKTIF</span>';
                    
                    html += `<tr>
                        <td class="py-5"><strong>${row.kode}</strong></td>
                        <td>${row.nama}</td>
                        <td>${row.jam_mulai}</td>
                        <td>${row.jam_selesai}</td>
                        <td>${statusBadge}</td>
                        <td class="text-end py-5">
                            <button class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1" 
                                    onclick="_edit(${row.id})" 
                                    title="Edit">
                                <i class="las la-edit fs-3"></i>
                            </button>
                        </td>
                    </tr>`;
                });
                $('#table-shift tbody').html(html);
            } else {
                $('#table-shift tbody').html(
                    '<tr><td colspan="6" class="text-center text-muted">Tidak ada data shift</td></tr>'
                );
            }
        },
        error: function(xhr) {
            console.error("Error loading shifts:", xhr);
            toastr.error("Gagal memuat data shift");
            $('#table-shift tbody').html(
                '<tr><td colspan="6" class="text-center text-danger">Error memuat data</td></tr>'
            );
        }
    });
}

/**
 * Show add modal (reset form)
 */
function _add() {
    _resetForm();
    $('#shift_id').val('');
    $('#modal-title').text('Tambah Shift');
    $('#modal-shift').modal('show');
}

/**
 * Edit shift - load data and show modal
 */
function _edit(id) {
    $.ajax({
        url: base_url + "api/manage_shift/show",
        type: "GET",
        data: { id: id },
        dataType: "JSON",
        success: function(res) {
            if (res.status && res.row) {
                $('#shift_id').val(res.row.id);
                $('#kode').val(res.row.kode);
                $('#nama').val(res.row.nama);
                $('#jam_mulai').val(res.row.jam_mulai);
                $('#jam_selesai').val(res.row.jam_selesai);
                if(res.row.is_active == 'Y' ){
                    $('#is_active').prop('checked', true);
                }else{
                    $('#is_active').prop('checked', false);
                }
                
                $('#modal-title').text('Edit Shift');
                $('#modal-shift').modal('show');
                _clearErrors();
            } else {
                toastr.error(res.message || "Gagal memuat data shift");
            }
        },
        error: function(xhr) {
            console.error("Error loading shift:", xhr);
            toastr.error("Gagal memuat data shift");
        }
    });
}

/**
 * Save shift (create or update)
 */
function _save() {
    // Validate form
    if (!_validateForm()) {
        return;
    }

    let formData = new FormData($('#form-shift')[0]);
    let btn = $('#btn-save');
    
    // Disable button and show loading
    btn.attr('disabled', true);
    btn.find('.indicator-label').hide();
    btn.find('.indicator-progress').show();

    $.ajax({
        url: base_url + "api/manage_shift/store",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
        dataType: "JSON",
        success: function(res) {
            if (res.status) {
                $('#modal-shift').modal('hide');
                _loadTable();
                toastr.success(res.message || "Data shift berhasil disimpan");
            } else {
                toastr.error(res.message || "Gagal menyimpan data");
            }
        },
        error: function(xhr) {
            console.error("Error saving shift:", xhr);
            let errorMsg = "Gagal menyimpan data shift";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            toastr.error(errorMsg);
        },
        complete: function() {
            // Re-enable button and hide loading
            btn.attr('disabled', false);
            btn.find('.indicator-label').show();
            btn.find('.indicator-progress').hide();
        }
    });
}

/**
 * Delete shift with confirmation
 */
function _delete(id) {
    Swal.fire({
        title: "Apakah anda yakin?",
        text: "Data shift yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc3545"
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: base_url + "api/manage_shift/delete",
                type: "POST",
                data: { id: id },
                headers: { "X-CSRFToken": $('meta[name="csrf-token"]').attr("content") },
                dataType: "JSON",
                success: function(res) {
                    if (res.status) {
                        _loadTable();
                        toastr.success(res.message || "Data shift berhasil dihapus");
                    } else {
                        toastr.error(res.message || "Gagal menghapus data");
                    }
                },
                error: function(xhr) {
                    console.error("Error deleting shift:", xhr);
                    toastr.error("Gagal menghapus data shift");
                }
            });
        }
    });
}

/**
 * Form validation
 */
function _validateForm() {
    _clearErrors();
    let isValid = true;

    const kode = $('#kode').val().trim();
    const nama = $('#nama').val().trim();
    const jam_mulai = $('#jam_mulai').val().trim();
    const jam_selesai = $('#jam_selesai').val().trim();

    // Kode validation
    if (!kode) {
        $('#error-kode').text('Kode shift harus diisi');
        isValid = false;
    } else if (kode.length < 2) {
        $('#error-kode').text('Kode shift minimal 2 karakter');
        isValid = false;
    }

    // Nama validation
    if (!nama) {
        $('#error-nama').text('Nama shift harus diisi');
        isValid = false;
    } else if (nama.length < 3) {
        $('#error-nama').text('Nama shift minimal 3 karakter');
        isValid = false;
    }

    // Jam mulai validation
    if (!jam_mulai) {
        $('#error-jam_mulai').text('Jam mulai harus diisi');
        isValid = false;
    }

    // Jam selesai validation
    if (!jam_selesai) {
        $('#error-jam_selesai').text('Jam selesai harus diisi');
        isValid = false;
    }

    // Compare times
    // if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
    //     $('#error-jam_selesai').text('Jam selesai harus lebih besar dari jam mulai');
    //     isValid = false;
    // }

    return isValid;
}

/**
 * Setup form validation on input change
 */
function _setupFormValidation() {
    $('#kode').on('change', function() {
        if (!$(this).val().trim()) {
            $('#error-kode').text('Kode shift harus diisi');
        } else {
            $('#error-kode').text('');
        }
    });

    $('#nama').on('change', function() {
        if (!$(this).val().trim()) {
            $('#error-nama').text('Nama shift harus diisi');
        } else {
            $('#error-nama').text('');
        }
    });

    $('#jam_mulai').on('change', function() {
        const jam_mulai = $(this).val();
        const jam_selesai = $('#jam_selesai').val();
        if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
            $('#error-jam_mulai').text('Jam mulai harus lebih kecil dari jam selesai');
        } else {
            $('#error-jam_mulai').text('');
        }
    });

    $('#jam_selesai').on('change', function() {
        const jam_mulai = $('#jam_mulai').val();
        const jam_selesai = $(this).val();
        // if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
        //     $('#error-jam_selesai').text('Jam selesai harus lebih besar dari jam mulai');
        // } else {
        //     $('#error-jam_selesai').text('');
        // }
    });
}

/**
 * Reset form fields and errors
 */
function _resetForm() {
    $('#form-shift')[0].reset();
    _clearErrors();
}

/**
 * Clear all error messages
 */
function _clearErrors() {
    $('#error-kode').text('');
    $('#error-nama').text('');
    $('#error-jam_mulai').text('');
    $('#error-jam_selesai').text('');
}

/**
 * Format time HH:MM from string
 */
function _formatTime(timeStr) {
    if (!timeStr) return '-';
    // If it's already HH:MM format, return as is
    if (timeStr.match(/^\d{2}:\d{2}/)) {
        return timeStr.substring(0, 5);
    }
    return timeStr;
}

/**
 * Escape HTML to prevent XSS
 */
function _escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}