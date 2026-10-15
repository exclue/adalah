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
        {/* Foto latar: MorphSlider (bisa digeser) */}
        <div
          data-bg
          className="absolute inset-x-0 top-0 h-[52svh] will-change-transform md:inset-0 md:h-auto"
        >
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

        {/* Gradasi lembut desktop */}
        <div
          data-veil
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-full bg-gradient-to-r from-paper/95 via-paper/60 to-transparent md:block md:w-[62%]"
        />
        {/* Gradasi HP: memudar di dalam bagian bawah foto */}
        <div className="pointer-events-none absolute inset-x-0 top-[38svh] z-10 h-[14svh] bg-gradient-to-t from-paper to-transparent md:hidden" />

        {/* Teks: bawah di HP (mulai di bawah foto), tengah di desktop */}
        <div
          data-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 pt-[52svh] md:justify-center md:px-12 md:pb-0 md:pt-24 lg:px-16"
        >
          <div className="max-w-5xl">
            <h1
              className={`${DISPLAY} mb-5 text-[clamp(2.7rem,12.5vw,4.5rem)] leading-[0.92] text-ink md:mb-7 md:text-[clamp(3.4rem,14vw,10.5rem)]`}
            >
              <Line text="HALAAWWW" />
              <Line text="NIAAA" />
            </h1>

            <p
              data-fade
              className="mb-6 max-w-md text-sm leading-relaxed text-ink-soft md:mb-9 md:text-base"
            >
              MAAAFF YAAHH LAMAAA EHEHHE AKUU NGEBUAT INII DARI HARI SENINN.
              DISINII TENTANGG KAMUU SEMUAA SEMOGA KAMU SUKAA YAA.
              kamuu scroll scroll ajaaa
            </p>

            <div data-fade className="pointer-events-auto flex flex-wrap items-center gap-3">
              <Magnetic>
                <button
                  onClick={() => goTo('gallery')}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#855792]/40 bg-gradient-to-b from-[#6b4375] to-[#54325c] px-6 py-3 text-sm font-medium text-[#faf6f0] shadow-[0_4px_16px_-2px_rgba(84,50,92,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all hover:from-[#764b81] hover:to-[#5e3867] hover:shadow-[0_8px_24px_-4px_rgba(84,50,92,0.45)] active:scale-95"
                >
                  <span>Lanjutt</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => {
                    playPop();
                    onExploreFavorites?.();
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-[#fffdf9] px-6 py-3 text-sm font-medium text-ink shadow-xs transition-all hover:bg-paper-2 hover:border-purple-200 active:scale-95"
                >
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span>Penceett</span>
                </button>
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
          <span>scroll</span>
          <span data-bob>
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
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
          const insetY = desktop ? 16 : 20;
          const insetX = desktop ? 24 : 10;
          const radius = desktop ? 24 : 18;

          // Jendela melebar + wall di-zoom-out
          const e = easeInOut(seg(p, 0, 0.34));
          frame.style.clipPath = `inset(${mix(insetY, 0, e)}% ${mix(insetX, 0, e)}% round ${mix(radius, 0, e)}px)`;
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
/* Scene: Momen                                                         */
/* ------------------------------------------------------------------ */

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
      className="flex min-h-svh flex-col bg-paper pb-14 pt-24 md:pb-20 md:pt-32"
    >
      <div className="mx-auto mb-10 flex w-full max-w-6xl flex-col gap-6 px-5 md:mb-12 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="max-w-xl">
          <h2
            data-r
            className={`${DISPLAY} mb-4 text-[clamp(2.8rem,7vw,5rem)] leading-none text-ink`}
          >
            LUCUUKK
          </h2>
          <p data-r className="text-sm leading-relaxed text-ink-soft md:text-base">
            nanti kalo meet videonya aku tambahin sama video kita yaahh EHEHE
          </p>
        </div>
      </div>

      {isDesktop ? (
        /* DESKTOP: full lebar, menyatu dengan background section */
        <div data-r className="relative h-[86svh] min-h-[480px] w-full overflow-hidden">
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

          {/* Pudar di tepi kiri/kanan supaya kartu tidak terpotong kasar */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-paper to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-paper to-transparent" />
        </div>
      ) : (
        /* HP: carousel geser biasa, kartu aktif menonjol */
        <div data-r className="w-full">
          <div
            ref={trackRef}
            onScroll={onTrackScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[12vw] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselItems.map((item, i) => {
              const img = getImage(item);
              const isActive = i === mobileIndex;
              return (
                <button
                  key={item.id ?? i}
                  type="button"
                  onClick={() => handleSelectMedia(i, item)}
                  className={`w-[76vw] max-w-[340px] flex-none snap-center text-left transition-all duration-500 ease-out ${
                    isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-50'
                  }`}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-line bg-[#fffdf9] shadow-[0_10px_25px_-10px_rgba(60,40,75,0.15)]">
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
                      <span className="absolute bottom-3 left-1/2 inline-flex h-9 -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-black/50 pl-3 pr-4 text-xs font-medium text-white backdrop-blur-md">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Putar video
                      </span>
                    )}
                  </div>
                  <div className="mt-4 px-1">
                    <p className="font-display text-xl font-medium leading-tight text-ink">
                      {getTitle(item)}
                    </p>
                    {getSub(item) && (
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-soft">
                        {getSub(item)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-xs tabular-nums text-ink/60">
            <span>{pad(mobileIndex + 1)}</span>
            <span className="relative h-[2px] w-24 overflow-hidden rounded-full bg-ink/10">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-purple-600 transition-[width] duration-300"
                style={{ width: `${((mobileIndex + 1) / carouselItems.length) * 100}%` }}
              />
            </span>
            <span className="text-ink/35">{pad(carouselItems.length)}</span>
          </div>
        </div>
      )}

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
          <div className="mx-auto w-full max-w-3xl text-center">
            <h2
              className={`${DISPLAY} pointer-events-none mb-6 text-[clamp(2.8rem,9vw,6rem)] leading-[1.02] text-ink`}
            >
              <Mask>Terima kasih</Mask>
              <Mask>sudah ada.</Mask>
            </h2>

            <p
              data-sub
              className="pointer-events-none mx-auto mb-10 max-w-md text-sm leading-relaxed text-ink-soft md:text-base"
            >
              Kamu bikin hari biasa terasa spesial dan hari yang berat terasa lebih ringan. Kalau
              kamu butuh tahu satu hal: aku selalu di sini, nyemangatin kamu.
            </p>

            <div data-cta className="flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <button
                  onClick={burst}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#855792]/40 bg-gradient-to-b from-[#6b4375] to-[#54325c] px-7 py-3.5 text-sm font-medium text-[#faf6f0] shadow-[0_4px_16px_-2px_rgba(84,50,92,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all hover:from-[#764b81] hover:to-[#5e3867] hover:shadow-[0_8px_24px_-4px_rgba(84,50,92,0.45)] active:scale-95"
                >
                  <Heart className="h-4 w-4 fill-current" />
                  <span>aku sayang kamu</span>
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => {
                    playPop();
                    onExploreFavorites?.();
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-[#fffdf9] px-6 py-3.5 text-sm font-medium text-ink shadow-xs transition-all hover:bg-paper-2 hover:border-purple-200 active:scale-95"
                >
                  <Utensils className="h-4 w-4 text-purple-600" />
                  <span>Buka Menu Kesukaan</span>
                </button>
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