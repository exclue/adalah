import { useEffect, useRef, useState } from 'react';
import { Heart, Music2, Pause, Play, SkipForward } from 'lucide-react';
import { goTo } from '../story/kit';

// Link navigasi yang tampil di dalam pill notch
const LINKS = [
  { id: 'hero', label: 'Beranda' },
  { id: 'moments', label: 'Momen' },
  { id: 'letters', label: 'Surat' },
];

// Ambil semua lagu dari src/assets/music. Format nama: "Artis - Judul.mp3"
const files = import.meta.glob('../../assets/music/*.{mp3,m4a,wav,ogg,flac}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const TRACKS = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, url]) => {
    const raw = decodeURIComponent(path.split('/').pop())
      .replace(/\.[^.]+$/, '')
      .replace(/_+/g, ' ')
      .replace(/^\d+\s*[-.]\s*/, '')
      .trim();
    const [first, ...rest] = raw.split(' - ');
    return rest.length
      ? { url, artist: first.trim(), title: rest.join(' - ').trim() }
      : { url, artist: '', title: raw };
  });

// Satu-satunya elemen audio di seluruh aplikasi.
// Disimpan di window supaya hot reload / StrictMode tidak bikin audio kedua.
const audio =
  typeof window === 'undefined'
    ? null
    : (window.__vanvanAudio ??= new Audio());
if (audio) audio.preload = 'auto';

// Saat file ini di-hot-reload, matikan audio lama biar tidak numpuk
if (import.meta.hot) {
  import.meta.hot.dispose(() => audio?.pause());
}

const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const NAV_H = 56;
const MUSIC_H = 72;

function Equalizer({ active }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
      {[0, 0.2, 0.4, 0.1].map((d) => (
        <span
          key={d}
          className="w-[3px] rounded-full bg-purple-600"
          style={{
            height: '100%',
            transformOrigin: 'bottom',
            animation: 'notch-eq 0.9s ease-in-out infinite',
            animationDelay: `${d}s`,
            animationPlayState: active ? 'running' : 'paused',
            transform: active ? undefined : 'scaleY(0.25)',
          }}
        />
      ))}
    </span>
  );
}

export default function DynamicNotch() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const wrapRef = useRef(null);

  // ---------- Musik ----------
  const wantPlay = useRef(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const track = TRACKS[index];

  // Listener ke audio global (dipasang & dilepas, audionya sendiri tidak dibuat ulang)
  useEffect(() => {
    if (!audio) return undefined;

    // Browser blokir autoplay sebelum ada interaksi -> mulai di klik/tap pertama
    const events = ['pointerdown', 'keydown', 'touchend'];
    const unlock = () => {
      if (wantPlay.current && audio.paused && audio.src) audio.play().catch(() => {});
    };
    const removeUnlock = () => events.forEach((ev) => window.removeEventListener(ev, unlock));
    events.forEach((ev) => window.addEventListener(ev, unlock));

    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onPlay = () => {
      setPlaying(true);
      removeUnlock();
    };
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      wantPlay.current = true;
      if (TRACKS.length < 2) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIndex((i) => (i + 1) % TRACKS.length); // auto next
      }
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnd);
    return () => {
      removeUnlock();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  // Ganti lagu: hentikan yang lama dulu, baru muat yang baru
  useEffect(() => {
    if (!audio || !TRACKS.length) return;
    audio.pause();
    audio.src = TRACKS[index].url;
    audio.load();
    setProgress(0);
    if (wantPlay.current) audio.play().catch(() => setPlaying(false));
  }, [index]);

  const toggle = () => {
    if (!audio || !TRACKS.length) return;
    if (audio.paused) {
      wantPlay.current = true;
      audio.play().catch(() => {});
    } else {
      wantPlay.current = false;
      audio.pause();
    }
  };

  const next = () => {
    if (!TRACKS.length) return;
    wantPlay.current = true;
    setIndex((i) => (i + 1) % TRACKS.length);
  };

  // ---------- Menu aktif sesuai scroll ----------
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let cur = LINKS[0].id;
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= line) cur = l.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tutup pill saat tap di luar (mobile)
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const tab = open ? 0 : -1;
  const hasMusic = TRACKS.length > 0 && track;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-3">
      <style>{`
        @keyframes notch-eq {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      <div
        ref={wrapRef}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
        onClick={() => !open && setOpen(true)}
        className="pointer-events-auto relative cursor-pointer overflow-hidden bg-paper/95 text-ink shadow-[0_12px_32px_-12px_rgba(60,40,75,0.18)] ring-1 ring-line backdrop-blur-xl"
        style={{
          width: open ? 'min(94vw, 680px)' : playing ? '132px' : '104px',
          height: open ? (hasMusic ? NAV_H + MUSIC_H : NAV_H) : 34,
          borderRadius: open ? 28 : 17,
          transition: `width 600ms ${EASE}, height 600ms ${EASE}, border-radius 600ms ${EASE}`,
        }}
      >
        {/* Saat tertutup: equalizer kecil kalau lagu jalan */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 flex h-[34px] items-center justify-center transition-opacity duration-300 ${
            open ? 'opacity-0' : 'opacity-100 delay-200'
          }`}
        >
          {hasMusic && <Equalizer active={playing} />}
        </div>

        {/* Baris menu navigasi */}
        <nav
          aria-label="Menu utama"
          className={`absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-4 transition-opacity duration-300 sm:px-5 ${
            open ? 'opacity-100 delay-200' : 'pointer-events-none opacity-0'
          }`}
          style={{ height: NAV_H }}
        >
          <button
            type="button"
            tabIndex={tab}
            onClick={() => {
              goTo('hero');
              setOpen(false);
            }}
            className="flex flex-none cursor-pointer items-center gap-2"
          >
            <Heart className="h-4 w-4 text-purple-600" />
            <span className="hidden font-display text-lg sm:inline">For Vanvan</span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                tabIndex={tab}
                onClick={() => {
                  goTo(l.id);
                  setOpen(false);
                }}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition-colors sm:text-sm ${
                  active === l.id ? 'bg-purple-100 font-medium text-purple-900' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Popup lagu di dalam navbar */}
        {hasMusic && (
          <div
            className={`absolute inset-x-3 flex items-center gap-3 rounded-[20px] border border-line/60 bg-paper-2/70 px-3 transition-opacity duration-300 ${
              open ? 'opacity-100 delay-300' : 'pointer-events-none opacity-0'
            }`}
            style={{ top: NAV_H - 4, height: MUSIC_H - 12 }}
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-xs">
              <Music2 className={`h-5 w-5 text-white/90 ${playing ? 'animate-pulse' : ''}`} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-ink">{track.title}</p>
              <p className="truncate text-xs leading-tight text-ink-soft">
                {track.artist || 'Playlist favoritmu'}
              </p>
            </div>

            <button
              type="button"
              tabIndex={tab}
              onClick={toggle}
              aria-label={playing ? 'Jeda' : 'Putar'}
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full border border-line bg-paper/80 text-ink transition-colors hover:bg-paper-2"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>
            <button
              type="button"
              tabIndex={tab}
              onClick={next}
              aria-label="Lagu berikutnya"
              className="flex-none cursor-pointer text-ink-soft transition-colors hover:text-ink"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <span
              className="absolute bottom-0 left-4 h-[2px] rounded-full bg-purple-600"
              style={{ width: `calc((100% - 2rem) * ${progress})` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}