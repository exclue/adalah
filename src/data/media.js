// ================================================================
// media.js — semua gambar & video diambil dari /public/assets/
// Pakai URL statis biar gak ada masalah encode nama file di HP
// ================================================================

const BASE_IMG   = '/assets/images/';
const BASE_VID   = '/assets/videos/';
const BASE_THUMB = '/assets/video-thumbnails/';

const encode = (name) => name.split('').map(c => {
  // encode spasi dan karakter spesial tapi biarkan titik, huruf, angka
  if (/[A-Za-z0-9.\-_]/.test(c)) return c;
  return encodeURIComponent(c);
}).join('');

// Helper buat buat URL dengan nama file yang di-encode dengan aman
const img  = (name) => BASE_IMG   + encode(name);
const vid  = (name) => BASE_VID   + encode(name);
const thm  = (name) => BASE_THUMB + encode(name);

// ----------------------------------------------------------------
// Daftar foto (urutan alphabetical = urutan file)
// ----------------------------------------------------------------
const IMAGE_NAMES = [
  'WhatsApp Image 2026-10-05 at 9.26.15 PM.jpeg',
  'WhatsApp Image 2026-10-05 at 9.26.29 PM.jpeg',
  'WhatsApp Image 2026-10-05 at 9.26.43 PM.jpeg',
  'WhatsApp Image 2026-10-05 at 9.26.47 PM.jpeg',
  'WhatsApp Image 2026-10-06 at 10.27.00 AM.jpeg',
  'WhatsApp Image 2026-10-07 at 10.07.36 AM.jpeg',
  'WhatsApp Image 2026-10-07 at 10.17.16 AM.jpeg',
  'WhatsApp Image 2026-10-07 at 7.25.04 PM.jpeg',
  'WhatsApp Image 2026-10-08 at 8.18.14 PM.jpeg',
  'WhatsApp Image 2026-10-08 at 8.18.17 PM.jpeg',
  'WhatsApp Image 2026-10-08 at 8.18.21 PM.jpeg',
  'WhatsApp Image 2026-10-09 at 10.30.32 PM.jpeg',
  'WhatsApp Image 2026-10-09 at 11.08.31 PM.jpeg',
  'WhatsApp Image 2026-10-09 at 6.53.20 AM.jpeg',
  'WhatsApp Image 2026-10-09 at 7.02.05 PM.jpeg',
  'WhatsApp Image 2026-10-09 at 7.02.15 PM.jpeg',
  'WhatsApp Image 2026-10-09 at 8.03.45 AM.jpeg',
  'WhatsApp Image 2026-10-10 at 11.19.54 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 11.20.17 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 11.30.18 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 7.23.41 AM.jpeg',
  'WhatsApp Image 2026-10-11 at 10.22.18 AM.jpeg',
  'WhatsApp Image 2026-10-11 at 10.29.34 AM.jpeg',
  'WhatsApp Image 2026-10-11 at 10.41.15 AM.jpeg',
  'WhatsApp Image 2026-10-11 at 10.44.12 AM.jpeg',
  'WhatsApp Image 2026-10-12 at 12.08.33 AM.jpeg',
  'WhatsApp Image 2026-10-12 at 12.09.03 AM.jpeg',
  'WhatsApp Image 2026-10-12 at 12.09.27 AM.jpeg',
  'WhatsApp Image 2026-10-12 at 6.15.43 AM.jpeg',
  'WhatsApp Image 2026-10-13 at 7.42.08 AM.jpeg',
  'WhatsApp Image 2026-10-13 at 7.54.14 AM.jpeg',
  'WhatsApp Image 2026-10-13 at 8.38.38 AM.jpeg',
  'WhatsApp Image 2026-10-14 at 3.26.05 PM.jpeg',
  'WhatsApp Image 2026-10-14 at 5.15.18 PM.jpeg',
  'WhatsApp Image 2026-10-14 at 7.01.57 AM.jpeg',
];

// ----------------------------------------------------------------
// Daftar video + thumbnail-nya
// ----------------------------------------------------------------
const VIDEO_DATA = [
  { name: 'WhatsApp Video 2026-10-09 at 3.30.39 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 3.30.39 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 3.31.10 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 3.31.10 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 3.32.08 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 3.32.08 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 3.33.02 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 3.33.02 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 3.44.04 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 3.44.04 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 7.05.20 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 7.05.20 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 8.20.50 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 8.20.50 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-09 at 8.33.01 PM.mp4',        thumb: 'WhatsApp Video 2026-10-09 at 8.33.01 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-10 at 6.13.48 PM.mp4',        thumb: 'WhatsApp Video 2026-10-10 at 6.13.48 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.40 AM (1).mp4',   thumb: 'WhatsApp Video 2026-10-11 at 10.23.40 AM (1).jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.40 AM.mp4',       thumb: 'WhatsApp Video 2026-10-11 at 10.23.40 AM.jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.41 AM (1).mp4',   thumb: 'WhatsApp Video 2026-10-11 at 10.23.41 AM (1).jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.41 AM.mp4',       thumb: 'WhatsApp Video 2026-10-11 at 10.23.41 AM.jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (1).mp4',    thumb: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (1).jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (2).mp4',    thumb: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (2).jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.56 PM.mp4',        thumb: 'WhatsApp Video 2026-10-11 at 9.48.56 PM.jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.57 PM (1).mp4',    thumb: 'WhatsApp Video 2026-10-11 at 9.48.57 PM (1).jpeg' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.57 PM.mp4',        thumb: 'WhatsApp Video 2026-10-11 at 9.48.57 PM.jpeg' },  
  { name: 'WhatsApp Video 2026-10-12 at 7.03.04 AM.mp4',        thumb: null },
  { name: 'WhatsApp Video 2026-10-13 at 6.36.56 PM.mp4',        thumb: null },
];

// ----------------------------------------------------------------
// Export utama
// ----------------------------------------------------------------
export const allImages = IMAGE_NAMES.map((name, index) => ({
  id: `img-${index + 1}`,
  url: img(name),
  fileName: name.replace('.jpeg', ''),
  title: `Memory #${index + 1}`,
}));

export const allVideos = VIDEO_DATA.map(({ name, thumb }, index) => ({
  id: `vid-${index + 1}`,
  url: vid(name),
  fileName: name.replace('.mp4', ''),
  poster: thumb ? thm(thumb) : null,
  title: `Moment Video #${index + 1}`,
}));

// ----------------------------------------------------------------
// 5 foto pertama untuk MorphSlider di Hero
// ----------------------------------------------------------------
export const morphSliderItems = allImages.slice(0, 5).map((im, i) => {
  const captions = [
    'MASYAALLAH CANTIKNYA GA ADA OBAT',
    'LIAT SENYUMNYA DOANG UDAH BIKIN SALTING PARAH',
    'INI ORANG APA BIDADARI SIH KOK BISA SEINDAH INI',
    'ASLI GABISA BERKATA KATA LAGI CAKEP BANGET',
    'FAVORIT AKU BANGET INI GATAU LAGI DEH',
  ];
  return {
    image: im.url,
    caption: captions[i] || `MOMEN SPESIAL #${i + 1}`,
    alt: `Foto Vanvan ${i + 1}`,
  };
});

// ----------------------------------------------------------------
// Foto untuk DriftWall — pakai semua foto (slice 4..35)
// ----------------------------------------------------------------
const excitedWallCaptions = [
  { title: 'LUCU BANGET ASLII',            subtitle: 'GAK KUAT BANGET LIAT KEGEMESAN INI' },
  { title: 'MASYAALLAH BIDADARI KAH INI',  subtitle: 'CAKEPNYA KEBANGETAN PARAH GABISA DIBIARIN' },
  { title: 'SENYUMNYA BIKIN MELELEH',      subtitle: 'LANGSUNG AUTO CERAH SEHARIAN GARA GARA KAMU' },
  { title: 'GEMESSS POL WOYY',             subtitle: 'PENGEN CUBIT PIPINYA SEKARANG JUGA' },
  { title: 'OUTFITNYA CAKEP BANGET',       subtitle: 'SELALU ON POINT GAPERNAH GAGAL HERAN' },
  { title: 'TATAPANNYA BAHAYA BANGET',     subtitle: 'TOLONG DEG DEGANNYA SAMPE KE ULU HATI' },
  { title: 'HARI PALING SERUU',            subtitle: 'TIAP BARENG KAMU RASANYA GAMAU PULANG' },
  { title: 'CANTIK NATURAL BANGET',        subtitle: 'ASLINYA 1000 KALI LIPAT LEBIH CAKEP' },
  { title: 'KANDID TERGEMAS SEDUNIA',      subtitle: 'LAGI BENGONG AJA TETEP SECANTIK INI' },
  { title: 'AURA BINTANG BANGETT',         subtitle: 'CAHAYA PALING CANTIK DI DUNIA AKU' },
  { title: 'PIPI TOMAT KETAWA SALTING',    subtitle: 'KETAUAN BANGET ITU SENYUM SENYUM MALU' },
  { title: 'MOOD BOOSTER NOMOR SATU',      subtitle: 'OBAT CAPEK PALING AMPUH SEDUNIA' },
  { title: 'MANISNYA OVERDOSIS INI MAH',   subtitle: 'GULA AJA KALAH MANIS SAMA SENYUM KAMU' },
  { title: 'MOMEN PALING HEPII',           subtitle: 'KETAWANYA NULAR BANGET ASLI' },
  { title: 'TOLONG JANGAN DITATAP GITU',   subtitle: 'GAK KUAT DISENYUMIN TERUS TERUSAN SALTING WOY' },
  { title: 'PESONANYA SERIBU PERSEN',      subtitle: 'SELALU BIKIN JATUH CINTA BERKALI KALI' },
  { title: 'EKSPRESI RANDOM TAPI LUCU',    subtitle: 'KELAKUAN LUCU KESAYANGAN AKU' },
  { title: 'WARNA WARNI HARIKUU',          subtitle: 'DUNIA LANGSUNG CERAH KALO ADA KAMU' },
  { title: 'KOK BISA SECANTIK INI YA',     subtitle: 'GABISA MIKIR LAGI SAKING CAKEPNYA' },
  { title: 'LOVE YOU TO THE MOON',         subtitle: 'SAYANG BANGET POKOKNYA GAUSAH DITANYA' },
  { title: 'CANTIKNYA GAK ADA LAWAN',      subtitle: 'TIAP FOTO MAKIN BIKIN SALTING AJA' },
  { title: 'MOMEN PALING BERHARGA',        subtitle: 'SETIAP DETIK BARENG KAMU ITU SPESIAL' },
  { title: 'VIBESNYA CANTIK BANGET',       subtitle: 'NATURAL AJA UDAH KEBANGETAN INDAHNYA' },
  { title: 'GEMES LEVEL MAKSIMAL',         subtitle: 'HATI LANGSUNG MELELEH PAS LIAT INI' },
  { title: 'KENANGAN PALING INDAH',        subtitle: 'GA BAKALAN PERNAH BISA DILUPAIN' },
  { title: 'SENYUM PALING MANIS',          subtitle: 'SATU SENYUM AJA CUKUP BUAT BAHAGIA SEHARIAN' },
  { title: 'STUNNING SEPERTI BIASA',       subtitle: 'TIAP HARI MAKIN CANTIK ITU FAKTA NYATA' },
  { title: 'INI FAVORIT AKU BANGET',       subtitle: 'GAMAU BERHENTI LIATINNYA BETAH SEHARIAN' },
  { title: 'AURA PRINCESS BANGET',         subtitle: 'TERLAHIR BUAT JADI YANG PALING CANTIK' },
  { title: 'TERBAIK POKOKNYA TITIK',       subtitle: 'NGGAK ADA DUANYA DI SELURUH DUNIA INI' },
  { title: 'SEMPURNA BANGET MASYAALLAH',   subtitle: 'GATAU MAU NGOMONG APA LAGI SAKING KAGUMNYA' },
];

export const driftWallItems = allImages.slice(4).map((im, i) => {
  const cap = excitedWallCaptions[i] || {
    title: `FOTO SPESIAL #${i + 1}`,
    subtitle: 'MOMEN PALING ISTIMEWA',
  };
  return {
    image: im.url,
    title: cap.title,
    subtitle: cap.subtitle,
    id: im.id,
  };
});

// ----------------------------------------------------------------
// Caption video untuk FlexCarousel
// ----------------------------------------------------------------
const videoCaptions = [
  { title: 'MASYAALLAH CANTIKKNYAA', subtitle: 'KAMUU MAKANN APA KOK BISA SECANTIKK ITUU' },
  { title: 'INIII JUGAA MASYAALLAHH', subtitle: 'INII CEWEE SIAPAA SIII CANTIKK BANGETT' },
  { title: 'HEEII GORGEOUSS', subtitle: 'AJDSNAJKFNAKJ GABISAA BERKATA KATAAA' },
  { title: 'KAMUU LUCUU BANGETT SIII', subtitle: 'SKNFJKA KOK BISA SE GEMESS INIII' },
  { title: 'AKUU SUKAA SEMUA VIDEONYA', subtitle: 'SERINGG SERINGG KASIH YAA MWEHWEH' },
  { title: 'WADUHHH KAKKK', subtitle: 'CAKEEPP BANGETT MASYAALLAH' },
  { title: 'AOSHDA HEEYY LUCU BANGET HEYY', subtitle: 'TERLALU LUCUU' },
  { title: 'YANGG INI BIKIN GEMES', subtitle: 'BISAA GA SIH NEMBUS LAYAR AJSDNAJ' },
  { title: 'YAALLAH KENA BANGET KE HATI', subtitle: 'HIDDEN GEM ADJSNIJASND' },
  { title: 'EH SENYUM DIA, EH MANIS BANGET', subtitle: 'BISA GA DI KONDISIKAN MANISNYA, DIABETES NI' },
  { title: 'ADUH GA KUWAT', subtitle: 'LOOKS LIKE AN ANGEL' },
  { title: 'UKHTIII MASYAALLAH UKHTII', subtitle: 'MAAF YAHH GILAA, MEMANG UDAH TERGILA GILA' },
  { title: 'PINKKKPINKKK CANTIIINYAA', subtitle: 'ALSMDANS GABISA BERKATA KATA LAGI' },
  { title: 'OMAIGATT MY SPIDERGIRLL??', subtitle: 'PANJAT HATI AKU KAKKK' },
  { title: 'YAALLAHH CAKEP BANGET', subtitle: 'INI NGEDITNYA SAMBIL SALTING ASJDNAKJSN' },
  { title: 'INII APALAGIII', subtitle: 'HERAN BANGET GA PERNAH GA LUCU' },
  { title: 'AKUU ALAY BANGET YA', subtitle: 'BIARINN ALAYFYUUUU' },
  { title: 'OKEEE MY BABYYY', subtitle: 'MY BABY ATAU MINEEE' },
  { title: 'YAALLAH SOSOK ASELI NERD GIRL KAH', subtitle: 'GATAU LAGI DEH BISA SECAKEP INI MAKAN APAAN SI' },
  { title: 'YAAMPUN MASYAALLAH', subtitle: 'IYAA IYA INI AKU UDAH JATOH KE PESONA KAMU' },
];

export const carouselItems = allVideos.map((video, i) => {
  const meta = videoCaptions[i] || {
    title: `MOMEN VIDEO #${i + 1}`,
    subtitle: 'LUCU BANGETT GATAU LAGI',
  };
  const thumbnail = video.poster || '';

  return {
    id: video.id,
    src: thumbnail,
    poster: thumbnail,
    videoUrl: video.url,
    alt: meta.title,
    title: meta.title,
    subtitle: meta.subtitle,
    index: i,
  };
});
