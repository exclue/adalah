import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { animate, stagger } from 'animejs';
import { ChevronDown, X } from 'lucide-react';
import { bouquetLetters, diaryTitle } from '../../data/messages';
import { playChime, playPop } from '../../utils/sound';
import { clamp, mix, prefersReduced } from '../story/kit';
import {
  HAND,
  INK as SCRAP_INK,
  NOISE as SCRAP_NOISE,
  TAPES,
  HeartS,
  StarS,
  Squiggle,
  Washi,
  Daisy as StickerDaisy,
  ScrapStyles,
  MomentsBackdrop,
} from '../story/scrap';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Font surat. Mau ganti? Ubah dua baris ini + FONT_HREF.
const TITLE_FONT = "'Great Vibes', 'Snell Roundhand', cursive";
const BODY_FONT = "'La Belle Aurore', 'Segoe Script', cursive";
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=La+Belle+Aurore&display=swap';

const INK = '#3a2a22';
const NOTE_ROT = 11;
const PIVOT = { x: 200, y: 418 };

/* ---------------- Pengaturan tampilan scrapbook ---------------- */
const TITLE_TEXT = 'buket buat kamu';
const STICKY_TEXT = 'geser, terus buka secarik kertasnya ya';
const HINT_TEXT = 'geser buketnya, terus ketuk secarik kertas yang terselip';
// Caption per buket, urutannya sama dengan BOUQUETS
const CAPTIONS = [
  'mawar merah, buat yang susah diucap',
  'kuncup yang pelan-pelan mekar',
  'manis, ringan, dan hangat',
];
// Ruang yang disisakan di layar buat judul, caption, dan titik (makin besar = buket makin kecil)
const SW_RESERVE = 240;
const SW_MAX = 560; // lebar maksimal satu buket (px)
const SW_VW = 88; // lebar maksimal buket (% lebar layar), berpengaruh di HP
/* ---------------------------------------------------------------- */

const mulberry = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f2 = (n) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Isi tiap buket (posisi bunga ada di sini, bisa kamu geser-geser)     */
/* t: rose | tulipW | iris | bud | peony | daisy | tulipP | baby        */
/* ------------------------------------------------------------------ */

const BOUQUETS = [
  {
    id: 'b1',
    k: 1, // 1 = kertas ivory + pita wine
    flowers: [
      { t: 'tulipW', x: 200, y: 76, s: 1.15, r: 0, seed: 11, lf: 'blade' },
      { t: 'tulipW', x: 122, y: 118, s: 1.05, r: -14, seed: 12 },
      { t: 'tulipW', x: 284, y: 126, s: 1.05, r: 13, seed: 13, lf: 'blade' },
      { t: 'iris', x: 62, y: 204, s: 1.05, r: -18, seed: 14, lf: 'blade' },
      { t: 'iris', x: 338, y: 212, s: 1.05, r: 16, seed: 15 },
      { t: 'rose', x: 200, y: 208, s: 1.32, r: 0, seed: 16, lf: 'broad' },
      { t: 'rose', x: 128, y: 274, s: 1.12, r: 0, seed: 17, lf: 'broad' },
      { t: 'rose', x: 278, y: 280, s: 1.12, r: 0, seed: 18 },
    ],
    euc: [
      [34, 152],
      [366, 160],
      [160, 36],
      [248, 44],
    ],
  },
  {
    id: 'b2',
    k: 2, // kertas dusty rose + pita champagne
    flowers: [
      { t: 'bud', x: 200, y: 84, s: 1.25, r: 3, seed: 21, lf: 'broad' },
      { t: 'bud', x: 112, y: 136, s: 1.15, r: -24, seed: 22 },
      { t: 'bud', x: 292, y: 144, s: 1.15, r: 22, seed: 23, lf: 'broad' },
      { t: 'daisy', x: 156, y: 150, s: 0.9, r: 0, seed: 24 },
      { t: 'daisy', x: 48, y: 206, s: 1.0, r: 0, seed: 25 },
      { t: 'daisy', x: 354, y: 214, s: 1.0, r: 0, seed: 26 },
      { t: 'peony', x: 200, y: 204, s: 1.4, r: 0, seed: 27, lf: 'broad' },
      { t: 'peony', x: 120, y: 276, s: 1.18, r: 0, seed: 28 },
      { t: 'daisy', x: 284, y: 272, s: 1.05, r: 0, seed: 29, lf: 'broad' },
    ],
    euc: [
      [30, 168],
      [370, 176],
      [150, 40],
      [256, 48],
    ],
  },
  {
    id: 'b3',
    k: 3, // kertas sage + pita mauve
    flowers: [
      { t: 'tulipP', x: 205, y: 72, s: 1.15, r: 2, seed: 31, lf: 'blade' },
      { t: 'tulipP', x: 118, y: 128, s: 1.05, r: -14, seed: 32 },
      { t: 'tulipP', x: 292, y: 136, s: 1.05, r: 13, seed: 33, lf: 'blade' },
      { t: 'daisy', x: 58, y: 214, s: 1.0, r: 0, seed: 34 },
      { t: 'daisy', x: 346, y: 216, s: 1.0, r: 0, seed: 35 },
      { t: 'daisy', x: 140, y: 178, s: 0.92, r: 0, seed: 36 },
      { t: 'daisy', x: 262, y: 186, s: 0.92, r: 0, seed: 37 },
      { t: 'baby', c: 'pink', x: 200, y: 222, s: 1.4, r: 0, seed: 41, lf: 'broad' },
      { t: 'baby', c: 'pink', x: 160, y: 252, s: 1.35, r: 0, seed: 42 },
      { t: 'baby', c: 'peach', x: 242, y: 250, s: 1.35, r: 0, seed: 43, lf: 'broad' },
      { t: 'baby', c: 'peach', x: 124, y: 286, s: 1.3, r: 0, seed: 44 },
      { t: 'baby', c: 'pink', x: 204, y: 292, s: 1.4, r: 0, seed: 45 },
      { t: 'baby', c: 'pink', x: 278, y: 296, s: 1.3, r: 0, seed: 46 },
    ],
    euc: [
      [34, 150],
      [366, 158],
      [158, 34],
      [252, 40],
    ],
  },
];

const BASE_LEAVES = [
  { k: 'blade', x: 178, y: 372, r: -36, s: 1.25 },
  { k: 'blade', x: 222, y: 372, r: 34, s: 1.25 },
  { k: 'broad', x: 150, y: 368, r: -64, s: 1.5 },
  { k: 'broad', x: 250, y: 368, r: 64, s: 1.5 },
  { k: 'broad', x: 200, y: 364, r: 0, s: 1.35 },
];

/* ------------------------------------------------------------------ */
/* Gradient & filter bersama (didefinisikan sekali)                    */
/* ------------------------------------------------------------------ */

// dir: up (pangkal -> ujung ke atas), down, diag
const GRADS = [
  ['g-rose-a', 'up', [[0, '#3d040d'], [0.35, '#7d0c1b'], [0.8, '#b81f33'], [1, '#d4404f']]],
  ['g-rose-b', 'up', [[0, '#2c0309'], [0.5, '#5f0915'], [1, '#9a1426']]],
  ['g-twhite-front', 'up', [[0, '#d3dbc2'], [0.3, '#f1ede5'], [1, '#ffffff']]],
  ['g-twhite-side', 'up', [[0, '#bfc4b0'], [0.4, '#e0dbd0'], [1, '#f3efe8']]],
  ['g-tpink-front', 'up', [[0, '#d9728f'], [0.4, '#f2a8bb'], [1, '#fde0e8']]],
  ['g-tpink-side', 'up', [[0, '#c0566f'], [0.5, '#e48ca3'], [1, '#f6c4d0']]],
  ['g-iris-fall', 'down', [[0, '#eee6fa'], [0.22, '#8068d4'], [1, '#33237d']]],
  ['g-iris-std', 'up', [[0, '#5b47b8'], [1, '#b4a7f1']]],
  ['g-peony-a', 'up', [[0, '#d2607e'], [0.5, '#f0a1b5'], [1, '#fde6ec']]],
  ['g-peony-b', 'up', [[0, '#b83e63'], [1, '#ee94ac']]],
  ['g-bud', 'up', [[0, '#5c0b22'], [0.55, '#a81d3d'], [1, '#dd5870']]],
  ['g-bud-b', 'up', [[0, '#7a1230'], [1, '#e8788b']]],
  ['g-br-pink', 'up', [[0, '#c94a72'], [0.6, '#ef93ae'], [1, '#fcd0dc']]],
  ['g-br-peach', 'up', [[0, '#d97c63'], [0.6, '#f5b49a'], [1, '#fde0d0']]],
  ['g-daisy', 'up', [[0, '#d8cfc2'], [0.4, '#f6f2ec'], [1, '#ffffff']]],
  ['g-leaf', 'up', [[0, '#173d2c'], [0.5, '#2f6a4a'], [1, '#68a883']]],
  ['g-euc', 'up', [[0, '#587a6c'], [1, '#a3c2b5']]],
  ['g-note', 'diag', [[0, '#fbf3e1'], [1, '#e8d8b6']]],
  // kertas pembungkus (back, front) dan pita per buket
  ['g-wrap-back-1', 'diag', [[0, '#a8946d'], [1, '#cdbd9c']]],
  ['g-wrap-front-1', 'diag', [[0, '#fbf4e4'], [1, '#d8c9a8']]],
  ['g-rib-1', 'diag', [[0, '#4f0a1d'], [0.5, '#a31d3d'], [1, '#5e0d23']]],
  ['g-wrap-back-2', 'diag', [[0, '#a8677a'], [1, '#cb96a4']]],
  ['g-wrap-front-2', 'diag', [[0, '#f5d3d8'], [1, '#cb97a3']]],
  ['g-rib-2', 'diag', [[0, '#cdb68a'], [0.5, '#f7edd4'], [1, '#c9b183']]],
  ['g-wrap-back-3', 'diag', [[0, '#6f866c'], [1, '#9bb097']]],
  ['g-wrap-front-3', 'diag', [[0, '#dfe8d6'], [1, '#a2b79d']]],
  ['g-rib-3', 'diag', [[0, '#7e405a'], [0.5, '#c88aa3'], [1, '#8a4a65']]],
];

const DIRS = {
  up: { x1: 0, y1: 1, x2: 0, y2: 0 },
  down: { x1: 0, y1: 0, x2: 0, y2: 1 },
  diag: { x1: 0, y1: 0, x2: 1, y2: 1 },
};

function SharedDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute"
    >
      <defs>
        {GRADS.map(([id, dir, stops]) => (
          <linearGradient key={id} id={id} {...DIRS[dir]}>
            {stops.map(([o, c]) => (
              <stop key={o} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        ))}
        <radialGradient id="g-dcenter" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.6" stopColor="#f2b032" />
          <stop offset="1" stopColor="#b8730f" />
        </radialGradient>
        <radialGradient id="g-shadow">
          <stop offset="0" stopColor="#2e2138" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2e2138" stopOpacity="0" />
        </radialGradient>
        {/* Bikin tepi bunga sedikit tidak simetris biar terasa dilukis */}
        <filter id="f-organic" filterUnits="userSpaceOnUse" x="-20" y="-20" width="440" height="580">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="3.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Kepala bunga (digambar di sekitar 0,0)                              */
/* ------------------------------------------------------------------ */

const cupPath = (len, w) =>
  `M0,0 C${f2(-w * 0.5)},${f2(-len * 0.18)} ${f2(-w * 1.25)},${f2(-len * 0.55)} ${f2(-w * 0.8)},${f2(-len * 0.92)} Q0,${f2(-len * 1.12)} ${f2(w * 0.8)},${f2(-len * 0.92)} C${f2(w * 1.25)},${f2(-len * 0.55)} ${f2(w * 0.5)},${f2(-len * 0.18)} 0,0Z`;
const lipPath = (len, w) =>
  `M${f2(-w * 0.8)},${f2(-len * 0.92)} Q0,${f2(-len * 1.12)} ${f2(w * 0.8)},${f2(-len * 0.92)}`;

const ROSE_RINGS = [
  { n: 5, len: 33, w: 17, fill: 'url(#g-rose-a)' },
  { n: 5, len: 27, w: 15, fill: 'url(#g-rose-a)' },
  { n: 4, len: 21, w: 12.5, fill: 'url(#g-rose-b)' },
  { n: 3, len: 14, w: 9.5, fill: 'url(#g-rose-b)' },
];
const BABY_PINK = [
  { n: 5, len: 15, w: 8.5, fill: 'url(#g-br-pink)' },
  { n: 4, len: 11, w: 7, fill: 'url(#g-br-pink)' },
  { n: 3, len: 7.5, w: 5, fill: 'url(#g-br-pink)' },
];
const BABY_PEACH = BABY_PINK.map((r) => ({ ...r, fill: 'url(#g-br-peach)' }));

function RoseLike({ seed, rings, lip, edge, core }) {
  const petals = useMemo(() => {
    const r = mulberry(seed);
    let off = r() * 72;
    const out = [];
    rings.forEach((ring, ri) => {
      off += 22 + r() * 22;
      for (let k = 0; k < ring.n; k++) {
        out.push({
          key: `${ri}-${k}`,
          ang: off + (360 / ring.n) * k + (r() - 0.5) * 14,
          len: ring.len * (0.92 + r() * 0.16),
          w: ring.w * (0.92 + r() * 0.16),
          fill: ring.fill,
        });
      }
    });
    return out;
  }, [seed, rings]);

  const big = rings[0].len;
  return (
    <g>
      <circle r={big * 1.25} cy={big * 0.1} fill="url(#g-shadow)" />
      {petals.map((p) => (
        <g key={p.key} transform={`rotate(${f2(p.ang)})`}>
          <path d={cupPath(p.len, p.w)} fill={p.fill} stroke={edge} strokeWidth="0.6" />
          <path
            d={lipPath(p.len, p.w)}
            fill="none"
            stroke={lip}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
      ))}
      {core}
    </g>
  );
}

const roseCore = (
  <g>
    <circle r="3.4" fill="#3a040c" />
    <path
      d="M0,-1 C3,-5 7,-1 4,4 C1,8 -6,5 -4,-1 C-3,-4 1,-5 2,-3"
      fill="none"
      stroke="rgba(20,0,5,.55)"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </g>
);

const Rose = ({ seed }) => (
  <RoseLike
    seed={seed}
    rings={ROSE_RINGS}
    lip="rgba(255,170,175,.5)"
    edge="rgba(40,0,8,.35)"
    core={roseCore}
  />
);

const BabyRose = ({ seed, c }) => (
  <RoseLike
    seed={seed}
    rings={c === 'peach' ? BABY_PEACH : BABY_PINK}
    lip="rgba(255,240,240,.65)"
    edge="rgba(110,30,50,.28)"
    core={<circle r="1.8" fill={c === 'peach' ? '#b4543c' : '#9c2f55'} />}
  />
);

function Tulip({ pal }) {
  const front = `url(#g-t${pal}-front)`;
  const side = `url(#g-t${pal}-side)`;
  const edge = pal === 'white' ? 'rgba(90,75,65,.22)' : 'rgba(110,30,55,.28)';
  return (
    <g>
      <ellipse cy="4" rx="26" ry="34" fill="url(#g-shadow)" />
      <path
        d="M-6,-32 C-21,-24 -23,6 -12,23 C-7,29 7,29 12,23 C23,6 21,-24 6,-32 Z"
        fill={side}
        stroke={edge}
        strokeWidth="0.6"
      />
      <path
        d="M-3,-36 C-19,-27 -26,2 -16,21 C-11,28 -3,29 1,26 C-5,8 -7,-17 -3,-36Z"
        fill={side}
        stroke={edge}
        strokeWidth="0.6"
      />
      <path
        d="M3,-36 C19,-27 26,2 16,21 C11,28 3,29 -1,26 C5,8 7,-17 3,-36Z"
        fill={side}
        stroke={edge}
        strokeWidth="0.6"
      />
      <path
        d="M0,-38 C-12,-27 -17,-2 -11,18 C-7,27 7,27 11,18 C17,-2 12,-27 0,-38Z"
        fill={front}
        stroke={edge}
        strokeWidth="0.7"
      />
      <path
        d="M-5,-24 C-9,-12 -9,0 -6,10"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M0,-34 C2,-14 2,6 0,24" fill="none" stroke={edge} strokeWidth="0.8" />
    </g>
  );
}

function Iris({ seed }) {
  const r = useMemo(() => mulberry(seed), [seed]);
  const std = (ang, len, w) => (
    <path
      key={`s${ang}`}
      transform={`rotate(${ang})`}
      d={`M0,0 C${-w},${-len * 0.25} ${-w * 1.05},${-len * 0.8} 0,${-len} C${w * 1.05},${-len * 0.8} ${w},${-len * 0.25} 0,0Z`}
      fill="url(#g-iris-std)"
      stroke="rgba(30,20,90,.3)"
      strokeWidth="0.6"
    />
  );
  const fall = (ang, len, w) => (
    <g key={`f${ang}`} transform={`rotate(${f2(ang + (r() - 0.5) * 6)})`}>
      <path
        d={`M0,0 C${-w * 0.7},${len * 0.2} ${-w * 1.35},${len * 0.6} ${-w * 0.8},${len * 0.95} Q0,${len * 1.12} ${w * 0.8},${len * 0.95} C${w * 1.35},${len * 0.6} ${w * 0.7},${len * 0.2} 0,0Z`}
        fill="url(#g-iris-fall)"
        stroke="rgba(25,15,80,.35)"
        strokeWidth="0.6"
      />
      {[-4, -1.5, 1.5, 4].map((v) => (
        <path
          key={v}
          d={`M0,3 Q${v},${len * 0.4} ${v * 2},${len * 0.82}`}
          fill="none"
          stroke="rgba(240,232,255,.32)"
          strokeWidth="0.7"
        />
      ))}
      <path d={`M0,3 L0,${len * 0.55}`} stroke="#f1ae1f" strokeWidth="3.2" strokeLinecap="round" />
      <path d={`M0,3 L0,${len * 0.48}`} stroke="#fff1b8" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <circle r="42" cy="4" fill="url(#g-shadow)" />
      {std(-26, 38, 10)}
      {std(26, 38, 10)}
      {std(0, 46, 11)}
      {fall(62, 34, 13)}
      {fall(-62, 34, 13)}
      {fall(0, 36, 13.5)}
    </g>
  );
}

function Daisy({ seed }) {
  const { back, front, dots } = useMemo(() => {
    const r = mulberry(seed);
    const n = 17;
    const mk = (offset, len0, w0) =>
      Array.from({ length: n }, (_, k) => {
        const len = len0 * (0.88 + r() * 0.22);
        const w = w0 * (0.9 + r() * 0.2);
        const tx = (r() - 0.5) * 3;
        return {
          ang: offset + (360 / n) * k + (r() - 0.5) * 8,
          d: `M0,0 C${f2(-w)},${f2(-len * 0.3)} ${f2(-w * 1.05)},${f2(-len * 0.85)} ${f2(tx)},${f2(-len)} C${f2(w * 1.05)},${f2(-len * 0.85)} ${f2(w)},${f2(-len * 0.3)} 0,0Z`,
        };
      });
    const dts = Array.from({ length: 24 }, (_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const rad = Math.sqrt(i + 1) * 1.25;
      return [f2(Math.cos(a) * rad), f2(Math.sin(a) * rad)];
    });
    return { back: mk(0, 26, 3.7), front: mk(360 / n / 2, 24, 3.5), dots: dts };
  }, [seed]);

  return (
    <g>
      <circle r="32" fill="url(#g-shadow)" />
      {back.map((p, i) => (
        <path
          key={`b${i}`}
          transform={`rotate(${f2(p.ang)})`}
          d={p.d}
          fill="#e2d9cc"
          stroke="rgba(120,100,90,.25)"
          strokeWidth="0.5"
        />
      ))}
      {front.map((p, i) => (
        <path
          key={`f${i}`}
          transform={`rotate(${f2(p.ang)})`}
          d={p.d}
          fill="url(#g-daisy)"
          stroke="rgba(120,100,90,.22)"
          strokeWidth="0.5"
        />
      ))}
      <circle r="8" fill="#a9640a" opacity="0.5" />
      <circle r="6.6" fill="url(#g-dcenter)" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.75" fill="rgba(110,60,5,.55)" />
      ))}
    </g>
  );
}

const PEONY_RINGS = [
  { n: 8, len: 36, w: 18, fill: 'url(#g-peony-a)' },
  { n: 7, len: 30, w: 16, fill: 'url(#g-peony-a)' },
  { n: 6, len: 24, w: 14, fill: 'url(#g-peony-a)' },
  { n: 5, len: 17, w: 11, fill: 'url(#g-peony-b)' },
  { n: 4, len: 10, w: 8, fill: 'url(#g-peony-b)' },
];

function Peony({ seed }) {
  const petals = useMemo(() => {
    const r = mulberry(seed);
    const ruff = (len, w) => {
      const bumps = 4;
      const span = 2 * w * 0.95;
      let d = `M0,0 C${f2(-w * 0.9)},${f2(-len * 0.15)} ${f2(-w * 1.3)},${f2(-len * 0.5)} ${f2(-w * 0.95)},${f2(-len * 0.82)}`;
      for (let i = 0; i < bumps; i++) {
        const x0 = -w * 0.95 + (i * span) / bumps;
        const x1 = x0 + span / bumps;
        const cy = -len * (1.1 + r() * 0.1);
        const ey = -len * (0.86 + r() * 0.08);
        d += ` Q${f2((x0 + x1) / 2)},${f2(cy)} ${f2(x1)},${f2(ey)}`;
      }
      d += ` C${f2(w * 1.3)},${f2(-len * 0.5)} ${f2(w * 0.9)},${f2(-len * 0.15)} 0,0Z`;
      return d;
    };
    let off = r() * 60;
    const out = [];
    PEONY_RINGS.forEach((ring, ri) => {
      off += 20 + r() * 20;
      for (let k = 0; k < ring.n; k++) {
        const len = ring.len * (0.92 + r() * 0.16);
        const w = ring.w * (0.92 + r() * 0.16);
        out.push({
          key: `${ri}-${k}`,
          ang: off + (360 / ring.n) * k + (r() - 0.5) * 12,
          d: ruff(len, w),
          fill: ring.fill,
          crease: `M0,${f2(-len * 0.15)} Q${f2((r() - 0.5) * 8)},${f2(-len * 0.5)} 0,${f2(-len * 0.82)}`,
        });
      }
    });
    return out;
  }, [seed]);

  return (
    <g>
      <circle r="46" cy="3" fill="url(#g-shadow)" />
      {petals.map((p) => (
        <g key={p.key} transform={`rotate(${f2(p.ang)})`}>
          <path d={p.d} fill={p.fill} stroke="rgba(150,40,80,.3)" strokeWidth="0.6" />
          <path d={p.crease} fill="none" stroke="rgba(190,70,105,.28)" strokeWidth="0.8" />
        </g>
      ))}
      <circle r="2.2" fill="#a52f55" />
    </g>
  );
}

function Bud() {
  return (
    <g>
      <circle r="32" cy="2" fill="url(#g-shadow)" />
      <path
        d="M0,-36 C-15,-28 -19,-4 -11,13 C-6,22 6,22 11,13 C19,-4 15,-28 0,-36Z"
        fill="url(#g-bud)"
        stroke="rgba(30,0,8,.4)"
        strokeWidth="0.7"
      />
      <path
        d="M-1,-36 C11,-27 17,-6 9,12 C4,19 -4,20 -8,14 C-3,4 -2,-14 -1,-36Z"
        fill="url(#g-bud-b)"
        opacity="0.92"
      />
      <path d="M-1,-35 C5,-22 7,-6 3,12" fill="none" stroke="rgba(30,0,8,.45)" strokeWidth="1" />
      <path
        d="M-9,-14 C-6,-4 -4,6 -3,14"
        fill="none"
        stroke="rgba(255,170,185,.4)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M-2,16 C-14,14 -26,20 -32,34 C-20,32 -10,28 -2,16Z" fill="url(#g-leaf)" />
      <path d="M2,16 C14,14 26,20 32,34 C20,32 10,28 2,16Z" fill="url(#g-leaf)" />
      <path d="M0,18 C-4,26 -4,36 0,44 C4,36 4,26 0,18Z" fill="url(#g-leaf)" />
    </g>
  );
}

function Flower({ f }) {
  switch (f.t) {
    case 'rose':
      return <Rose seed={f.seed} />;
    case 'baby':
      return <BabyRose seed={f.seed} c={f.c} />;
    case 'tulipW':
      return <Tulip pal="white" />;
    case 'tulipP':
      return <Tulip pal="pink" />;
    case 'iris':
      return <Iris seed={f.seed} />;
    case 'daisy':
      return <Daisy seed={f.seed} />;
    case 'peony':
      return <Peony seed={f.seed} />;
    default:
      return <Bud />;
  }
}

/* ------------------------------------------------------------------ */
/* Daun, batang, eucalyptus                                            */
/* ------------------------------------------------------------------ */

const LEAF_BROAD = 'M0,0 C-11,-10 -15,-28 0,-48 C15,-28 11,-10 0,0Z';
const LEAF_BLADE = 'M0,0 C8,-26 6,-64 -6,-98 C-12,-64 -10,-26 0,0Z';

function Leaf({ k }) {
  return (
    <>
      <path d={k === 'blade' ? LEAF_BLADE : LEAF_BROAD} fill="url(#g-leaf)" />
      <path
        d={k === 'blade' ? 'M0,0 C2,-30 0,-64 -5,-92' : 'M0,0 C1,-16 1,-32 0,-44'}
        fill="none"
        stroke="rgba(255,255,255,.2)"
        strokeWidth="0.9"
      />
    </>
  );
}

const quad = (p0, c, p1, t) => ({
  x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x,
  y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y,
});

function Euc({ tip }) {
  const [tx, ty] = tip;
  const c = { x: PIVOT.x + (tx - PIVOT.x) * 0.2, y: (PIVOT.y + ty) / 2 + 30 };
  const p1 = { x: tx, y: ty };
  const leaves = [0.4, 0.52, 0.64, 0.76, 0.88, 1].map((t, i) => {
    const p = quad(PIVOT, c, p1, t);
    const dx = 2 * (1 - t) * (c.x - PIVOT.x) + 2 * t * (tx - c.x);
    const dy = 2 * (1 - t) * (c.y - PIVOT.y) + 2 * t * (ty - c.y);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    const tipLeaf = t === 1;
    const side = i % 2 ? 1 : -1;
    return {
      key: t,
      x: f2(p.x),
      y: f2(p.y),
      rot: f2(tipLeaf ? a - 90 : a + side * 52 - 90),
      rx: tipLeaf ? 7 : 8.5,
      ry: tipLeaf ? 10 : 11,
    };
  });
  return (
    <g>
      <path
        data-stem
        d={`M${PIVOT.x},${PIVOT.y} Q${f2(c.x)},${f2(c.y)} ${tx},${ty}`}
        pathLength="1"
        fill="none"
        stroke="#6b8f7f"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{ strokeDasharray: 1 }}
      />
      {leaves.map((l) => (
        <ellipse
          key={l.key}
          data-leaf
          cx="0"
          cy={l.ry}
          rx={l.rx}
          ry={l.ry}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
          fill="url(#g-euc)"
          stroke="rgba(30,60,50,.25)"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Kertas pembungkus + pita (lapisan depan)                             */
/* ------------------------------------------------------------------ */

const BACK_SHEET =
  'M72,336 C120,322 160,338 200,352 C240,338 280,322 328,336 L250,508 Q200,520 150,508Z';

function WrapFront({ k }) {
  const rib = `url(#g-rib-${k})`;
  return (
    <svg
      viewBox="0 0 400 540"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    >
      <path
        d="M342,350 C296,332 240,350 200,390 L212,516 C228,520 246,514 258,506 Z"
        fill={`url(#g-wrap-front-${k})`}
      />
      <path d="M200,390 L212,516" stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
      <path
        d="M280,346 C262,400 252,450 250,508"
        fill="none"
        stroke="rgba(0,0,0,.08)"
        strokeWidth="1.4"
      />
      <path
        d="M58,352 C106,334 160,352 204,394 L192,516 C176,520 158,516 146,506 Z"
        fill={`url(#g-wrap-front-${k})`}
      />
      <path d="M204,394 L192,516" stroke="rgba(0,0,0,.16)" strokeWidth="1.2" />
      <path
        d="M120,348 C150,380 170,440 176,512"
        fill="none"
        stroke="rgba(255,255,255,.38)"
        strokeWidth="1.6"
      />
      <path
        d="M96,360 C118,400 134,440 148,500"
        fill="none"
        stroke="rgba(0,0,0,.08)"
        strokeWidth="1.2"
      />

      {/* pita satin */}
      <path d="M110,436 Q200,464 292,436 L288,454 Q200,482 114,454Z" fill={rib} />
      <path d="M197,468 L170,522 L186,514 L194,526 L204,474Z" fill={rib} />
      <path d="M203,468 L230,522 L214,514 L206,526 L196,474Z" fill={rib} />
      <path d="M200,462 C170,432 128,440 140,468 C150,486 188,476 200,462Z" fill={rib} />
      <path d="M200,462 C230,432 272,440 260,468 C250,486 212,476 200,462Z" fill={rib} />
      <path
        d="M150,452 C160,444 180,448 192,458"
        fill="none"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M250,452 C240,444 220,448 208,458"
        fill="none"
        stroke="rgba(255,255,255,.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="200" cy="466" rx="11" ry="9" fill={rib} />
      <ellipse cx="200" cy="466" rx="11" ry="9" fill="rgba(0,0,0,.28)" />
      <path
        d="M194,462 C198,459 203,459 207,462"
        fill="none"
        stroke="rgba(255,255,255,.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Satu buket                                                          */
/* ------------------------------------------------------------------ */

function Bouquet({ data, onNote, noteRef }) {
  const stackRef = useRef(null);
  const tiltRef = useRef(null);

  const geo = useMemo(
    () =>
      data.flowers.map((f, i) => {
        const c = { x: PIVOT.x + (f.x - PIVOT.x) * 0.18, y: (PIVOT.y + f.y) / 2 + 40 };
        const side = f.x > 210 ? 1 : -1;
        const p = quad(PIVOT, c, f, 0.56);
        return {
          i,
          f,
          path: `M${PIVOT.x},${PIVOT.y} Q${f2(c.x)},${f2(c.y)} ${f.x},${f.y}`,
          w: f2(2.4 + f.s * 1.1),
          leaf: f.lf
            ? { x: f2(p.x), y: f2(p.y), rot: side * (f.lf === 'blade' ? 26 : 52), k: f.lf }
            : null,
        };
      }),
    [data]
  );
  const heads = useMemo(() => [...geo].sort((a, b) => a.f.y - b.f.y), [geo]);

  // Tumbuh dan mekar saat buket masuk layar
  useLayoutEffect(() => {
    const root = stackRef.current;
    if (!root || prefersReduced()) return undefined;
    const q = (s) => root.querySelectorAll(s);
    const stems = q('[data-stem]');
    const leaves = q('[data-leaf]');
    const hs = q('[data-head]');

    leaves.forEach((el) => (el.style.opacity = 0));
    stems.forEach((el) => (el.style.strokeDashoffset = 1));
    hs.forEach((el) => (el.style.transform = 'scale(0)'));

    const anims = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        anims.push(
          animate(stems, {
            strokeDashoffset: [1, 0],
            duration: 1400,
            delay: stagger(90),
            ease: 'outCubic',
          }),
          animate(leaves, {
            opacity: [0, 1],
            duration: 700,
            delay: stagger(60, { start: 600 }),
            ease: 'outQuad',
          }),
          animate(hs, {
            scale: [0, 1],
            duration: 1200,
            delay: stagger(120, { start: 700 }),
            ease: 'outBack',
          })
        );
      },
      { threshold: 0.25 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      anims.forEach((a) => a.revert());
      leaves.forEach((el) => (el.style.opacity = ''));
      stems.forEach((el) => (el.style.strokeDashoffset = ''));
      hs.forEach((el) => (el.style.transform = ''));
    };
  }, []);

  // Buket miring halus mengikuti kursor
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || prefersReduced() || !window.matchMedia('(hover: hover)').matches) return undefined;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      el.style.transform = `perspective(1000px) rotateY(${cx * 7}deg) rotateX(${-cy * 5}deg)`;
      raf = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, []);

  return (
    <div ref={tiltRef} className="will-change-transform">
      <div className="bq-sway">
        <div ref={stackRef} className="relative aspect-[400/540] w-full">
          {/* Belakang: kertas dalam + semua tanaman */}
          <svg
            viewBox="0 0 400 540"
            aria-hidden="true"
            focusable="false"
            className="absolute inset-0 z-0 h-full w-full"
          >
            <ellipse cx="200" cy="524" rx="104" ry="11" fill="url(#g-shadow)" />
            <path d={BACK_SHEET} fill={`url(#g-wrap-back-${data.k})`} />

            <g filter="url(#f-organic)">
              {data.euc.map((tip, i) => (
                <Euc key={i} tip={tip} />
              ))}

              {BASE_LEAVES.map((l, i) => (
                <g
                  key={i}
                  data-leaf
                  transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}
                >
                  <Leaf k={l.k} />
                </g>
              ))}

              {geo.map((g) => (
                <g key={`st${g.i}`}>
                  <path
                    data-stem
                    d={g.path}
                    pathLength="1"
                    fill="none"
                    stroke="#2f6a49"
                    strokeWidth={g.w}
                    strokeLinecap="round"
                    style={{ strokeDasharray: 1 }}
                  />
                  {g.leaf && (
                    <g
                      data-leaf
                      transform={`translate(${g.leaf.x} ${g.leaf.y}) rotate(${g.leaf.rot}) scale(0.95)`}
                    >
                      <Leaf k={g.leaf.k} />
                    </g>
                  )}
                </g>
              ))}

              {heads.map((g) => (
                <g
                  key={`hd${g.i}`}
                  transform={`translate(${g.f.x} ${g.f.y}) rotate(${g.f.r}) scale(${g.f.s})`}
                >
                  <g data-head style={{ transformOrigin: '0 0' }}>
                    <Flower f={g.f} />
                  </g>
                </g>
              ))}
            </g>
          </svg>

          {/* Secarik kertas yang terselip di buket */}
          <div
            ref={noteRef}
            className="absolute z-10 transition-opacity duration-500"
            style={{
              left: '58.5%',
              top: '53%',
              width: '14%',
              height: '14.8%',
              transform: `rotate(${NOTE_ROT}deg)`,
            }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Buka secarik kertas di buket ini"
              onClick={onNote}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNote(e);
                }
              }}
              className="bq-note group relative h-full w-full cursor-pointer outline-none before:absolute before:-inset-3 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-200"
            >
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                <svg
                  viewBox="0 0 56 80"
                  aria-hidden="true"
                  className="h-full w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
                >
                  <rect width="56" height="80" rx="2" fill="url(#g-note)" />
                  {[28, 38, 48, 58, 68].map((y) => (
                    <path
                      key={y}
                      d={`M8,${y} q4,-4 8,0 t8,0 t8,0 t8,0 t8,0`}
                      fill="none"
                      stroke="#7a5a45"
                      strokeOpacity="0.5"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    />
                  ))}
                  <circle cx="41" cy="14" r="6" fill="#8e1230" />
                  <circle cx="39.5" cy="12.5" r="2" fill="rgba(255,255,255,.28)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Depan: kertas pembungkus + pita */}
          <WrapFront k={data.k} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surat / secarik kertas                                              */
/* ------------------------------------------------------------------ */

// Tepi atas dan bawah kertas dirobek sedikit
const tornClip = (seed) => {
  const r = mulberry(seed);
  const N = 48;
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(`${((i / N) * 100).toFixed(2)}% ${(r() * 6).toFixed(1)}px`);
  for (let i = N; i >= 0; i--)
    pts.push(`${((i / N) * 100).toFixed(2)}% calc(100% - ${(r() * 6).toFixed(1)}px)`);
  return `polygon(${pts.join(',')})`;
};

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45 0 0 0 0 .33 0 0 0 0 .2 0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const PAPER_BG = `${NOISE}, linear-gradient(160deg, #f8eed9, #eddcbc)`;
const RULES =
  'linear-gradient(to bottom, transparent 39px, rgba(120,92,70,.2) 39px, rgba(120,92,70,.2) 40px)';

function Reveal({ rootRef, className = '', children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReduced());

  useEffect(() => {
    if (shown) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { root: rootRef.current, threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootRef]);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-1000 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Semua baris pakai tinggi 40px biar pas dengan garis buku
function Entry({ text, rootRef }) {
  let node;
  if (text === '---') {
    node = <div className="flex h-[40px] items-center justify-center text-[#9b7b62]">· · ·</div>;
  } else if (text.startsWith('# ')) {
    node = (
      <h4 style={{ fontFamily: TITLE_FONT, lineHeight: '40px' }} className="text-[36px]">
        {text.slice(2)}
      </h4>
    );
  } else if (text.startsWith('~ ')) {
    node = (
      <p
        style={{ fontFamily: TITLE_FONT, lineHeight: '40px' }}
        className="text-right text-[34px]"
      >
        {text.slice(2)}
      </p>
    );
  } else {
    node = (
      <p
        style={{ lineHeight: '40px', textIndent: '1.6em' }}
        className="whitespace-pre-line text-[20px] md:text-[21px]"
      >
        {text}
      </p>
    );
  }
  return (
    <Reveal rootRef={rootRef} className="pb-[40px]">
      {node}
    </Reveal>
  );
}

function Letter({ letter, originEl, onClose }) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const foldRef = useRef(null);
  const scrollRef = useRef(null);
  const closeRef = useRef(null);
  const closing = useRef(false);
  const [hint, setHint] = useState(false);
  const reduced = useMemo(() => prefersReduced(), []);
  const torn = useMemo(() => tornClip(7), []);

  // Posisi & ukuran secarik kertas di buket, relatif ke posisi akhir kartu di tengah layar
  const calc = useCallback(() => {
    const card = cardRef.current;
    const o = originEl.getBoundingClientRect();
    const cx = document.documentElement.clientWidth / 2;
    const cy = window.innerHeight / 2;
    return {
      dx: o.left + o.width / 2 - cx,
      dy: o.top + o.height / 2 - cy,
      s: Math.min(0.5, o.width / card.offsetWidth),
    };
  }, [originEl]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const finish = () => {
      originEl.style.opacity = '';
      onClose();
    };
    if (prefersReduced()) {
      finish();
      return;
    }
    const { dx, dy, s } = calc();
    animate(cardRef.current, {
      translateX: dx,
      translateY: dy,
      scale: s,
      rotate: NOTE_ROT,
      duration: 650,
      ease: 'inCubic',
    });
    animate(foldRef.current, {
      clipPath: 'inset(0% 0% 86% 0% round 4px)',
      duration: 520,
      ease: 'inCubic',
    });
    animate(cardRef.current, { opacity: 0, duration: 160, delay: 500, onComplete: finish });
    animate(backdropRef.current, { opacity: 0, duration: 500, ease: 'outQuad' });
  }, [calc, onClose, originEl]);

  // Kertas keluar dari buket, terbang ke tengah, lalu terbuka ke bawah
  useLayoutEffect(() => {
    originEl.style.opacity = '0';
    if (reduced) {
      return () => {
        originEl.style.opacity = '';
      };
    }
    const { dx, dy, s } = calc();
    const list = [
      animate(backdropRef.current, { opacity: [0, 1], duration: 500, ease: 'outQuad' }),
      animate(cardRef.current, {
        translateX: [dx, 0],
        translateY: [dy, 0],
        scale: [s, 1],
        rotate: [NOTE_ROT, 0],
        duration: 1100,
        ease: 'outExpo',
      }),
      animate(cardRef.current, { opacity: [0, 1], duration: 160 }),
      animate(foldRef.current, {
        clipPath: ['inset(0% 0% 86% 0% round 4px)', 'inset(0% 0% 0% 0% round 4px)'],
        duration: 950,
        delay: 220,
        ease: 'outCubic',
      }),
    ];
    return () => {
      list.forEach((a) => a.revert());
      originEl.style.opacity = '';
    };
  }, [calc, originEl, reduced]);

  // Kunci scroll halaman, Esc, fokus tetap di surat
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = cardRef.current?.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (!nodes || !nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setHint(max > 12 && el.scrollTop < max - 24);
  }, []);

  useEffect(() => {
    measure();
    const t = setTimeout(measure, 1200);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={diaryTitle}
      className="fixed inset-0 z-[85] flex items-center justify-center p-3 md:p-8"
    >
      <div
        ref={backdropRef}
        onClick={close}
        style={{ opacity: reduced ? 1 : 0 }}
        className="absolute inset-0 bg-ink/50 backdrop-blur-md"
      />

      <div
        ref={cardRef}
        style={{
          opacity: reduced ? 1 : 0,
          filter: 'drop-shadow(0 25px 45px rgba(46,36,54,0.35))',
        }}
        className="relative flex max-h-[min(88svh,780px)] w-full max-w-[520px] flex-col will-change-transform"
      >
        <div
          ref={foldRef}
          className="flex min-h-0 flex-1 flex-col"
          style={reduced ? undefined : { clipPath: 'inset(0% 0% 86% 0% round 4px)' }}
        >
          <div
            className="relative flex min-h-0 flex-1 flex-col"
            style={{ clipPath: torn, background: PAPER_BG }}
          >
            {/* garis margin buku */}
                        {/* tape + stiker scrapbook */}
            <Washi className="left-1/2 top-1 z-10 h-6 w-24 -translate-x-1/2 -rotate-2" color={TAPES[0]} />
            <StickerDaisy className="pointer-events-none absolute left-2 top-2 z-10 h-9 w-9 -rotate-12 drop-shadow md:left-3 md:top-3" />
            <div className="pointer-events-none absolute inset-y-0 left-[38px] w-px bg-[rgba(176,72,84,0.38)] md:left-[54px]" />

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#7a5c48] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a35a64]"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              ref={scrollRef}
              onScroll={measure}
              tabIndex={0}
              aria-label="Isi surat"
              style={{
                fontFamily: BODY_FONT,
                color: INK,
                textShadow: '0 0 0.5px rgba(58,42,34,.55)',
                backgroundImage: RULES,
                backgroundSize: '100% 40px',
                backgroundAttachment: 'local',
              }}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[80px] pl-[52px] pr-8 outline-none [scrollbar-color:rgba(120,92,70,0.45)_transparent] [scrollbar-width:thin] md:pl-[72px] md:pr-10 [&::-webkit-scrollbar-thumb]:bg-[rgba(120,92,70,0.4)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
            >
              {/* Judul paling atas */}
              <div className="-ml-[14px] flex h-[160px] flex-col items-center justify-center md:-ml-[18px]">
                <h3
                  style={{ fontFamily: TITLE_FONT }}
                  className="text-[58px] leading-[1.2] md:text-[64px]"
                >
                  {diaryTitle}
                </h3>
                {letter.date && (
                  <p className="text-[18px] leading-[40px] text-[#7a5c48]">{letter.date}</p>
                )}
              </div>

              {letter.paragraphs.map((text, i) => (
                <Entry key={i} text={text} rootRef={scrollRef} />
              ))}
            </div>

            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end justify-center bg-gradient-to-t from-[#eddcbc] via-[#eddcbc]/80 to-transparent pb-3 text-[#7a5c48] transition-opacity duration-500 ${
                hint ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section: tiga buket yang bisa di-slide                              */
/* ------------------------------------------------------------------ */

const CSS = `
@keyframes bq-sway { from { transform: rotate(-1deg); } to { transform: rotate(1deg); } }
.bq-sway { transform-origin: 50% 92%; animation: bq-sway 5.5s ease-in-out infinite alternate; }
@keyframes bq-peek { from { transform: translateY(0); } to { transform: translateY(-5px); } }
.bq-note { animation: bq-peek 2.2s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) { .bq-sway, .bq-note { animation: none; } }
`;

export default function ReasonScene() {
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);
  const noteRefs = useRef([]);
  const rafRef = useRef(0);
  const activeRef = useRef(0);
  const drag = useRef({ moved: false });
  const lastFocus = useRef(null);
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState(null);

  // Muat font surat
  useEffect(() => {
    if (document.getElementById('bq-fonts')) return;
    const l = document.createElement('link');
    l.id = 'bq-fonts';
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    document.head.appendChild(l);
  }, []);

  // Slide tengah membesar, yang di samping mengecil dan redup
  const update = useCallback(() => {
    rafRef.current = 0;
    const el = scrollerRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bd = Infinity;
    slideRefs.current.forEach((s, i) => {
      if (!s) return;
      const c = s.offsetLeft + s.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bd) {
        bd = d;
        best = i;
      }
      const t = clamp(d / (s.offsetWidth * 1.1), 0, 1);
      const inner = s.firstElementChild;
      inner.style.transform = `scale(${mix(1, 0.74, t)})`;
      inner.style.opacity = mix(1, 0.38, t);
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
  }, [update]);

  useLayoutEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  const goTo = useCallback((i) => {
    const el = scrollerRef.current;
    const s = slideRefs.current[clamp(i, 0, BOUQUETS.length - 1)];
    if (!el || !s) return;
    el.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - el.clientWidth / 2, behavior: 'smooth' });
  }, []);

  // Geser pakai mouse (sentuhan dan trackpad sudah native)
  const onDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = scrollerRef.current;
    const start = { x: e.clientX, left: el.scrollLeft };
    drag.current.moved = false;

    const move = (ev) => {
      const dx = ev.clientX - start.x;
      if (!drag.current.moved && Math.abs(dx) > 5) {
        drag.current.moved = true;
        el.style.scrollSnapType = 'none';
        el.style.cursor = 'grabbing';
      }
      if (drag.current.moved) el.scrollLeft = start.left - dx;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.style.cursor = '';
      if (drag.current.moved) {
        goTo(activeRef.current);
        el.style.scrollSnapType = '';
        setTimeout(() => {
          drag.current.moved = false;
        }, 0);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const openNote = (i) => {
    if (drag.current.moved) return;
    playPop();
    playChime();
    lastFocus.current = document.activeElement;
    setOpenIdx(i);
  };

  const handleClose = useCallback(() => {
    setOpenIdx(null);
    lastFocus.current?.focus?.({ preventScroll: true });
  }, []);

    return (
    <section
      id="photos"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-cream py-10 md:py-12"    >
      <style>{CSS}</style>
      <ScrapStyles />
      <MomentsBackdrop note="" />
      <SharedDefs />

      {/* Judul: label kertas bertape */}
      <div className="relative z-10 mb-2 md:mb-4">
        <div className="relative -rotate-2 bg-[#faf4eb] px-7 pb-4 pt-6 shadow-[0_10px_22px_-8px_rgba(40,20,70,0.45)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-multiply"
            style={SCRAP_NOISE}
          />
          <Washi className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3" />
          <div className="relative h-10 w-44 md:h-12 md:w-56" aria-hidden="true" />
          <Squiggle className="relative mx-auto mt-1.5 w-28" />
          <StarS className="absolute -right-3 -top-3 h-6 w-6 rotate-12" />
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onPointerDown={onDown}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(activeRef.current + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(activeRef.current - 1);
          }
        }}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Buket bunga"
        style={{ '--sw': `min(${SW_VW}vw, ${SW_MAX}px, calc((100svh - ${SW_RESERVE}px) * 0.74))` }}
        className="relative z-10 flex w-full cursor-grab select-none snap-x snap-mandatory items-center gap-6 overflow-x-auto px-[calc(50%-var(--sw)/2)] py-6 outline-none [scrollbar-width:none] md:gap-10 [&::-webkit-scrollbar]:hidden"
      >
        {BOUQUETS.map((b, i) => (
          <div
            key={b.id}
            ref={(el) => (slideRefs.current[i] = el)}
            className="w-[var(--sw)] flex-none snap-center"
            // Klik buket di samping = geser ke buket itu dulu
            onClickCapture={(e) => {
              if (i !== activeRef.current && !drag.current.moved) {
                e.stopPropagation();
                goTo(i);
              }
            }}
          >
            <div className="will-change-transform" style={{ transformOrigin: '50% 70%' }}>
              <Bouquet
                data={b}
                noteRef={(el) => (noteRefs.current[i] = el)}
                onNote={() => openNote(i)}
              />

              {/* caption tulisan tangan */}
              <div className="mt-1 flex justify-center">
                <span
                  aria-hidden="true"
                  className="relative inline-block h-7 w-36 rotate-1 bg-[#fffdf8] shadow-[0_8px_16px_-8px_rgba(60,35,80,0.45)]"
                >
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-center gap-2" aria-hidden="true">
        {BOUQUETS.map((b, i) => (
          <span
            key={b.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? 'w-7 bg-purple-600' : 'w-1.5 bg-ink/20'
            }`}
          />
        ))}
      </div>

      <p className="relative z-10 mt-3 flex justify-center" aria-hidden="true">
        <HeartS className="h-5 w-5" />
      </p>
      {openIdx !== null &&
        createPortal(
          <Letter
            letter={bouquetLetters[openIdx] ?? bouquetLetters[0]}
            originEl={noteRefs.current[openIdx]}
            onClose={handleClose}
          />,
          document.body
        )}
    </section>
  );
}