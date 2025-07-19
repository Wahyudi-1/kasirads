// ====================================================================
// UI.JS - Modul untuk Semua Hal Terkait Tampilan dan Interaksi Pengguna
// ====================================================================

import { AppState, SCRIPT_URL, loginContainer, appContainer, formLogin, loginStatus, infoNamaKasir, btnLogout, notifikasi, navManajemen, navTransaksi, navLaporan, navPengguna, semuaMenu, menuManajemen, menuTransaksi, menuLaporan, menuPengguna, formBarang, idBarangInput, inputKodeBarang, rekomendasiKodeDiv, btnTambah, btnSimpan, btnBatal, tabelBarangBody, loadingManajemen, formPengguna, idPenggunaInput, btnTambahPengguna, btnSimpanPengguna, btnBatalPengguna, tabelPenggunaBody, loadingPengguna, inputCari, hasilPencarianDiv, loadingCari, formTambahKeranjang, namaBarangTerpilihSpan, itemTerpilihDataInput, inputJumlahKasir, selectSatuanKasir, btnTambahKeranjang, tabelKeranjangBody, totalBelanjaSpan, inputBayar, kembalianSpan, btnProsesTransaksi, tabelLaporanBody, loadingLaporan, areaStruk, strukContent } from './app.js';
import { handleLoginApi, batalkanTransaksiApi, muatSemuaDataAwal } from './api.js';

// --- Variabel State Lokal untuk UI ---
export let dataTransaksiTerakhir = null;
export let idTransaksiTerakhir = null;
let dataBarangTerakhirRender = [];


// --- FUNGSI-FUNGSI UI ---

export function tampilkanNotifikasi(pesan, tipe) {
    notifikasi.textContent = pesan;
    notifikasi.className = tipe;
    notifikasi.classList.remove('hidden');
    setTimeout(() => { notifikasi.classList.add('hidden'); }, 4000);
}

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

function terjemahkanSatuan(satuan) {
    if (satuan === 'Pcs') return 'Pcs / Kg';
    if (satuan === 'Lusin') return 'Paket / Lusin';
    if (satuan === 'Karton') return 'Karton / Sak';
    return satuan;
}

export async function checkLoginStatus() {
    const user = sessionStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        AppState.currentUser = userData;
        
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        if (AppState.barang.length === 0 && AppState.laporan.length === 0) {
            infoNamaKasir.textContent = 'Memuat data aplikasi...';
            await muatSemuaDataAwal();
        }

        infoNamaKasir.textContent = `Kasir: ${userData.Nama_Lengkap}`;
        if (userData.Role === 'admin') {
            navPengguna.classList.remove('hidden');
        } else {
            navPengguna.classList.add('hidden');
        }
        navManajemen.click();
    } else {
        loginContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

export async function handleLogin(formData) {
    const button = formLogin.querySelector('button');
    button.disabled = true;
    button.textContent = 'Memproses...';
    loginStatus.textContent = '';
    
    const result = await handleLoginApi(formData);

    if (result.success) {
        await checkLoginStatus(); 
    } else {
        loginStatus.textContent = result.message;
        button.disabled = false;
        button.textContent = 'Login';
    }
}

export function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.removeItem('user');
        AppState.currentUser = null;
        AppState.keranjang = [];
        AppState.barang = [];
        AppState.pengguna = [];
        AppState.laporan = [];
        checkLoginStatus();
    }
}

export function renderTabelBarang(data) {
    dataBarangTerakhirRender = data;
    tabelBarangBody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.Kode_Barang}</td>
            <td>${item.Nama_Barang}</td>
            <td>${item.Kategori_Barang}</td>
            <td>${item.Stok_Pcs}</td>
            <td>${formatRupiah(item.Harga_Pcs)}</td>
            <td>
                <button class="btn-aksi btn-ubah" data-id="${item.ID_Barang}">Ubah</button>
                <button class="btn-aksi btn-hapus" data-id="${item.ID_Barang}">Hapus</button>
            </td>
        `;
        tabelBarangBody.appendChild(tr);
    });
}

export function getDataFromLastRender(id) {
    return dataBarangTerakhirRender.find(item => item.ID_Barang === id);
}

export function masukModeEdit(dataBarang) { /* ... (Kode tidak berubah) ... */ }
export function keluarModeEdit() { /* ... (Kode tidak berubah) ... */ }
export function renderTabelPengguna() { /* ... (Kode tidak berubah) ... */ }
export function masukModeEditPengguna(dataPengguna) { /* ... (Kode tidak berubah) ... */ }
export function keluarModeEditPengguna() { /* ... (Kode tidak berubah) ... */ }
export function cariBarang() { /* ... (Kode tidak berubah) ... */ }
export function pilihBarang(item) { /* ... (Kode tidak berubah) ... */ }
export function handleTambahKeKeranjang(e) { /* ... (Kode tidak berubah) ... */ }
export function renderKeranjang() { /* ... (Kode tidak berubah) ... */ }
export function updateKuantitasKeranjang(index, jumlahBaru) { /* ... (Kode tidak berubah) ... */ }
export function updateSatuanKeranjang(index, satuanBaru) { /* ... (Kode tidak berubah) ... */ }
export function hitungKembalian() { /* ... (Kode tidak berubah) ... */ }
export function tampilkanStruk(dataTransaksi, idTransaksi) { /* ... (Kode tidak berubah) ... */ }
export function cetakStruk() { window.print(); }
export function setActiveNav(button) { /* ... (Kode tidak berubah) ... */ }
export function showMenu(menuToShow) { /* ... (Kode tidak berubah) ... */ }
export function rekomendasiKodeBarang(query) { /* ... (Kode tidak berubah) ... */ }
export function togglePasswordVisibility(target) { /* ... (Kode tidak berubah) ... */ }
export async function handleBatalDanUlangi() { /* ... (Kode tidak berubah) ... */ }
function formatStrukUntukWhatsApp(dataTransaksi, idTransaksi) { /* ... (Kode tidak berubah) ... */ }
function formatNomorWhatsApp(nomor) { /* ... (Kode tidak berubah) ... */ }
export function handleKirimWhatsApp() { /* ... (Kode tidak berubah) ... */ }

// ====================================================================
// === FUNGSI FILTER LAPORAN (DENGAN PERBAIKAN) ===
// ====================================================================

/**
 * PERBAIKAN: Fungsi ini sekarang lebih tangguh, menggunakan Regular Expression
 * untuk mem-parsing format tanggal Indonesia (DD/MM/YYYY, HH.MM atau HH:MM).
 */
function parseTanggalLaporan(tanggalString) {
    if (!tanggalString || typeof tanggalString !== 'string') return null;
    
    const match = tanggalString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2})[.:](\d{1,2})/);
    
    if (!match) return null;
    
    const [, hari, bulan, tahun, jam, menit] = match;
    
    return new Date(tahun, bulan - 1, hari, jam, menit);
}

export function populasiFilterKasir() {
    const filterKasir = document.getElementById('filter-kasir');
    if (!filterKasir) return;
    const namaKasir = [...new Set(AppState.laporan.map(trx => trx.Kasir).filter(Boolean))];
    while (filterKasir.options.length > 1) {
        filterKasir.remove(1);
    }
    namaKasir.sort().forEach(nama => {
        filterKasir.add(new Option(nama, nama));
    });
}

/**
 * PERBAIKAN: Logika filter disempurnakan.
 */
export function terapkanFilterLaporan() {
    const tanggalMulaiValue = document.getElementById('filter-tanggal-mulai').value;
    const tanggalSelesaiValue = document.getElementById('filter-tanggal-selesai').value;
    const kasirValue = document.getElementById('filter-kasir').value;
    const statusValue = document.getElementById('filter-status').value;

    const tanggalMulai = tanggalMulaiValue ? new Date(tanggalMulaiValue) : null;
    if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);

    const tanggalSelesai = tanggalSelesaiValue ? new Date(tanggalSelesaiValue) : null;
    if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);

    const dataTersaring = AppState.laporan.filter(trx => {
        const tanggalTrx = parseTanggalLaporan(trx.Timestamp_Transaksi);
        if (!tanggalTrx) return false;

        if (tanggalMulai && tanggalTrx < tanggalMulai) return false;
        if (tanggalSelesai && tanggalTrx > tanggalSelesai) return false;
        if (kasirValue && trx.Kasir !== kasirValue) return false;
        
        const statusTransaksi = trx.Status || 'COMPLETED';
        if (statusValue && statusTransaksi !== statusValue) return false;

        return true;
    });

    renderTabelLaporan(dataTersaring);
}

export function renderTabelLaporan(data) {
    tabelLaporanBody.innerHTML = '';
    data.forEach(trx => {
        const detailBarang = JSON.parse(trx.Detail_Barang_JSON).map(item => `${item.namaBarang} (${item.jumlah} ${terjemahkanSatuan(item.satuan)})`).join('<br>');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${trx.ID_Transaksi}</td>
            <td>${trx.Timestamp_Transaksi}</td>
            <td>${trx.Kasir || ''}</td>
            <td>${detailBarang}</td>
            <td>${formatRupiah(trx.Total_Belanja)}</td>
            <td>${trx.Status || 'COMPLETED'}</td>
        `;
        tabelLaporanBody.appendChild(tr);
    });
}
