// ====================================================================
// API.JS - Modul untuk Komunikasi dengan Server (Google Apps Script)
// ====================================================================

import { AppState, SCRIPT_URL, API_ACTIONS } from './app.js';
import { tampilkanNotifikasi, renderTabelBarang, renderTabelPengguna, renderTabelLaporan, tampilkanStruk, keluarModeEdit, keluarModeEditPengguna, checkLoginStatus } from './ui.js';

// --- FUNGSI-FUNGSI API ---

export async function handleLoginApi(dataUntukKirim) {
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: dataUntukKirim });
        const result = await response.json();
        if (result.status === 'sukses') {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            AppState.currentUser = result.user;
            checkLoginStatus();
            return { success: true };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        return { success: false, message: 'Terjadi kesalahan jaringan.' };
    }
}

/**
 * === PERBAIKAN: Fungsi ini sekarang lebih fleksibel ===
 * Memuat data barang dari backend. Bisa dengan query pencarian atau tanpa query (memuat semua).
 * @param {string} query - Kata kunci pencarian (opsional).
 */
export async function muatDataBarang(query = "") {
    const loadingManajemen = document.getElementById('loading-manajemen');
    const tabelBarangBody = document.getElementById('tabel-barang-body');
    loadingManajemen.classList.remove('hidden');
    tabelBarangBody.innerHTML = '';

    // Menggunakan action baru 'getBarang' yang bisa menerima query
    let url = `${SCRIPT_URL}?action=getBarang`;
    if (query && query.trim() !== "") {
        url += `&query=${encodeURIComponent(query)}`;
    }

    try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.status === 'sukses') {
            // Jika tidak ada query, simpan semua data ke cache global untuk kasir
            if (!query) {
                AppState.barang = result.data;
            }
            // Render data yang diterima (bisa semua atau hasil filter)
            renderTabelBarang(result.data); 
        } else {
            tampilkanNotifikasi('Gagal memuat data: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
    } finally {
        loadingManajemen.classList.add('hidden');
    }
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
            // Panggil muatDataBarang tanpa query untuk refresh dan memuat semua data lagi
            muatDataBarang(); 
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
            // Panggil muatDataBarang tanpa query untuk refresh dan memuat semua data lagi
            muatDataBarang();
        } else {
            tampilkanNotifikasi('Gagal menghapus: ' + result.message, 'error');
            target.disabled = false;
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
        target.disabled = false;
    }
}

export async function muatDataPengguna() {
    if (AppState.pengguna.length > 0) {
        renderTabelPengguna();
        return;
    }
    const loadingPengguna = document.getElementById('loading-pengguna');
    const tabelPenggunaBody = document.getElementById('tabel-pengguna-body');
    loadingPengguna.classList.remove('hidden');
    tabelPenggunaBody.innerHTML = '';
    try {
        const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_PENGGUNA}`);
        const result = await response.json();
        if (result.status === 'sukses') {
            AppState.pengguna = result.data;
            renderTabelPengguna();
        } else {
            tampilkanNotifikasi('Gagal memuat data pengguna: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
    } finally {
        loadingPengguna.classList.add('hidden');
    }
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
            AppState.pengguna = [];
            muatDataPengguna();
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
            AppState.pengguna = [];
            muatDataPengguna();
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
            AppState.barang = []; // Kosongkan cache agar stok baru dimuat
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

export async function muatLaporan() {
    if (AppState.laporan.length > 0) {
        renderTabelLaporan();
        return;
    }
    const loadingLaporan = document.getElementById('loading-laporan');
    const tabelLaporanBody = document.getElementById('tabel-laporan-body');
    loadingLaporan.classList.remove('hidden');
    tabelLaporanBody.innerHTML = '';
    try {
        const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_LAPORAN}`);
        const result = await response.json();
        if (result.status === 'sukses') {
            AppState.laporan = result.data;
            renderTabelLaporan();
        } else {
            tampilkanNotifikasi('Gagal memuat laporan: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
    } finally {
        loadingLaporan.classList.add('hidden');
    }
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
