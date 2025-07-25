// ====================================================================
// TAHAP 1: KONFIGURASI DAN SELEKSI ELEMEN
// ====================================================================

// PASTIKAN URL WEB APP ANDA SUDAH BENAR DI SINI
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAKa3ErQip9zxi2bVZaTb6K47SR_pHZrwgEfZZA--Kqc9iqLRSJzJZ2Hdw-LYeNjG5/exec";

// === KAMUS UNTUK SEMUA AKSI API ===
const API_ACTIONS = {
    LOGIN: 'loginUser',
    GET_BARANG: 'getSemuaBarang',
    TAMBAH_BARANG: 'tambahBarang',
    UBAH_BARANG: 'ubahBarang',
    HAPUS_BARANG: 'hapusBarang',
    GET_PENGGUNA: 'getSemuaPengguna',
    TAMBAH_PENGGUNA: 'tambahPengguna',
    UBAH_PENGGUNA: 'ubahPengguna',
    HAPUS_PENGGUNA: 'hapusPengguna',
    PROSES_TRANSAKSI: 'prosesTransaksi',
    GET_LAPORAN: 'getRiwayatTransaksi'
};

// --- ELEMEN-ELEMEN HTML ---
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const formLogin = document.getElementById('form-login');
const loginStatus = document.getElementById('login-status');
const infoNamaKasir = document.getElementById('info-nama-kasir');
const btnLogout = document.getElementById('btn-logout');
const notifikasi = document.getElementById('notifikasi');
const navManajemen = document.getElementById('nav-manajemen');
const navTransaksi = document.getElementById('nav-transaksi');
const navLaporan = document.getElementById('nav-laporan');
const navPengguna = document.getElementById('nav-pengguna');
const semuaMenu = document.querySelectorAll('main section');
const menuManajemen = document.getElementById('menu-manajemen-barang');
const menuTransaksi = document.getElementById('menu-transaksi');
const menuLaporan = document.getElementById('menu-laporan');
const menuPengguna = document.getElementById('menu-pengguna');
const formBarang = document.getElementById('form-barang');
const idBarangInput = document.getElementById('ID_Barang');
const inputKodeBarang = document.getElementById('Kode_Barang');
const rekomendasiKodeDiv = document.getElementById('rekomendasi-kode');
const btnTambah = document.getElementById('btn-tambah');
const btnSimpan = document.getElementById('btn-simpan');
const btnBatal = document.getElementById('btn-batal');
const tabelBarangBody = document.getElementById('tabel-barang-body');
const loadingManajemen = document.getElementById('loading-manajemen');
const formPengguna = document.getElementById('form-pengguna');
const idPenggunaInput = document.getElementById('ID_Pengguna');
const btnTambahPengguna = document.getElementById('btn-tambah-pengguna');
const btnSimpanPengguna = document.getElementById('btn-simpan-pengguna');
const btnBatalPengguna = document.getElementById('btn-batal-pengguna');
const tabelPenggunaBody = document.getElementById('tabel-pengguna-body');
const loadingPengguna = document.getElementById('loading-pengguna');
const inputCari = document.getElementById('input-cari-barang');
const hasilPencarianDiv = document.getElementById('hasil-pencarian');
const loadingCari = document.getElementById('loading-cari');
const formTambahKeranjang = document.getElementById('form-tambah-keranjang');
const namaBarangTerpilihSpan = document.getElementById('nama-barang-terpilih');
const itemTerpilihDataInput = document.getElementById('item-terpilih-data');
const inputJumlahKasir = document.getElementById('input-jumlah-kasir');
const selectSatuanKasir = document.getElementById('select-satuan-kasir');
const btnTambahKeranjang = document.getElementById('btn-tambah-keranjang');
const tabelKeranjangBody = document.getElementById('tabel-keranjang-body');
const totalBelanjaSpan = document.getElementById('total-belanja');
const inputBayar = document.getElementById('input-bayar');
const kembalianSpan = document.getElementById('kembalian');
const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');
const tabelLaporanBody = document.getElementById('tabel-laporan-body');
const loadingLaporan = document.getElementById('loading-laporan');
const areaStruk = document.getElementById('area-struk');
const strukContent = document.getElementById('struk-content');
const btnCetakStruk = document.getElementById('btn-cetak-struk');
const btnTransaksiBaru = document.getElementById('btn-transaksi-baru');

// --- STATE APLIKASI & CACHE (TERSENTRALISASI) ---
const AppState = {
    keranjang: [],
    barang: [],
    pengguna: [],
    laporan: [],
    modeEdit: {
        barang: false,
        pengguna: false
    },
    currentUser: null,
    timeoutCari: null
};


// ====================================================================
// TAHAP 2: FUNGSI-FUNGSI LOGIN & SESI
// ====================================================================

function checkLoginStatus() {
    const user = sessionStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        AppState.currentUser = userData; // Muat data user ke state saat aplikasi dimulai
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        infoNamaKasir.textContent = `Kasir: ${userData.Nama_Lengkap}`;
        if (userData.Role === 'admin') {
            navPengguna.classList.remove('hidden');
        } else {
            navPengguna.classList.add('hidden');
        }
        navManajemen.click(); // Otomatis klik tab manajemen agar data dimuat
    } else {
        loginContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(formLogin);
    const username = formData.get('username');
    const passwordAsli = formData.get('password');
    const dataUntukKirim = new FormData();
    dataUntukKirim.append('action', API_ACTIONS.LOGIN);
    dataUntukKirim.append('username', username);
    dataUntukKirim.append('password', passwordAsli);

    const button = formLogin.querySelector('button');
    button.disabled = true;
    button.textContent = 'Memproses...';
    loginStatus.textContent = '';

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: dataUntukKirim });
        const result = await response.json();
        if (result.status === 'sukses') {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            AppState.currentUser = result.user; // Simpan juga ke state aplikasi
            checkLoginStatus();
        } else {
            loginStatus.textContent = result.message;
        }
    } catch (error) {
        loginStatus.textContent = 'Terjadi kesalahan jaringan.';
    } finally {
        button.disabled = false;
        button.textContent = 'Login';
    }
}

function handleLogout() {
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

// ====================================================================
// TAHAP 3: FUNGSI-FUNGSI PEMBANTU & LOGIKA APLIKASI
// ====================================================================

function tampilkanNotifikasi(pesan, tipe) {
    notifikasi.textContent = pesan;
    notifikasi.className = tipe;
    notifikasi.classList.remove('hidden');
    setTimeout(() => {
        notifikasi.classList.add('hidden');
    }, 4000);
}

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
};

// --- MANAJEMEN BARANG ---
async function muatDataBarang() {
    if (AppState.barang.length > 0) {
        renderTabelBarang();
        return;
    }
    loadingManajemen.classList.remove('hidden');
    tabelBarangBody.innerHTML = '';
    try {
        const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.GET_BARANG}`);
        const result = await response.json();
        if (result.status === 'sukses') {
            AppState.barang = result.data;
            renderTabelBarang();
        } else {
            tampilkanNotifikasi('Gagal memuat data: ' + result.message, 'error');
        }
    } catch (error) {
        tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
    } finally {
        loadingManajemen.classList.add('hidden');
    }
}

function renderTabelBarang() {
    tabelBarangBody.innerHTML = '';
    AppState.barang.forEach(item => {
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

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(formBarang);
    const action = AppState.modeEdit.barang ? API_ACTIONS.UBAH_BARANG : API_ACTIONS.TAMBAH_BARANG;
    formData.append('action', action);

    const button = AppState.modeEdit.barang ? btnSimpan : btnTambah;
    button.disabled = true;
    button.textContent = 'Memproses...';

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.status === 'sukses') {
            tampilkanNotifikasi(result.message, 'sukses');
            formBarang.reset();
            keluarModeEdit();
            AppState.barang = []; // Kosongkan cache agar data baru dimuat
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

function masukModeEdit(dataBarang) {
    AppState.modeEdit.barang = true;
    formBarang.scrollIntoView({
        behavior: 'smooth'
    });
    for (const key in dataBarang) {
        if (formBarang.elements[key]) {
            formBarang.elements[key].value = dataBarang[key];
        }
    }
    btnTambah.classList.add('hidden');
    btnSimpan.classList.remove('hidden');
    btnBatal.classList.remove('hidden');
    rekomendasiKodeDiv.classList.add('hidden');
    rekomendasiKodeDiv.innerHTML = '';
}

function keluarModeEdit() {
    AppState.modeEdit.barang = false;
    formBarang.reset();
    idBarangInput.value = '';
    btnTambah.classList.remove('hidden');
    btnSimpan.classList.add('hidden');
    btnBatal.classList.add('hidden');
}

// --- MANAJEMEN PENGGUNA ---
async function muatDataPengguna() {
    if (AppState.pengguna.length > 0) {
        renderTabelPengguna();
        return;
    }
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

function renderTabelPengguna() {
    tabelPenggunaBody.innerHTML = '';
    AppState.pengguna.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.Username}</td>
            <td>${user.Nama_Lengkap}</td>
            <td>${user.Role}</td>
            <td>
                <button class="btn-aksi btn-ubah" data-id="${user.ID_Pengguna}">Ubah</button>
                <button class="btn-aksi btn-hapus" data-id="${user.ID_Pengguna}">Hapus</button>
            </td>
        `;
        tabelPenggunaBody.appendChild(tr);
    });
}

async function handleFormSubmitPengguna(e) {
    e.preventDefault();
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
        if (passwordValue) {
            dataUntukKirim.append('Password_Baru', passwordValue);
        }
    } else {
        if (!passwordValue) {
            alert('Password wajib diisi untuk pengguna baru.');
            return;
        }
        dataUntukKirim.append('Password', passwordValue);
    }

    const button = AppState.modeEdit.pengguna ? btnSimpanPengguna : btnTambahPengguna;
    button.disabled = true;
    button.textContent = 'Memproses...';
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: dataUntukKirim
        });
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

function masukModeEditPengguna(dataPengguna) {
    AppState.modeEdit.pengguna = true;
    formPengguna.scrollIntoView({
        behavior: 'smooth'
    });
    idPenggunaInput.value = dataPengguna.ID_Pengguna;
    formPengguna.elements['Username'].value = dataPengguna.Username;
    formPengguna.elements['Nama_Lengkap'].value = dataPengguna.Nama_Lengkap;
    formPengguna.elements['Role'].value = dataPengguna.Role;
    
    const passwordInput = formPengguna.elements['Password_Baru'];
    passwordInput.value = '';
    passwordInput.placeholder = "Isi hanya jika ingin mengubah password";
    
    btnTambahPengguna.classList.add('hidden');
    btnSimpanPengguna.classList.remove('hidden');
    btnBatalPengguna.classList.remove('hidden');
}

function keluarModeEditPengguna() {
    AppState.modeEdit.pengguna = false;
    formPengguna.reset();
    idPenggunaInput.value = '';
    formPengguna.elements['Password_Baru'].placeholder = "Isi untuk pengguna baru / jika ingin diubah";
    btnTambahPengguna.classList.remove('hidden');
    btnSimpanPengguna.classList.add('hidden');
    btnBatalPengguna.classList.add('hidden');
}

// --- LOGIKA KASIR, LAPORAN & STRUK ---
function cariBarang() {
    const query = inputCari.value.toLowerCase();
    if (query.length < 2) {
        hasilPencarianDiv.classList.add('hidden');
        hasilPencarianDiv.innerHTML = '';
        return;
    }

    const hasilFilter = AppState.barang.filter(item => {
        const kode = item.Kode_Barang ? String(item.Kode_Barang).toLowerCase() : '';
        const nama = item.Nama_Barang ? String(item.Nama_Barang).toLowerCase() : '';
        return kode.includes(query) || nama.includes(query);
    }).slice(0, 10);

    hasilPencarianDiv.innerHTML = '';
    if (hasilFilter.length > 0) {
        hasilPencarianDiv.classList.remove('hidden');
        hasilFilter.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'rekomendasi-item';
            itemDiv.innerHTML = `<strong>${item.Nama_Barang}</strong> <br><small>Kode: ${item.Kode_Barang} | Stok: ${item.Stok_Pcs} Pcs</small>`;
            itemDiv.addEventListener('click', () => pilihBarang(item));
            hasilPencarianDiv.appendChild(itemDiv);
        });
    } else {
        hasilPencarianDiv.classList.add('hidden');
    }
}

function pilihBarang(item) {
    formTambahKeranjang.classList.remove('hidden');
    itemTerpilihDataInput.value = JSON.stringify(item);
    namaBarangTerpilihSpan.innerHTML = `${item.Nama_Barang} <small>(Stok: ${item.Stok_Pcs} Pcs)</small>`;
    
    selectSatuanKasir.innerHTML = '';
    selectSatuanKasir.add(new Option(`Pcs - ${formatRupiah(item.Harga_Pcs)}`, 'Pcs'));
    if (item.Harga_Lusin > 0 && item.Pcs_Per_Lusin > 0) {
        selectSatuanKasir.add(new Option(`Lusin - ${formatRupiah(item.Harga_Lusin)}`, 'Lusin'));
    }
    if (item.Harga_Karton > 0 && item.Pcs_Per_Karton > 0) {
        selectSatuanKasir.add(new Option(`Karton - ${formatRupiah(item.Harga_Karton)}`, 'Karton'));
    }

    inputCari.value = '';
    hasilPencarianDiv.classList.add('hidden');
    inputJumlahKasir.value = 1;
    inputJumlahKasir.focus();
}

function handleTambahKeKeranjang(e) {
    e.preventDefault();
    const itemData = JSON.parse(itemTerpilihDataInput.value);
    const jumlahDiminta = parseFloat(inputJumlahKasir.value);
    const satuanDiminta = selectSatuanKasir.value;
    
    const pcsDiKeranjang = AppState.keranjang
        .filter(item => item.idBarang === itemData.ID_Barang)
        .reduce((total, item) => total + item.jumlahPcs, 0);
    
    let pcsAkanDitambah = 0;
    if (satuanDiminta === 'Pcs') {
        pcsAkanDitambah = jumlahDiminta;
    } else if (satuanDiminta === 'Lusin') {
        pcsAkanDitambah = jumlahDiminta * itemData.Pcs_Per_Lusin;
    } else if (satuanDiminta === 'Karton') {
        pcsAkanDitambah = jumlahDiminta * itemData.Pcs_Per_Karton;
    }
    
    if ((pcsDiKeranjang + pcsAkanDitambah) > itemData.Stok_Pcs) {
        const sisaStokEfektif = itemData.Stok_Pcs - pcsDiKeranjang;
        alert(`Stok tidak mencukupi!\n\nStok Awal: ${itemData.Stok_Pcs} Pcs\nSudah di Keranjang: ${pcsDiKeranjang} Pcs\nSisa Stok Tersedia: ${sisaStokEfektif} Pcs`);
        return;
    }

    let hargaSatuan = 0;
    if (satuanDiminta === 'Pcs') hargaSatuan = itemData.Harga_Pcs;
    else if (satuanDiminta === 'Lusin') hargaSatuan = itemData.Harga_Lusin;
    else if (satuanDiminta === 'Karton') hargaSatuan = itemData.Harga_Karton;

    const itemDiKeranjang = {
        idBarang: itemData.ID_Barang,
        namaBarang: itemData.Nama_Barang,
        jumlah: jumlahDiminta,
        jumlahPcs: pcsAkanDitambah,
        satuan: satuanDiminta,
        hargaSatuan: hargaSatuan,
        subtotal: jumlahDiminta * hargaSatuan,
        dataAsli: {
            Harga_Pcs: itemData.Harga_Pcs,
            Pcs_Per_Lusin: itemData.Pcs_Per_Lusin,
            Harga_Lusin: itemData.Harga_Lusin,
            Pcs_Per_Karton: itemData.Pcs_Per_Karton,
            Harga_Karton: itemData.Harga_Karton
        }
    };
    
    const indexAda = AppState.keranjang.findIndex(item => item.idBarang === itemDiKeranjang.idBarang && item.satuan === itemDiKeranjang.satuan);
    if (indexAda > -1) {
        AppState.keranjang[indexAda].jumlah += jumlahDiminta;
        AppState.keranjang[indexAda].jumlahPcs += pcsAkanDitambah;
        AppState.keranjang[indexAda].subtotal = AppState.keranjang[indexAda].jumlah * AppState.keranjang[indexAda].hargaSatuan;
    } else {
        AppState.keranjang.push(itemDiKeranjang);
    }
    
    renderKeranjang();
    formTambahKeranjang.classList.add('hidden');
    itemTerpilihDataInput.value = '';
    namaBarangTerpilihSpan.textContent = '';
    inputJumlahKasir.value = 1;
    inputCari.value = '';
    inputCari.focus();
}

function renderKeranjang() {
    tabelKeranjangBody.innerHTML = '';
    let total = 0;
    AppState.keranjang.forEach((item, index) => {
        const tr = document.createElement('tr');
        let satuanOptions = `<option value="Pcs">Pcs</option>`;
        const dataAsli = item.dataAsli;
        if (dataAsli.Harga_Lusin > 0 && dataAsli.Pcs_Per_Lusin > 0) satuanOptions += `<option value="Lusin">Lusin</option>`;
        if (dataAsli.Harga_Karton > 0 && dataAsli.Pcs_Per_Karton > 0) satuanOptions += `<option value="Karton">Karton</option>`;
        
        tr.innerHTML = `
            <td>${item.namaBarang}</td>
            <td><input type="number" class="qty-keranjang" value="${item.jumlah}" min="0.01" step="any" data-index="${index}"></td>
            <td><select class="satuan-keranjang" data-index="${index}">${satuanOptions}</select></td>
            <td>${formatRupiah(item.subtotal)}</td>
            <td><button class="btn-aksi btn-hapus" data-index="${index}">X</button></td>
        `;
        tabelKeranjangBody.appendChild(tr);
        tr.querySelector('.satuan-keranjang').value = item.satuan;
        total += item.subtotal;
    });
    totalBelanjaSpan.textContent = formatRupiah(total);
    hitungKembalian();
}

function updateKuantitasKeranjang(index, jumlahBaru) {
    const item = AppState.keranjang[index];
    if (!item) return;
    
    const itemDataAsli = AppState.barang.find(i => i.ID_Barang === item.idBarang);
    if (!itemDataAsli) {
        alert('Data barang tidak ditemukan. Coba muat ulang halaman.');
        renderKeranjang();
        return;
    }

    const stokAwal = itemDataAsli.Stok_Pcs;
    const pcsLainDiKeranjang = AppState.keranjang
        .filter((_, i) => i !== parseInt(index) && AppState.keranjang[i].idBarang === item.idBarang)
        .reduce((total, itemLain) => total + itemLain.jumlahPcs, 0);
    
    let pcsDimintaSekarang = 0;
    if (item.satuan === 'Pcs') pcsDimintaSekarang = jumlahBaru;
    else if (item.satuan === 'Lusin') pcsDimintaSekarang = jumlahBaru * item.dataAsli.Pcs_Per_Lusin;
    else if (item.satuan === 'Karton') pcsDimintaSekarang = jumlahBaru * item.dataAsli.Pcs_Per_Karton;

    if ((pcsLainDiKeranjang + pcsDimintaSekarang) > stokAwal) {
        alert(`Stok tidak mencukupi!\n\nStok Awal: ${stokAwal} Pcs\nItem lain di Keranjang: ${pcsLainDiKeranjang} Pcs\nSisa Stok Tersedia: ${stokAwal - pcsLainDiKeranjang} Pcs`);
        renderKeranjang();
        return;
    }
    
    item.jumlah = jumlahBaru;
    item.jumlahPcs = pcsDimintaSekarang;
    item.subtotal = jumlahBaru * item.hargaSatuan;
    renderKeranjang();
}

function updateSatuanKeranjang(index, satuanBaru) {
    const item = AppState.keranjang[index];
    if (!item) return;

    const itemDataAsliServer = AppState.barang.find(i => i.ID_Barang === item.idBarang);
    if (!itemDataAsliServer) {
        alert('Data barang tidak ditemukan. Coba muat ulang halaman.');
        return;
    }
    
    let hargaSatuanBaru = 0;
    let jumlahPcsBaru = 0;
    if (satuanBaru === 'Pcs') {
        hargaSatuanBaru = itemDataAsliServer.Harga_Pcs;
        jumlahPcsBaru = item.jumlah * 1;
    } else if (satuanBaru === 'Lusin') {
        hargaSatuanBaru = itemDataAsliServer.Harga_Lusin;
        jumlahPcsBaru = item.jumlah * itemDataAsliServer.Pcs_Per_Lusin;
    } else if (satuanBaru === 'Karton') {
        hargaSatuanBaru = itemDataAsliServer.Harga_Karton;
        jumlahPcsBaru = item.jumlah * itemDataAsliServer.Pcs_Per_Karton;
    }

    const stokAwal = itemDataAsliServer.Stok_Pcs;
    const pcsLainDiKeranjang = AppState.keranjang
        .filter((_, i) => i !== parseInt(index) && AppState.keranjang[i].idBarang === item.idBarang)
        .reduce((total, itemLain) => total + itemLain.jumlahPcs, 0);

    if ((pcsLainDiKeranjang + jumlahPcsBaru) > stokAwal) {
        alert(`Stok tidak mencukupi untuk mengubah ke satuan ${satuanBaru}!`);
        renderKeranjang();
        return;
    }
    
    item.satuan = satuanBaru;
    item.hargaSatuan = hargaSatuanBaru;
    item.jumlahPcs = jumlahPcsBaru;
    item.subtotal = item.jumlah * hargaSatuanBaru;
    renderKeranjang();
}

function hitungKembalian() {
    const total = AppState.keranjang.reduce((sum, item) => sum + item.subtotal, 0);
    const bayar = parseFloat(inputBayar.value) || 0;
    const kembali = bayar - total;
    kembalianSpan.textContent = formatRupiah(kembali);
    btnProsesTransaksi.disabled = !(kembali >= 0 && AppState.keranjang.length > 0);
}

async function prosesTransaksi() {
    if (AppState.keranjang.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    const dataUntukKirim = {
        kasir: AppState.currentUser.Nama_Lengkap,
        keranjang: AppState.keranjang,
        totalBelanja: AppState.keranjang.reduce((sum, item) => sum + item.subtotal, 0),
        jumlahBayar: parseFloat(inputBayar.value),
        kembalian: (parseFloat(inputBayar.value) - AppState.keranjang.reduce((sum, item) => sum + item.subtotal, 0))
    };

    btnProsesTransaksi.disabled = true;
    btnProsesTransaksi.textContent = 'Memproses...';
    try {
        const response = await fetch(`${SCRIPT_URL}?action=${API_ACTIONS.PROSES_TRANSAKSI}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(dataUntukKirim)
        });
        const result = await response.json();
        if (result.status === 'sukses') {
            menuTransaksi.classList.add('hidden');
            tampilkanStruk(dataUntukKirim, result.idTransaksi);
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

function tampilkanStruk(dataTransaksi, idTransaksi) {
    let htmlStruk = `<h3>Toko ADS Gedangan</h3><p>ID Transaksi: ${idTransaksi}</p><p>Waktu: ${new Date().toLocaleString('id-ID')}</p><p>Kasir: ${dataTransaksi.kasir}</p><hr>`;
    dataTransaksi.keranjang.forEach(item => {
        htmlStruk += `<div>${item.namaBarang}</div><div class="struk-item"><span>${item.jumlah} ${item.satuan} x ${formatRupiah(item.hargaSatuan)}</span><span>${formatRupiah(item.subtotal)}</span></div>`;
    });
    htmlStruk += `<hr><div class="struk-item"><strong>Total</strong><strong>${formatRupiah(dataTransaksi.totalBelanja)}</strong></div>`;
    htmlStruk += `<div class="struk-item"><span>Bayar</span><span>${formatRupiah(dataTransaksi.jumlahBayar)}</span></div>`;
    htmlStruk += `<div class="struk-item"><span>Kembali</span><span>${formatRupiah(dataTransaksi.kembalian)}</span></div>`;
    htmlStruk += `<hr><p style="text-align:center; margin-top:10px;">Terima Kasih Telah Berbelanja, Semoga Berkah ^_^</p>`;
    strukContent.innerHTML = htmlStruk;
    areaStruk.classList.remove('hidden');
}

function cetakStruk() {
    window.print();
}

async function muatLaporan() {
    if (AppState.laporan.length > 0) {
        renderTabelLaporan();
        return;
    }
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

function renderTabelLaporan() {
    tabelLaporanBody.innerHTML = '';
    AppState.laporan.forEach(trx => {
        const detailBarang = JSON.parse(trx.Detail_Barang_JSON).map(item => `${item.namaBarang} (${item.jumlah} ${item.satuan})`).join('<br>');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${trx.ID_Transaksi}</td>
            <td>${trx.Timestamp_Transaksi}</td>
            <td>${trx.Kasir || ''}</td>
            <td>${detailBarang}</td>
            <td>${formatRupiah(trx.Total_Belanja)}</td>
        `;
        tabelLaporanBody.appendChild(tr);
    });
}

// ====================================================================
// TAHAP 5: EVENT LISTENERS UTAMA
// ====================================================================

function setActiveNav(button) {
    [navManajemen, navTransaksi, navLaporan, navPengguna].forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

function showMenu(menuToShow) {
    semuaMenu.forEach(menu => menu.classList.add('hidden'));
    areaStruk.classList.add('hidden');
    menuToShow.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
formLogin.addEventListener('submit', handleLogin);
btnLogout.addEventListener('click', handleLogout);

navManajemen.addEventListener('click', () => {
    setActiveNav(navManajemen);
    showMenu(menuManajemen);
    muatDataBarang();
});
navTransaksi.addEventListener('click', () => {
    setActiveNav(navTransaksi);
    showMenu(menuTransaksi);
    if (AppState.barang.length === 0) {
        muatDataBarang();
    }
});
navLaporan.addEventListener('click', () => {
    setActiveNav(navLaporan);
    showMenu(menuLaporan);
    muatLaporan();
});
navPengguna.addEventListener('click', () => {
    setActiveNav(navPengguna);
    showMenu(menuPengguna);
    muatDataPengguna();
});

formBarang.addEventListener('submit', handleFormSubmit);
btnBatal.addEventListener('click', keluarModeEdit);
tabelBarangBody.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('btn-ubah')) {
        const id = target.dataset.id;
        const dataBarang = AppState.barang.find(item => item.ID_Barang === id);
        if (dataBarang) masukModeEdit(dataBarang);
    }
    if (target.classList.contains('btn-hapus')) {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            const id = target.dataset.id;
            const formData = new FormData();
            formData.append('action', API_ACTIONS.HAPUS_BARANG);
            formData.append('ID_Barang', id);
            target.disabled = true;
            target.textContent = '...';
            try {
                const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
                const result = await response.json();
                if (result.status === 'sukses') {
                    tampilkanNotifikasi(result.message, 'sukses');
                    AppState.barang = [];
                    muatDataBarang();
                } else {
                    tampilkanNotifikasi('Gagal menghapus: ' + result.message, 'error');
                }
            } catch (error) {
                tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
            }
        }
    }
});

formPengguna.addEventListener('submit', handleFormSubmitPengguna);
btnBatalPengguna.addEventListener('click', keluarModeEditPengguna);
tabelPenggunaBody.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('btn-ubah')) {
        const id = target.dataset.id;
        const dataPengguna = AppState.pengguna.find(user => user.ID_Pengguna === id);
        if (dataPengguna) masukModeEditPengguna(dataPengguna);
    }
    if (target.classList.contains('btn-hapus')) {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            const id = target.dataset.id;
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
                }
            } catch (error) {
                tampilkanNotifikasi('Terjadi kesalahan jaringan.', 'error');
            }
        }
    }
});

inputKodeBarang.addEventListener('keyup', (e) => {
    const query = inputKodeBarang.value.toLowerCase();
    if (query.length < 1 || AppState.modeEdit.barang) {
        rekomendasiKodeDiv.classList.add('hidden');
        rekomendasiKodeDiv.innerHTML = '';
        return;
    }

    const hasilFilter = AppState.barang.filter(item => {
        const kode = item.Kode_Barang ? String(item.Kode_Barang).toLowerCase() : '';
        const nama = item.Nama_Barang ? String(item.Nama_Barang).toLowerCase() : '';
        return kode.includes(query) || nama.includes(query);
    }).slice(0, 10);

    rekomendasiKodeDiv.innerHTML = '';
    if (hasilFilter.length > 0) {
        rekomendasiKodeDiv.classList.remove('hidden');
        hasilFilter.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'rekomendasi-item';
            itemDiv.textContent = `${item.Kode_Barang} - ${item.Nama_Barang}`;
            itemDiv.addEventListener('click', () => {
                masukModeEdit(item);
                rekomendasiKodeDiv.classList.add('hidden');
            });
            rekomendasiKodeDiv.appendChild(itemDiv);
        });
    } else {
        rekomendasiKodeDiv.classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#rekomendasi-kode') && e.target !== inputKodeBarang) {
        rekomendasiKodeDiv.classList.add('hidden');
    }
    if (!e.target.closest('#hasil-pencarian') && e.target !== inputCari) {
        hasilPencarianDiv.classList.add('hidden');
    }
    if (e.target.classList.contains('toggle-password')) {
        const passwordInput = e.target.previousElementSibling;
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            e.target.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            e.target.textContent = '👁️';
        }
    }
});

inputCari.addEventListener('keyup', () => {
    clearTimeout(AppState.timeoutCari);
    AppState.timeoutCari = setTimeout(cariBarang, 300);
});

formTambahKeranjang.addEventListener('submit', handleTambahKeKeranjang);
inputBayar.addEventListener('input', hitungKembalian);
btnProsesTransaksi.addEventListener('click', prosesTransaksi);

tabelKeranjangBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-hapus')) {
        const index = e.target.dataset.index;
        AppState.keranjang.splice(index, 1);
        renderKeranjang();
    }
});
tabelKeranjangBody.addEventListener('change', (e) => {
    const target = e.target;
    const index = target.dataset.index;
    if (target.classList.contains('qty-keranjang')) {
        const jumlahBaru = parseFloat(target.value);
        if (jumlahBaru > 0) {
            updateKuantitasKeranjang(index, jumlahBaru);
        } else {
            AppState.keranjang.splice(index, 1);
            renderKeranjang();
        }
    }
    if (target.classList.contains('satuan-keranjang')) {
        const satuanBaru = target.value;
        updateSatuanKeranjang(index, satuanBaru);
    }
});

btnCetakStruk.addEventListener('click', cetakStruk);
btnTransaksiBaru.addEventListener('click', () => {
    AppState.keranjang = [];
    renderKeranjang();
    inputBayar.value = '';
    hitungKembalian();
    menuTransaksi.classList.remove('hidden');
    areaStruk.classList.add('hidden');
});
