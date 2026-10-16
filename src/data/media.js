// ================================================================
// media.js: semua gambar & video dibaca otomatis dari src/assets/
// (images, videos, video-thumbnails). Nama file tidak perlu diketik.
// ================================================================

// Samakan karakter spasi "aneh" (U+202F dari WhatsApp) jadi spasi biasa
const norm = (s) => s.replace(/[\u202f\u00a0]/g, ' ').normalize('NFC');

const toMap = (mods) => {
  const map = {};
  for (const [path, url] of Object.entries(mods)) {
    map[norm(path.split('/').pop())] = url;
  }
  return map;
};

const IMG_MAP = toMap(
  import.meta.glob('/src/assets/images/*.{jpeg,jpg,JPG,JPEG,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);
const VID_MAP = toMap(
  import.meta.glob('/src/assets/videos/*.mp4', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);
const THUMB_MAP = toMap(
  import.meta.glob('/src/assets/video-thumbnails/*.{jpeg,jpg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

// lookup toleran: abaikan semua spasi & huruf besar/kecil
const squash = (s) => norm(s).replace(/\s+/g, '').toLowerCase();
const toLooseMap = (map) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [squash(k), v]));
const IMG_LOOSE = toLooseMap(IMG_MAP);
const THUMB_LOOSE = toLooseMap(THUMB_MAP);
const VID_LOOSE = toLooseMap(VID_MAP);
// Semua foto di src/assets/images, urut alfabet berdasarkan nama file
const IMAGE_ENTRIES = Object.entries(IMG_MAP).sort(([a], [b]) => (a < b ? -1 : 1));

// ----------------------------------------------------------------
// Daftar video + thumbnail-nya
// thumbType 'vid' => dari /video-thumbnails/, 'img' => dari /images/
// Untuk video baru yang belum ada thumbnail-nya, fallback ke foto
// dengan tanggal/waktu paling dekat
// ----------------------------------------------------------------
const VIDEO_DATA = [
  { name: 'WhatsApp Video 2026-10-09 at 3.30.39 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 3.30.39 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 3.31.10 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 3.31.10 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 3.32.08 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 3.32.08 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 3.33.02 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 3.33.02 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 3.44.04 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 3.44.04 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 7.05.20 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 7.05.20 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 8.20.50 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 8.20.50 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-09 at 8.33.01 PM.mp4',      thumb: 'WhatsApp Video 2026-10-09 at 8.33.01 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-10 at 6.13.48 PM.mp4',      thumb: 'WhatsApp Video 2026-10-10 at 6.13.48 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.40 AM (1).mp4', thumb: 'WhatsApp Video 2026-10-11 at 10.23.40 AM (1).jpeg', thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.40 AM.mp4',     thumb: 'WhatsApp Video 2026-10-11 at 10.23.40 AM.jpeg',     thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.41 AM (1).mp4', thumb: 'WhatsApp Video 2026-10-11 at 10.23.41 AM (1).jpeg', thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 10.23.41 AM.mp4',     thumb: 'WhatsApp Video 2026-10-11 at 10.23.41 AM.jpeg',     thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (1).mp4',  thumb: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (1).jpeg',  thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (2).mp4',  thumb: 'WhatsApp Video 2026-10-11 at 9.48.56 PM (2).jpeg',  thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.56 PM.mp4',      thumb: 'WhatsApp Video 2026-10-11 at 9.48.56 PM.jpeg',      thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.57 PM (1).mp4',  thumb: 'WhatsApp Video 2026-10-11 at 9.48.57 PM (1).jpeg',  thumbType: 'vid' },
  { name: 'WhatsApp Video 2026-10-11 at 9.48.57 PM.mp4',      thumb: 'WhatsApp Video 2026-10-11 at 9.48.57 PM.jpeg',      thumbType: 'vid' },
  // Video baru: thumbnail fallback ke foto dengan tanggal terdekat
  { name: 'WhatsApp Video 2026-10-12 at 7.03.04 AM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.01 PM.jpeg',     thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-13 at 6.36.56 PM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.01 PM (1).jpeg', thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-15 at 8.05.13 AM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.02 PM.jpeg',     thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-15 at 8.05.50 AM (1).mp4',  thumb: 'WhatsApp Image 2026-10-16 at 10.10.02 PM (1).jpeg', thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-15 at 4.43.50 PM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.02 PM (2).jpeg', thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-15 at 7.21.16 PM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.02 PM (3).jpeg', thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-15 at 7.21.36 PM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.03 PM .jpeg',    thumbType: 'img' },
  { name: 'WhatsApp Video 2026-10-15 at 7.21.37 PM.mp4',      thumb: 'WhatsApp Image 2026-10-16 at 10.10.03 PM (1).jpeg', thumbType: 'img' },
];

// ----------------------------------------------------------------
// Export utama
// ----------------------------------------------------------------
export const allImages = IMAGE_ENTRIES.map(([name, url], index) => ({
  id: `img-${index + 1}`,
  url,
  fileName: name.replace(/\.[^.]+$/, ''),
  title: `Memory #${index + 1}`,
}));

export const allVideos = VIDEO_DATA.map(({ name, thumb, thumbType }, index) => {
  const exact = thumbType === 'img' ? IMG_MAP : THUMB_MAP;
  const loose = thumbType === 'img' ? IMG_LOOSE : THUMB_LOOSE;
  const poster = thumb
    ? (THUMB_MAP[norm(thumb)] ?? THUMB_LOOSE[squash(thumb)] ??
      IMG_MAP[norm(thumb)] ?? IMG_LOOSE[squash(thumb)] ?? null)
    : null;
  const url = VID_MAP[norm(name)] ?? VID_LOOSE[squash(name)] ?? '';

  if (!url) console.warn('[media] video tidak ketemu:', name);
  if (thumb && !poster) {
    console.warn('[media] thumbnail tidak ketemu:', thumb);
  }

  return {
    id: `vid-${index + 1}`,
    url,
    fileName: name.replace('.mp4', ''),
    poster,
    title: `Moment Video #${index + 1}`,
  };
});

// ----------------------------------------------------------------
// 5 foto pertama untuk MorphSlider di Hero
// ----------------------------------------------------------------
export const morphSliderItems = allImages.slice(16, 20).map((im, i) => {
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
// Foto untuk DriftWall: pakai semua foto
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
  { title: 'MASYA ALLAH CANTIKKK',         subtitle: 'TIAP FOTO BARU MAKIN BIKIN JATUH CINTA' },
  { title: 'VIBE HARI INI PERFECT BANGET', subtitle: 'AURA CANTIKNYA NULAR GA SIH INI' },
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
  { title: 'MASYAALLAH CANTIKKNYAA',           subtitle: 'KAMUU MAKANN APA KOK BISA SECANTIKK ITUU' },
  { title: 'INIII JUGAA MASYAALLAHH',           subtitle: 'INII CEWEE SIAPAA SIII CANTIKK BANGETT' },
  { title: 'HEEII GORGEOUSS',                   subtitle: 'AJDSNAJKFNAKJ GABISAA BERKATA KATAAA' },
  { title: 'KAMUU LUCUU BANGETT SIII',          subtitle: 'SKNFJKA KOK BISA SE GEMESS INIII' },
  { title: 'AKUU SUKAA SEMUA VIDEONYA',         subtitle: 'SERINGG SERINGG KASIH YAA MWEHWEH' },
  { title: 'WADUHHH KAKKK',                     subtitle: 'CAKEEPP BANGETT MASYAALLAH' },
  { title: 'AOSHDA HEEYY LUCU BANGET HEYY',     subtitle: 'TERLALU LUCUU' },
  { title: 'YANGG INI BIKIN GEMES',             subtitle: 'BISAA GA SIH NEMBUS LAYAR AJSDNAJ' },
  { title: 'YAALLAH KENA BANGET KE HATI',       subtitle: 'HIDDEN GEM ADJSNIJASND' },
  { title: 'EH SENYUM DIA, EH MANIS BANGET',    subtitle: 'BISA GA DI KONDISIKAN MANISNYA, DIABETES NI' },
  { title: 'ADUH GA KUWAT',                     subtitle: 'LOOKS LIKE AN ANGEL' },
  { title: 'UKHTIII MASYAALLAH UKHTII',         subtitle: 'MAAF YAHH GILAA, MEMANG UDAH TERGILA GILA' },
  { title: 'PINKKKPINKKK CANTIIINYAA',          subtitle: 'ALSMDANS GABISA BERKATA KATA LAGI' },
  { title: 'OMAIGATT MY SPIDERGIRLL??',         subtitle: 'PANJAT HATI AKU KAKKK' },
  { title: 'YAALLAHH CAKEP BANGET',             subtitle: 'INI NGEDITNYA SAMBIL SALTING ASJDNAKJSN' },
  { title: 'INII APALAGIII',                    subtitle: 'HERAN BANGET GA PERNAH GA LUCU' },
  { title: 'AKUU ALAY BANGET YA',               subtitle: 'BIARINN ALAYFYUUUU' },
  { title: 'OKEEE MY BABYYY',                   subtitle: 'MY BABY ATAU MINEEE' },
  { title: 'YAALLAH SOSOK ASELI NERD GIRL KAH', subtitle: 'GATAU LAGI DEH BISA SECAKEP INI MAKAN APAAN SI' },
  { title: 'YAAMPUN MASYAALLAH',                subtitle: 'IYAA IYA INI AKU UDAH JATOH KE PESONA KAMU' },
  { title: 'SINCHANNN KUUU',                    subtitle: 'WAHAHAHWH BAKSOO URATT' },
  { title: 'CANTIK BANGET KKK MASYAALLAH',      subtitle: 'SUJUUDD SYUKURR DAPET CEWE KAYA KAMUU' },
  { title: 'AKUU GATAU LAGIII NIAAA',           subtitle: 'KAMUU MAKANNYA APASIIII' },
  { title: 'WEETTT SI SYENTILLL',               subtitle: 'NAYKILLA DEPOKKK NIEEE' },
  { title: 'WEETT WETTT MUNDURANN KAK',         subtitle: 'CANTIKNYA KELEWATAN' },
  { title: 'ADUHHAAIIIII SAALLAHH',             subtitle: 'BOBOOO BESOKKK SAMA KAMU LAGI' },
  { title: 'GAJFNJANFJ GATAUU LAGI AKU',        subtitle: 'AKU BENER BENER GILAA SAMA KAMUU' },
  { title: 'MASYAALLAH TABARAKALLAH',           subtitle: 'BENERAN CIPTAAN ALLAH YANG PALING INDAH' },
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