"use strict";
// Class Definition
//Message BlockUi
const messageBlockUi = '<div class="blockui-message bg-light text-dark"><span class="spinner-border text-primary"></span> Please wait ...</div>';
//Validate Email
const validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
//System INFO
const _loadSystemInfo = () => {
	$.ajax({
        url: base_url+ "api/site_info",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            let siteInfo = data.row;
            let headerLogo = `
                <img alt="Logo" src="` +siteInfo.headpublic_logo_url+ `" class="h-20px h-lg-30px theme-light-show" />
                <img alt="Logo-dark" src="` +siteInfo.headpublic_logo_dark_url+ `" class="h-20px h-lg-30px theme-dark-show" />
            `;
            $('#headerLogo').html(headerLogo);
            $('#copyRight').html(` `+siteInfo.app_version+` - `+siteInfo.copyright+``);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
};
// Class Initialization
jQuery(document).ready(function() {
    _loadSystemInfo();
});