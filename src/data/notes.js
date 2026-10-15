// Tambah objek baru di array NOTES untuk nambah kartu.
//
// type: 'letter'   -> surat. Field:
//   herText   : surat panjang dia (opsional; kalau kosong, cuma balasanmu yang tampil)
//   myText    : balasanmu (opsional)
//   herAfter  : kalimat pendek dia setelah baca balasanmu (opsional)
//   herName   : nama dia di surat (default 'Dia')
//   Pisah paragraf pakai baris kosong (\n\n).
//
// type: 'favorite' -> daftar kesukaan (category, note, items) seperti sebelumnya.

export const NOTES = [
  {
    id: 'letter-1',
    type: 'letter',
    title: 'soal hari yang berat',
    date: 'Oktober 2026',
    herName: 'Dia',
    herText:
      'Hari ini capek banget. Rasanya semua hal salah, dan aku nggak tahu harus mulai cerita dari mana. Kadang aku cuma pengen ada yang dengerin tanpa nyuruh aku buat kuat.',
    myText:
      'Aku dengerin kok. Nggak usah kuat hari ini. Cerita aja pelan-pelan, atau diem pun nggak apa-apa, aku tetap di sini.\n\nDan makasih udah mau cerita ke aku. Itu berarti banget buatku.\n\nIstirahat dulu ya, besok kita jalan lagi pelan-pelan.',
    herAfter: 'Makasih ya. Beneran bikin tenang.',
  },
  {
    id: 'fav-makanan',
    type: 'favorite',
    category: 'Makanan',
    title: 'yang selalu bikin dia senyum',
    note: 'Daftar makanan yang kalau ditawarin, dia nggak pernah nolak.',
    items: [
      { name: 'Kebab', desc: 'SETUJUUUKK INI EMANG ENAK', image: '' },
      { name: 'Nasi Goreng (bikinan mama)', desc: 'Gaada fotonyaaa jadi ambil google aja EHEHE maaf ya.', image: '' },
      { name: 'Ayam Geprek', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Mie Ayam', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Bakso', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Seblak', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Cireng', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Cumi', desc: 'Noted : Alergi Seafood', image: '' },
      { name: 'Beef Teriyaki', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Capcay', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Bebek Goreng', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Ayam Bakar', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Sosis di Kecapin', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Udang Saus Tiram', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
      { name: 'Kerang', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
    ],
  },
  {
    id: 'letter-2',
    type: 'letter',
    title: 'balesan panjang yang aku simpan',
    date: 'Oktober 2026',
    herText:
      'Kamu tuh kok bisa ya inget hal-hal kecil yang bahkan aku sendiri lupa pernah bilang?',
    myText:
      'Karena buatku nggak ada yang kecil kalau itu tentang kamu. Cara kamu ketawa, minuman yang selalu kamu pesan, sampai kebiasaan kamu mikir sebelum jawab.\n\nAku catat semuanya diam-diam, soalnya itu bagian dari kamu yang aku suka.',
  },
  {
    id: 'fav-minuman',
    type: 'favorite',
    category: 'Minuman',
    title: 'penyelamat mood di siang hari',
    note: 'Less sugar, extra creamy. Itu aturannya.',
    items: [
      { name: 'Jus', desc: 'Manisnya pas, teksturnya lembut.', image: '' },
      { name: 'Susu', desc: 'AHAHAHA PASTII SUSU NOBO, karna orangnya NOBO.', image: '' },
    ],
  },
  {
    id: 'letter-3',
    type: 'letter',
    title: 'kalau kamu lagi capek',
    date: 'Buat dibaca kapan aja',
    myText:
      'Kalau suatu hari kamu ngerasa semuanya berat, balik lagi ke sini ya. Baca ulang surat-surat ini.\n\nNggak harus langsung merasa lebih baik. Cukup tahu bahwa ada yang mikirin kamu tiap hari dan bangga sama kamu, bahkan di hari kamu ngerasa nggak ngapa-ngapain.',
  },
  {
    id: 'fav-tempat',
    type: 'favorite',
    category: 'Tempat',
    title: 'Minumaann',
    note: 'beberapa jenis minuman yang kamu suka',
    items: [
      { name: 'Jus Mangga', desc: 'SETUJUK BANGET JUS MANGGA ENAAKK', image: '' },
      { name: 'Jus Alpukat', desc: 'AKJDNAJKND AKU JUGA SUKA BANGET', image: '' },
    ],
  },
];