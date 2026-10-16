// Hiasan scrapbook yang dipakai bareng: MomentsScene & VideoPlayerModal.
// Taruh di src/components/story/scrap.jsx

export const INK = '#3d274f';
export const PURPLE = '#795492';
export const PAPER = '#fffaf2';

// Tulisan tangan (Caveat sudah ke-load di website)
export const HAND = "font-['Caveat','Segoe_Script','Bradley_Hand',cursive]";

// Serat kertas halus
export const NOISE = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
};

export const TAPES = [
  'rgba(244,182,200,0.88)',
  'rgba(205,189,245,0.88)',
  'rgba(246,223,156,0.92)',
  'rgba(191,227,208,0.92)',
];

export const Daisy = ({ className = '', style }) => (
  <svg viewBox="-50 -50 100 100" className={className} style={style} aria-hidden="true">
    {Array.from({ length: 8 }).map((_, k) => (
      <ellipse
        key={k}
        cx="0"
        cy="-27"
        rx="10"
        ry="20"
        fill="#fffdf8"
        stroke="#d9cfe8"
        strokeWidth="1.5"
        transform={`rotate(${k * 45})`}
      />
    ))}
    <circle r="11" fill="#f6c85f" stroke="#e0a93a" strokeWidth="1.5" />
  </svg>
);

export const HeartS = ({ className = '', style, fill = '#f4a6bf' }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.4 4.5c2.1 0 3.6 1.1 5.6 3.3 2-2.2 3.5-3.3 5.6-3.3 3.7 0 5.5 3.9 4 7.3C19.5 16.4 12 21 12 21z"
      fill={fill}
      stroke="#c96b8f"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

export const StarS = ({ className = '', style, fill = '#f6df9c' }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <path
      d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.3l7.1-.7z"
      fill={fill}
      stroke="#d9b24c"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

export const Leaf = ({ className = '', style }) => (
  <svg viewBox="0 0 40 80" className={className} style={style} aria-hidden="true">
    <path d="M20 78C4 56 4 24 20 2c16 22 16 54 0 76z" fill="#c5d6b6" stroke="#9db38d" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M20 8v66" stroke="#9db38d" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const Squiggle = ({ className = '', color = '#e58aa8' }) => (
  <svg viewBox="0 0 104 10" className={className} fill="none" aria-hidden="true">
    <path
      d="M2 5 Q 8 0 14 5 T 26 5 T 38 5 T 50 5 T 62 5 T 74 5 T 86 5 T 98 5"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

const TAPE_CLIP =
  'polygon(0 0,4% 12%,0 25%,4% 38%,0 50%,4% 62%,0 75%,4% 88%,0 100%,100% 100%,96% 88%,100% 75%,96% 62%,100% 50%,96% 38%,100% 25%,96% 12%,100% 0)';

export const Washi = ({ className = '', color = 'rgba(244,182,200,0.8)' }) => (
  <span
    aria-hidden="true"
    className={`absolute block ${className}`}
    style={{
      background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 14px), ${color}`,
      clipPath: TAPE_CLIP,
    }}
  />
);

/* ================================================================== */
/* Tambahan: latar meja scrapbook untuk section Momen                  */
/* ================================================================== */

// Tepi kertas sobek
export const TORN_CLIP =
  'polygon(0 3%,6% 0,14% 3%,24% 0,36% 2%,48% 0,60% 3%,72% 0,84% 2%,94% 0,100% 3%,100% 97%,92% 100%,80% 97%,68% 100%,54% 98%,42% 100%,30% 97%,18% 100%,8% 98%,0 100%)';

// Keyframes melayang pelan (nama sama dengan yang di ScrapbookScene, aman dobel)
const FLOAT_CSS = `
@keyframes sb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@media (prefers-reduced-motion: reduce){.sb-anim{animation:none!important}}
`;
export const ScrapStyles = () => <style>{FLOAT_CSS}</style>;

export const float = (sec, delay = 0) => ({
  animation: `sb-float ${sec}s ease-in-out ${delay}s infinite`,
});

export function MomentsBackdrop({ note = 'klik kartunya, nanti videonya main' }) {
  const fade = 'radial-gradient(ellipse 62% 58% at 50% 50%, transparent 40%, #000 90%)';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* cahaya lampu meja */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_55%,rgba(248,236,214,0.95),transparent_72%)]" />

      {/* semburat warna lembut */}
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-[#f4b6c8]/30 blur-3xl" />

      {/* alas titik-titik ala bullet journal */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(121,84,146,.22) 1.2px, transparent 1.4px)',
          backgroundSize: '26px 26px',
          WebkitMaskImage: fade,
          maskImage: fade,
        }}
      />

      {/* serat kertas + vinyet tepi */}
      <div className="absolute inset-0 opacity-[0.22] mix-blend-multiply" style={NOISE} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(98,66,120,0.14)_100%)]" />

      {/* bunga kanan atas */}
      <div className="sb-anim absolute right-[3%] top-[5%]" style={float(8)}>
        <Leaf className="absolute -left-4 top-10 h-24 w-12 -rotate-[28deg]" />
        <Leaf className="absolute left-14 top-8 h-20 w-10 rotate-[32deg]" />
        <Daisy className="relative h-20 w-20 rotate-12 drop-shadow-md md:h-28 md:w-28" />
        <Daisy className="absolute -left-10 top-20 hidden h-14 w-14 -rotate-[24deg] drop-shadow md:block" />
      </div>

      {/* bunga kiri bawah */}
      <div className="sb-anim absolute bottom-[4%] left-[3%]" style={float(9, 1.2)}>
        <Leaf className="absolute -left-6 top-6 h-20 w-10 -rotate-[38deg]" />
        <Leaf className="absolute left-12 top-2 h-16 w-8 rotate-[24deg]" />
        <Daisy className="relative h-16 w-16 -rotate-[10deg] drop-shadow-md md:h-24 md:w-24" />
      </div>

      {/* washi tape di sudut */}
      <Washi className="-left-10 top-10 hidden h-8 w-44 -rotate-[34deg] md:block" color={TAPES[1]} />
      <Washi className="-right-12 bottom-12 hidden h-8 w-44 rotate-[32deg] md:block" color={TAPES[0]} />

      {/* sticky note kanan atas */}
      <div className="sb-anim absolute right-[14%] top-[9%] hidden w-44 -rotate-[3deg] xl:block" style={float(7, 0.6)}>
        <div className="bg-[#fbeaa9] px-4 pb-5 pt-6 shadow-[0_8px_16px_-6px_rgba(60,35,80,0.4)]">
        <p className={`${HAND} text-xl leading-tight`} style={{ color: INK }}>
            {note}
          </p>
        </div>
        <Washi className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-3" color={TAPES[0]} />
      </div>

      {/* bintang & hati kecil berserakan */}
      <StarS className="sb-anim absolute left-[8%] top-[16%] hidden h-6 w-6 rotate-12 md:block" style={float(6)} />
      <StarS className="sb-anim absolute right-[30%] top-[6%] h-5 w-5 -rotate-12" style={float(7, 1)} fill="#f4b6c8" />
      <HeartS className="sb-anim absolute left-[14%] top-[40%] hidden h-6 w-6 -rotate-12 md:block" style={float(8, 0.4)} />
      <HeartS className="sb-anim absolute bottom-[12%] right-[10%] hidden h-7 w-7 rotate-12 md:block" style={float(7.5, 2)} />
      <StarS className="sb-anim absolute bottom-[7%] right-[34%] h-5 w-5 rotate-6" style={float(6.5, 1.6)} />
      <StarS className="sb-anim absolute left-[40%] top-[38%] hidden h-5 w-5 -rotate-6 md:block" style={float(9, 0.8)} fill="#cdbdf5" />
    </div>
  );
}