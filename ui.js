// ====================================================================
// UI.JS - Modul untuk Semua Hal Terkait Tampilan dan Interaksi Pengguna
// ====================================================================

import { AppState, API_ACTIONS, loginContainer, appContainer, formLogin, loginStatus, infoNamaKasir, btnLogout, notifikasi, navManajemen, navTransaksi, navLaporan, navPengguna, semuaMenu, menuManajemen, menuTransaksi, menuLaporan, menuPengguna, formBarang, idBarangInput, inputKodeBarang, rekomendasiKodeDiv, btnTambah, btnSimpan, btnBatal, tabelBarangBody, loadingManajemen, formPengguna, idPenggunaInput, btnTambahPengguna, btnSimpanPengguna, btnBatalPengguna, tabelPenggunaBody, loadingPengguna, inputCari, hasilPencarianDiv, loadingCari, formTambahKeranjang, namaBarangTerpilihSpan, itemTerpilihDataInput, inputJumlahKasir, selectSatuanKasir, btnTambahKeranjang, tabelKeranjangBody, totalBelanjaSpan, inputBayar, kembalianSpan, btnProsesTransaksi, tabelLaporanBody, loadingLaporan, areaStruk, strukContent } from './app.js';
import { handleLoginApi } from './api.js';

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

export function checkLoginStatus() {
    const user = sessionStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        AppState.currentUser = userData;
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
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

export async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(formLogin);
    const button = formLogin.querySelector('button');
    button.disabled = true;
    button.textContent = 'Memproses...';
    loginStatus.textContent = '';
    
    const result = await handleLoginApi(formData);

    if (!result.success) {
        loginStatus.textContent = result.message;
    }
    button.disabled = false;
    button.textContent = 'Login';
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

export function renderTabelBarang() {
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
            itemDiv.innerHTML = `<strong>${item.Nama_Barang}</strong> <br><small>Kode: ${item.Kode_Barang} | Stok: ${item.Stok_Pcs} Pcs</small>`;
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
        alert(`Stok tidak mencukupi!\n\nStok Awal: ${itemData.Stok_Pcs} Pcs\nSudah di Keranjang: ${pcsDiKeranjang} Pcs\nSisa Stok Tersedia: ${itemData.Stok_Pcs - pcsDiKeranjang} Pcs`);
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
        alert(`Stok tidak mencukupi!\n\nStok Awal: ${stokAwal} Pcs\nItem lain di Keranjang: ${pcsLainDiKeranjang} Pcs\nSisa Stok Tersedia: ${stokAwal - pcsLainDiKeranjang} Pcs`);
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

export function cetakStruk() {
    window.print();
}

export function renderTabelLaporan() {
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
