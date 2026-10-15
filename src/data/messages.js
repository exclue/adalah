export const loveNotes = [
  {
    id: 'note-1',
    category: 'A Little Appreciation',
    title: 'Untuk Kamu yang Selalu Jadi Rumah',
    date: 'Setiap Hari',
    content: 'Kadang dunia di luar sana berjalan terlalu cepat dan melelahkan, tapi setiap kali melihat senyum kamu, semua beban rasanya reda. Terima kasih sudah selalu menjadi tempat ternyaman untuk pulang, untuk cerita tanpa takut dinilai, dan untuk jadi diri sendiri seutuhnya.',
    highlight: 'Kamu adalah definisi ketenangan yang paling nyata.',
    authorTag: 'Dari seseorang yang selalu mengagumimu'
  },
  {
    id: 'note-2',
    category: 'Things I Adore',
    title: 'Detail-Detail Kecil Tentangmu',
    date: 'Selamanya Tersimpan',
    content: 'Cara kamu tertawa lepas saat mendengar lelucon konyol, antusiasme matamu saat menceritakan hal yang kamu suka, sampai caramu cemberut saat lapar—semua detail kecil itu adalah hal paling berharga yang selalu ingin kujaga.',
    highlight: 'Hal-hal sederhana darimu adalah hal luar biasa bagiku.',
    authorTag: 'Tersimpan rapi di ingatanku'
  },
  {
    id: 'note-3',
    category: 'A Gentle Promise',
    title: 'Menemani Setiap Langkahmu',
    date: 'Hari Ini & Seterusnya',
    content: 'Apapun impian yang sedang kamu kejar, dan tantangan apapun yang ada di depan, ingat kalau kamu ga pernah sendirian. Aku akan selalu ada di sini—bukan hanya saat hari-harimu cerah, tapi juga saat mendung datang dan kamu butuh pelukan hangat.',
    highlight: 'Melangkah pelan-pelan bersama, tanpa perlu terburu-buru.',
    authorTag: 'Selalu di sampingmu'
  },
  {
    id: 'note-4',
    category: 'Gratitude',
    title: 'Terima Kasih Sudah Hadir',
    date: 'Dari Lubuk Hati',
    content: 'Kehadiranmu mengubah banyak hal menjadi jauh lebih berarti. Terima kasih telah mencintai dengan tulus, menerima kurang dan lebihku, dan membuat hari-hari biasa terasa seperti petualangan yang indah.',
    highlight: 'Memiliki kamu adalah berkah paling manis dalam hidupku.',
    authorTag: 'Dengan segenap rasa sayang'
  }
];

export const shortQuotes = [
  'Di antara jutaan kemungkinan, menemukan kamu adalah keberuntungan terbesarku.',
  'Bukan tentang tempat yang kita tuju, tapi tentang tangan siapa yang kugenggam di perjalanan.',
  'Terima kasih sudah lahir dan tumbuh menjadi wanita yang begitu luar biasa.'
];

/**
 * Secarik kertas di section buket bunga.
 *
 * Judul di paling atas kertas (sama untuk ketiga buket):
 */
export const diaryTitle = 'diary nia';

/**
 * Tiga surat, urutannya sama dengan urutan buket yang di-slide:
 *   [0] mawar merah + tulip putih + iris
 *   [1] kuncup mawar + daisy + peony
 *   [2] daisy + tulip + baby rose
 *
 * `date` : tulisan kecil di bawah "diary nia" (kosongkan '' kalau tidak mau).
 * `paragraphs` : isi surat, panjang berapa pun aman (kertasnya bisa di-scroll).
 *
 * Cara nulis tiap item di `paragraphs`:
 *  - 'teks biasa'      -> satu paragraf. Pakai \n kalau mau ganti baris (puisi / daftar).
 *  - '# Judul kecil'   -> sub-judul tulisan tangan yang lebih besar.
 *  - '---'             -> pemisah  · · ·
 *  - '~ dari aku'      -> tanda tangan, rata kanan, tulisan tangan besar (taruh di akhir).
 *
 * Isi di bawah ini cuma contoh. Ganti semuanya.
 */
export const bouquetLetters = [
  {
    date: 'October 15th, 2026',
    paragraphs: [
      'Nia,',
      'Aku nggak pernah pintar merangkai kata, jadi aku selipkan semuanya di sini, di secarik kertas yang kutaruh di antara bunga-bunga ini.',
      'Mawar merah buat hal yang nggak bisa kuucapkan langsung. Tulip putih buat semua yang tulus dan sederhana. Iris buat harapan yang diam-diam kujaga tiap kali kamu tersenyum.',
      '---',
      '# Yang pengen aku bilang pelan-pelan',
      'Terima kasih sudah sabar di hari-hari aku lagi nggak gampang. Terima kasih sudah mendengarkan cerita yang kadang nggak penting, tapi kamu tetap dengarkan sampai habis.',
      'Di dekatmu rasanya seperti pulang. Bukan ke sebuah tempat, tapi ke seseorang.',
      '~ dari aku',
    ],
  },
  {
    date: 'October 15th, 2026',
    paragraphs: [
      'Nia,',
      'Kuncup mawar ini belum mekar. Seperti banyak hal di antara kita yang masih pelan-pelan tumbuh, dan aku suka menunggunya bersamamu.',
      'Ini cuma contoh isi. Ganti dengan tulisanmu sendiri di messages.js. Mau tiga kalimat atau tiga halaman, kertasnya tetap rapi dan bisa digeser ke bawah.',
      '---',
      '# Hal-hal kecil yang kusimpan',
      'Cara kamu tertawa sampai matamu menyipit. Cara kamu bilang "bentar" padahal sudah hampir sampai. Cara kamu diam-diam peduli tanpa minta dilihat.',
      '~ dari aku',
    ],
  },
  {
    date: 'October 15th, 2026',
    paragraphs: [
      'Nia,',
      'Daisy buat hari-hari yang ringan, tulip buat yang hangat, dan baby rose buat hal-hal manis yang cuma kita berdua yang tahu.',
      'Aku nggak janji semuanya bakal mulus. Tapi aku janji tetap di sini, menyemangati kamu, dan jadi orang pertama yang ikut senang kalau kamu senang.',
      '---',
      'Sekali lagi, selamat ulang tahun. Semoga tahun ini sebaik kamu pada dunia.',
      '~ selalu, aku',
    ],
  },
];