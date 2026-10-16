import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../story/kit';

// Tanggal ulang tahun (bulan mulai dari 0, jadi 0 = Januari)
const BIRTH_MONTH = 0;
const BIRTH_DAY = 10;

const INK = '#3d274f';
const PURPLE = '#795492';
const PAPER = '#fffaf2';

const pad = (v) => String(v).padStart(2, '0');

// Hitung ulang tahun berikutnya. Otomatis lompat ke tahun depan kalau sudah lewat.
function getState(now) {
  const isBirthday = now.getMonth() === BIRTH_MONTH && now.getDate() === BIRTH_DAY;

  let target = new Date(now.getFullYear(), BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  if (!isBirthday && now >= target) {
    target = new Date(now.getFullYear() + 1, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  }

  const diff = Math.max(0, target - now);
  const totalSec = Math.floor(diff / 1000);

  return {
    isBirthday,
    target,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

const CSS = `
.cd-hand{font-family:'Caveat','Segoe Script','Bradley Hand','Comic Sans MS',cursive;}
@keyframes cd-pop{0%{transform:translateY(-10px);opacity:0}100%{transform:none;opacity:1}}
@keyframes cd-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes cd-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
.cd-noise{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");}
@media (prefers-reduced-motion: reduce){.cd-anim{animation:none!important}}
`;

const float = (sec, delay = 0) => ({ animation: `cd-float ${sec}s ease-in-out ${delay}s infinite` });

/* ------------------------------------------------------------------ */
/* Stiker & hiasan                                                      */
/* ------------------------------------------------------------------ */

const Daisy = ({ className = '', style }) => (
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

const HeartS = ({ className = '', style, fill = '#f4a6bf' }) => (
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

const StarS = ({ className = '', style, fill = '#f6df9c' }) => (
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

const Leaf = ({ className = '', style }) => (
  <svg viewBox="0 0 40 80" className={className} style={style} aria-hidden="true">
    <path d="M20 78C4 56 4 24 20 2c16 22 16 54 0 76z" fill="#c5d6b6" stroke="#9db38d" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M20 8v66" stroke="#9db38d" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Squiggle = ({ className = '', color = '#e58aa8' }) => (
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

const Washi = ({ className = '', color = 'rgba(244,182,200,0.8)' }) => (
  <span
    aria-hidden="true"
    className={`absolute block ${className}`}
    style={{
      background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 14px), ${color}`,
      clipPath: TAPE_CLIP,
    }}
  />
);

// Untaian bendera (bunting) yang menjuntai di atas section
const FLAG_COLORS = ['#f4b6c8', '#cdbdf5', '#f6df9c', '#bfe3d0', '#fffdf8'];

function Bunting() {
  const flags = Array.from({ length: 15 }).map((_, k) => {
    const t = (k + 0.5) / 15;
    const x = t * 1200;
    const y = 14 + 160 * t * (1 - t);
    const angle = (Math.atan((160 * (1 - 2 * t)) / 1200) * 180) / Math.PI;
    return { x, y, angle, color: FLAG_COLORS[k % FLAG_COLORS.length] };
  });
  return (
    <svg
      viewBox="0 0 1200 130"
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-x-0 top-0 h-20 w-full md:h-28"
      aria-hidden="true"
    >
      <path d="M0 14 Q600 94 1200 14" fill="none" stroke="#a98bbd" strokeWidth="2" />
      {flags.map((f, k) => (
        <g key={k} transform={`rotate(${f.angle} ${f.x} ${f.y})`}>
          <path
            d={`M${f.x - 24} ${f.y} L${f.x + 24} ${f.y} L${f.x} ${f.y + 54} Z`}
            fill={f.color}
            stroke="#c9b7d8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}

// Konfeti kertas: [kiri%, atas%, warna, rotasi, lebar, tinggi]
const CONFETTI = [
  [8, 22, '#f4b6c8', 20, 10, 5],
  [16, 62, '#cdbdf5', -35, 9, 5],
  [27, 14, '#f6df9c', 50, 10, 4],
  [34, 80, '#bfe3d0', -15, 9, 5],
  [66, 18, '#cdbdf5', 30, 10, 5],
  [74, 74, '#f4b6c8', -45, 9, 4],
  [86, 30, '#f6df9c', 15, 10, 5],
  [92, 66, '#bfe3d0', 60, 9, 5],
];

function Backdrop() {
  const fade = 'radial-gradient(ellipse 60% 55% at 50% 52%, transparent 38%, #000 92%)';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* semburat warna lembut */}
      <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-purple-300/25 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#f4b6c8]/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_52%,rgba(255,246,230,0.9),transparent_72%)]" />

      {/* alas titik-titik, memudar ke tengah */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(121,84,146,.22) 1.2px, transparent 1.4px)',
          backgroundSize: '26px 26px',
          WebkitMaskImage: fade,
          maskImage: fade,
        }}
      />
      <div className="cd-noise absolute inset-0 opacity-[0.2] mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(98,66,120,0.12)_100%)]" />

      <Bunting />

      {/* konfeti kertas */}
      {CONFETTI.map(([l, t, c, r, w, h], k) => (
        <span
          key={k}
          className="absolute hidden rounded-[1px] md:block"
          style={{ left: `${l}%`, top: `${t}%`, width: w, height: h, background: c, rotate: `${r}deg` }}
        />
      ))}

      {/* bunga kering */}
      <div className="cd-anim absolute bottom-[8%] left-[3%] hidden md:block" style={float(9)}>
        <Leaf className="absolute -left-4 top-6 h-20 w-10 -rotate-[34deg]" />
        <Leaf className="absolute left-12 top-2 h-16 w-8 rotate-[26deg]" />
        <Daisy className="relative h-24 w-24 -rotate-12 drop-shadow-md" />
      </div>
      <div className="cd-anim absolute right-[4%] top-[26%] hidden lg:block" style={float(8, 1)}>
        <Leaf className="absolute -left-5 top-8 h-16 w-8 -rotate-[30deg]" />
        <Daisy className="relative h-20 w-20 rotate-[14deg] drop-shadow-md" />
      </div>

      <StarS className="cd-anim absolute left-[20%] top-[24%] hidden h-6 w-6 rotate-12 md:block" style={float(6)} />
      <StarS className="cd-anim absolute right-[22%] bottom-[14%] h-5 w-5 -rotate-12" style={float(7, 1)} fill="#f4b6c8" />
      <HeartS className="cd-anim absolute right-[12%] top-[18%] hidden h-6 w-6 rotate-12 md:block" style={float(7.5, 0.5)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kartu angka                                                          */
/* ------------------------------------------------------------------ */

const CARD_ROT = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
const TAPES = [
  'rgba(244,182,200,0.88)',
  'rgba(205,189,245,0.88)',
  'rgba(246,223,156,0.92)',
  'rgba(191,227,208,0.92)',
];

function Unit({ value, label, i, children }) {
  return (
    <div className={`relative ${CARD_ROT[i]}`}>
      <div
        className="relative px-1 pb-5 pt-9 text-center md:pb-8 md:pt-12"
        style={{
          background: PAPER,
          borderRadius: 2,
          boxShadow: '0 16px 24px -14px rgba(60,35,80,.5), 0 2px 4px rgba(60,35,80,.08)',
        }}
      >
        <div className="pointer-events-none absolute inset-[6px] rounded-[2px] border border-dashed border-purple-200 md:inset-[8px]" />
        <span
          key={value}
          className="cd-anim relative block font-display text-[clamp(2.2rem,8.4vw,5.4rem)] font-medium leading-none tabular-nums"
          style={{ color: INK, animation: 'cd-pop .5s ease-out' }}
        >
          {value}
        </span>
        <span
          className="cd-hand relative mt-2 block text-[clamp(1.05rem,3.2vw,1.7rem)] leading-none"
          style={{ color: PURPLE }}
        >
          {label}
        </span>
      </div>
      <Washi
        className="-top-3 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 md:-top-4 md:h-7 md:w-24"
        color={TAPES[i]}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

export default function BirthdayCountdown() {
  const ref = useRef(null);
  const [state, setState] = useState(() => getState(new Date()));
  useReveal(ref);

  useEffect(() => {
    const id = setInterval(() => setState(getState(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const dateText = state.target.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section
      id="countdown"
      ref={ref}
      className="relative overflow-hidden bg-paper-warm px-5 pb-28 pt-40 md:px-10 md:pb-40 md:pt-52"
    >
      <style>{CSS}</style>
      <Backdrop />

      <div className="relative mx-auto max-w-4xl text-center">
        {state.isBirthday ? (
          <>
            <HeartS
              className="cd-anim mx-auto mb-6 h-14 w-14 drop-shadow"
              style={{ animation: 'cd-beat 1.4s ease-in-out infinite' }}
            />
            <h2
              data-r
              className="font-display text-[clamp(2.6rem,7vw,5rem)] font-medium leading-[1.02] tracking-tight text-ink"
            >
              selamat ulang tahun!
            </h2>
            <Squiggle className="mx-auto mb-10 mt-4 w-32 md:w-44" />

            <div data-r className="relative mx-auto max-w-md -rotate-1">
              <div
                className="px-8 py-9 md:px-10 md:py-11"
                style={{
                  background: PAPER,
                  boxShadow: '0 18px 28px -16px rgba(60,35,80,.5), 0 2px 4px rgba(60,35,80,.08)',
                }}
              >
                <p className="text-sm leading-relaxed text-ink-soft md:text-base">
                  Hari ini hari kamu. Semoga semua yang kamu harapin pelan-pelan jadi nyata, dan
                  aku masih jadi bagian dari harinya.
                </p>
              </div>
              <Washi className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2" color="rgba(244,182,200,0.88)" />
              <Daisy className="absolute -bottom-6 -right-6 h-16 w-16 rotate-12 drop-shadow-md" />
            </div>
          </>
        ) : (
          <>
            <h2
              data-r
              className="font-display text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-[1.05] tracking-tight text-ink"
            >
              hitung mundur ke hari spesialmu
            </h2>
            <Squiggle className="mx-auto mt-4 w-32 md:w-44" />
            <p data-r className="mx-auto mb-14 mt-5 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
              Tinggal sebentar lagi sampai{' '}
              <span
                className="cd-hand px-1 text-[1.5em] leading-none"
                style={{
                  color: INK,
                  background: 'linear-gradient(transparent 55%, rgba(246,223,156,0.95) 55%)',
                  WebkitBoxDecorationBreak: 'clone',
                  boxDecorationBreak: 'clone',
                }}
              >
                {dateText}
              </span>
            </p>

            <div
              data-r
              className="mx-auto grid max-w-3xl grid-cols-4 gap-3 md:gap-7"
              role="timer"
              aria-live="off"
            >
              <Unit i={0} value={state.days} label="hari">
                <Daisy className="absolute -left-3 -top-5 h-9 w-9 -rotate-12 drop-shadow md:-left-5 md:-top-7 md:h-14 md:w-14" />
              </Unit>
              <Unit i={1} value={pad(state.hours)} label="jam" />
              <Unit i={2} value={pad(state.minutes)} label="menit" />
              <Unit i={3} value={pad(state.seconds)} label="detik">
                <HeartS
                  className="cd-anim absolute -bottom-3 -right-2 h-7 w-7 rotate-12 drop-shadow md:-bottom-4 md:-right-4 md:h-10 md:w-10"
                  style={{ animation: 'cd-beat 1.2s ease-in-out infinite' }}
                />
              </Unit>
            </div>

            <p data-r className="cd-hand mt-14 text-xl md:text-2xl" style={{ color: PURPLE }}>
              dihitung sampai jam 00.00, pas harinya tiba
            </p>
          </>
        )}
      </div>
    </section>
  );
}