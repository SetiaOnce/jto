//Class Initialization
jQuery(document).ready(function() {
    var weight = 0
    const socket = new WebSocket("ws://127.0.0.1:8300");
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        weight = data.berat_timbangs;
    };
    let ws = new WebSocket("ws://127.0.0.1:8300/input");
    ws.onopen = () => {
        console.log("WebSocket connected");
        // Kirim data setiap 1 detik
        setInterval(() => {
            ws.send(JSON.stringify({
                plat_nomor: "XXXXXXXX",
                jbi: 0,
                berat: weight,
                berat_lebih: 0,
                persentase: 0
            }));
        }, 500);
    };
});