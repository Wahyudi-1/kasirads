// ====================================================================
// API.JS - Modul Komunikasi Server & Manajer Offline (Semi-Offline Mode)
// ====================================================================

import { AppState, SCRIPT_URL, API_ACTIONS } from './app.js';
import { 
    tampilkanNotifikasi, renderTabelBarang, renderTabelPengguna, 
    renderTabelLaporan, tampilkanStruk, keluarModeEdit, 
    keluarModeEditPengguna, populasiFilterKasir 
} from './ui.js';

// Kunci penyimpanan lokal
const STORAGE_KEYS = {
    BARANG: 'ads_offline_barang',
    PENGGUNA: 'ads_offline_pengguna',
    ANTREAN: 'ads_offline_transaksi'
};

// --- FUNGSI-FUNGSI UTAMA ---

// 1. Inisialisasi Data (Support Offline)
export async function muatSemuaDataAwal() {
    console.log("Memulai pemuatan data (Mode Hybrid)...");
    
    // STRATEGI: Stale-While-Revalidate
    // 1. Load dari LocalStorage dulu agar tampilan instan
    const cachedBarang = localStorage.getItem(STORAGE_KEYS.BARANG);
    const cachedPengguna = localStorage.getItem(STORAGE_KEYS.PENGGUNA);
    
    if (cachedBarang) {
        try { AppState.barang = JSON.parse(cachedBarang); } catch(e) {}
    }
    if (cachedPengguna) {
        try { AppState.pengguna = JSON.parse(cachedPengguna); } catch(e) {}
    }

    // Render data cache jika ada
    if (AppState.barang.length > 0) renderTabelBarang(AppState.barang);
    if (AppState.pengguna.length > 0) renderTabelPengguna(AppState.pengguna);

    // Cek koneksi internet
    if (!navigator.onLine) {
        tampilkanNotifikasi('Mode OFFLINE. Menggunakan data terakhir yang tersimpan.', 'warning');
        return { success: true, mode: 'offline' };
    }

    try {
        // 2. Ambil data terbaru dari server (Background)
        const promises = [fetch(`${SCRIPT_URL}?action=getBarang`)];
        promises.push(fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_PENGGUNA}`));

        const [hasilBarang, hasilPengguna] = await Promise.all(promises);
        const barang = await hasilBarang.json();
        const pengguna = await hasilPengguna.json();

        if (barang.status === 'sukses') {
            AppState.barang = barang.data;
            // Simpan ke LocalStorage untuk offline nanti
            localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(barang.data));
            renderTabelBarang(AppState.barang); // Update UI dengan data baru
        }
        
        if (pengguna.status === 'sukses') {
            AppState.pengguna = pengguna.data;
            localStorage.setItem(STORAGE_KEYS.PENGGUNA, JSON.stringify(pengguna.data));
            renderTabelPengguna(AppState.pengguna);
        }
        
        console.log("Data berhasil diperbarui dari server.");
        
        // Cek apakah ada antrean transaksi offline yang perlu dikirim
        cekDanKirimAntreanOffline();

        return { success: true, mode: 'online' };

    } catch (error) {
        console.error("Gagal terhubung ke server:", error);
        tampilkanNotifikasi('Gagal terhubung ke server. Masuk mode Offline.', 'error');
        return { success: false, mode: 'offline' };
    }
}

// 2. Fungsi Laporan (Online Only untuk saat ini)
export async function ambilDataLaporan(paksaRefresh = false) {
    if (!navigator.onLine) {
        tampilkanNotifikasi("Fitur Laporan butuh koneksi internet.", "error");
        return;
    }

    if (AppState.laporan.length > 0 && !paksaRefresh) {
        renderTabelLaporan(AppState.laporan);
        populasiFilterKasir();
        return;
    }

    const loadingLaporan = document.getElementById('loading-laporan');
    if (loadingLaporan) loadingLaporan.classList.remove('hidden');
    
    try {
        const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_LAPORAN}`);
        const result = await response.json();

        if (result.status === 'sukses') {
            AppState.laporan = result.data;
            renderTabelLaporan(AppState.laporan);
            populasiFilterKasir();
            tampilkanNotifikasi('Laporan diperbarui.', 'sukses');
        } else {
            tampilkanNotifikasi('Gagal memuat laporan: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Gagal mengambil laporan.', 'error');
    } finally {
        if (loadingLaporan) loadingLaporan.classList.add('hidden');
    }
}

export async function handleLoginApi(dataUntukKirim) {
    if (!navigator.onLine) {
        return { success: false, message: 'Login membutuhkan koneksi internet.' };
    }

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: dataUntukKirim });
        const result = await response.json();
        if (result.status === 'sukses') {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            AppState.currentUser = result.user;
            return { success: true };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        return { success: false, message: 'Kesalahan jaringan saat login.' };
    }
}

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
    if (!navigator.onLine) {
        tampilkanNotifikasi("Tambah/Edit Barang butuh internet.", "error");
        return;
    }
    
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
            await muatSemuaDataAwal(); 
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
    if (!navigator.onLine) { tampilkanNotifikasi("Hapus data butuh internet.", "error"); return; }
    
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
            await muatSemuaDataAwal();
        } else {
            tampilkanNotifikasi('Gagal: ' + result.message, 'error');
            target.disabled = false;
        }
    } catch (error) {
        tampilkanNotifikasi('Jaringan error.', 'error');
        target.disabled = false;
    }
}

export function muatDataPengguna() {
    renderTabelPengguna();
}

export async function handleFormSubmitPengguna(e) {
    e.preventDefault();
    if (!navigator.onLine) { tampilkanNotifikasi("Kelola pengguna butuh internet.", "error"); return; }
    
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
        if (!passwordValue) { alert('Password wajib diisi.'); return; }
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
            await muatSemuaDataAwal();
        } else {
            tampilkanNotifikasi('Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Error jaringan.', 'error');
    } finally {
        button.disabled = false;
        button.textContent = AppState.modeEdit.pengguna ? 'Simpan Perubahan' : 'Tambah Pengguna';
    }
}

export async function hapusPengguna(id, target) {
    if (!navigator.onLine) { tampilkanNotifikasi("Hapus pengguna butuh internet.", "error"); return; }
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
            await muatSemuaDataAwal();
        } else {
            tampilkanNotifikasi('Gagal: ' + result.message, 'error');
            target.disabled = false;
        }
    } catch (error) {
        tampilkanNotifikasi('Error jaringan.', 'error');
        target.disabled = false;
    }
}

// 3. PROSES TRANSAKSI (Hybrid: Online Priority, Offline Fallback)
export async function prosesTransaksi() {
    if (AppState.keranjang.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');
    const inputBayar = document.getElementById('input-bayar');
    const totalBelanja = AppState.keranjang.reduce((sum, item) => sum + item.subtotal, 0);
    
    const dataTransaksi = {
        kasir: AppState.currentUser.Nama_Lengkap,
        keranjang: AppState.keranjang,
        totalBelanja: totalBelanja,
        jumlahBayar: parseFloat(inputBayar.value),
        kembalian: (parseFloat(inputBayar.value) - totalBelanja),
        timestamp: new Date().toISOString() // Penting untuk offline
    };

    btnProsesTransaksi.disabled = true;
    btnProsesTransaksi.textContent = 'Memproses...';

    // A. JIKA ONLINE: Kirim langsung
    if (navigator.onLine) {
        try {
            const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.PROSES_TRANSAKSI}`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(dataTransaksi)
            });
            const result = await response.json();
            
            if (result.status === 'sukses') {
                selesaikanTransaksiUI(dataTransaksi, result.idTransaksi, false);
            } else {
                tampilkanNotifikasi(result.message, 'error');
                btnProsesTransaksi.disabled = false;
            }
        } catch (error) {
            console.warn("Gagal kirim online, mencoba simpan offline...", error);
            // Jika fetch gagal (misal server down atau koneksi putus tiba2), masuk offline
            simpanTransaksiOffline(dataTransaksi, btnProsesTransaksi);
        }
    } 
    // B. JIKA OFFLINE: Simpan lokal
    else {
        simpanTransaksiOffline(dataTransaksi, btnProsesTransaksi);
    }
}

function simpanTransaksiOffline(dataTransaksi, btnElement) {
    try {
        // 1. Ambil antrean lama
        const antrean = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANTREAN) || '[]');
        
        // 2. Generate ID Sementara
        const idOffline = `OFFLINE-${Date.now()}`;
        dataTransaksi.idOffline = idOffline; // Penanda
        
        // 3. Masukkan ke antrean
        antrean.push(dataTransaksi);
        localStorage.setItem(STORAGE_KEYS.ANTREAN, JSON.stringify(antrean));
        
        // 4. Update Stok Lokal (Optimistic UI) agar user tidak jual barang yg sama berlebih
        updateStokLokal(dataTransaksi.keranjang);
        
        // 5. Sukseskan di UI
        selesaikanTransaksiUI(dataTransaksi, idOffline, true);
        
    } catch (e) {
        console.error(e);
        tampilkanNotifikasi('Gagal menyimpan transaksi offline. Memori penuh?', 'error');
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.textContent = 'Proses Transaksi';
        }
    }
}

function updateStokLokal(keranjang) {
    // Kurangi stok di AppState.barang dan simpan ke localStorage
    keranjang.forEach(itemBeli => {
        const barangIndex = AppState.barang.findIndex(b => b.ID_Barang === itemBeli.idBarang);
        if (barangIndex > -1) {
            AppState.barang[barangIndex].Stok_Pcs -= itemBeli.jumlahPcs;
        }
    });
    // Simpan state terbaru ke storage agar kalau refresh, stok tetap berkurang
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(AppState.barang));
    // Re-render tabel manajemen jika sedang terbuka
    renderTabelBarang(AppState.barang); 
}

function selesaikanTransaksiUI(dataTransaksi, idTransaksi, isOffline) {
    const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');
    document.getElementById('menu-transaksi').classList.add('hidden');
    
    tampilkanStruk(dataTransaksi, idTransaksi);
    
    if (isOffline) {
        tampilkanNotifikasi('Internet Mati. Transaksi disimpan di HP dan akan dikirim otomatis saat online.', 'warning');
    } else {
        // Jika online, kita bisa clear cache laporan agar nanti reload data baru
        AppState.laporan = [];
    }

    btnProsesTransaksi.disabled = false;
    btnProsesTransaksi.textContent = 'Proses Transaksi';
}

// 4. SYNC MANAGER
async function cekDanKirimAntreanOffline() {
    if (!navigator.onLine) return;

    const antrean = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANTREAN) || '[]');
    if (antrean.length === 0) return;

    tampilkanNotifikasi(`Menyingkronkan ${antrean.length} transaksi offline...`, 'info');
    console.log("Mencoba sync transaksi:", antrean);

    const sisaAntrean = [];
    let suksesCount = 0;

    for (const trx of antrean) {
        try {
            // Hapus properti internal yg tidak perlu dikirim ke server jika ada
            const { idOffline, ...dataBersih } = trx; 
            
            const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.PROSES_TRANSAKSI}`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(dataBersih)
            });
            const result = await response.json();
            
            if (result.status === 'sukses') {
                suksesCount++;
            } else {
                console.error("Gagal sync satu transaksi:", result.message);
                sisaAntrean.push(trx); // Kembalikan ke antrean jika server nolak
            }
        } catch (error) {
            console.error("Network error saat sync:", error);
            sisaAntrean.push(trx); // Kembalikan jika error network
        }
    }

    // Simpan sisa (yang gagal)
    localStorage.setItem(STORAGE_KEYS.ANTREAN, JSON.stringify(sisaAntrean));

    if (suksesCount > 0) {
        tampilkanNotifikasi(`${suksesCount} transaksi offline berhasil di-upload!`, 'sukses');
        // Refresh data server karena stok sudah berubah di server (tanpa full reload)
        try {
            const resp = await fetch(`${SCRIPT_URL}?action=getBarang`);
            const json = await resp.json();
            if (json.status === 'sukses') {
                AppState.barang = json.data;
                localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(json.data));
                renderTabelBarang(AppState.barang);
            }
        } catch(e) { console.log("Gagal refresh stok pasca-sync", e); }
    }
}

// Listener otomatis saat internet nyala kembali
window.addEventListener('online', () => {
    tampilkanNotifikasi('Internet Terhubung. Mencoba sync data...', 'sukses');
    cekDanKirimAntreanOffline();
});

export async function batalkanTransaksiApi(idTransaksi) {
    if (idTransaksi && idTransaksi.startsWith('OFFLINE-')) {
        alert("Transaksi offline tidak bisa dibatalkan dari server. Silakan hapus data browsing jika ingin reset.");
        return { status: 'error', message: 'Transaksi offline lokal tidak bisa dibatalkan via API.' };
    }
    const formData = new FormData();
    formData.append('action', API_ACTIONS.BATALKAN_TRANSAKSI);
    formData.append('idTransaksi', idTransaksi);
  
    try {
      const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
      const result = await response.json();
      return result;
    } catch (error) {
      return { status: 'error', message: 'Kesalahan jaringan.' };
    }
}
