// ====================================================================
// APP.JS - Otak Aplikasi, State Manager, dan Event Controller
// ====================================================================

// --- Impor Modul Fungsional ---
import * as api from './api.js';
import * as ui from './ui.js';

// --- Konfigurasi Global & State Aplikasi ---
export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhue9eY4KEOD9SCm1Wdbq0Md1wSQVyxCbkdAnI9lLoOg9Kjljf43XXMlaAfj_o-NCX/exec";

export const API_ACTIONS = {
    LOGIN: 'loginUser', TAMBAH_BARANG: 'tambahBarang', UBAH_BARANG: 'ubahBarang', HAPUS_BARANG: 'hapusBarang', GET_PENGGUNA: 'getSemuaPengguna', TAMBAH_PENGGUNA: 'tambahPengguna', UBAH_PENGGUNA: 'ubahPengguna', HAPUS_PENGGUNA: 'hapusPengguna', PROSES_TRANSAKSI: 'prosesTransaksi', GET_LAPORAN: 'getRiwayatTransaksi',
    BATALKAN_TRANSAKSI: 'batalkanTransaksi'
};

export const AppState = {
    keranjang: [], barang: [], pengguna: [], laporan: [], modeEdit: { barang: false, pengguna: false }, currentUser: null, timeoutCari: null
};

// --- Seleksi Elemen DOM ---
export const loginContainer = document.getElementById('login-container');
export const appContainer = document.getElementById('app-container');
export const formLogin = document.getElementById('form-login');
export const loginStatus = document.getElementById('login-status');
export const infoNamaKasir = document.getElementById('info-nama-kasir');
export const btnLogout = document.getElementById('btn-logout');
export const notifikasi = document.getElementById('notifikasi');
export const navManajemen = document.getElementById('nav-manajemen');
export const navTransaksi = document.getElementById('nav-transaksi');
export const navLaporan = document.getElementById('nav-laporan');
export const navPengguna = document.getElementById('nav-pengguna');
export const semuaMenu = document.querySelectorAll('main section');
export const menuManajemen = document.getElementById('menu-manajemen-barang');
export const menuTransaksi = document.getElementById('menu-transaksi');
export const menuLaporan = document.getElementById('menu-laporan');
export const menuPengguna = document.getElementById('menu-pengguna');
export const formBarang = document.getElementById('form-barang');
export const idBarangInput = document.getElementById('ID_Barang');
export const inputKodeBarang = document.getElementById('Kode_Barang');
export const rekomendasiKodeDiv = document.getElementById('rekomendasi-kode');
export const btnTambah = document.getElementById('btn-tambah');
export const btnSimpan = document.getElementById('btn-simpan');
export const btnBatal = document.getElementById('btn-batal');
export const tabelBarangBody = document.getElementById('tabel-barang-body');
export const loadingManajemen = document.getElementById('loading-manajemen');
export const inputCariManajemen = document.getElementById('input-cari-manajemen');
export const btnCariManajemen = document.getElementById('btn-cari-manajemen');
export const btnTampilkanSemua = document.getElementById('btn-tampilkan-semua');
export const formPengguna = document.getElementById('form-pengguna');
export const idPenggunaInput = document.getElementById('ID_Pengguna');
export const btnTambahPengguna = document.getElementById('btn-tambah-pengguna');
export const btnSimpanPengguna = document.getElementById('btn-simpan-pengguna');
export const btnBatalPengguna = document.getElementById('btn-batal-pengguna');
export const tabelPenggunaBody = document.getElementById('tabel-pengguna-body');
export const loadingPengguna = document.getElementById('loading-pengguna');
export const inputCari = document.getElementById('input-cari-barang');
export const hasilPencarianDiv = document.getElementById('hasil-pencarian');
export const loadingCari = document.getElementById('loading-cari');
export const formTambahKeranjang = document.getElementById('form-tambah-keranjang');
export const namaBarangTerpilihSpan = document.getElementById('nama-barang-terpilih');
export const itemTerpilihDataInput = document.getElementById('item-terpilih-data');
export const inputJumlahKasir = document.getElementById('input-jumlah-kasir');
export const selectSatuanKasir = document.getElementById('select-satuan-kasir');
export const btnTambahKeranjang = document.getElementById('btn-tambah-keranjang');
export const tabelKeranjangBody = document.getElementById('tabel-keranjang-body');
export const totalBelanjaSpan = document.getElementById('total-belanja');
export const inputBayar = document.getElementById('input-bayar');
export const kembalianSpan = document.getElementById('kembalian');
export const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');
export const tabelLaporanBody = document.getElementById('tabel-laporan-body');
export const loadingLaporan = document.getElementById('loading-laporan');
export const btnFilterLaporan = document.getElementById('btn-filter-laporan');
export const btnResetFilter = document.getElementById('btn-reset-filter');
export const areaStruk = document.getElementById('area-struk');
export const strukContent = document.getElementById('struk-content');
export const btnCetakStruk = document.getElementById('btn-cetak-struk');
export const btnUbahTransaksi = document.getElementById('btn-ubah-transaksi');
export const btnKirimWhatsApp = document.getElementById('btn-kirim-whatsapp');
export const btnTransaksiBaru = document.getElementById('btn-transaksi-baru');
export const btnTransaksiBaruKasir = document.getElementById('btn-transaksi-baru-kasir');


// ====================================================================
// EVENT LISTENERS UTAMA - Titik Masuk Aplikasi
// ====================================================================

document.addEventListener('DOMContentLoaded', ui.checkLoginStatus);
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formLogin);
    formData.append('action', API_ACTIONS.LOGIN); 
    ui.handleLogin(formData);
});
btnLogout.addEventListener('click', ui.handleLogout);

// --- Event Listener Navigasi ---
navManajemen.addEventListener('click', () => {
    ui.setActiveNav(navManajemen);
    ui.showMenu(menuManajemen);
    // Kosongkan tabel dan pencarian saat tab dibuka, data sudah ada di cache
    ui.renderTabelBarang([]);
    inputCariManajemen.value = '';
});

navTransaksi.addEventListener('click', () => {
    ui.setActiveNav(navTransaksi);
    ui.showMenu(menuTransaksi);
    // Tidak perlu aksi, data sudah dimuat di awal
});

navLaporan.addEventListener('click', () => {
    ui.setActiveNav(navLaporan);
    ui.showMenu(menuLaporan);
    // Panggil fungsi yang hanya memproses dan merender dari data cache
    api.muatLaporan(); 
});

navPengguna.addEventListener('click', () => {
    ui.setActiveNav(navPengguna);
    ui.showMenu(menuPengguna);
    // Panggil fungsi yang hanya merender dari data cache
    api.muatDataPengguna();
});

// --- Event Listener untuk Kontrol Pencarian di Halaman Manajemen ---
btnCariManajemen.addEventListener('click', () => {
    const query = inputCariManajemen.value;
    api.muatDataBarang(query);
});

inputCariManajemen.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = inputCariManajemen.value;
        api.muatDataBarang(query);
    }
});

btnTampilkanSemua.addEventListener('click', () => {
    inputCariManajemen.value = '';
    // Panggil muatDataBarang tanpa query untuk menampilkan semua data dari cache
    api.muatDataBarang(); 
});

// --- Event Listener CRUD Barang & Pengguna ---
formBarang.addEventListener('submit', api.handleFormSubmit);
btnBatal.addEventListener('click', ui.keluarModeEdit);
tabelBarangBody.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-ubah')) {
        const id = target.dataset.id;
        const dataBarang = ui.getDataFromLastRender(id); 
        if (dataBarang) ui.masukModeEdit(dataBarang);
    }
    if (target.classList.contains('btn-hapus')) {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            const id = target.dataset.id;
            api.hapusBarang(id, target);
        }
    }
});

formPengguna.addEventListener('submit', api.handleFormSubmitPengguna);
btnBatalPengguna.addEventListener('click', ui.keluarModeEditPengguna);
tabelPenggunaBody.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-ubah')) {
        const id = target.dataset.id;
        const dataPengguna = AppState.pengguna.find(user => user.ID_Pengguna === id);
        if (dataPengguna) ui.masukModeEditPengguna(dataPengguna);
    }
    if (target.classList.contains('btn-hapus')) {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            const id = target.dataset.id;
            api.hapusPengguna(id, target);
        }
    }
});

// --- Event Listener Lainnya ---
let timeoutRekomendasi;
inputKodeBarang.addEventListener('keyup', (e) => {
    clearTimeout(timeoutRekomendasi);
    const query = inputKodeBarang.value;
    timeoutRekomendasi = setTimeout(() => {
        if (query.length > 0) {
            ui.rekomendasiKodeBarang(query);
        } else {
            rekomendasiKodeDiv.classList.add('hidden');
        }
    }, 400);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#rekomendasi-kode') && e.target !== inputKodeBarang) {
        rekomendasiKodeDiv.classList.add('hidden');
    }
    if (!e.target.closest('#hasil-pencarian') && e.target !== inputCari) {
        hasilPencarianDiv.classList.add('hidden');
    }
    if (e.target.classList.contains('toggle-password')) {
        ui.togglePasswordVisibility(e.target);
    }
});

inputCari.addEventListener('keyup', () => {
    clearTimeout(AppState.timeoutCari);
    AppState.timeoutCari = setTimeout(ui.cariBarang, 300);
});

formTambahKeranjang.addEventListener('submit', ui.handleTambahKeKeranjang);
inputBayar.addEventListener('input', ui.hitungKembalian);
btnProsesTransaksi.addEventListener('click', api.prosesTransaksi);

tabelKeranjangBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-hapus')) {
        const index = e.target.dataset.index;
        AppState.keranjang.splice(index, 1);
        ui.renderKeranjang();
    }
});
tabelKeranjangBody.addEventListener('change', (e) => {
    const target = e.target;
    const index = parseInt(target.dataset.index);
    if (target.classList.contains('qty-keranjang')) {
        const jumlahBaru = parseFloat(target.value);
        if (jumlahBaru > 0) {
            ui.updateKuantitasKeranjang(index, jumlahBaru);
        } else {
            AppState.keranjang.splice(index, 1);
            ui.renderKeranjang();
        }
    }
    if (target.classList.contains('satuan-keranjang')) {
        const satuanBaru = target.value;
        ui.updateSatuanKeranjang(index, satuanBaru);
    }
});

btnCetakStruk.addEventListener('click', ui.cetakStruk);
btnUbahTransaksi.addEventListener('click', () => {
    ui.handleBatalDanUlangi();
});
btnKirimWhatsApp.addEventListener('click', () => {
    ui.handleKirimWhatsApp();
});
btnTransaksiBaru.addEventListener('click', () => {
    AppState.keranjang = [];
    ui.renderKeranjang();
    inputBayar.value = '';
    ui.hitungKembalian();
    menuTransaksi.classList.remove('hidden');
    areaStruk.classList.add('hidden');
    inputCari.focus();
});
btnTransaksiBaruKasir.addEventListener('click', () => {
    if (AppState.keranjang.length > 0 && confirm('Apakah Anda yakin ingin mengosongkan keranjang dan memulai transaksi baru?')) {
        AppState.keranjang = [];
        ui.renderKeranjang();
        inputBayar.value = '';
        ui.hitungKembalian();
        inputCari.focus();
    } else if (AppState.keranjang.length === 0) {
        inputBayar.value = '';
        ui.hitungKembalian();
        inputCari.focus();
    }
});

btnFilterLaporan.addEventListener('click', ui.terapkanFilterLaporan);

btnResetFilter.addEventListener('click', () => {
    document.getElementById('filter-tanggal-mulai').value = '';
    document.getElementById('filter-tanggal-selesai').value = '';
    document.getElementById('filter-kasir').value = '';
    document.getElementById('filter-status').value = '';
    ui.renderTabelLaporan([]);
});
