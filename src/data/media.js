// Import semua gambar, video, dan thumbnail dari folder assets
const rawImages = import.meta.glob('/src/assets/images/*.jpeg', { eager: true, import: 'default' });
const rawVideos = import.meta.glob('/src/assets/videos/*.mp4', { eager: true, import: 'default' });
const rawVideoThumbs = import.meta.glob('/src/assets/video-thumbnails/*.jpeg', { eager: true, import: 'default' });

// Map nama file video ke thumbnail-nya
const videoThumbnailMap = {};
Object.entries(rawVideoThumbs).forEach(([path, url]) => {
  const fileName = path.split('/').pop().replace('.jpeg', '');
  videoThumbnailMap[fileName] = url;
});

export const allImages = Object.entries(rawImages).map(([path, url], index) => {
  const fileName = path.split('/').pop().replace('.jpeg', '');
  return {
    id: `img-${index + 1}`,
    url,
    fileName,
    title: `Memory #${index + 1}`,
  };
});

export const allVideos = Object.entries(rawVideos).map(([path, url], index) => {
  const fileName = path.split('/').pop().replace('.mp4', '');
  const poster = videoThumbnailMap[fileName] || null;
  return {
    id: `vid-${index + 1}`,
    url,
    fileName,
    poster,
    title: `Moment Video #${index + 1}`,
  };
});

// 5 foto pertama untuk MorphSlider di Hero
export const morphSliderItems = allImages.slice(0, 5).map((img, i) => {
  const captions = [
    'Aaa cantiknya gak ada obat!! ✨😍',
    'Liat senyum ini langsung meleleh parah! 🫠❤️',
    'Momen paling berharga sedunia, sumpah! 🌟🔥',
    'Definisi bidadari nyata, no debat! 💖👑',
    'Selalu bersinar paling terang di hatiku! ✨🥺'
  ];
  return {
    image: img.url,
    caption: captions[i] || `Momen Ajaib #${i + 1} ✨`,
    alt: `Foto Vanvan ${i + 1}`
  };
});

const excitedWallCaptions = [
  { title: 'Lucu Banget Asli! 🥺🤏', subtitle: 'Gak kuat liat kegemasannya!!' },
  { title: 'Bidadari Turun ke Bumi ✨💖', subtitle: 'Cakepnya kebangetan parah!' },
  { title: 'Senyum Pembawa Bahagia! 🥰🌸', subtitle: 'Langsung auto cerah duniaku!' },
  { title: 'Gemesss Pol! 🤏😆', subtitle: 'Pengen cubit pipinya sekarang juga!' },
  { title: 'Outfit Kece Badai! 💃✨', subtitle: 'Selalu on point dan mempesona!' },
  { title: 'Tatapannya Bahaya! 💘🫣', subtitle: 'Bikin deg-degan gak karuan!' },
  { title: 'Hari Super Seru! 🎉🥳', subtitle: 'Tiap detik rasanya kayak festival!' },
  { title: 'Cantik Natural No Filter! 🌸✨', subtitle: 'Aslinya 1000x lebih cakep!' },
  { title: 'Kandid Tergemas! 📸👀', subtitle: 'Lagi bengong aja tetep secantik ini!' },
  { title: 'Aura Bintang Banget! 🌟💫', subtitle: 'Cahaya tercantik di duniaku!' },
  { title: 'Pipi Tomat Mode On! 🍅🥰', subtitle: 'Ketawa malu-malu yang bikin salting!' },
  { title: 'Mood Booster Terbaik! 🚀🔥', subtitle: 'Obat capek paling ampuh sedunia!' },
  { title: 'Manisnya Overdosis! 🍯🫠', subtitle: 'Gula aja kalah manis sama kamu!' },
  { title: 'Momen Paling Hepi! 🥳🎈', subtitle: 'Ketawanya nular banget sumpah!' },
  { title: 'Tatapan Bikin Salting! 🫣💘', subtitle: 'Tolong, gak kuat disenyumin gini!' },
  { title: 'Pesona 1000%! 💫❤️‍🔥', subtitle: 'Selalu bikin jatuh cinta berkali-kali!' },
  { title: 'Ekspresi Random Juara! 🤪✌️', subtitle: 'Kelakuan lucu kesayangan aku!' },
  { title: 'Pelangi di Hari Mendung! 🌈✨', subtitle: 'Bikin hariku warna-warni terus!' },
  { title: 'Malaikat Tanpa Sayap! 🪽🤍', subtitle: 'Kok bisa ya secantik ini?!' },
  { title: 'Love You to The Moon! 🌙💖', subtitle: 'Dan balik lagi berkali-kali!' }
];

// Foto untuk DriftWall (grid perspektif 3D di scene galeri)
export const driftWallItems = allImages.slice(4, 24).map((img, i) => {
  const cap = excitedWallCaptions[i] || {
    title: `Foto Ajaib #${i + 1} ✨`,
    subtitle: 'Momen paling istimewa!',
  };
  return {
    image: img.url,
    title: cap.title,
    subtitle: cap.subtitle,
    id: img.id
  };
});

// Item untuk FlexCarousel — semua video dengan caption masing-masing
const videoCaptions = [
  { title: 'MASYAALLAH CANTIKKNYAA', subtitle: 'KAMUU MAKANN APA KOK BISA SECANTIKK ITUU' },
  { title: 'INIII JUGAA MASYAALAH', subtitle: 'Gandengan tangan sambil cerita heboh ga ada abisnya!' },
  { title: 'Candid Tercakep Sedunia! 📸✨', subtitle: 'Gila sih, ga siap kamera aja tetep sebadai ini!' },
  { title: 'Cerita Random Mode Heboh! 🗣️🔥', subtitle: 'Kalo udah nyerocos lucu banget, betah dengerin semaleman!' },
  { title: 'Momen Super Spesial Kita! 💖✨', subtitle: 'Detik-detik magis yang bakal aku inget seumur hidup!' },
  { title: 'Tatapan Maut Bikin Salting! 🫣💘', subtitle: 'Tolong jangan ditatap gitu, jantungku langsung mau copot!' },
  { title: 'Petualangan Paling Asik! 🚀🌍', subtitle: 'Kemana pun tujuannya, kalo bareng kamu selalu gokil!' },
  { title: 'Hari Paling Berkesan Parah! 🥳🌟', subtitle: 'Senyum seharian sampai pipi pegel bareng kesayangan!' },
  { title: 'Senyum Bikin Meleleh Total! 🫠🍯', subtitle: 'Dunia langsung cerah 1000% begitu kamu senyum manis!' },
  { title: 'Tingkah Gemes Pol! 🤏🤪', subtitle: 'Kelakuan random yang bikin geregetan pengen unyel-unyel!' },
  { title: 'Quality Time Terindah! ☕💫', subtitle: 'Dunia berasa milik berdua doang, yang lain cuma ngontrak!' },
  { title: 'Ngakak Sampe Sakit Perut! 😂💥', subtitle: 'Gak ada jaim-jaiman, candaan kita emang paling juara!' },
  { title: 'Sorot Mata Penuh Cinta! 👀❤️', subtitle: 'Tatapannya nembus langsung ke relung hati terdalam!' },
  { title: 'Dunia Serasa Berhenti! ⏳✨', subtitle: 'Fokus duniaku cuma tertuju ke kamu seorang, titik!' },
  { title: 'Detik Emas Tak Terganti! 🏆💎', subtitle: 'Harta karun paling berharga yang pernah aku punya!' },
  { title: 'Lucunya Kebangetan Woy! 🐰⚡', subtitle: 'Gimana ga bucin kalo tiap hari selucu dan seimut ini?!' },
  { title: 'Hari Penuh Bunga-Bunga! 🌸🎈', subtitle: 'Setiap sudut hari terasa luar biasa bahagia bersamamu!' },
  { title: 'Kenangan Abadi Terkeren! 🎬🎞️', subtitle: 'Kisah cinta terindah yang bakal kita tonton terus selamanya!' },
];

export const carouselItems = allVideos.map((video, i) => {
  const meta = videoCaptions[i] || {
    title: `Momen Video #${i + 1} 🎬🎉`,
    subtitle: 'Captured moments with you!',
  };
  const thumbnail = videoThumbnailMap[video.fileName] || video.poster || '';

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
