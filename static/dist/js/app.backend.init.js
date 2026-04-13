"use strict";
// Class Definition
//Message BlockUi
const messageBlockUi = '<div class="blockui-message bg-light text-dark"><span class="spinner-border spinner-border-sm align-middle text-primary"></span> Mohon tunggu ...</div>';
//Validate Email
const validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function isValidDateFormat(dateStr) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateStr);
}
function isRealDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}
function isValidFullDate(dateStr) {
    return isValidDateFormat(dateStr) && isRealDate(dateStr);
}
class CameraStream {
    constructor(cameraId, wsUrl) {
        this.cameraId = cameraId;
        this.wsUrl = wsUrl;

        this.videoEl = document.getElementById(cameraId);
        if (!this.videoEl) {
            console.error("Video element not found:", cameraId);
            return;
        }

        this.queue = [];
        this.codecInitialized = false;
        this.mediaSource = null;
        this.sourceBuffer = null;
        this.ws = null;

        this.isReconnecting = false;
        this._boundOnSourceOpen = null;

        // create and attach initial mediaSource + ws
        this._createMediaSource();

        // keep video playable when tab becomes visible (do not force reconnect)
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                // Try to play - not forcing reload/reconnect
                this.videoEl.play().catch(() => {});
            }
        });
    }

    _createMediaSource() {
        // clean previous mediaSource reference if any
        if (this.mediaSource) {
            try { this.mediaSource = null; } catch (e) {}
        }

        this.mediaSource = new MediaSource();

        // bind once so listener isn't duplicated
        this._boundOnSourceOpen = () => this.initWebSocket();
        this.mediaSource.addEventListener("sourceopen", this._boundOnSourceOpen, { once: true });

        // attach to video
        try {
            this.videoEl.src = URL.createObjectURL(this.mediaSource);
        } catch (e) {
            console.error("Failed to set video src object URL:", e);
        }

        // reset flags
        this.codecInitialized = false;
        this.queue = [];
        this.sourceBuffer = null;
    }

    initWebSocket() {
        // avoid creating many concurrent WS when reconnect in flight
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            this.ws = new WebSocket(this.wsUrl);
        } catch (e) {
            console.error("WebSocket construct error:", e);
            this.safeReconnect();
            return;
        }

        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => {
            console.log(`WS Connected => ${this.cameraId}`);
            this.isReconnecting = false;
        };

        this.ws.onerror = (err) => {
            console.error(`WS Error => ${this.cameraId}`, err);
            this.safeReconnect();
        };

        this.ws.onclose = (ev) => {
            console.warn(`WS Closed => ${this.cameraId}`, ev);
            this.safeReconnect();
        };

        this.ws.onmessage = (event) => this.handleMessage(event);
    }

    handleMessage(event) {
        // make sure event.data is ArrayBuffer
        if (!event || !event.data) return;

        const data = new Uint8Array(event.data);

        // protocol: first byte 9 = codec string header
        if (data[0] === 9) {
            const codec = new TextDecoder().decode(data.slice(1));
            if (!this.codecInitialized) {
                try {
                    this.sourceBuffer = this.mediaSource.addSourceBuffer(`video/mp4; codecs="${codec}"`);
                    // sequence mode is safer for fragmented mp4 from many producers
                    this.sourceBuffer.mode = "sequence";
                    this.sourceBuffer.addEventListener("updateend", () => this.processQueue());
                    this.codecInitialized = true;
                    console.log(`Codec initialized [${this.cameraId}]: ${codec}`);
                } catch (e) {
                    console.error("Failed to create SourceBuffer:", e);
                }
            }
            return;
        }

        // push payload (append)
        this.pushPacket(event.data);
    }

    pushPacket(packet) {
        // Store only latest frame to avoid backlog when tab is backgrounded
        // Keep a tiny buffer (1) for immediate append
        this.queue = [packet];

        // If ready, process immediately
        if (this.sourceBuffer && !this.sourceBuffer.updating) {
            this.processQueue();
        }
    }

    processQueue() {
        if (!this.sourceBuffer || this.sourceBuffer.updating) return;

        // safety: if queue somehow grows (shouldn't with above logic), reset
        if (this.queue.length > 12) {
            console.warn(`[${this.cameraId}] queue overflow → reset buffer`);
            this.resetBuffer();
            return;
        }

        if (this.queue.length === 0) return;

        const packet = this.queue.shift();
        try {
            this.sourceBuffer.appendBuffer(packet);
        } catch (err) {
            console.warn(`[${this.cameraId}] appendBuffer error, resetting buffer`, err);
            // reset buffer to recover clean state
            this.resetBuffer();
        }
    }

    resetBuffer() {
        try {
            if (this.sourceBuffer && this.sourceBuffer.updating) {
                // cannot abort while updating in some browsers; safe guard
                // remove event and reset after updateend if needed
            }
            if (this.sourceBuffer) this.sourceBuffer.abort();
        } catch (e) { /* ignore */ }

        // clear queues and flags
        this.queue = [];
        this.codecInitialized = false;
        this.sourceBuffer = null;
    }

    safeReconnect() {
        // debounce reconnect attempts
        if (this.isReconnecting) return;
        this.isReconnecting = true;

        // close existing ws properly
        try {
            if (this.ws) {
                this.ws.onclose = null;
                this.ws.onerror = null;
                this.ws.close();
            }
        } catch (e) {}

        // schedule reconnect: do a soft reload: create new mediaSource and reopen WS
        setTimeout(() => {
            console.log(`[${this.cameraId}] safeReconnect -> recreating mediaSource & websocket`);
            try {
                // create new media source to ensure fresh timeline
                this._createMediaSource();
                // when sourceopen fires (once), initWebSocket will be called
            } catch (e) {
                console.error("safeReconnect error:", e);
            }
            // allow future reconnect cycles
            this.isReconnecting = false;
        }, 1500);
    }

    // stop keeps object alive but stops playback & closes ws
    stop() {
        try {
            if (this.ws) {
                this.ws.onclose = null;
                this.ws.onerror = null;
                this.ws.close();
                this.ws = null;
            }
        } catch (e) {}

        try {
            if (this.mediaSource) {
                // detach src
                this.videoEl.pause();
                this.videoEl.removeAttribute('src');
                this.videoEl.load();
            }
        } catch (e) {}

        this.queue = [];
        this.codecInitialized = false;
        this.sourceBuffer = null;
    }

    // reload: safe, cleans ws/media and re-inits mediaSource + ws
    reload() {
        console.log(`[${this.cameraId}] reload() called`);

        // stop current ws cleanly
        try {
            if (this.ws) {
                this.ws.onclose = null;
                this.ws.onerror = null;
                this.ws.close();
                this.ws = null;
            }
        } catch (e) {}

        // detach video src to release old media source
        try {
            this.videoEl.pause();
            this.videoEl.removeAttribute('src');
            this.videoEl.load();
        } catch (e) {}

        // create fresh media source and rebind
        this._createMediaSource();
        // videoEl.src already set by _createMediaSource
        // play and let sourceopen -> initWebSocket handle rest
        this.videoEl.play().catch(() => {});
    }
}
//Get Cookies
function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
    return null;
}
//Create Cookies
function setCookie(name, value, days=365 * 10) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
//System INFO
const _loadSystemInfo = () => {
	$.ajax({
        url: base_url+ "api/site_info",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            let siteInfo = data.row;
            $('#headerLogo').html(`<img alt="Logo" src="` +siteInfo.headbackend_logo_url+ `" class="h-30px app-sidebar-logo-default theme-light-show" height="52"/>
                <img alt="Logo" src="` +siteInfo.headbackend_logo_dark_url+ `" class="h-30px app-sidebar-logo-minimize theme-dark-show" height="52"/>`);
            $('#mobileHeadLogo').html(`<img alt="Logo" src="` +siteInfo.headbackend_logo_url+ `" class="h-20px theme-light-show" />
                <img alt="Logo" src="` +siteInfo.headbackend_logo_dark_url+ `" class="h-20px theme-dark-show" />`);
            $('#copyRight').html(siteInfo.copyright);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
};
//User INFO
const _loadUserInfo = () => {
	$.ajax({
        url: base_url+ "api/user_info",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
            let userInfo = data.row, thumbHeader;
            let userThumbHeader = `<img src="` +userInfo.url_thumb+ `" class="rounded-3" alt="avatar-user" />`;
            let userSymbol = `<div class="symbol-label fs-1 fw-bold ` +userInfo.symbol_color+ `">` +userInfo.text_symbol+ `</div>`;
            if(userInfo.thumb==null || userInfo.thumb=='') {
                thumbHeader = userSymbol;
            } else {
                thumbHeader = userThumbHeader;
            }
            $('#kt_header_user_menu_toggle .avatar-header').html(thumbHeader);
            $('#navbarUserInfo').html(`<div class="fw-bold d-flex align-items-center fs-5 text-break">
                ` +userInfo.name+ `
            </div>
            <a href="javascript:void(0);" class="fw-semibold text-muted text-hover-primary fs-7 text-break"> ` +userInfo.email+ ` </a>`);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log('Load data is error');
        }
    });
};
//Upload Image to Local Server with Summernote JS
var _uploadFile_editor = function(image, idCustom) {
	var data = new FormData();
	data.append("image", image);
	$.ajax({
		url: base_url+ "api/upload_imgeditor",
        headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
		data: data,
		type: "POST",
		cache: false,
        contentType: false,
        processData: false,
        dataType: "JSON",
		success: function(data){
			if(data.status){
				//console.log(url);
				if(idCustom){
					$(idCustom).summernote("insertImage", data.row.url_img);
				}else{
					$('.summernote').summernote("insertImage", data.row.url_img);
				}
				//var image = $('<img>').attr('src', url);
				//$('#summernote').summernote("insertNode", url);
			}else{
				Swal.fire({
					title: "Ooops!",
					html: data.message,
					icon: "warning", allowOutsideClick: false
				});
			}
		}, error: function (jqXHR, textStatus, errorThrown, data) {
			console.log('Error upload images to text editor');
			toastr.error(errorThrown+ ', <br />' +jqXHR.responseJSON.errors.image[0], 'Uuppss!', {"progressBar": true, "timeOut": 1500});
		}
	});
};
// Class Initialization
jQuery(document).ready(function() {
    _loadSystemInfo() //_loadUserInfo();
});