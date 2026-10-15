import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, SkipForward } from 'lucide-react';

// Ambil semua file musik dari src/assets/music. Format nama: "Artis - Judul.mp3"
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

export default function MusicDrawer({ className = '' }) {
  const audioRef = useRef(null);
  const wantPlay = useRef(true);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const track = TRACKS[index];

  // Audio dibuat sekali, autoplay, auto next
  useEffect(() => {
    const a = new Audio();
    a.preload = 'auto';
    audioRef.current = a;

    const events = ['pointerdown', 'keydown', 'touchend'];
    const unlock = () => {
      if (wantPlay.current && a.paused && a.src) a.play().catch(() => {});
    };
    const removeUnlock = () => events.forEach((ev) => window.removeEventListener(ev, unlock));
    events.forEach((ev) => window.addEventListener(ev, unlock));

    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onPlay = () => {
      setPlaying(true);
      removeUnlock();
    };
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      wantPlay.current = true;
      if (TRACKS.length < 2) {
        a.currentTime = 0;
        a.play().catch(() => {});
      } else {
        setIndex((i) => (i + 1) % TRACKS.length);
      }
    };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnd);
    return () => {
      removeUnlock();
      a.pause();
      a.removeAttribute('src');
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  // Ganti lagu
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !TRACKS.length) return;
    a.src = TRACKS[index].url;
    setProgress(0);
    if (wantPlay.current) a.play().catch(() => setPlaying(false));
  }, [index]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !TRACKS.length) return;
    if (a.paused) {
      wantPlay.current = true;
      a.play().catch(() => {});
    } else {
      wantPlay.current = false;
      a.pause();
    }
  };

  const next = () => {
    if (!TRACKS.length) return;
    wantPlay.current = true;
    setIndex((i) => (i + 1) % TRACKS.length);
  };

  if (!track) return null;

  return (
    <div
      className={`relative flex w-full min-w-[220px] items-center gap-3 overflow-hidden rounded-2xl bg-paper-2 px-3 py-2.5 text-ink ${className}`}
    >
      {/* Cover */}
      <div className="relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
        <Music2
          className={`h-5 w-5 text-white/90 ${playing ? 'animate-pulse' : ''}`}
        />
      </div>

      {/* Judul + artis */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight text-ink">{track.title}</p>
        <p className="truncate text-xs leading-tight text-ink-soft">
          {track.artist || 'Playlist favoritmu'}
        </p>
      </div>

      {/* Kontrol */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Jeda' : 'Putar'}
        className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-full border border-ink/35 text-ink transition-colors hover:bg-ink/5"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Lagu berikutnya"
        className="flex-none cursor-pointer text-ink-soft transition-colors hover:text-ink"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      {/* Progress tipis di bawah kartu */}
      <span
        className="absolute bottom-0 left-0 h-[2px] bg-purple-500"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}