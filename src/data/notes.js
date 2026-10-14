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
      { name: 'Bakso urat', desc: 'Wajib kuah panas, sambal tipis aja.', image: '' },
      { name: 'Mie kuah hangat', desc: 'Pilihan pertama pas hujan atau perut lapar.', image: '' },
      { name: 'Jajanan malam', desc: 'Yang penting dimakan sambil ngobrol.', image: '' },
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
      { name: 'Creamy matcha', desc: 'Manisnya pas, teksturnya lembut.', image: '' },
      { name: 'Taro velvet', desc: 'Selalu diminum sambil cerita hal seru.', image: '' },
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
    title: 'tempat yang bikin waktu berhenti',
    note: 'Angin sepoi-sepoi dan langit senja gradasi ungu.',
    items: [
      { name: 'Cafe senja', desc: 'Spot ngobrol berjam-jam tanpa rasa bosan.', image: '' },
      { name: 'Rooftop', desc: 'Paling bagus jam 5 sore.', image: '' },
    ],
  },
];