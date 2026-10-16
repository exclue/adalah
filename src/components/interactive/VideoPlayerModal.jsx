import { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { INK, PURPLE, PAPER, HAND, NOISE, Daisy, HeartS, StarS, Washi } from '../story/scrap';

const STYLE = `
@keyframes vpm-backdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes vpm-pop { from { opacity: 0; transform: translateY(20px) scale(0.95) rotate(-1.5deg); } to { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); } }
@media (prefers-reduced-motion: reduce) { .vpm-anim { animation: none !important; } }
`;

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function VideoPlayerModal({ isOpen, onClose, videoItem }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Putar dari awal tiap kali video dibuka
  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    const v = videoRef.current;
    v.currentTime = 0;
    v.muted = false;
    setIsMuted(false);
    setProgress(0);
    v.play().catch(() => {
      // Browser menolak autoplay bersuara, ulangi dalam keadaan mute
      v.muted = true;
      setIsMuted(true);
      v.play().catch(() => setIsPlaying(false));
    });
    setIsPlaying(true);
  }, [isOpen, videoItem]);

  // Tutup dengan Escape + kunci scroll halaman saat modal terbuka
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoItem) return null;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  return (
    <div
      className="vpm-anim fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-md"
      style={{ animation: 'vpm-backdrop 250ms ease both' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={videoItem.title || 'Video'}
    >
      <style>{STYLE}</style>

      <div
        className="vpm-anim relative my-auto w-full max-w-sm md:max-w-md"
        style={{ animation: 'vpm-pop 420ms cubic-bezier(0.22,1,0.36,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lembar kertas */}
        <div
          className="relative rounded-[6px] px-4 pb-6 pt-8 md:px-5"
          style={{
            background: PAPER,
            boxShadow: '0 30px 60px -24px rgba(43,24,60,0.6), 0 2px 6px rgba(43,24,60,0.12)',
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]">
            <div className="absolute inset-0 opacity-[0.3] mix-blend-multiply" style={NOISE} />
          </div>
          <Washi className="-top-3 left-1/2 h-6 w-28 -translate-x-1/2 -rotate-2" color="rgba(244,182,200,0.88)" />

          {/* Tombol tutup (stiker bulat) */}
          <button
            onClick={onClose}
            autoFocus
            className="absolute -right-3 -top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed border-[#c9b7d8] shadow-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-purple-600 active:scale-95"
            style={{ background: PAPER, color: INK }}
            aria-label="Tutup video"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Judul + subjudul tulisan tangan */}
          <div className="relative px-1 pb-4 text-center">
            <h4 className={`${HAND} line-clamp-2 text-[1.9rem] font-bold leading-[0.95]`} style={{ color: INK }}>
              {videoItem.title || 'Momen Paling Seru! 🎉'}
            </h4>
            {videoItem.subtitle && (
              <p className={`${HAND} mt-1.5 line-clamp-2 text-xl leading-tight opacity-75`} style={{ color: INK }}>
                {videoItem.subtitle}
              </p>
            )}
          </div>

          {/* Layar video (vertikal), ukuran menyesuaikan tinggi layar */}
          <div
            className="relative mx-auto aspect-[9/16] overflow-hidden rounded-[3px] bg-ink"
            style={{
              width: 'min(100%, calc(60svh * 9 / 16))',
              boxShadow: '0 0 0 4px #fff, 0 10px 24px -10px rgba(43,24,60,0.55)',
            }}
          >
            <video
              ref={videoRef}
              src={videoItem.videoUrl}
              poster={videoItem.src}
              playsInline
              loop
              className="h-full w-full object-cover"
              onClick={togglePlay}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
                aria-label="Putar"
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[#d9b24c]/70 shadow-lg"
                  style={{ background: PAPER, color: PURPLE }}
                >
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </span>
              </button>
            )}

            {/* Kontrol: play, progress (jantung), waktu, mute */}
            <div
              className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-full px-3.5 py-2 shadow-lg backdrop-blur-sm"
              style={{ background: 'rgba(255,250,242,0.92)', color: INK }}
            >
              <button
                onClick={togglePlay}
                className="cursor-pointer p-0.5 transition-colors hover:text-purple-600"
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              <div
                onClick={seek}
                className="relative h-5 flex-1 cursor-pointer"
                role="slider"
                aria-label="Posisi video"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/15" />
                <span
                  className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-purple-600"
                  style={{ width: `${progress * 100}%` }}
                />
                <HeartS
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 drop-shadow"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>

              <span className={`${HAND} min-w-[2.6rem] text-right text-base leading-none tabular-nums`}>
                {fmt(progress * duration)}
              </span>

              <button
                onClick={toggleMute}
                className="cursor-pointer p-0.5 transition-colors hover:text-purple-600"
                aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stiker di pojok */}
        <Daisy className="pointer-events-none absolute -bottom-7 -left-7 h-16 w-16 -rotate-12 drop-shadow-md" />
        <HeartS className="pointer-events-none absolute -bottom-4 right-8 h-8 w-8 rotate-12 drop-shadow" />
        <StarS className="pointer-events-none absolute -right-4 bottom-12 h-6 w-6 rotate-12" fill="#f4b6c8" />
      </div>
    </div>
  );
}