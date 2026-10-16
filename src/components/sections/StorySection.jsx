import { useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { ArrowRight, ChevronDown, Heart, Lightbulb, Play, Utensils } from 'lucide-react';
import MorphSlider from '../reactbits/MorphSlider';
import DriftWall from '../reactbits/DriftWall';
import FlexCarousel from '../reactbits/FlexCarousel';
import VideoPlayerModal from '../interactive/VideoPlayerModal';
import DynamicNotch from '../common/DynamicNotch';
import ReasonScene from './ReasonScene';
import NotesScene from './NotesScene';
import ScrapbookScene from './ScrapbookScene';
import BirthdayCountdown from './BirthdayCountdown';
import { allImages, morphSliderItems, driftWallItems, carouselItems } from '../../data/media';
import { playPop, playChime } from '../../utils/sound';
import {
  Curtain,
  hasPlayedCurtain,
  ProgressBar,
  SideNav,
  Marquee,
  Magnetic,
  Line,
  Mask,
  useScene,
  useReveal,
  useMediaQuery,
  mix,
  seg,
  easeOut,
  easeInOut,
  prefersReduced,
  goTo,
} from '../story/kit';
import {
  INK,
  HAND,
  NOISE,
  TAPES,
  HeartS,
  StarS,
  Daisy,
  Squiggle,
  Washi,
  PatchButton,
  NoteButton,
  ScrapStyles,
  MomentsBackdrop,
} from '../story/scrap';

// Mask bawaan DriftWall itu gradient, dimatikan biar wall full sampai ujung.
const NO_MASK = { WebkitMaskImage: 'none', maskImage: 'none' };

// Warna dasar yang dipakai shader foto (hero & galeri)
const WASH = '#f4ece0';

// Judul besar memakai serif display, satu warna, tanpa kata yang diwarnai sendiri.
const DISPLAY = 'font-display font-medium tracking-[-0.02em]';

/* ------------------------------------------------------------------ */
/* Scene 1: Hero                                                        */
/* ------------------------------------------------------------------ */

const HERO_POLAROIDS = [
  { cls: 'left-0 top-4 w-[150px]', rot: -8, cap: 'INII SIAPAA YAA', pick: 12 },
  { cls: 'right-0 top-0 w-[160px]', rot: 6, cap: 'ASKDAK CAKEP BANGET', pick: 6 },
  { cls: 'bottom-0 left-[70px] w-[170px]', rot: -2, cap: 'WHOOPP APA INI CAKEP BNGT', pick: 8 },
];

function HeroScene({ ready, onExploreFavorites }) {
  const sceneRef = useRef(null);

  // Intro: huruf naik satu per satu, sisanya fade-in bergantian
  useLayoutEffect(() => {
    const root = sceneRef.current;
    if (!root || prefersReduced()) return undefined;
    const letters = root.querySelectorAll('[data-l]');
    const fades = root.querySelectorAll('[data-fade]');

    const clear = () => {
      letters.forEach((el) => {
        el.style.transform = '';
      });
      fades.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
      });
    };

    letters.forEach((el) => {
      el.style.transform = 'translateY(115%)';
    });
    fades.forEach((el) => {
      el.style.opacity = 0;
    });
    if (!ready) return clear;

    const a = animate(letters, {
      translateY: ['115%', '0%'],
      duration: 1300,
      delay: stagger(55),
      ease: 'outExpo',
    });
    const b = animate(fades, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 1000,
      delay: stagger(120, { start: 500 }),
      ease: 'outExpo',
    });
    return () => {
      a.revert();
      b.revert();
      clear();
    };
  }, [ready]);

  // Panah scroll naik-turun pelan
  useLayoutEffect(() => {
    const el = sceneRef.current?.querySelector('[data-bob]');
    if (!el || prefersReduced()) return undefined;
    const a = animate(el, {
      translateY: [0, 8],
      duration: 900,
      ease: 'inOutSine',
      alternate: true,
      loop: true,
    });
    return () => a.revert();
  }, []);

  // Foto polaroid melayang pelan
  useLayoutEffect(() => {
    const els = sceneRef.current?.querySelectorAll('[data-float]');
    if (!els || !els.length || prefersReduced()) return undefined;
    const a = animate(els, {
      translateY: [0, -12],
      duration: 2600,
      ease: 'inOutSine',
      alternate: true,
      loop: true,
      delay: stagger(450),
    });
    return () => a.revert();
  }, []);

  // Dikendalikan scroll: foto zoom, teks naik dan memudar
  useScene(
    sceneRef,
    (scene) => {
      if (prefersReduced()) return { onProgress: () => {} };
      const bg = scene.querySelector('[data-bg]');
      const veil = scene.querySelector('[data-veil]');
      const copy = scene.querySelector('[data-copy]');
      const aside = scene.querySelector('[data-aside]');
      const cue = scene.querySelector('[data-cue]');
      return {
        onProgress(p) {
          const maxZoom = window.innerWidth < 768 ? 1.06 : 1.16;
          if (bg) bg.style.transform = `scale(${mix(1, maxZoom, easeOut(p))})`;
          if (veil) veil.style.opacity = mix(0.92, 1, seg(p, 0.1, 0.9));
          const fade = 1 - seg(p, 0.2, 0.65);
          if (copy) {
            copy.style.transform = `translate3d(0, ${-p * 140}px, 0)`;
            copy.style.opacity = fade;
            copy.style.visibility = fade < 0.02 ? 'hidden' : 'visible';
          }
          if (aside) aside.style.opacity = 1 - seg(p, 0.1, 0.4);
          if (cue) cue.style.opacity = 1 - seg(p, 0, 0.12);
        },
      };
    },
    []
  );

return (
  <section
    id="hero"
    ref={sceneRef}
    className="relative h-[170svh] bg-paper motion-reduce:h-svh"
  >
    <div className="sticky top-0 h-svh min-h-[600px] overflow-hidden">
      {/* Foto latar full layar (HP & desktop): MorphSlider */}
      <div data-bg className="absolute inset-0 will-change-transform">
        <MorphSlider
          items={morphSliderItems}
          transition="melt"
          intensity={0.4}
          aberration={0.2}
          drift={0.3}
          autoplay
          autoplayDelay={5}
          duration={1.2}
          radius={0}
          overlayColor="#FAF7F2"
          showCaptions={false}
          showControls={false}
          showIndicators={false}
          focusY={0.3}
        />
      </div>

      {/* Gradasi desktop (kiri) */}
      <div
        data-veil
        className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-full bg-gradient-to-r from-paper/95 via-paper/60 to-transparent md:block md:w-[62%]"
      />
      {/* Gradasi HP (bawah), biar teks kebaca di atas foto full */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[62svh] bg-gradient-to-t from-paper via-paper/85 to-transparent md:hidden" />

            {/* Teks: bawah di HP, tengah di desktop */}
      <div
        data-copy
        className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 pt-24 md:justify-center md:px-12 md:pb-0 lg:px-16"
      >
        <div className="max-w-5xl">
          <div data-fade>
            <p
              className={`${HAND} mb-1 text-[2rem] leading-none md:text-[2.5rem]`}
              style={{ color: INK }}
            >
              psst, ini buat kamu{' '}
              <HeartS className="inline-block h-6 w-6 align-[-3px] md:h-7 md:w-7" />
            </p>
          </div>

          <h1
            className={`${DISPLAY} mb-3 text-[clamp(3.4rem,11vw,8.5rem)] leading-[0.92] text-ink md:mb-4`}
          >
            <Line text="Halaawww" />
            <span className="block italic md:ml-[0.55em]">
              <Line text="Niaaa" />
            </span>
          </h1>

          <div data-fade className="mb-6 md:mb-8">
            <Squiggle className="ml-1 w-32 md:w-44" />
          </div>

          <div data-fade className="mb-7 max-w-md md:mb-9">
            <div className="relative -rotate-1 bg-[#fffaf2]/90 px-6 pb-5 pt-7 shadow-[0_14px_28px_-12px_rgba(40,20,70,0.5)]">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply"
                style={NOISE}
              />
              <Washi
                className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2"
                color={TAPES[0]}
              />
              <Daisy className="absolute -right-5 -top-6 h-12 w-12 rotate-12 drop-shadow" />
              <p
                className={`${HAND} relative text-[1.5rem] leading-[1.2] lowercase md:text-[1.65rem]`}
                style={{ color: INK }}
              >
                MAAAFF YAAHH LAMAAA EHEHHE AKUU NGEBUAT INII DARI HARI SENINN. DISINII TENTANGG
                KAMUU SEMUAA SEMOGA KAMU SUKAA YAA.{' '}
                <span
                  className="px-1"
                  style={{
                    background: 'linear-gradient(transparent 55%, rgba(246,223,156,0.95) 55%)',
                  }}
                >
                  kamuu scroll scroll ajaaa
                </span>
              </p>
            </div>
          </div>

          <div data-fade className="pointer-events-auto flex flex-wrap items-center gap-4">
            <Magnetic>
              <PatchButton onClick={() => goTo('gallery')}>
                <span>Lanjutt</span>
                <ArrowRight className="h-5 w-5" />
              </PatchButton>
            </Magnetic>
            <Magnetic>
              <NoteButton
                onClick={() => {
                  playPop();
                  onExploreFavorites?.();
                }}
              >
                <Lightbulb className="h-5 w-5 text-purple-600" />
                <span>Penceett</span>
              </NoteButton>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Tumpukan polaroid (layar lebar) */}
      <div
        data-aside
        className="pointer-events-none absolute right-5 top-24 z-10 md:right-10 xl:right-16 xl:top-1/2 xl:-translate-y-1/2"
      >
        <div data-fade className="relative xl:h-[400px] xl:w-[300px]">
          {allImages.length > 0 &&
            HERO_POLAROIDS.map((p) => {
              const img = allImages[p.pick % allImages.length];
              return (
                <div key={p.cap} data-float className={`absolute hidden xl:block ${p.cls}`}>
                  <div
                    className="rounded-[6px] border border-line/60 bg-[#fffdf9] p-2 pb-1.5 shadow-[0_18px_36px_-12px_rgba(60,40,75,0.22)]"
                    style={{ transform: `rotate(${p.rot}deg)` }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      draggable={false}
                      className="aspect-[4/5] w-full rounded-[2px] object-cover"
                    />
                    <span className="block pb-1 pt-2 text-center text-[11px] font-medium text-ink/70">
                      {p.cap}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Petunjuk scroll */}
      <div
        data-cue
        className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-xs text-ink/60 md:bottom-6 md:left-auto md:right-8 md:translate-x-0"
      >
      <span className={`${HAND} text-xl`}>scroll yaa</span>
        <span data-bob>
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
    </div>
  </section>
);
}

/* ------------------------------------------------------------------ */
/* Bentuk jendela galeri: daun semanggi 4 (empat hati, ujung di tengah) */
/* ------------------------------------------------------------------ */

// Satu daun = hati dengan ujung di (0,0), kurva bezier dalam satuan r
const CLOVER_SEG = [
  [-0.15, -0.2, -0.55, -0.45, -0.55, -0.72],
  [-0.55, -0.95, -0.3, -1.02, -0.15, -0.95],
  [-0.07, -0.91, -0.02, -0.85, 0, -0.78],
  [0.02, -0.85, 0.07, -0.91, 0.15, -0.95],
  [0.3, -1.02, 0.55, -0.95, 0.55, -0.72],
  [0.55, -0.45, 0.15, -0.2, 0, 0],
];

/* ---------------- Pengaturan semanggi ---------------- */
const CLOVER_WIDTH = 1.4; // kegemukan daun (jangan di bawah 1.4, nanti ada celah di tengah)
const CLOVER_START_DESKTOP = 0.34; // setengah lebar semanggi awal, sebagai pecahan tinggi layar
const CLOVER_START_MOBILE = 0.44; // sama, tapi sebagai pecahan lebar layar (HP)
const CLOVER_SPIN = 20; // derajat putaran selama membuka (0 = tidak berputar)
/* ------------------------------------------------------ */

const CLOVER_HALF = 0.61 + 0.36 * CLOVER_WIDTH; // setengah lebar total semanggi (satuan r)
const CLOVER_FILL = 0.78; // radius lingkaran terbesar yang selalu terisi penuh (satuan r)

function cloverPath(cx, cy, r, rotDeg) {
  let d = '';
  for (let k = 0; k < 4; k++) {
    const a = ((45 + 90 * k + rotDeg) * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const pt = (x, y) => {
      const lx = x * CLOVER_WIDTH;
      return `${(cx + r * (lx * cos - y * sin)).toFixed(1)} ${(cy + r * (lx * sin + y * cos)).toFixed(1)}`;
    };
    d += `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
    CLOVER_SEG.forEach(([x1, y1, x2, y2, x3, y3]) => {
      d += `C${pt(x1, y1)} ${pt(x2, y2)} ${pt(x3, y3)} `;
    });
    d += 'Z';
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* Scene 2: Galeri (jendela kecil melebar jadi full layar)              */
/* ------------------------------------------------------------------ */

function GalleryScene() {
  const sceneRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useScene(
    sceneRef,
    (scene) => {
      if (prefersReduced()) return { onProgress: () => {} };
      const frame = scene.querySelector('[data-frame]');
      const wall = scene.querySelector('[data-wall]');
      const veil = scene.querySelector('[data-veil]');
      const copy = scene.querySelector('[data-copy]');
      const hint = scene.querySelector('[data-hint]');
      const lines = scene.querySelectorAll('[data-m]');

      return {
        onProgress(p) {
          const desktop = window.innerWidth >= 768;
          const W = frame.clientWidth;
          const H = frame.clientHeight;

          // r = ukuran satu daun. Mulai kecil, akhirnya cukup besar buat menutup seluruh layar
          const half = desktop
            ? H * CLOVER_START_DESKTOP
            : Math.min(W * CLOVER_START_MOBILE, H * 0.3);
          const r0 = half / CLOVER_HALF;
          const rMax = (Math.hypot(W, H) / 2 / CLOVER_FILL) * 1.04;

          // Semanggi membesar sambil sedikit berputar + wall di-zoom-out
          const e = easeInOut(seg(p, 0, 0.34));
          const clip =
            e >= 0.999
              ? 'none'
              : `path('${cloverPath(W / 2, H / 2, r0 * Math.pow(rMax / r0, e), mix(CLOVER_SPIN, 0, e))}')`;
          frame.style.clipPath = clip;
          frame.style.webkitClipPath = clip;
          wall.style.transform = `scale(${mix(1.3, 1, e)})`;

          // Baris teks naik dari balik topeng
          lines.forEach((el, i) => {
            const t = easeOut(seg(p, 0.18 + i * 0.12, 0.34 + i * 0.12));
            el.style.transform = `translate3d(0, ${(1 - t) * 125}%, 0)`;
          });

          // Keluar: teks naik dan hilang, veil krem terbuka
          const x = seg(p, 0.72, 0.92);
          copy.style.opacity = 1 - x;
          copy.style.transform = `translate3d(0, ${-x * 60}px, 0)`;
          veil.style.opacity = mix(0.7, 0.05, easeInOut(seg(p, 0.7, 0.95)));
          hint.style.opacity = seg(p, 0.9, 1);
        },
      };
    },
    []
  );

  return (
    <section
      id="gallery"
      ref={sceneRef}
      className="relative h-[280svh] bg-cream motion-reduce:h-svh md:h-[320svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-frame className="absolute inset-0">
          <div data-wall className="absolute inset-0 will-change-transform">
            <DriftWall
              items={driftWallItems}
              columns={isDesktop ? 8 : 4}
              tileWidth={isDesktop ? 210 : 120}
              tileHeight={isDesktop ? 170 : 160}
              gap={isDesktop ? 40 : 26}
              tilt={isDesktop ? 14 : 10}
              turn={isDesktop ? -12 : -8}
              speed={isDesktop ? 38 : 30}
              variance={0.4}
              parallax={0.5}
              lift={55}
              dim={0.9}
              overlayColor="#FAF7F2"
              style={NO_MASK}
            />
          </div>
          <div data-veil className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream/90 via-cream/25 to-transparent opacity-75 md:bg-gradient-to-r md:from-cream/90 md:via-cream/35 md:to-transparent" />
        </div>

        <div
          data-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 pt-[52svh] md:justify-center md:px-12 md:pb-0 md:pt-24 lg:px-16"
        >
          <h2
            className={`${DISPLAY} text-[clamp(2.8rem,9vw,6rem)] leading-[1.02] text-ink`}
          >
            <Mask>I Love Everything</Mask>
            <Mask>About You,</Mask>
            <Mask>More Than Ever You'll Know.</Mask>
          </h2>
        </div>

        <p
          data-hint
          className="pointer-events-none absolute inset-x-0 bottom-10 z-10 px-6 text-center text-xs text-ink/60 md:text-sm"
        >
          sentuh atau arahkan kursor ke foto, terus lanjut scroll
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene: Momen (gaya scrapbook)                                        */
/* ------------------------------------------------------------------ */

const BAND_INSET = '12%'; // jarak lembaran kertas dari atas/bawah area carousel (desktop)
const EDGE_FADE = '7%'; // lebar pudar tepi kiri/kanan carousel (desktop)
const MOBILE_TILT = 1.8; // derajat miring polaroid yang tidak aktif (HP)

const EDGE_MASK = `linear-gradient(to right, transparent 0, #000 ${EDGE_FADE}, #000 calc(100% - ${EDGE_FADE}), transparent 100%)`;

function MomentsScene() {
  const ref = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const trackRef = useRef(null);
  useReveal(ref);

  const handleSelectMedia = (index, item) => {
    playPop();
    if (item && item.videoUrl) {
      setSelectedVideo(item);
      setIsModalOpen(true);
    }
  };

  const getImage = (it) =>
    it.image ?? it.src ?? it.url ?? it.poster ?? it.thumbnail ?? it.cover ?? null;
  const getTitle = (it) => it.title ?? it.caption ?? '';
  const getSub = (it) => it.subtitle ?? it.description ?? it.alt ?? '';

  const onTrackScroll = (e) => {
    const el = e.currentTarget;
    const card = el.firstElementChild;
    if (!card) return;
    const step = card.offsetWidth + 24; // lebar card + gap-6
    const i = Math.round(el.scrollLeft / step);
    setMobileIndex(Math.max(0, Math.min(carouselItems.length - 1, i)));
  };

  const pad = (v) => String(v).padStart(2, '0');

  return (
    <section
      id="moments"
      ref={ref}
      className="relative flex min-h-svh flex-col overflow-hidden bg-cream pb-14 pt-24 md:pb-20 md:pt-32"
    >
      <ScrapStyles />
      <MomentsBackdrop />

      {/* Judul: label kertas + sticky note (rotasi di elemen dalam, biar tidak bentrok dengan data-r) */}
      <div className="relative z-10 mx-auto mb-10 flex w-full max-w-6xl flex-col gap-8 px-5 md:mb-12 md:flex-row md:items-end md:gap-12 md:px-10">
        <div data-r>
          <div className="relative inline-block -rotate-2 bg-[#faf4eb] px-8 pb-6 pt-9 shadow-[0_10px_22px_-8px_rgba(40,20,70,0.45)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-multiply"
              style={NOISE}
            />
            <Washi className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3" />
            <h2
              className={`${HAND} relative text-[clamp(3.2rem,9vw,6rem)] font-bold leading-[0.95]`}
              style={{ color: INK }}
            >
              LUCUUKK
            </h2>
            <Squiggle className="relative mt-2 w-32 md:w-40" />
            <StarS className="absolute -right-3 -top-3 h-7 w-7 rotate-12" />
          </div>
        </div>

        <div data-r>
          <div className="relative max-w-xs rotate-2 bg-[#fbeaa9] px-5 pb-5 pt-8 shadow-[0_8px_16px_-6px_rgba(60,35,80,0.4)]">
            <Washi className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3" color={TAPES[0]} />
            <p className={`${HAND} text-2xl leading-[1.15]`} style={{ color: INK }}>
              nanti kalo meet videonya aku tambahin sama video kita yaahh EHEHE{' '}
              <HeartS className="inline-block h-5 w-5 align-[-3px]" />
            </p>
          </div>
        </div>
      </div>

      {isDesktop ? (
        /* DESKTOP: kartu "ditempel" di lembaran kertas berjahit */
        <div data-r className="relative z-10 h-[86svh] min-h-[480px] w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ WebkitMaskImage: EDGE_MASK, maskImage: EDGE_MASK }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-[2%] -rotate-[0.6deg] border-y-[3px] border-dashed border-purple-300/70 bg-[#fffdf8]/60 shadow-[0_18px_40px_-20px_rgba(60,35,80,0.35)]"
              style={{ top: BAND_INSET, bottom: BAND_INSET }}
            >
              <div
                className="absolute inset-0 opacity-[0.25] mix-blend-multiply"
                style={NOISE}
              />
            </div>

            <FlexCarousel
              items={carouselItems}
              preset="liquid"
              intro="rise"
              cardHeight={0.56}
              gap={64}
              radius={10}
              squeeze={0.1}
              focusOnClick={false}
              playBadge
              badgeLabel="Putar video"
              captions
              autoplay
              interval={4}
              onSelect={handleSelectMedia}
            />
          </div>
        </div>
      ) : (
        /* HP: polaroid bertape, geser kiri-kanan */
        <div data-r className="relative z-10 w-full">
          <div
            ref={trackRef}
            onScroll={onTrackScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[12vw] pb-6 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselItems.map((item, i) => {
              const img = getImage(item);
              const isActive = i === mobileIndex;
              const tilt = isActive ? 0 : i % 2 === 0 ? -MOBILE_TILT : MOBILE_TILT;
              return (
                <button
                  key={item.id ?? i}
                  type="button"
                  onClick={() => handleSelectMedia(i, item)}
                  className={`relative w-[76vw] max-w-[340px] flex-none snap-center bg-[#fffdf8] p-3 pb-4 text-left shadow-[0_14px_26px_-10px_rgba(40,20,70,0.45)] transition-all duration-500 ease-out ${
                    isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60'
                  }`}
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  <Washi
                    className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3"
                    color={TAPES[i % TAPES.length]}
                  />
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e6dcf5]">
                    {img ? (
                      <img
                        src={img}
                        alt={getTitle(item)}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    ) : item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    {item.videoUrl && (
                      <span className="absolute bottom-3 left-1/2 inline-flex h-9 -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-[#54325c]/80 pl-3 pr-4 text-xs font-medium text-white backdrop-blur-md">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Putar video
                      </span>
                    )}
                  </div>
                  <div className="mt-3 px-1">
                    <p
                      className={`${HAND} text-[1.7rem] font-bold leading-[1.05]`}
                      style={{ color: INK }}
                    >
                      {getTitle(item)}
                    </p>
                    {getSub(item) && (
                      <p
                        className={`${HAND} mt-1 line-clamp-2 text-lg leading-tight opacity-70`}
                        style={{ color: INK }}
                      >
                        {getSub(item)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-ink/70">
            <span className={`${HAND} text-2xl`}>{pad(mobileIndex + 1)}</span>
            <span className="relative h-[3px] w-24 overflow-hidden rounded-full bg-ink/10">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-purple-600 transition-[width] duration-300"
                style={{ width: `${((mobileIndex + 1) / carouselItems.length) * 100}%` }}
              />
            </span>
            <span className={`${HAND} text-2xl text-ink/40`}>{pad(carouselItems.length)}</span>
          </div>
        </div>
      )}

      <p className={`${HAND} relative z-10 mt-6 text-center text-lg text-ink-soft`}>
        {isDesktop
          ? 'arahkan kursor ke kartu, klik buat putar videonya'
          : 'geser, terus ketuk kartunya buat putar video'}
      </p>

      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoItem={selectedVideo}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene: Penutup (foto terbuka dari lingkaran)                         */
/* ------------------------------------------------------------------ */

function ClosingScene({ onExploreFavorites }) {
  const sceneRef = useRef(null);
  const burstRef = useRef(null);
  const photo = allImages[5] ?? allImages[0];

    useScene(
    sceneRef,
    (scene) => {
      if (prefersReduced()) return { onProgress: () => {} };
      const reveal = scene.querySelector('[data-reveal]');
      const img = scene.querySelector('[data-img]');
      const lines = scene.querySelectorAll('[data-m]');
      const sub = scene.querySelector('[data-sub]');
      const cta = scene.querySelector('[data-cta]');
      const deco = scene.querySelector('[data-deco]');

      return {
        onProgress(p) {
          const e = easeInOut(seg(p, 0, 0.5));
          reveal.style.clipPath = `circle(${mix(7, 78, e)}% at 50% 52%)`;
          img.style.transform = `scale(${mix(1.25, 1, e)})`;

          lines.forEach((el, i) => {
            const t = easeOut(seg(p, 0.4 + i * 0.1, 0.62 + i * 0.1));
            el.style.transform = `translate3d(0, ${(1 - t) * 115}%, 0)`;
          });

          const s = seg(p, 0.65, 0.82);
          sub.style.opacity = s;
          sub.style.transform = `translate3d(0, ${(1 - s) * 24}px, 0)`;
          if (deco) deco.style.opacity = seg(p, 0.7, 0.9);

          const c = seg(p, 0.78, 0.92);
          cta.style.opacity = c;
          cta.style.transform = `translate3d(0, ${(1 - c) * 24}px, 0)`;
          cta.style.pointerEvents = c > 0.6 ? 'auto' : 'none';
        },
      };
    },
    []
  );

  const burst = (e) => {
    playChime();
    const layer = burstRef.current;
    if (!layer || prefersReduced()) return;

    const lr = layer.getBoundingClientRect();
    const br = e.currentTarget.getBoundingClientRect();
    const x = br.left + br.width / 2 - lr.left;
    const y = br.top - lr.top;

    for (let i = 0; i < 18; i++) {
      const h = document.createElement('span');
      h.textContent = '♥';
      h.className = 'pointer-events-none absolute text-purple-400';
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.fontSize = `${14 + Math.random() * 22}px`;
      layer.appendChild(h);

      animate(h, {
        translateX: (Math.random() - 0.5) * 320,
        translateY: -(120 + Math.random() * 260),
        rotate: (Math.random() - 0.5) * 50,
        opacity: [1, 0],
        scale: [0.6, 1.2],
        duration: 1400 + Math.random() * 900,
        ease: 'outCubic',
        onComplete: () => h.remove(),
      });
    }
  };

  return (
    <section
      id="closing"
      ref={sceneRef}
      className="relative h-[240svh] bg-cream motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        {/* Foto terbuka dari lingkaran */}
        <div data-reveal className="absolute inset-0">
          {photo && (
            <img
              data-img
              src={photo.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_30%] will-change-transform"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-paper/85 via-paper/40 to-paper/15" />
        </div>

        <div ref={burstRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden" />

                <div className="absolute inset-0 z-10 flex items-center px-6 md:px-16">
          <div className="relative mx-auto w-full max-w-3xl text-center">
            {/* hiasan: muncul bareng paragraf */}
            <div
              data-deco
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-2 -inset-y-6"
            >
              <Daisy className="absolute -left-2 top-0 h-16 w-16 -rotate-12 drop-shadow-md md:-left-10 md:h-20 md:w-20" />
              <StarS className="absolute right-2 top-2 h-7 w-7 rotate-12 md:-right-6" />
              <HeartS className="absolute -right-1 bottom-16 h-8 w-8 -rotate-12 md:-right-12" />
              <StarS
                className="absolute -left-1 bottom-24 hidden h-6 w-6 -rotate-6 md:block"
                fill="#f4b6c8"
              />
            </div>

            <div className="pointer-events-none mb-1">
              <Mask>
                <span
                  className={`${HAND} text-[2rem] leading-none md:text-[2.6rem]`}
                  style={{ color: INK }}
                >
                  buat kamu, yang paling kusayang
                </span>
              </Mask>
            </div>

            <h2
              className={`${DISPLAY} pointer-events-none mb-4 text-[clamp(2.8rem,8vw,5.6rem)] leading-[1] text-ink`}
            >
              <Mask>Terima kasih</Mask>
              <Mask>
                <span className="italic">sudah ada.</span>
              </Mask>
            </h2>

            <div data-sub className="pointer-events-none mx-auto mb-9 max-w-md">
              <Squiggle className="mx-auto mb-6 w-36" />
              <div className="relative rotate-1 bg-[#fffaf2]/90 px-6 pb-5 pt-7 shadow-[0_14px_28px_-12px_rgba(40,20,70,0.5)]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply"
                  style={NOISE}
                />
                <Washi
                  className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2"
                  color={TAPES[1]}
                />
                <p
                  className={`${HAND} relative text-center text-[1.5rem] leading-[1.2] md:text-[1.65rem]`}
                  style={{ color: INK }}
                >
                  Kamu bikin hari biasa terasa spesial dan hari yang berat terasa lebih ringan.
                  Kalau kamu butuh tahu satu hal: aku selalu di sini, nyemangatin kamu.
                </p>
              </div>
            </div>

            <div data-cta className="flex flex-wrap items-center justify-center gap-4">
              <Magnetic>
                <PatchButton onClick={burst}>
                  <Heart className="h-5 w-5 fill-current" />
                  <span>aku sayang kamu</span>
                </PatchButton>
              </Magnetic>
              <Magnetic>
                <NoteButton
                  onClick={() => {
                    playPop();
                    onExploreFavorites?.();
                  }}
                >
                  <Utensils className="h-5 w-5 text-purple-600" />
                  <span>Buka Menu Kesukaan</span>
                </NoteButton>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function StorySection({ onExploreFavorites }) {
  const [ready, setReady] = useState(hasPlayedCurtain);

  return (
    <>
      <Curtain onLift={() => setReady(true)} />
      <ProgressBar />
      <SideNav />
      <DynamicNotch onExploreFavorites={onExploreFavorites} />

      <HeroScene ready={ready} onExploreFavorites={onExploreFavorites} />
      <GalleryScene />
      <Marquee
        words={[
          'senyum manismu',
          'tawamu yang menenangkan',
          'setiap cerita tentang kita',
          'selamanya di hati',
        ]}
      />
      <ReasonScene />
      <MomentsScene />
      <NotesScene onGoToAllFavorites={onExploreFavorites} />
      <ScrapbookScene />
      <BirthdayCountdown />
      <ClosingScene onExploreFavorites={onExploreFavorites} />
    </>
  );
}