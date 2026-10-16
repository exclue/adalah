import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { allImages } from '../../data/media';
import { loveNotes, shortQuotes } from '../../data/messages';
import { playPop } from '../../utils/sound';
import { prefersReduced, useMediaQuery } from '../story/kit';

/* ================================================================== */
/* Scrapbook surat versi NOVEL: buku hardcover yang bisa dibolak-balik */
/*                                                                     */
/* Desktop : buku terbuka dua halaman (kiri = foto, kanan = bab/surat) */
/* HP      : satu halaman penuh, dibalik ke kiri                       */
/* Kontrol : klik sisi halaman, geser, tombol bawah, panah keyboard,   */
/*           dan tab warna di tepi kanan (desktop) buat lompat ke bab  */
/*                                                                     */
/* Isi halaman = tipografi novel (serif, drop cap, nomor halaman).     */
/* Tempelan scrapbook (polaroid, tape, stiker, stabilo, tulisan        */
/* tangan) tetap ada di atasnya.                                       */
/*                                                                     */
/* Ukuran isi halaman pakai satuan cqw (persen lebar halaman), jadi    */
/* semuanya ikut mengecil/membesar bersama bukunya.                    */
/* ================================================================== */

const INK = '#3d274f';
const PURPLE = '#795492';
const PAPER = '#faf4eb';
const EASE = 'cubic-bezier(.645,.045,.355,1)';
const RATIO = 1.42; // tinggi halaman = lebar x RATIO
const BOOK_TITLE = 'pesan pesan aku buat kamu';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const toRoman = (k) => ROMAN[k] ?? String(k + 1);

const TAB_COLORS = ['#f4b6c8', '#cdbdf5', '#f6df9c', '#bfe3d0'];

// Teks tulisan tangan di halaman foto. Bebas diganti.
const POLAROID_CAPTIONS = [
  ['ini favoritku', 'senyum andalan'],
  ['lucu banget', 'jangan diliatin terus'],
  ['gemes', 'versi paling kamu'],
  ['kesayangan', 'bikin kangen'],
];
const SCRAP_NOTES = [
  'aku simpan baik-baik',
  'tiap liat jadi senyum',
  'lagi-lagi kamu',
  'koleksi favoritku',
];

const CSS = `
.sb-hand{font-family:'Caveat','Segoe Script','Bradley Hand','Comic Sans MS',cursive;}
.sb-serif{font-family:var(--font-display),'Cormorant Garamond',Georgia,'Times New Roman',serif;}
@keyframes sb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes sb-shade{0%{opacity:0}50%{opacity:.4}100%{opacity:0}}
@keyframes sb-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(1.6cqw)}}
.sb-noise{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");}
@media (prefers-reduced-motion: reduce){.sb-anim{animation:none!important}}
`;

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

const Squiggle = ({ className = '', color = '#c9a3ff' }) => (
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

const Tape = ({ className = '', color = 'rgba(244,182,200,0.8)' }) => (
  <span
    aria-hidden="true"
    className={`absolute block h-[6cqw] w-[20cqw] ${className}`}
    style={{
      background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 1.2cqw, transparent 1.2cqw 3cqw), ${color}`,
      clipPath: TAPE_CLIP,
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Halaman dasar                                                        */
/* ------------------------------------------------------------------ */

function Page({ side, children }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden [container-type:inline-size]"
      style={{
        background: PAPER,
        borderRadius: side === 'l' ? '6px 2px 2px 6px' : '2px 6px 6px 2px',
      }}
    >
      <div className="sb-noise pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply" />
      {children}
      {/* bayangan lipatan di dekat jilid */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-[16%] from-[#3b2a5c]/30 to-transparent ${
          side === 'l' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
        }`}
      />
    </div>
  );
}

function BlankPage() {
  return <Page side="l" />;
}

// Nomor halaman kecil di bawah tengah: "— 12 —"
function PageNo({ n }) {
  return (
    <p
      className="sb-serif pointer-events-none absolute inset-x-0 bottom-[4.2cqw] text-center text-[4cqw] italic opacity-55"
      style={{ color: INK }}
    >
      &mdash; {n} &mdash;
    </p>
  );
}

// Judul buku kecil di atas halaman (running head)
function RunningHead() {
  return (
    <p
      className="sb-serif pointer-events-none absolute inset-x-0 top-[3.8cqw] text-center text-[3.5cqw] italic tracking-[0.1em] opacity-50"
      style={{ color: INK }}
    >
      {BOOK_TITLE}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Sampul hardcover                                                     */
/* ------------------------------------------------------------------ */

function Cover() {
  return (
    <div
      className="relative h-full w-full overflow-hidden [container-type:inline-size]"
      style={{
        background: 'linear-gradient(135deg,#947aa5,#785e8b)',
        borderRadius: '2px 10px 10px 2px',
      }}
    >
      {/* tekstur kain linen */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(40,20,90,.45) 0 1px, transparent 1px 3px)',
        }}
      />

      {/* punggung buku (spine) */}
      <div className="absolute inset-y-0 left-0 w-[9%] bg-gradient-to-r from-[#2a1b45]/55 via-[#2a1b45]/15 to-transparent" />
      <div className="absolute inset-y-0 left-[9%] w-[0.6cqw] bg-[#2a1b45]/30" />

      {/* jahitan */}
      <div className="absolute inset-[6cqw] left-[13cqw] rounded-[2.4cqw] border-[0.55cqw] border-dashed border-[#f7f0e3]/75" />

      {/* label kertas */}
      <div
        className="absolute left-[calc(50%+4cqw)] top-[40%] w-[66cqw] -translate-x-1/2 -translate-y-1/2 -rotate-2 px-[5cqw] py-[9cqw] text-center shadow-[0_1.4cqw_2.6cqw_-0.8cqw_rgba(40,20,70,0.55)]"
        style={{ background: PAPER }}
      >
        <Tape className="-top-[3cqw] left-1/2 -translate-x-1/2 rotate-3" />
        <p className="sb-hand text-[10.5cqw] font-bold leading-[0.95]" style={{ color: INK }}>
          Pesan pesan
          <br />
          aku buat kamu
        </p>
        <Squiggle className="mx-auto mt-[4cqw] w-[30cqw]" color="#e58aa8" />
      </div>

      <Daisy className="absolute right-[9cqw] top-[60%] w-[22cqw] rotate-12 drop-shadow-md" />
      <HeartS className="absolute left-[19cqw] top-[64%] w-[11cqw] -rotate-12" />
      <StarS className="absolute left-[31cqw] top-[72%] w-[6.5cqw] rotate-12" />

      <p
        className="sb-hand absolute inset-x-0 bottom-[11cqw] pl-[8cqw] text-center text-[5.6cqw]"
        style={{ color: PAPER }}
      >
        buka yuk{' '}
        <span className="sb-anim inline-block" style={{ animation: 'sb-nudge 1.6s ease-in-out infinite' }}>
          &rarr;
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman foto (kiri)                                                  */
/* ------------------------------------------------------------------ */

function Polaroid({ src, caption, rot, style, tapeColor }) {
  return (
    <figure
      className="absolute bg-[#fffdf8] p-[2.6cqw] pb-[2cqw] shadow-[0_1.2cqw_2.4cqw_-0.6cqw_rgba(40,20,70,0.45)]"
      style={{ ...style, transform: `rotate(${rot}deg)` }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          className="block aspect-[4/5] w-full object-cover object-[center_22%]"
        />
      ) : (
        <div className="aspect-[4/5] w-full bg-[#e6dcf5]" />
      )}
      <figcaption
        className="sb-hand pt-[1.8cqw] text-center text-[4.8cqw] leading-none"
        style={{ color: INK }}
      >
        {caption}
      </figcaption>
      <Tape className="-top-[3.4cqw] left-1/2 -translate-x-1/2 -rotate-3" color={tapeColor} />
    </figure>
  );
}

function PhotoPage({ note, index, pageNo }) {
  const mirror = index % 2 === 1;
  const pick = (k) => (allImages.length ? allImages[k % allImages.length].url : '');
  const near = (x) => (mirror ? { right: x } : { left: x });
  const far = (x) => (mirror ? { left: x } : { right: x });
  const caps = POLAROID_CAPTIONS[index % POLAROID_CAPTIONS.length];
  const scrap = SCRAP_NOTES[index % SCRAP_NOTES.length];

  return (
    <Page side="l">
      <RunningHead />

      <div className="absolute top-[9cqw]" style={{ ...near('9cqw'), width: '82cqw' }}>
        <p
          className={`sb-hand text-[6.8cqw] font-bold leading-none ${mirror ? 'text-right' : ''}`}
          style={{ color: INK }}
        >
          {note.category}
        </p>
        {note.date && (
          <p
            className={`sb-hand mt-[1.6cqw] text-[4.4cqw] leading-none opacity-60 ${mirror ? 'text-right' : ''}`}
            style={{ color: INK }}
          >
            ~ {note.date} ~
          </p>
        )}
      </div>

      <Polaroid
        src={pick(index * 2 + 3)}
        caption={caps[0]}
        rot={mirror ? 4 : -4}
        style={{ ...near('8cqw'), top: '25cqw', width: '56cqw' }}
        tapeColor="rgba(244,182,200,0.8)"
      />
      <Polaroid
        src={pick(index * 2 + 4)}
        caption={caps[1]}
        rot={mirror ? -5 : 5}
        style={{ ...far('7cqw'), top: '62cqw', width: '38cqw' }}
        tapeColor="rgba(205,189,245,0.85)"
      />

      <Daisy className="absolute w-[19cqw] -rotate-6 drop-shadow" style={{ ...near('10cqw'), top: '104cqw' }} />
      <HeartS className="absolute w-[10cqw] rotate-12" style={{ ...near('33cqw'), top: '113cqw' }} />
      <StarS className="absolute w-[6cqw] -rotate-12" style={{ ...near('29cqw'), top: '102cqw' }} />

      <p
        className="sb-hand absolute w-[44cqw] -rotate-2 text-[5cqw] leading-tight"
        style={{ ...far('8cqw'), top: '118cqw', color: INK, textAlign: mirror ? 'left' : 'right' }}
      >
        {scrap}
      </p>

      <PageNo n={pageNo} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman bab / surat (kanan)                                          */
/* ------------------------------------------------------------------ */

function LetterPage({ note, index, total, pageNo, side = 'r' }) {
  const text = note.content || '';
  const first = text.charAt(0);
  const rest = text.slice(1);

  return (
    <Page side={side}>
      <div className="absolute inset-0 flex flex-col px-[9cqw] pb-[12cqw] pt-[7cqw]">
        {/* baris atas: stiker kategori + penanda bab */}
        <div className="flex items-start justify-between">
          <span
            className="sb-hand -rotate-2 border border-dashed border-[#d9b24c]/70 px-[3cqw] py-[0.8cqw] text-[4.4cqw] leading-tight"
            style={{ background: '#f6df9c', color: INK }}
          >
            {note.category}
          </span>
          <span className="sb-serif text-[3.8cqw] italic opacity-60" style={{ color: INK }}>
            {index + 1} dari {total}
          </span>
        </div>

        {/* pembuka bab */}
        <p
          className="sb-serif mt-[6cqw] text-center text-[4.2cqw] font-semibold italic tracking-[0.2em]"
          style={{ color: PURPLE }}
        >
          bab {toRoman(index)}
        </p>
        <h3
          className="sb-serif mt-[1.6cqw] text-center text-[6.8cqw] font-semibold leading-[1.08]"
          style={{ color: INK }}
        >
          {note.title}
        </h3>
        <Squiggle className="mx-auto mt-[2cqw] w-[30cqw]" color="#e58aa8" />

        {/* kalimat inti, distabilo seperti coretan tangan */}
        <p className="sb-hand mt-[4cqw] -rotate-1 text-center text-[5.4cqw] leading-[1.25]" style={{ color: INK }}>
          <span
            className="px-[1cqw]"
            style={{
              background: 'linear-gradient(transparent 52%, rgba(246,223,156,0.95) 52%)',
              WebkitBoxDecorationBreak: 'clone',
              boxDecorationBreak: 'clone',
            }}
          >
            {note.highlight}
          </span>
        </p>

        {/* isi bab: serif + drop cap */}
        <p
          lang="id"
          className="sb-serif mt-[4.5cqw] text-justify text-[4.9cqw] font-medium leading-[6.7cqw] [hyphens:auto]"
          style={{ color: INK }}
        >
          <span
            aria-hidden="true"
            className="float-left font-semibold"
            style={{
              fontSize: '14cqw',
              lineHeight: 0.8,
              paddingRight: '1.6cqw',
              paddingTop: '0.9cqw',
              color: PURPLE,
            }}
          >
            {first}
          </span>
          <span className="sr-only">{first}</span>
          {rest}
        </p>

        {/* tanda tangan + stiker */}
        <div className="mt-auto flex items-end justify-between gap-[4cqw]">
          <Daisy className="w-[12cqw] flex-none rotate-6 drop-shadow" />
          <p
            className="sb-hand -rotate-2 text-right text-[5.4cqw] leading-tight"
            style={{ color: INK }}
          >
            {note.authorTag}{' '}
            <HeartS className="inline-block w-[5cqw] align-[-0.6cqw]" />
          </p>
        </div>
      </div>

      <PageNo n={pageNo} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman penutup                                                      */
/* ------------------------------------------------------------------ */

const TORN_CLIP =
  'polygon(0 3%,6% 0,14% 3%,24% 0,36% 2%,48% 0,60% 3%,72% 0,84% 2%,94% 0,100% 3%,100% 97%,92% 100%,80% 97%,68% 100%,54% 98%,42% 100%,30% 97%,18% 100%,8% 98%,0 100%)';

function ClosingPage({ side = 'l', pageNo }) {
  const quote = shortQuotes?.[0];
  return (
    <Page side={side}>
      <RunningHead />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[7cqw] px-[11cqw] text-center">
        <HeartS className="w-[22cqw] -rotate-6 drop-shadow" />
        <p className="sb-hand text-[11cqw] font-bold leading-none" style={{ color: INK }}>
          bersambung...
        </p>
        {quote && (
          <div className="relative rotate-1 drop-shadow-[0_1cqw_1.4cqw_rgba(40,20,70,0.3)]">
            <div
              className="bg-white/75 px-[6cqw] py-[6cqw]"
              style={{ clipPath: TORN_CLIP }}
            >
              <p className="sb-hand text-[5.2cqw] leading-[1.35]" style={{ color: INK }}>
                {quote}
              </p>
            </div>
            <Tape className="-top-[3cqw] left-1/2 -translate-x-1/2 -rotate-2" color="rgba(246,223,156,0.85)" />
          </div>
        )}
      </div>
      <StarS className="absolute left-[12cqw] top-[14cqw] w-[8cqw] rotate-12" />
      <StarS className="absolute bottom-[14cqw] right-[12cqw] w-[6cqw] -rotate-12" fill="#f4b6c8" />
      {pageNo ? <PageNo n={pageNo} /> : null}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Lembaran (halaman yang bisa berputar) dan papan sampul               */
/* ------------------------------------------------------------------ */

function Sheet({ i, total, flipped, turning, single, dur, front, back }) {
  const z = flipped ? i + 1 : total - i;
  const face = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };
  const shade = (
    <span
      className="sb-anim pointer-events-none absolute inset-0 bg-[#2a1b45] opacity-0"
      style={turning === i && dur ? { animation: `sb-shade ${dur}ms ease` } : undefined}
    />
  );

  return (
    <div
      className="absolute top-0 h-full"
      style={{
        left: single ? 0 : '50%',
        width: single ? '100%' : '50%',
        zIndex: z,
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        transform: `rotateY(${flipped ? -180 : 0}deg)`,
        transition: `transform ${dur}ms ${EASE}, z-index 0ms linear ${dur / 2}ms`,
      }}
    >
      <div className="absolute inset-0" style={face}>
        {front}
        {shade}
      </div>
      <div className="absolute inset-0" style={{ ...face, transform: 'rotateY(180deg)' }}>
        {back}
        {shade}
      </div>
    </div>
  );
}

// Garis-garis tepi tumpukan kertas
const EDGE_V = 'repeating-linear-gradient(90deg,#f3eadb 0 1px,#d8ccb6 1px 2.2px)';
const EDGE_H = 'repeating-linear-gradient(0deg,#f3eadb 0 1px,#d8ccb6 1px 2.2px)';

// Papan hardcover + tebal tumpukan halaman (kiri tebal kalau sudah banyak
// halaman terbalik, kanan tebal kalau masih banyak yang belum dibaca)
function Boards({ single, f, maxF, dur }) {
  const t = maxF ? f / maxF : 0;
  const base = {
    background: '#6a5078',
    transition: 'opacity 600ms ease',
    transform: 'translateZ(-3px)',
  };
  const stack = { transform: 'translateZ(-2px)', transition: `width ${dur}ms ${EASE}, left ${dur}ms ${EASE}, opacity 600ms ease` };

  if (single) {
    return (
      <>
        <div className="absolute rounded-[10px]" style={{ ...base, inset: '-1.4% -2.4% -1.4% -2.4%' }} />
        <div
          className="absolute"
          style={{ ...stack, left: 0, width: '101.6%', top: '0.5%', bottom: '-0.5%', background: EDGE_V, borderRadius: '0 3px 3px 0' }}
        />
        <div
          className="absolute"
          style={{ ...stack, left: '0.4%', right: '0.4%', top: '100%', height: '1%', background: EDGE_H, borderRadius: '0 0 3px 3px' }}
        />
      </>
    );
  }

  const leftW = 0.3 + 1.1 * t;
  const rightW = 0.3 + 1.1 * (1 - t);
  const leftOn = f === 0 ? 0 : 1;
  const rightOn = f === maxF ? 0 : 1;

  return (
    <>
      <div
        className="absolute rounded-l-[10px]"
        style={{ ...base, left: '-1.4%', top: '-1.6%', bottom: '-1.6%', width: '51.4%', opacity: leftOn }}
      />
      <div
        className="absolute rounded-r-[10px]"
        style={{ ...base, left: '50%', top: '-1.6%', bottom: '-1.6%', width: '51.4%', opacity: rightOn }}
      />

      {/* tebal tumpukan halaman kiri */}
      <div
        className="absolute"
        style={{
          ...stack,
          left: `${-leftW}%`,
          width: `${50 + leftW}%`,
          top: '0.5%',
          bottom: '-0.5%',
          background: EDGE_V,
          borderRadius: '3px 0 0 3px',
          opacity: leftOn,
        }}
      />
      {/* tebal tumpukan halaman kanan */}
      <div
        className="absolute"
        style={{
          ...stack,
          left: '50%',
          width: `${50 + rightW}%`,
          top: '0.5%',
          bottom: '-0.5%',
          background: EDGE_V,
          borderRadius: '0 3px 3px 0',
          opacity: rightOn,
        }}
      />
      {/* tepi bawah tumpukan */}
      <div
        className="absolute"
        style={{ ...stack, left: '0.4%', width: '49.6%', top: '100%', height: '0.9%', background: EDGE_H, opacity: leftOn }}
      />
      <div
        className="absolute"
        style={{ ...stack, left: '50%', width: '49.6%', top: '100%', height: '0.9%', background: EDGE_H, opacity: rightOn }}
      />
    </>
  );
}

// Pita pembatas pink yang menjuntai dari bawah buku
function Ribbon({ left, dur }) {
  return (
    <div
      aria-hidden="true"
      className="absolute"
      style={{
        left,
        top: '96%',
        width: 'calc(var(--pw) * 0.055)',
        height: 'calc(var(--pw) * 0.13)',
        background: 'linear-gradient(90deg,#d9708f,#f09ab4 50%,#d9708f)',
        clipPath: 'polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)',
        transform: 'translateZ(-1px)',
        transition: `left ${dur}ms ${EASE}`,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Latar meja scrapbook                                                 */
/* ------------------------------------------------------------------ */

const float = (sec, delay = 0) => ({ animation: `sb-float ${sec}s ease-in-out ${delay}s infinite` });

const Leaf = ({ className = '', style }) => (
  <svg viewBox="0 0 40 80" className={className} style={style} aria-hidden="true">
    <path d="M20 78C4 56 4 24 20 2c16 22 16 54 0 76z" fill="#c5d6b6" stroke="#9db38d" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M20 8v66" stroke="#9db38d" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Washi = ({ className = '', color = 'rgba(244,182,200,0.78)' }) => (
  <span
    aria-hidden="true"
    className={`absolute block ${className}`}
    style={{
      background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 14px), ${color}`,
      clipPath: TAPE_CLIP,
    }}
  />
);

function DeskBackdrop() {
  const fade = 'radial-gradient(ellipse 62% 58% at 50% 50%, transparent 40%, #000 90%)';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* cahaya lampu meja */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_48%,rgba(248,236,214,0.95),transparent_72%)]" />

      {/* semburat warna lembut */}
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#f4b6c8]/30 blur-3xl" />

      {/* alas titik-titik ala bullet journal, memudar ke tengah */}
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
      <div className="sb-noise absolute inset-0 opacity-[0.22] mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(98,66,120,0.14)_100%)]" />

      {/* bunga kering kiri atas */}
      <div className="sb-anim absolute left-[3%] top-[6%]" style={float(8)}>
        <Leaf className="absolute left-2 top-10 h-24 w-12 -rotate-[28deg]" />
        <Leaf className="absolute left-20 top-8 h-20 w-10 rotate-[32deg]" />
        <Daisy className="relative h-24 w-24 -rotate-12 drop-shadow-md md:h-28 md:w-28" />
        <Daisy className="absolute left-16 top-20 hidden h-14 w-14 rotate-[24deg] drop-shadow md:block" />
      </div>

      {/* ranting kanan bawah */}
      <div className="sb-anim absolute bottom-[5%] right-[3%]" style={float(9, 1.2)}>
        <Leaf className="absolute -left-6 top-6 h-20 w-10 -rotate-[38deg]" />
        <Leaf className="absolute left-12 top-2 h-16 w-8 rotate-[24deg]" />
        <Daisy className="relative h-20 w-20 rotate-[10deg] drop-shadow-md md:h-24 md:w-24" />
      </div>

      {/* washi tape di sudut */}
      <Washi className="-right-10 top-8 hidden h-8 w-44 rotate-[34deg] md:block" />
      <Washi className="-left-12 bottom-14 hidden h-8 w-44 -rotate-[32deg] md:block" color="rgba(205,189,245,0.8)" />

      {/* sticky note kanan atas */}
      <div className="sb-anim absolute right-[6%] top-[9%] hidden w-44 rotate-[4deg] lg:block" style={float(7, 0.6)}>
        <div className="bg-[#fbeaa9] px-4 pb-5 pt-6 shadow-[0_8px_16px_-6px_rgba(60,35,80,0.4)]">
          <p className="sb-hand text-xl leading-tight" style={{ color: INK }}>
            psst, bacanya pelan-pelan ya
          </p>
        </div>
        <Washi className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3" color="rgba(244,182,200,0.85)" />
      </div>

      {/* secarik kertas sobek kiri bawah */}
      <div className="absolute bottom-[8%] left-[5%] hidden w-52 -rotate-3 drop-shadow-[0_6px_10px_rgba(60,35,80,0.25)] lg:block">
        <div className="bg-white/80 px-5 py-6" style={{ clipPath: TORN_CLIP }}>
          <p className="sb-hand text-xl leading-snug" style={{ color: INK }}>
            untukmu, yang lagi baca ini{' '}
            <HeartS className="inline-block h-4 w-4 align-[-2px]" />
          </p>
        </div>
        <Washi className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2" color="rgba(246,223,156,0.9)" />
      </div>

      {/* bintang & hati kecil berserakan */}
      <StarS className="sb-anim absolute left-[22%] top-[14%] hidden h-6 w-6 rotate-12 md:block" style={float(6)} />
      <StarS className="sb-anim absolute right-[24%] top-[7%] h-5 w-5 -rotate-12" style={float(7, 1)} fill="#f4b6c8" />
      <HeartS className="sb-anim absolute left-[12%] top-[52%] hidden h-6 w-6 -rotate-12 md:block" style={float(8, 0.4)} />
      <HeartS className="sb-anim absolute bottom-[18%] right-[19%] hidden h-7 w-7 rotate-12 md:block" style={float(7.5, 2)} />
      <StarS className="sb-anim absolute bottom-[9%] left-[30%] h-5 w-5 rotate-6" style={float(6.5, 1.6)} />
      <StarS className="sb-anim absolute right-[9%] top-[48%] hidden h-5 w-5 -rotate-6 md:block" style={float(9, 0.8)} fill="#cdbdf5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene                                                                */
/* ------------------------------------------------------------------ */

const stop = (e) => e.stopPropagation();

export default function ScrapbookScene() {
  const sectionRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const n = loveNotes.length;
  const dur = prefersReduced() ? 0 : 900;

  const [f, setF] = useState(0);
  const [turning, setTurning] = useState(-1);
  const fRef = useRef(0);
  const interacted = useRef(false);
  const timer = useRef(0);
  const drag = useRef({ x: 0, y: 0 });

  const sheets = useMemo(() => {
    if (!n) return [];
    const endNo = 2 * n + 2;
    if (isDesktop) {
      // nomor halaman: foto = genap (kiri), surat = ganjil (kanan)
      const list = [
        { front: <Cover />, back: <PhotoPage note={loveNotes[0]} index={0} pageNo={2} /> },
      ];
      for (let i = 0; i < n; i++) {
        list.push({
          front: <LetterPage note={loveNotes[i]} index={i} total={n} pageNo={2 * i + 3} side="r" />,
          back:
            i < n - 1 ? (
              <PhotoPage note={loveNotes[i + 1]} index={i + 1} pageNo={2 * (i + 1) + 2} />
            ) : (
              <ClosingPage side="l" pageNo={endNo} />
            ),
        });
      }
      return list;
    }
    const pages = [<Cover key="cover" />];
    loveNotes.forEach((note, i) => {
      pages.push(<PhotoPage key={`p${i}`} note={note} index={i} pageNo={2 * i + 2} />);
      pages.push(<LetterPage key={`l${i}`} note={note} index={i} total={n} pageNo={2 * i + 3} side="r" />);
    });
    pages.push(<ClosingPage key="end" side="r" pageNo={endNo} />);
    return pages.map((page) => ({ front: page, back: <BlankPage /> }));
  }, [isDesktop, n]);

  const maxF = isDesktop ? sheets.length : Math.max(sheets.length - 1, 0);

  const go = useCallback(
    (dir) => {
      const next = Math.min(Math.max(fRef.current + dir, 0), maxF);
      if (next === fRef.current) return;
      const turned = dir > 0 ? fRef.current : next;
      fRef.current = next;
      setF(next);
      setTurning(turned);
      playPop();
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTurning(-1), dur + 80);
    },
    [maxF, dur]
  );

  // Lompat langsung ke halaman tertentu (dipakai tab bab)
  const jump = useCallback(
    (target) => {
      const next = Math.min(Math.max(target, 0), maxF);
      if (next === fRef.current) return;
      fRef.current = next;
      setF(next);
      setTurning(-1);
      playPop();
    },
    [maxF]
  );

  // Ganti ukuran layar (HP <-> desktop): kembali ke sampul
  useEffect(() => {
    fRef.current = 0;
    setF(0);
    setTurning(-1);
  }, [isDesktop]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Buku membuka sendiri sekali saat section pertama kali kelihatan
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReduced()) return undefined;
    let t = 0;
    let done = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done || interacted.current) return;
        done = true;
        t = setTimeout(() => {
          if (!interacted.current && fRef.current === 0) go(1);
        }, 900);
      },
      { threshold: 0.55 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [go]);

  if (!n) return null;

  const press = (dir) => {
    interacted.current = true;
    go(dir);
  };

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e) => {
    interacted.current = true;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (fRef.current === 0) return go(1);
      if (isDesktop && fRef.current === maxF) return go(-1);
      const r = e.currentTarget.getBoundingClientRect();
      const rel = (e.clientX - r.left) / r.width;
      go(rel > 0.5 ? 1 : -1);
    }
    return undefined;
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      press(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      press(-1);
    }
  };

  const shift = isDesktop ? (f === 0 ? -25 : f === maxF ? 25 : 0) : 0;

  let label = 'sampul';
  if (f === maxF) label = 'selesai';
  else if (f > 0) label = isDesktop ? `bab ${toRoman(f - 1)} / ${toRoman(n - 1)}` : `halaman ${f} / ${n * 2}`;

  const pw = isDesktop
    ? `min(44vw, calc(72svh / ${RATIO}), 460px)`
    : `min(86vw, calc(66svh / ${RATIO}), 340px)`;

  const ribbonLeft = isDesktop ? (f === maxF ? '41%' : '57%') : '78%';
  const tabsVisible = isDesktop && f > 0 && f < maxF;

  return (
    <section
      id="letters"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-cream px-4 py-20 md:py-28"
    >
      <style>{CSS}</style>

      <DeskBackdrop />

      <div
        role="group"
        aria-roledescription="buku novel scrapbook"
        aria-label="Buku novel scrapbook berisi surat. Gunakan panah kiri dan kanan untuk membalik halaman."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative cursor-pointer select-none rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-purple-600/60"
        style={{
          '--pw': pw,
          width: isDesktop ? 'calc(var(--pw) * 2)' : 'var(--pw)',
          height: `calc(var(--pw) * ${RATIO})`,
          perspective: '2400px',
          touchAction: 'pan-y',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateX(${shift}%) rotateX(4deg)`,
            transition: `transform ${dur}ms ${EASE}`,
          }}
        >
          {/* bayangan di meja */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[4%] -bottom-[3.5%] h-[6%] rounded-[50%] bg-[#362444]/20 blur-xl"
          />
          <Boards single={!isDesktop} f={f} maxF={maxF} dur={dur} />
          <Ribbon left={ribbonLeft} dur={dur} />
          {sheets.map((s, i) => (
            <Sheet
              key={i}
              i={i}
              total={sheets.length}
              flipped={f > i}
              turning={turning}
              single={!isDesktop}
              dur={dur}
              front={s.front}
              back={s.back}
            />
          ))}

          {/* tab pembatas di tepi kanan: lompat ke bab (desktop) */}
          {isDesktop &&
            loveNotes.map((note, i) => {
              const active = f === i + 1;
              return (
                <button
                  key={note.id ?? i}
                  type="button"
                  aria-label={`Lompat ke bab ${toRoman(i)}`}
                  tabIndex={tabsVisible ? 0 : -1}
                  onPointerDown={stop}
                  onPointerUp={stop}
                  onClick={() => {
                    interacted.current = true;
                    jump(i + 1);
                  }}
                  className="sb-hand absolute flex cursor-pointer items-center justify-center rounded-r-md font-bold shadow-sm"
                  style={{
                    left: '101%',
                    top: `${12 + i * 16}%`,
                    width: `calc(var(--pw) * ${active ? 0.1 : 0.075})`,
                    height: 'calc(var(--pw) * 0.13)',
                    fontSize: 'calc(var(--pw) * 0.05)',
                    background: TAB_COLORS[i % TAB_COLORS.length],
                    color: INK,
                    opacity: tabsVisible ? 1 : 0,
                    pointerEvents: tabsVisible ? 'auto' : 'none',
                    zIndex: 60,
                    transition: 'width 300ms ease, opacity 400ms ease',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
        </div>
      </div>

      <div className="relative z-10 mt-14 flex items-center gap-5 text-ink-soft">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={f === 0}
          onClick={() => press(-1)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-[#fffdf9] text-ink shadow-xs transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-purple-600 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-[#fffdf9]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span
          className="sb-hand min-w-[8.5ch] text-center text-2xl text-ink"
          aria-live="polite"
        >
          {label}
        </span>
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={f === maxF}
          onClick={() => press(1)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-[#fffdf9] text-ink shadow-xs transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-purple-600 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-[#fffdf9]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="sb-hand relative z-10 mt-3 text-lg text-ink-soft">
        klik, geser, atau pakai panah keyboard buat bolak-balik
      </p>
    </section>
  );
}