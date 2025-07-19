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

export function masukModeEdit(dataBarang) {
    AppState.modeEdit.barang = true;
    formBarang.scrollIntoView({ behavior: 'smooth' });
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

export function keluarModeEdit() {
    AppState.modeEdit.barang = false;
    formBarang.reset();
    idBarangInput.value = '';
    btnTambah.classList.remove('hidden');
    btnSimpan.classList.add('hidden');
    btnBatal.classList.add('hidden');
}

export function renderTabelPengguna() {
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

export function masukModeEditPengguna(dataPengguna) {
    AppState.modeEdit.pengguna = true;
    formPengguna.scrollIntoView({ behavior: 'smooth' });
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

export function keluarModeEditPengguna() {
    AppState.modeEdit.pengguna = false;
    formPengguna.reset();
    idPenggunaInput.value = '';
    formPengguna.elements['Password_Baru'].placeholder = "Isi untuk pengguna baru / jika ingin diubah";
    btnTambahPengguna.classList.remove('hidden');
    btnSimpanPengguna.classList.add('hidden');
    btnBatalPengguna.classList.add('hidden');
}

export function cariBarang() {
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
            itemDiv.innerHTML = `<strong>${item.Nama_Barang}</strong> <br><small>Kode: ${item.Kode_Barang} | Stok: ${item.Stok_Pcs} Pcs/Kg</small>`;
            itemDiv.addEventListener('click', () => pilihBarang(item));
            hasilPencarianDiv.appendChild(itemDiv);
        });
    } else {
        hasilPencarianDiv.classList.add('hidden');
    }
}

export function pilihBarang(item) {
    formTambahKeranjang.classList.remove('hidden');
    itemTerpilihDataInput.value = JSON.stringify(item);
    namaBarangTerpilihSpan.innerHTML = `${item.Nama_Barang} <small>(Stok: ${item.Stok_Pcs} Pcs/Kg)</small>`;
    selectSatuanKasir.innerHTML = '';
    selectSatuanKasir.add(new Option(`Pcs / Kg - ${formatRupiah(item.Harga_Pcs)}`, 'Pcs'));
    if (item.Harga_Lusin > 0 && item.Pcs_Per_Lusin > 0) {
        selectSatuanKasir.add(new Option(`Paket / Lusin - ${formatRupiah(item.Harga_Lusin)}`, 'Lusin'));
    }
    if (item.Harga_Karton > 0 && item.Pcs_Per_Karton > 0) {
        selectSatuanKasir.add(new Option(`Karton / Sak - ${formatRupiah(item.Harga_Karton)}`, 'Karton'));
    }
    inputCari.value = '';
    hasilPencarianDiv.classList.add('hidden');
    inputJumlahKasir.value = 1;
    inputJumlahKasir.focus();
}

export function handleTambahKeKeranjang(e) {
    e.preventDefault();
    const itemData = JSON.parse(itemTerpilihDataInput.value);
    const jumlahDiminta = parseFloat(inputJumlahKasir.value);
    const satuanDiminta = selectSatuanKasir.value;
    const pcsDiKeranjang = AppState.keranjang.filter(item => item.idBarang === itemData.ID_Barang).reduce((total, item) => total + item.jumlahPcs, 0);
    let pcsAkanDitambah = 0;
    if (satuanDiminta === 'Pcs') pcsAkanDitambah = jumlahDiminta;
    else if (satuanDiminta === 'Lusin') pcsAkanDitambah = jumlahDiminta * itemData.Pcs_Per_Lusin;
    else if (satuanDiminta === 'Karton') pcsAkanDitambah = jumlahDiminta * itemData.Pcs_Per_Karton;

    if ((pcsDiKeranjang + pcsAkanDitambah) > itemData.Stok_Pcs) {
        const sisaStokEfektif = itemData.Stok_Pcs - pcsDiKeranjang;
        alert(`Stok tidak mencukupi!\n\nStok Awal: ${itemData.Stok_Pcs}\nSudah di Keranjang: ${pcsDiKeranjang}\nSisa Stok Tersedia: ${sisaStokEfektif}`);
        return;
    }

    let hargaSatuan = 0;
    if (satuanDiminta === 'Pcs') hargaSatuan = itemData.Harga_Pcs;
    else if (satuanDiminta === 'Lusin') hargaSatuan = itemData.Harga_Lusin;
    else if (satuanDiminta === 'Karton') hargaSatuan = itemData.Harga_Karton;

    const itemDiKeranjang = {
        idBarang: itemData.ID_Barang, namaBarang: itemData.Nama_Barang, jumlah: jumlahDiminta, jumlahPcs: pcsAkanDitambah, satuan: satuanDiminta, hargaSatuan: hargaSatuan, subtotal: jumlahDiminta * hargaSatuan, dataAsli: { Harga_Pcs: itemData.Harga_Pcs, Pcs_Per_Lusin: itemData.Pcs_Per_Lusin, Harga_Lusin: itemData.Harga_Lusin, Pcs_Per_Karton: itemData.Pcs_Per_Karton, Harga_Karton: itemData.Harga_Karton }
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

export function renderKeranjang() {
    tabelKeranjangBody.innerHTML = '';
    let total = 0;
    AppState.keranjang.forEach((item, index) => {
        const tr = document.createElement('tr');
        let satuanOptions = `<option value="Pcs">Pcs / Kg</option>`;
        const dataAsli = item.dataAsli;
        if (dataAsli.Harga_Lusin > 0 && dataAsli.Pcs_Per_Lusin > 0) satuanOptions += `<option value="Lusin">Paket / Lusin</option>`;
        if (dataAsli.Harga_Karton > 0 && dataAsli.Pcs_Per_Karton > 0) satuanOptions += `<option value="Karton">Karton / Sak</option>`;
        
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

export function updateKuantitasKeranjang(index, jumlahBaru) {
    const item = AppState.keranjang[index];
    if (!item) return;
    const itemDataAsli = AppState.barang.find(i => i.ID_Barang === item.idBarang);
    if (!itemDataAsli) {
        alert('Data barang tidak ditemukan. Coba muat ulang halaman.');
        renderKeranjang();
        return;
    }
    const stokAwal = itemDataAsli.Stok_Pcs;
    const pcsLainDiKeranjang = AppState.keranjang.filter((_, i) => i !== index && AppState.keranjang[i].idBarang === item.idBarang).reduce((total, itemLain) => total + itemLain.jumlahPcs, 0);
    let pcsDimintaSekarang = 0;
    if (item.satuan === 'Pcs') pcsDimintaSekarang = jumlahBaru;
    else if (item.satuan === 'Lusin') pcsDimintaSekarang = jumlahBaru * item.dataAsli.Pcs_Per_Lusin;
    else if (item.satuan === 'Karton') pcsDimintaSekarang = jumlahBaru * item.dataAsli.Pcs_Per_Karton;

    if ((pcsLainDiKeranjang + pcsDimintaSekarang) > stokAwal) {
        alert(`Stok tidak mencukupi!\n\nStok Awal: ${stokAwal}\nItem lain di Keranjang: ${pcsLainDiKeranjang}\nSisa Stok Tersedia: ${stokAwal - pcsLainDiKeranjang}`);
        renderKeranjang();
        return;
    }
    item.jumlah = jumlahBaru;
    item.jumlahPcs = pcsDimintaSekarang;
    item.subtotal = jumlahBaru * item.hargaSatuan;
    renderKeranjang();
}

export function updateSatuanKeranjang(index, satuanBaru) {
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
    const pcsLainDiKeranjang = AppState.keranjang.filter((_, i) => i !== index && AppState.keranjang[i].idBarang === item.idBarang).reduce((total, itemLain) => total + itemLain.jumlahPcs, 0);

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

export function hitungKembalian() {
    const total = AppState.keranjang.reduce((sum, item) => sum + item.subtotal, 0);
    const bayar = parseFloat(inputBayar.value) || 0;
    const kembali = bayar - total;
    kembalianSpan.textContent = formatRupiah(kembali);
    btnProsesTransaksi.disabled = !(kembali >= 0 && AppState.keranjang.length > 0);
}

export function tampilkanStruk(dataTransaksi, idTransaksi) {
    dataTransaksiTerakhir = dataTransaksi;
    idTransaksiTerakhir = idTransaksi;
    let htmlStruk = `<h3>Toko ADS Gedangan</h3><p style="text-align: center; margin-top: -5px; margin-bottom: 10px;">Terima kasih telah berbelanja!</p><hr><div class="struk-item"><span>ID Transaksi:</span><span>${idTransaksi}</span></div><div class="struk-item"><span>Waktu:</span><span>${new Date().toLocaleString('id-ID')}</span></div><div class="struk-item"><span>Kasir:</span><span>${dataTransaksi.kasir}</span></div><hr>`;
    dataTransaksi.keranjang.forEach(item => {
        htmlStruk += `<div>${item.namaBarang}</div><div class="struk-item"><span>${item.jumlah} ${terjemahkanSatuan(item.satuan)} x ${formatRupiah(item.hargaSatuan)}</span><span>${formatRupiah(item.subtotal)}</span></div>`;
    });
    htmlStruk += `<hr><div class="struk-item"><strong>Total Belanja</strong><strong>${formatRupiah(dataTransaksi.totalBelanja)}</strong></div><div class="struk-item"><span>Bayar</span><span>${formatRupiah(dataTransaksi.jumlahBayar)}</span></div><div class="struk-item"><span>Kembali</span><span>${formatRupiah(dataTransaksi.kembalian)}</span></div><hr><p style="text-align:center; margin-top:10px;">Semoga Berkah dan Sehat Selalu</p>`;
    strukContent.innerHTML = htmlStruk;
    areaStruk.classList.remove('hidden');
}

export function cetakStruk() {
    window.print();
}

export function setActiveNav(button) {
    [navManajemen, navTransaksi, navLaporan, navPengguna].forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

export function showMenu(menuToShow) {
    semuaMenu.forEach(menu => menu.classList.add('hidden'));
    areaStruk.classList.add('hidden');
    menuToShow.classList.remove('hidden');
}

export function rekomendasiKodeBarang(query) {
    const q = query.toLowerCase();
    if (q.length < 1 || AppState.modeEdit.barang) {
        rekomendasiKodeDiv.classList.add('hidden');
        rekomendasiKodeDiv.innerHTML = '';
        return;
    }
    const hasilFilter = AppState.barang.filter(item => {
        const kode = item.Kode_Barang ? String(item.Kode_Barang).toLowerCase() : '';
        const nama = item.Nama_Barang ? String(item.Nama_Barang).toLowerCase() : '';
        return kode.includes(q) || nama.includes(q);
    }).slice(0, 5);
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
}

export function togglePasswordVisibility(target) {
    const passwordInput = target.previousElementSibling;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        target.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        target.textContent = '👁️';
    }
}

export async function handleBatalDanUlangi() {
    if (!idTransaksiTerakhir) {
        alert("Tidak ada data transaksi terakhir untuk diubah.");
        return;
    }
    if (!confirm("Anda yakin ingin mengubah transaksi ini? Transaksi lama akan dibatalkan dan stok akan dikembalikan ke sistem.")) {
      return;
    }
    const btnUbah = document.getElementById('btn-ubah-transaksi');
    btnUbah.disabled = true;
    btnUbah.textContent = 'Membatalkan...';
    const result = await batalkanTransaksiApi(idTransaksiTerakhir);
    if (result.status === 'sukses') {
      tampilkanNotifikasi(result.message, 'sukses');
      AppState.keranjang = dataTransaksiTerakhir.keranjang;
      areaStruk.classList.add('hidden');
      menuTransaksi.classList.remove('hidden');
      renderKeranjang();
      inputBayar.value = dataTransaksiTerakhir.jumlahBayar;
      hitungKembalian();
    } else {
      tampilkanNotifikasi('Gagal: ' + result.message, 'error');
      btnUbah.disabled = false;
      btnUbah.textContent = 'Ubah Transaksi';
    }
}

function formatStrukUntukWhatsApp(dataTransaksi, idTransaksi) {
    let teksStruk = `*Toko ADS Gedangan*\n\n`;
    teksStruk += `Terima kasih telah berbelanja!\n`;
    teksStruk += `Berikut adalah rincian belanja Anda:\n\n`;
    teksStruk += `ID Transaksi: *${idTransaksi}*\n`;
    teksStruk += `Waktu: ${new Date().toLocaleString('id-ID')}\n`;
    teksStruk += `Kasir: ${dataTransaksi.kasir}\n`;
    teksStruk += `-----------------------------------\n`;

    dataTransaksi.keranjang.forEach(item => {
        teksStruk += `*${item.namaBarang}*\n`;
        teksStruk += `${item.jumlah} ${terjemahkanSatuan(item.satuan)} x ${formatRupiah(item.hargaSatuan)} = *${formatRupiah(item.subtotal)}*\n`;
    });

    teksStruk += `-----------------------------------\n`;
    teksStruk += `Total Belanja: *${formatRupiah(dataTransaksi.totalBelanja)}*\n`;
    teksStruk += `Bayar: ${formatRupiah(dataTransaksi.jumlahBayar)}\n`;
    teksStruk += `Kembali: ${formatRupiah(dataTransaksi.kembalian)}\n\n`;
    teksStruk += `_Semoga Berkah ^_^_\n`;
    return encodeURIComponent(teksStruk);
}

function formatNomorWhatsApp(nomor) {
    if (!nomor) return null;
    let nomorBersih = nomor.replace(/\D/g, '');
    if (nomorBersih.startsWith('0')) {
        return '62' + nomorBersih.substring(1);
    }
    if (nomorBersih.startsWith('62')) {
        return nomorBersih;
    }
    if (nomorBersih.length >= 10 && nomorBersih.length <= 15) {
      return nomorBersih;
    }
    return null;
}

export function handleKirimWhatsApp() {
    if (!idTransaksiTerakhir || !dataTransaksiTerakhir) {
        alert("Data transaksi tidak ditemukan. Silakan proses transaksi terlebih dahulu.");
        return;
    }
    const nomorTujuan = prompt("Masukkan nomor WhatsApp pelanggan (contoh: 081234567890):");
    if (nomorTujuan === null || nomorTujuan.trim() === '') {
        return;
    }
    const nomorTerformat = formatNomorWhatsApp(nomorTujuan);
    if (!nomorTerformat) {
        alert("Format nomor WhatsApp tidak valid. Pastikan Anda memasukkan nomor yang benar.");
        return;
    }
    const pesanStruk = formatStrukUntukWhatsApp(dataTransaksiTerakhir, idTransaksiTerakhir);
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${nomorTerformat}&text=${pesanStruk}`;
    window.open(urlWhatsApp, '_blank');
}

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
