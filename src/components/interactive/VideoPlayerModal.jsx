import { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const STYLE = `
@keyframes vpm-backdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes vpm-pop { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
`;

export default function VideoPlayerModal({ isOpen, onClose, videoItem }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-md"
      style={{ animation: 'vpm-backdrop 250ms ease both' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={videoItem.title || 'Video'}
    >
      <style>{STYLE}</style>

      <div
        className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border border-line bg-paper p-4 shadow-[0_30px_80px_-30px_rgba(43,36,51,0.45)] md:max-w-md"
        style={{ animation: 'vpm-pop 380ms cubic-bezier(0.22,1,0.36,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: judul + subjudul, tombol tutup */}
        <div className="flex items-start justify-between gap-3 px-2 pb-3">
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold leading-tight text-ink">
              {videoItem.title || 'Momen Paling Seru! 🎉'}
            </h4>
            {videoItem.subtitle && (
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-ink-soft">
                {videoItem.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink/5 text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-purple-600"
            aria-label="Tutup video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Layar video (vertikal) */}
        <div className="relative aspect-[9/16] max-h-[65vh] w-full overflow-hidden rounded-3xl bg-ink">
          <video
            ref={videoRef}
            src={videoItem.videoUrl}
            poster={videoItem.src}
            playsInline
            loop
            className="h-full w-full object-cover"
            onClick={togglePlay}
            onTimeUpdate={onTimeUpdate}
          />

          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
              aria-label="Putar"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
                <Play className="ml-1 h-6 w-6 fill-current" />
              </span>
            </button>
          )}

          {/* Kontrol: play, progress, mute */}
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/50 px-4 py-2.5 text-white backdrop-blur-md">
            <button
              onClick={togglePlay}
              className="p-1 transition-colors hover:text-purple-300"
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <div
              onClick={seek}
              className="group/bar relative h-4 flex-1 cursor-pointer"
              role="slider"
              aria-label="Posisi video"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/20" />
              <span
                className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-purple-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <button
              onClick={toggleMute}
              className="p-1 transition-colors hover:text-purple-300"
              aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}