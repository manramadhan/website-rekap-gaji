$(document).ready(function () {
  const tabel = $("#tabelData");

  // === Format angka ke format rupiah ===
  function formatRupiah(angka) {
    const numberString = angka.toString().replace(/[^,\d]/g, "");
    const split = numberString.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }
    rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
    return rupiah;
  }

  function unformatRupiah(str) {
    return parseInt(str.replace(/[^\d]/g, "")) || 0;
  }

  function formatTanggalIndo(tgl) {
    const date = new Date(tgl);
    const hari = String(date.getDate()).padStart(2, "0");
    const bulan = String(date.getMonth() + 1).padStart(2, "0");
    const tahun = date.getFullYear();
    return `${hari}-${bulan}-${tahun}`;
  }

  // === Format otomatis saat diketik ===
  $("#jumlah").on("input", function () {
    let val = $(this).val().replace(/[^\d]/g, "");
    if (val) {
      $(this).val("Rp " + formatRupiah(val));
    } else {
      $(this).val("");
    }
  });

  // === Load tahun unik dari data ===
  function muatTahun() {
    const data = JSON.parse(localStorage.getItem("rekapData")) || [];
    const tahunSet = new Set();
    data.forEach((item) => {
      const t = new Date(item.tanggal).getFullYear();
      tahunSet.add(t);
    });

    const tahunSelect = $("#tahun");
    tahunSelect.find("option:not([value='all'])").remove();
    [...tahunSet].sort((a, b) => b - a).forEach((t) => {
      tahunSelect.append(`<option value="${t}">${t}</option>`);
    });
  }

  // === Muat data ke tabel ===
  function muatData() {
    const data = JSON.parse(localStorage.getItem("rekapData")) || [];
    tampilkanData(data);
    muatTahun();
  }

  // === Tampilkan data ===
  function tampilkanData(data) {
    tabel.empty();
    let totalMasuk = 0;
    let totalKeluar = 0;

    data.forEach((item, index) => {
      const row = `
        <tr>
          <td>${formatTanggalIndo(item.tanggal)}</td>
          <td>${item.keterangan}</td>
          <td class="${item.jenis === "Pemasukan" ? "text-green" : "text-red"}">${item.jenis}</td>
          <td>Rp ${formatRupiah(item.jumlah)}</td>
          <td><button class="hapus" data-index="${index}">Hapus</button></td>
        </tr>`;
      tabel.append(row);

      if (item.jenis === "Pemasukan") totalMasuk += item.jumlah;
      else totalKeluar += item.jumlah;
    });

    $("#totalMasuk").text("Rp " + formatRupiah(totalMasuk));
    $("#totalKeluar").text("Rp " + formatRupiah(totalKeluar));
    $("#saldo").text("Rp " + formatRupiah(totalMasuk - totalKeluar));
  }

  // === Tambah data ===
  $("#formInput").on("submit", function (e) {
    e.preventDefault();

    const tanggal = $("#tanggal").val();
    const keterangan = $("#keterangan").val();
    const jenis = $("#jenis").val();
    const jumlah = unformatRupiah($("#jumlah").val());

    if (!tanggal || !keterangan || isNaN(jumlah) || jumlah <= 0) {
      alert("Isi semua kolom dengan benar!");
      return;
    }

    const data = JSON.parse(localStorage.getItem("rekapData")) || [];
    data.push({ tanggal, keterangan, jenis, jumlah });
    localStorage.setItem("rekapData", JSON.stringify(data));
    muatData();
    $("#formInput")[0].reset();
  });

  // === Hapus data (dengan konfirmasi) ===
  $(document).on("click", ".hapus", function () {
    const index = $(this).data("index");
    const data = JSON.parse(localStorage.getItem("rekapData")) || [];
    const item = data[index];

    // Alert konfirmasi hapus
    if (confirm(`Yakin ingin menghapus data:\n${item.keterangan} (${item.jenis} Rp ${formatRupiah(item.jumlah)}) ?`)) {
      data.splice(index, 1);
      localStorage.setItem("rekapData", JSON.stringify(data));
      muatData();
      alert("Data berhasil dihapus ✅");
    }
  });

  // === Filter tanggal 5, 20, 25 ===
  $(".filter-btn").click(function () {
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    const filterTanggal = $(this).data("tanggal");
    const data = JSON.parse(localStorage.getItem("rekapData")) || [];

    if (filterTanggal === "all") {
      filterBulanan();
    } else {
      const hasil = data.filter((item) => {
        const tgl = new Date(item.tanggal).getDate();
        return tgl == filterTanggal;
      });
      tampilkanData(hasil);
    }
  });

  // === Filter per bulan dan tahun ===
  function filterBulanan() {
    const data = JSON.parse(localStorage.getItem("rekapData")) || [];
    const bulan = $("#bulan").val();
    const tahun = $("#tahun").val();

    let hasil = data;
    if (bulan !== "all") {
      hasil = hasil.filter((item) => new Date(item.tanggal).getMonth() == bulan);
    }
    if (tahun !== "all") {
      hasil = hasil.filter((item) => new Date(item.tanggal).getFullYear() == tahun);
    }

    tampilkanData(hasil);
  }

  $("#bulan, #tahun").change(function () {
    filterBulanan();
  });

  muatData();
});
