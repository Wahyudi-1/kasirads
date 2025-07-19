// ====================================================================
// API.JS - Modul untuk Komunikasi dengan Server (Google Apps Script)
// ====================================================================

import { AppState, SCRIPT_URL, API_ACTIONS } from './app.js';
import { tampilkanNotifikasi, renderTabelBarang, renderTabelPengguna, renderTabelLaporan, tampilkanStruk, keluarModeEdit, keluarModeEditPengguna, populasiFilterKasir } from './ui.js';

// --- FUNGSI-FUNGSI API ---

/**
 * === FUNGSI BARU (Eager Loading) ===
 * Memuat semua data penting (barang, laporan, pengguna) secara bersamaan setelah login.
 */
export async function muatSemuaDataAwal() {
    console.log("Memulai pemuatan semua data awal...");
    try {
        // Jalankan semua permintaan data secara paralel untuk efisiensi
        const [hasilBarang, hasilLaporan, hasilPengguna] = await Promise.all([
            fetch(`${SCRIPT_URL}?action=getBarang`),
            fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_LAPORAN}`),
            fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_PENGGUNA}`)
        ]);

        // Proses semua respons menjadi JSON
        const barang = await hasilBarang.json();
        const laporan = await hasilLaporan.json();
        const pengguna = await hasilPengguna.json();

        // Simpan semua data ke cache AppState
        if (barang.status === 'sukses') AppState.barang = barang.data;
        if (laporan.status === 'sukses') AppState.laporan = laporan.data;
        if (pengguna.status === 'sukses') AppState.pengguna = pengguna.data;
        
        console.log("Semua data awal berhasil dimuat.");
        return { success: true };

    } catch (error) {
        console.error("Gagal memuat semua data awal:", error);
        tampilkanNotifikasi('Gagal memuat data aplikasi. Coba muat ulang halaman.', 'error');
        return { success: false };
    }
}


export async function handleLoginApi(dataUntukKirim) {
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: dataUntukKirim });
        const result = await response.json();
        if (result.status === 'sukses') {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            AppState.currentUser = result.user;
            // checkLoginStatus dipindahkan ke ui.js agar berjalan setelah data dimuat
            return { success: true };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        return { success: false, message: 'Terjadi kesalahan jaringan.' };
    }
}

/**
 * === PERBAIKAN: Fungsi ini sekarang hanya memfilter dan merender data dari cache ===
 * @param {string} query - Kata kunci pencarian (opsional).
 */
export function muatDataBarang(query = "") {
    let dataToRender = AppState.barang;

    if (query && query.trim() !== "") {
        const lowerCaseQuery = query.toLowerCase();
        dataToRender = AppState.barang.filter(item => {
            const kode = item.Kode_Barang ? String(item.Kode_Barang).toLowerCase() : '';
            const nama = item.Nama_Barang ? String(item.Nama_Barang).toLowerCase() : '';
            return kode.includes(lowerCaseQuery) || nama.includes(lowerCaseQuery);
        });
    }
    renderTabelBarang(dataToRender);
}

export async function handleFormSubmit(e) {
    e.preventDefault();
    const formBarang = document.getElementById('form-barang');
    const formData = new FormData(formBarang);
    const action = AppState.modeEdit.barang ? API_ACTIONS.UBAH_BARANG : API_ACTIONS.TAMBAH_BARANG;
    formData.append('action', action);

    const button = AppState.modeEdit.barang ? document.getElementById('btn-simpan') : document.getElementById('btn-tambah');
    button.disabled = true;
    button.textContent = 'Memproses...';

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'sukses') {
            tampilkanNotifikasi(result.message, 'sukses');
            formBarang.reset();
            keluarModeEdit();
            // Muat ulang semua data agar cache sinkron
            await muatSemuaDataAwal();
            // Render ulang tabel dengan data lengkap yang baru
            renderTabelBarang(AppState.barang);
        } else {
            tampilkanNotifikasi('Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
    } finally {
        button.disabled = false;
        button.textContent = AppState.modeEdit.barang ? 'Simpan Perubahan' : 'Tambah Barang';
    }
}

export async function hapusBarang(id, target) {
    target.disabled = true;
    target.textContent = '...';
    const formData = new FormData();
    formData.append('action', API_ACTIONS.HAPUS_BARANG);
    formData.append('ID_Barang', id);
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'sukses') {
            tampilkanNotifikasi(result.message, 'sukses');
            // Muat ulang semua data agar cache sinkron
            await muatSemuaDataAwal();
            // Render ulang tabel dengan data lengkap yang baru
            renderTabelBarang(AppState.barang);
        } else {
            tampilkanNotifikasi('Gagal menghapus: ' + result.message, 'error');
            target.disabled = false;
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
        target.disabled = false;
    }
}

/**
 * === PERBAIKAN: Fungsi ini sekarang hanya merender data dari cache ===
 */
export function muatDataPengguna() {
    renderTabelPengguna();
}

export async function handleFormSubmitPengguna(e) {
    e.preventDefault();
    const formPengguna = document.getElementById('form-pengguna');
    const formData = new FormData(formPengguna);
    const action = AppState.modeEdit.pengguna ? API_ACTIONS.UBAH_PENGGUNA : API_ACTIONS.TAMBAH_PENGGUNA;
    const passwordValue = formData.get('Password_Baru');
    const dataUntukKirim = new FormData();
    dataUntukKirim.append('action', action);
    dataUntukKirim.append('ID_Pengguna', formData.get('ID_Pengguna'));
    dataUntukKirim.append('Username', formData.get('Username'));
    dataUntukKirim.append('Nama_Lengkap', formData.get('Nama_Lengkap'));
    dataUntukKirim.append('Role', formData.get('Role'));

    if (AppState.modeEdit.pengguna) {
        if (passwordValue) dataUntukKirim.append('Password_Baru', passwordValue);
    } else {
        if (!passwordValue) {
            alert('Password wajib diisi untuk pengguna baru.');
            return;
        }
        dataUntukKirim.append('Password', passwordValue);
    }

    const button = AppState.modeEdit.pengguna ? document.getElementById('btn-simpan-pengguna') : document.getElementById('btn-tambah-pengguna');
    button.disabled = true;
    button.textContent = 'Memproses...';
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: dataUntukKirim });
        const result = await response.json();
        if (result.status === 'sukses') {
            tampilkanNotifikasi(result.message, 'sukses');
            formPengguna.reset();
            keluarModeEditPengguna();
            // Muat ulang semua data agar cache sinkron
            await muatSemuaDataAwal();
            renderTabelPengguna();
        } else {
            tampilkanNotifikasi('Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
    } finally {
        button.disabled = false;
        button.textContent = AppState.modeEdit.pengguna ? 'Simpan Perubahan' : 'Tambah Pengguna';
    }
}

export async function hapusPengguna(id, target) {
    target.disabled = true;
    target.textContent = '...';
    const formData = new FormData();
    formData.append('action', API_ACTIONS.HAPUS_PENGGUNA);
    formData.append('ID_Pengguna', id);
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'sukses') {
            tampilkanNotifikasi(result.message, 'sukses');
            // Muat ulang semua data agar cache sinkron
            await muatSemuaDataAwal();
            renderTabelPengguna();
        } else {
            tampilkanNotifikasi('Gagal menghapus: ' + result.message, 'error');
            target.disabled = false;
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
        target.disabled = false;
    }
}

export async function prosesTransaksi() {
    if (AppState.keranjang.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');
    const inputBayar = document.getElementById('input-bayar');
    const totalBelanja = AppState.keranjang.reduce((sum, item) => sum + item.subtotal, 0);
    const dataUntukKirim = {
        kasir: AppState.currentUser.Nama_Lengkap,
        keranjang: AppState.keranjang,
        totalBelanja: totalBelanja,
        jumlahBayar: parseFloat(inputBayar.value),
        kembalian: (parseFloat(inputBayar.value) - totalBelanja)
    };

    btnProsesTransaksi.disabled = true;
    btnProsesTransaksi.textContent = 'Memproses...';
    try {
        const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.PROSES_TRANSAKSI}`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(dataUntukKirim)
        });
        const result = await response.json();
        if (result.status === 'sukses') {
            document.getElementById('menu-transaksi').classList.add('hidden');
            tampilkanStruk(dataUntukKirim, result.idTransaksi);
            // Kosongkan cache agar data baru dimuat saat login berikutnya
            AppState.barang = [];
            AppState.laporan = [];
        } else {
            tampilkanNotifikasi(result.message, 'error');
            btnProsesTransaksi.disabled = false;
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan saat memproses.', 'error');
        btnProsesTransaksi.disabled = false;
    } finally {
        btnProsesTransaksi.textContent = 'Proses Transaksi';
    }
}

/**
 * === PERBAIKAN: Fungsi ini sekarang hanya mempersiapkan UI, tidak fetch data ===
 */
export function muatLaporan() {
    populasiFilterKasir();
    // Tabel sengaja dibiarkan kosong sampai filter diterapkan oleh pengguna
    renderTabelLaporan([]);
}

export async function batalkanTransaksiApi(idTransaksi) {
    const formData = new FormData();
    formData.append('action', API_ACTIONS.BATALKAN_TRANSAKSI);
    formData.append('idTransaksi', idTransaksi);
  
    try {
      const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
      const result = await response.json();
      return result;
    } catch (error) {
      return { status: 'error', message: 'Kesalahan jaringan saat mencoba membatalkan transaksi.' };
    }
}
