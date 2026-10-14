import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Play,
  Utensils,
} from 'lucide-react';
import MorphSlider from '../reactbits/MorphSlider';
import DriftWall from '../reactbits/DriftWall';
import FlexCarousel from '../reactbits/FlexCarousel';
import TiltedCard from '../reactbits/TiltedCard';
import SpotlightCard from '../reactbits/SpotlightCard';
import DecryptedText from '../reactbits/DecryptedText';
import VideoPlayerModal from '../interactive/VideoPlayerModal';
import DynamicNotch from '../common/DynamicNotch';
import MusicDrawer from '../common/MusicDrawer';
import ReasonScene from './ReasonScene';
import NotesScene from './NotesScene';
import BirthdayCountdown from './BirthdayCountdown';
import { allImages, morphSliderItems, driftWallItems, carouselItems } from '../../data/media';
import { loveNotes } from '../../data/messages';
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
  clamp,
  mix,
  seg,
  easeOut,
  easeInOut,
  prefersReduced,
  goTo,
} from '../story/kit';

// Mask bawaan DriftWall itu gradient, dimatikan biar wall full sampai ujung.
const NO_MASK = { WebkitMaskImage: 'none', maskImage: 'none' };

/* ------------------------------------------------------------------ */
/* Scene 1: Hero                                                        */
/* ------------------------------------------------------------------ */

const HERO_POLAROIDS = [
  { cls: 'left-0 top-4 w-[150px]', rot: -8, cap: 'Senyum Idaman! 😍✨', pick: 3 },
  { cls: 'right-0 top-0 w-[160px]', rot: 6, cap: 'Tatapannya Bikin Meleleh! 🫠💘', pick: 6 },
  { cls: 'bottom-0 left-[70px] w-[170px]', rot: -2, cap: 'Gemes Banget Asli! 🤏🥰', pick: 9 },
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

  // Foto polaroid dan badge melayang pelan
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
          bg.style.transform = `scale(${mix(1, 1.16, easeOut(p))})`;
          veil.style.opacity = mix(0.6, 0.92, seg(p, 0.1, 0.9));
          const fade = 1 - seg(p, 0.2, 0.65);
          copy.style.transform = `translate3d(0, ${-p * 140}px, 0)`;
          copy.style.opacity = fade;
          copy.style.visibility = fade < 0.02 ? 'hidden' : 'visible';
          if (aside) aside.style.opacity = 1 - seg(p, 0.1, 0.4);
          cue.style.opacity = 1 - seg(p, 0, 0.12);
        },
      };
    },
    []
  );

  return (
    <section
      id="hero"
      ref={sceneRef}
      className="relative h-[170svh] bg-[#0d0917] motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh min-h-[600px] overflow-hidden">
        {/* Foto latar: MorphSlider (bisa digeser) */}
        <div data-bg className="absolute inset-0 will-change-transform">
          <MorphSlider
            items={morphSliderItems}
            transition="melt"
            intensity={0.55}
            aberration={0.3}
            drift={0.35}
            autoplay
            autoplayDelay={5}
            duration={1.2}
            radius={0}
            overlayColor="#0d0917"
            showCaptions={false}
            showControls={false}
          />
        </div>

        <div data-veil className="pointer-events-none absolute inset-0 bg-[#0d0917] opacity-60" />

        {/* Teks: bawah di HP, tengah di desktop */}
        <div
          data-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-24 pt-24 md:justify-center md:px-12 md:pb-0 lg:px-16"
        >
          <div className="max-w-5xl">
            <h1 className="mb-6 text-[clamp(3rem,13vw,9.5rem)] font-semibold leading-[0.95] tracking-tight text-white">
              <Line text="HALAAWWW" />
              <Line text="NIAAA" className="text-purple-400" />
            </h1>

            <p
              data-fade
              className="mb-8 max-w-md text-sm leading-relaxed text-white/75 md:text-base"
            >
              MAAAFF YAAHH LAMAAA EHEHHE AKUU NGEBUAT INII DARI HARI SENINN.
              DISINII TENTANGG KAMUU SEMUAA SEMOGA KAMU SUKAA YAA.
              kamuu scroll scroll ajaaa
            </p>

            <div data-fade className="pointer-events-auto flex flex-wrap items-center gap-3">
              <Magnetic>
                <button
                  onClick={() => goTo('gallery')}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-purple-200 px-6 py-3 text-sm font-medium text-purple-950 transition-colors hover:bg-purple-100 active:scale-95"
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
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10 active:scale-95"
                >
                  <Utensils className="h-4 w-4 text-purple-300" />
                  <span>Penceett</span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Hiasan kanan: badge teks muter (semua layar) + tumpukan polaroid (layar lebar) */}
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
                      className="rounded-[10px] bg-[#f3eefc] p-2 pb-1.5 shadow-[0_20px_44px_-14px_rgba(0,0,0,0.65)]"
                      style={{ transform: `rotate(${p.rot}deg)` }}
                    >
                      <img
                        src={img.url}
                        alt=""
                        draggable={false}
                        className="aspect-[4/5] w-full rounded-[6px] object-cover"
                      />
                      <span className="block pb-1 pt-2 text-center text-[11px] font-medium text-purple-950/70">
                        {p.cap}
                      </span>
                    </div>
                  </div>
                );
              })}

            <div
              data-float
              className="relative ml-auto h-24 w-24 xl:absolute xl:-left-12 xl:bottom-10 xl:ml-0 xl:h-28 xl:w-28"
            >
              <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
                <defs>
                  <path
                    id="heroBadgeCircle"
                    d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                  />
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Petunjuk scroll */}
        <div
          data-cue
          className="pointer-events-none absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-xs text-white/60 md:bottom-6 md:left-auto md:right-8 md:translate-x-0"
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
          const radius = desktop ? 40 : 28;

          // Jendela melebar + wall di-zoom-out
          const e = easeInOut(seg(p, 0, 0.34));
          frame.style.clipPath = `inset(${mix(insetY, 0, e)}% ${mix(insetX, 0, e)}% round ${mix(radius, 0, e)}px)`;
          wall.style.transform = `scale(${mix(1.3, 1, e)})`;

          // Baris teks naik dari balik topeng
          lines.forEach((el, i) => {
            const t = easeOut(seg(p, 0.18 + i * 0.12, 0.34 + i * 0.12));
            el.style.transform = `translate3d(0, ${(1 - t) * 125}%, 0)`;
          });

          // Keluar: teks naik dan hilang, layar gelap terbuka
          const x = seg(p, 0.72, 0.92);
          copy.style.opacity = 1 - x;
          copy.style.transform = `translate3d(0, ${-x * 60}px, 0)`;
          veil.style.opacity = mix(0.55, 0.1, easeInOut(seg(p, 0.7, 0.95)));
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
      className="relative h-[280svh] bg-[#0d0917] motion-reduce:h-svh md:h-[320svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-frame className="absolute inset-0">
          <div data-wall className="absolute inset-0 will-change-transform">
            <DriftWall
              items={driftWallItems}
              columns={isDesktop ? 7 : 3}
              tileWidth={isDesktop ? 240 : 150}
              tileHeight={isDesktop ? 180 : 200}
              gap={isDesktop ? 16 : 12}
              tilt={isDesktop ? 14 : 10}
              turn={isDesktop ? -12 : -8}
              speed={isDesktop ? 38 : 30}
              variance={0.4}
              parallax={0.5}
              lift={55}
              dim={0.9}
              overlayColor="#120822"
              style={NO_MASK}
            />
          </div>
          <div data-veil className="pointer-events-none absolute inset-0 bg-[#0d0917] opacity-50" />
        </div>

        <div
          data-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-28 md:justify-center md:px-16 md:pb-0"
        >
          <h2 className="text-[clamp(2.4rem,9vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            <Mask>LUCUU LUCUU BANGADD,</Mask>
            <Mask>GEMAASS,</Mask>
            <Mask className="text-purple-400">kasihh aku lebih banyak lagi.</Mask>
          </h2>
        </div>

        <p
          data-hint
          className="pointer-events-none absolute inset-x-0 bottom-10 z-10 px-6 text-center text-xs text-white/70 md:text-sm"
        >
          sentuh atau arahkan kursor ke foto, terus lanjut scroll
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 4: Momen                                                       */
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

  // Tebak nama field dari data/media.js (aman kalau namanya beda-beda)
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
      className="flex min-h-svh flex-col bg-[#120b20] pb-10 pt-20 md:pb-14 md:pt-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="mb-8 max-w-xl md:mb-10">
          <h2 data-r className="mb-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            VIDEOONYA AKU SIMPEN DISINI YAAHH EHEHE
          </h2>
          <p data-r className="text-sm leading-relaxed text-white/65 md:text-base">
            VIDEOONYA LUCUU LUCUU SEMUAA
          </p>
        </div>
      </div>

      {isDesktop ? (
        /* DESKTOP: full lebar layar */
        <div
          data-r
          className="relative h-[82svh] min-h-[460px] w-full overflow-hidden bg-[#0d0917] [&_*]:text-white!"
        >
          <FlexCarousel
            items={carouselItems}
            preset="liquid"
            intro="rise"
            cardHeight={0.6}
            gap={64}
            squeeze={0.1}
            focusOnClick
            captions
            autoplay
            interval={4}
            onSelect={handleSelectMedia}
          />
        </div>
      ) : (
        /* HP: carousel geser biasa, card lurus dan berjarak */
        <div data-r className="w-full">
          <div
            ref={trackRef}
            onScroll={onTrackScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[12vw] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselItems.map((item, i) => {
              const img = getImage(item);
              return (
                <button
                  key={item.id ?? i}
                  type="button"
                  onClick={() => handleSelectMedia(i, item)}
                  className="w-[76vw] max-w-[340px] flex-none snap-center text-left"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1a1030]">
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
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur">
                        <Play className="h-4 w-4 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4 px-1">
                    <p className="text-base font-semibold text-white">{getTitle(item)}</p>
                    {getSub(item) && (
                      <p className="mt-0.5 text-sm text-white/80">{getSub(item)}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs tracking-widest text-white">
            {pad(mobileIndex + 1)} / {pad(carouselItems.length)}
          </p>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <p data-r className="mt-6 flex items-center gap-2 text-xs text-white/60 md:text-sm">
          <Play className="h-3.5 w-3.5 text-purple-300" />
          <span>kamuu bisaa pencet nantii keluarr videonyaa ehehe</span>
        </p>
      </div>

      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoItem={selectedVideo}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Scene 6: Surat (kartu bertumpuk)                                     */
/* ------------------------------------------------------------------ */

function LettersScene() {
  const sceneRef = useRef(null);
  const n = loveNotes.length;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reduced = prefersReduced();

  useScene(
    sceneRef,
    (scene) => {
      const cards = [...scene.querySelectorAll('[data-card]')];
      const dims = cards.map((c) => c.querySelector('[data-dim]'));
      const isReduced = prefersReduced();

      return {
        onProgress(p) {
          const f = clamp(p / 0.86, 0, 1) * (n - 1);
          const idx = clamp(Math.round(f), 0, n - 1);
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }

          cards.forEach((card, i) => {
            if (isReduced) {
              card.style.opacity = i === idx ? 1 : 0;
              card.style.pointerEvents = i === idx ? 'auto' : 'none';
              return;
            }
            const enter = i === 0 ? 1 : easeInOut(clamp(f - (i - 1), 0, 1));
            const buried = clamp(f - i, 0, 3);
            card.style.transform = `translate3d(0, calc(${(1 - enter) * 110}vh - ${buried * 16}px), 0) scale(${1 - buried * 0.05}) rotate(${(1 - enter) * 2.5}deg)`;
            card.style.visibility = i > 0 && enter === 0 ? 'hidden' : 'visible';
            if (dims[i]) dims[i].style.opacity = Math.min(0.6, buried * 0.22);
          });
        },
      };
    },
    [n]
  );

  const pad = (v) => String(v).padStart(2, '0');

  return (
    <section id="letters" ref={sceneRef} className="relative h-[420svh] bg-[#0d0917] md:h-[460svh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-4 md:px-8">
        <h2 className="mb-4 text-center text-2xl font-semibold tracking-tight text-white md:text-4xl">
          Pesan pesan aku buat kamu
        </h2>

        <div className="mb-5 flex items-center gap-2" aria-hidden="true">
          {loveNotes.map((note, i) => (
            <span
              key={note.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? 'w-8 bg-purple-300' : 'w-3 bg-white/25'
              }`}
            />
          ))}
        </div>

        <div className="relative h-[min(540px,66svh)] w-full max-w-3xl">
          {loveNotes.map((note, i) => (
            <article
              key={note.id}
              data-card
              style={{ zIndex: i + 1 }}
              className="absolute inset-0 will-change-transform"
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1a1030] p-5 md:p-9">
                <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="mb-1 block text-xs font-medium text-purple-300">
                      {note.category}
                    </span>
                    <h3 className="text-xl font-semibold text-white md:text-3xl">
                      {reduced ? (
                        note.title
                      ) : (
                        <DecryptedText
                          text={note.title}
                          animateOn="view"
                          sequential
                          speed={35}
                          maxIterations={14}
                          characters="abcdefghijklmnopqrstuvwxyz"
                        />
                      )}
                    </h3>
                  </div>
                  <span className="flex-none text-xs text-white/45">
                    {pad(i + 1)} / {pad(n)}
                  </span>
                </div>

                <p className="mb-4 border-l-2 border-purple-400/60 pl-4 text-sm italic text-purple-200 [@media(max-height:700px)]:hidden md:text-base">
                  {note.highlight}
                </p>

                <p className="text-[13px] leading-relaxed text-white/75 md:text-base">
                  {note.content}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-white/50">
                  <span>{note.authorTag}</span>
                  <Heart className="h-3.5 w-3.5 text-purple-300" />
                </div>

                <div
                  data-dim
                  className="pointer-events-none absolute inset-0 bg-[#0d0917] opacity-0"
                />
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 h-4 text-xs text-white/50">
          {active < n - 1 ? 'terus scroll buat baca surat berikutnya' : ''}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 7: Penutup (foto terbuka dari lingkaran)                       */
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
      h.className = 'pointer-events-none absolute text-purple-300';
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
      className="relative h-[240svh] bg-[#0d0917] motion-reduce:h-svh"
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
          <div className="absolute inset-0 bg-[#0d0917]/70" />
        </div>

        <div ref={burstRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden" />

        <div className="absolute inset-0 z-10 flex items-center px-6 md:px-16">
          <div className="mx-auto w-full max-w-3xl text-center">
            <h2 className="pointer-events-none mb-5 text-[clamp(2.5rem,9vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
              <Mask>Terima kasih</Mask>
              <Mask className="text-purple-400">sudah ada.</Mask>
            </h2>

            <p
              data-sub
              className="pointer-events-none mx-auto mb-10 max-w-md text-sm leading-relaxed text-white/75 md:text-base"
            >
              Kamu bikin hari biasa terasa spesial dan hari yang berat terasa lebih ringan. Kalau
              kamu butuh tahu satu hal: aku selalu di sini, nyemangatin kamu.
            </p>

            <div data-cta className="flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <button
                  onClick={burst}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-purple-200 px-7 py-3.5 text-sm font-medium text-purple-950 transition-colors hover:bg-purple-100 active:scale-95"
                >
                  <Heart className="h-4 w-4" />
                  <span>aku sayang kamu</span>
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => {
                    playPop();
                    onExploreFavorites?.();
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10 active:scale-95"
                >
                  <Utensils className="h-4 w-4 text-purple-300" />
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

export default function StorySection({ onExploreFavorites, onOpenNotes }) {
  const [ready, setReady] = useState(hasPlayedCurtain);

  return (
    <>
      <Curtain onLift={() => setReady(true)} />
      <ProgressBar />
      <SideNav />
      <DynamicNotch onExploreFavorites={onExploreFavorites} />
      <MusicDrawer />

      <HeroScene ready={ready} onExploreFavorites={onExploreFavorites} />
      <GalleryScene />
      <Marquee words={['senyummu', 'tawamu', 'kita', 'selamanya']} />
      <ReasonScene />
      <MomentsScene />
      <NotesScene onGoToAllFavorites={onExploreFavorites} />
      <LettersScene />
      <BirthdayCountdown />
      <ClosingScene onExploreFavorites={onExploreFavorites} />
    </>
  );
}