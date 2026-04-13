//Message BlockUi
const messageBlockUi = '<div class="blockui-message bg-light text-dark"><span class="spinner-border spinner-border-sm align-middle text-primary"></span> Mohon tunggu ...</div>';
$("#kt_sign_in_form input").keyup((function(t) {
    13 != t.keyCode && "Enter" !== t.key || $("#btn-login").click()
}))
$("#btn-login").on("click", (function(t) {
    t.preventDefault();
    $("#btn-login").attr('data-kt-indicator', 'on').attr('disabled', true);
    
    let username = $("#username"), password = $("#password");
    if (username.val() == "") {
        toastr.error("Email/Username masih kosong ...", "Uuppss!", { progressBar: true, timeOut: 1500 });
        username.focus();
        $("#btn-login").removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    if (password.val() == "") {
        toastr.error("Password masih kosong ...", "Uuppss!", { progressBar: true, timeOut: 1500 });
        password.focus();
        $("#btn-login").removeAttr('data-kt-indicator').attr('disabled', false);
        return false;
    }
    let target = document.querySelector("#kt_sign_in"), blockUi = new KTBlockUI(target, { message: messageBlockUi, zIndex: 9 });
    blockUi.block(), blockUi.destroy();
    let formData = new FormData($("#kt_sign_in_form")[0]);
    $.ajax({
        url: base_url + "api/auth/request",
        headers: {
            "X-CSRFToken": $('meta[name="csrf-token"]').attr("content")
        },
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        dataType: "JSON",
        success: function(data) {
            $("#btn-login").removeAttr('data-kt-indicator').attr('disabled', false);
            blockUi.release(), blockUi.destroy()
            if (data.status==true){
                window.location.href = base_url+ "dashboard"
            }else{
                toastr.error(data.message, 'Uuppss!', {"progressBar": true, "timeOut": 2500});
            }
        },
        error: function(t, e, a) {
            $("#btn-login").removeAttr('data-kt-indicator').attr('disabled', false);
            blockUi.release(), blockUi.destroy();
            Swal.fire({
                title: "Ooops!",
                text: "Terjadi kesalahan yang tidak diketahui, mohon hubungi pengembang!",
                icon: "error",
                allowOutsideClick: false,
            }).then((function(t) {
                // location.reload(true)
            }))
        }
    })
}))
// Class Initialization
jQuery(document).ready(function() {
    $("#showPass_checkbox").change((function(t) {
        t.preventDefault(), $("#showPass_checkbox").is(":checked") ? $("#password").attr("type", "text") : $("#password").attr("type", "password")
    }));
});