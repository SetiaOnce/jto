//System INFO
const _loadSystemInfo = () => {
	$.ajax({
        url: base_url+ "api/site_info",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            let siteInfo = data.row;
            // $('#hLogo-login a').html(`<img alt="Logo" src="` +siteInfo.login_logo_url+ `" class="mb-5 theme-light-show" height="52"/>
            //     <img alt="Logo" src="` +siteInfo.login_logo_url+ `" class="mb-5 theme-dark-show" height="52"/>`);
            // $('#mobileHeadLogo').html(`<img alt="Logo" src="` +siteInfo.login_logo_url+ `" class="h-20px theme-light-show" />
            //     <img alt="Logo" src="` +siteInfo.login_logo_url+ `" class="h-20px theme-dark-show" />`);
            $('#kt_body').css({
                'background-size': 'cover',
                'background-position': 'unset',
                'background-image': "linear-gradient(0deg, rgb(2 18 13), #060606cc), url('')"
            });
            $('#kt_body').attr('style', `
                height: 100vh;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-image: linear-gradient(0deg, rgb(2, 18, 13), #060606cc), url('${siteInfo.login_bg_url}');
            `);
            $('#copyRight').html(`<span class="badge badge-light">App `+siteInfo.app_version+` - `+siteInfo.copyright+`</span>`);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
};
// Class Initialization
jQuery(document).ready(function() {
    _loadSystemInfo();
});