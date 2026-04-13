// WIB = 7
// WITA = 8
// WIT = 9
var timezones = (getCookie('timezone')) ? getCookie('timezone') : 7;
function updateAllClocks() {
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);

    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const localTime = new Date(nowUTC.getTime() + (timezones * 3600000));

    const namaHari = hari[localTime.getDay()];
    const tanggal = localTime.getDate();
    const namaBulan = bulan[localTime.getMonth()];
    const tahun = localTime.getFullYear();

    const jam = String(localTime.getHours()).padStart(2, '0');
    const menit = String(localTime.getMinutes()).padStart(2, '0');
    const detik = String(localTime.getSeconds()).padStart(2, '0');

    const waktuLengkap = `${namaHari}, ${tanggal} ${namaBulan} ${tahun} ${jam}:${menit}:${detik}`;

    document.getElementById('day_date_and_time').textContent = waktuLengkap;
}

setInterval(updateAllClocks, 1000);
updateAllClocks();
