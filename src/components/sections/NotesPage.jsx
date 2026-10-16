import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate, stagger } from 'animejs';
import { ArrowLeft, Mail, Reply, X } from 'lucide-react';
import DecryptedText from '../reactbits/DecryptedText';
import { allImages } from '../../data/media';
import { NOTES } from '../../data/notes';
import { playPop } from '../../utils/sound';
import { prefersReduced } from '../story/kit';
import {
  INK,
  HAND,
  NOISE,
  TAPES,
  HeartS,
  StarS,
  Squiggle,
  Washi,
  NoteButton,
  ScrapStyles,
  MomentsBackdrop,
} from '../story/scrap';

/* ---------------- Pengaturan ---------------- */
const STICKY_TEXT = 'ketuk satu kertas buat dibuka';
const CARD_TILT = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]']; // kemiringan kartu
const ITEM_TILT = ['-rotate-2', 'rotate-1', '-rotate-1']; // kemiringan polaroid di popup
/* -------------------------------------------- */

/* ---------------- Helper ---------------- */

const itemImage = (item, seed) => {
  if (item.image) return item.image;
  if (!allImages.length) return null;
  return allImages[seed % allImages.length].url;
};
const seedOf = (noteIndex, itemIndex = 0) => noteIndex * 3 + itemIndex + 2;
const paragraphs = (t = '') =>
  t
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const FILTERS = [
  { id: 'semua', label: 'semua' },
  { id: 'surat', label: 'surat' },
  { id: 'favorit', label: 'kesukaan' },
];

/* Muncul sekali saat masuk layar (dipakai di dalam popup yang bisa discroll) */
function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) {
      el.style.opacity = 1;
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animate(el, {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 900,
          delay,
          ease: 'outExpo',
        });
        io.disconnect();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}

/* Kartu dasar: selembar kertas bertape */
function Card({ children, onClick, className = '', tilt = '', tape = TAPES[0] }) {
  return (
    <button
      type="button"
      onClick={() => {
        playPop();
        onClick();
      }}
      className={`group relative block w-full cursor-pointer bg-[#fffaf2] px-6 pb-6 pt-9 text-left shadow-[0_14px_28px_-12px_rgba(40,20,70,0.45)] transition-all duration-300 hover:-translate-y-1 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600 md:px-7 ${tilt} ${className}`}
      style={{ color: INK }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply"
        style={NOISE}
      />
      <Washi className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2" color={tape} />
      {children}
    </button>
  );
}

/* ---------------- Kartu ---------------- */

function LetterCard({ note, onOpen, tilt, tape }) {
  const hasHer = Boolean(note.herText);
  const excerpt = (hasHer ? note.herText : note.myText).replace(/\s+/g, ' ');

  return (
    <Card onClick={onOpen} tilt={tilt} tape={tape}>
      <span className="relative mb-4 flex items-center justify-between">
        <span
          className={`${HAND} inline-flex -rotate-2 items-center gap-1.5 border border-dashed border-[#d9b24c]/70 bg-[#f6df9c] px-3 py-0.5 text-[1.25rem] leading-tight`}
        >
          <Mail className="h-3.5 w-3.5" />
          {hasHer ? 'surat dari dia' : 'surat dariku'}
        </span>
        <HeartS className="h-6 w-6 rotate-12" />
      </span>

      <span
        className={`${HAND} relative mb-2 block text-[2rem] font-bold leading-[1.05] lowercase`}
      >
        {note.title}
      </span>

      <span
        className={`${HAND} relative line-clamp-5 block text-[1.45rem] leading-[1.2] opacity-80`}
      >
        “{excerpt}”
      </span>

      {hasHer && note.myText && (
        <span
          className={`${HAND} relative mt-4 flex items-center gap-1.5 text-[1.25rem] text-purple-700`}
        >
          <Reply className="h-4 w-4" />
          ada balasanku di dalamnya
        </span>
      )}

      <span className="relative mt-5 flex items-center justify-between border-t-2 border-dashed border-purple-300/70 pt-3">
        <span className={`${HAND} text-xl opacity-70`}>{note.date}</span>
        <span className={`${HAND} text-[1.4rem] font-bold text-purple-700`}>baca surat</span>
      </span>
    </Card>
  );
}

const STACK_ROT = ['-rotate-6', 'rotate-3', '-rotate-1'];
const STACK_LEFT = ['left-0', 'left-[72px]', 'left-[36px]'];

function FavoriteCard({ note, noteIndex, onOpen, tilt, tape }) {
  return (
    <Card onClick={onOpen} tilt={tilt} tape={tape}>
      <span className="relative mb-7 block h-44">
        {note.items.slice(0, 3).map((item, i) => {
          const src = itemImage(item, seedOf(noteIndex, i));
          return (
            <span
              key={item.name}
              className={`absolute top-0 block h-40 w-32 overflow-hidden bg-[#fffdf8] p-1.5 pb-5 shadow-[0_8px_20px_-10px_rgba(43,36,51,0.5)] transition-transform duration-300 group-hover:-translate-y-1 ${STACK_LEFT[i]} ${STACK_ROT[i]}`}
              style={{ zIndex: i + 1 }}
            >
              {src && (
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              )}
            </span>
          );
        })}
      </span>

      <span
        className={`${HAND} relative mb-2 inline-block -rotate-2 border border-dashed border-[#d9b24c]/70 bg-[#f6df9c] px-3 py-0.5 text-[1.25rem] leading-tight`}
      >
        {note.category}
      </span>
      <span
        className={`${HAND} relative mb-1 block text-[2rem] font-bold leading-[1.05] lowercase`}
      >
        {note.title}
      </span>
      <span
        className={`${HAND} relative mb-3 block text-[1.35rem] leading-[1.15] lowercase opacity-75`}
      >
        {note.note}
      </span>
      <span className={`${HAND} relative block text-[1.35rem] leading-[1.15]`}>
        {note.items.map((item) => item.name).join(', ')}
      </span>
    </Card>
  );
}

/* ---------------- Popup ---------------- */

function NoteModal({ note, noteIndex, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    if (!prefersReduced()) {
      animate(overlayRef.current, { opacity: [0, 1], duration: 250, ease: 'outQuad' });
      animate(panelRef.current, {
        opacity: [0, 1],
        translateY: [32, 0],
        duration: 500,
        ease: 'outExpo',
      });
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isLetter = note.type === 'letter';
  const herName = note.herName ?? 'Dia';
  const hasHer = Boolean(note.herText);

  return createPortal(
    <div
      ref={overlayRef}
      data-lenis-prevent
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm md:items-center md:p-6"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl"
      >
        <Washi
          className="-top-3 left-1/2 z-10 h-6 w-28 -translate-x-1/2 -rotate-1"
          color={TAPES[0]}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={note.title}
          className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[14px] bg-[#fffaf2] shadow-[0_25px_60px_-15px_rgba(46,36,54,0.45)] md:rounded-[8px]"
          style={{ color: INK }}
        >
          {/* Header */}
          <div className="relative flex items-start justify-between gap-4 border-b-2 border-dashed border-purple-300/70 px-5 pb-4 pt-7 md:px-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-multiply"
              style={NOISE}
            />
            <div className="relative">
              <span
                className={`${HAND} mb-1 inline-block -rotate-1 bg-[#f6df9c] px-3 text-[1.25rem] leading-tight`}
              >
                {isLetter ? note.date : note.category}
              </span>
              <h3
                className={`${HAND} text-[2.2rem] font-bold leading-[1.02] lowercase md:text-[2.8rem]`}
              >
                {note.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Tutup"
              className="relative flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full border border-dashed border-purple-300 bg-white text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-purple-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Isi */}
          <div data-lenis-prevent className="overflow-y-auto overscroll-contain">
            {isLetter ? (
              <div className="px-5 py-8 md:px-8 md:py-10">
                {hasHer && (
                  <>
                    <p className={`${HAND} mb-3 flex items-center gap-2 text-2xl opacity-75`}>
                      <Mail className="h-4 w-4" />
                      dari {herName}
                    </p>
                    <div className="border-l-2 border-purple-300 pl-5 md:pl-7">
                      {paragraphs(note.herText).map((p, i) => (
                        <p
                          key={i}
                          className="mb-5 font-display text-[19px] leading-[1.7] last:mb-0 md:text-[22px]"
                        >
                          {p}
                        </p>
                      ))}
                    </div>

                    {note.myText && (
                      <div className="my-10 flex items-center gap-3">
                        <span className="h-0 flex-1 border-t-2 border-dashed border-purple-300/70" />
                        <span
                          className={`${HAND} flex items-center gap-1.5 text-2xl font-bold text-purple-700`}
                        >
                          <Reply className="h-4 w-4" />
                          balasanku
                        </span>
                        <span className="h-0 flex-1 border-t-2 border-dashed border-purple-300/70" />
                      </div>
                    )}
                  </>
                )}

                {note.myText && (
                  <Reveal className="relative rotate-1 bg-[#fbeaa9]/85 px-6 pb-8 pt-10 shadow-[0_12px_24px_-12px_rgba(60,35,80,0.5)] md:px-9">
                    <Washi
                      className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2"
                      color={TAPES[1]}
                    />
                    {!hasHer && (
                      <p className={`${HAND} mb-3 flex items-center gap-2 text-2xl opacity-75`}>
                        <HeartS className="h-5 w-5" />
                        buat kamu
                      </p>
                    )}
                    {paragraphs(note.myText).map((p, i) => (
                      <p
                        key={i}
                        className="mb-5 font-display text-[19px] leading-[1.7] md:text-[22px]"
                      >
                        {p}
                      </p>
                    ))}
                    <p className={`${HAND} text-right text-[2rem] leading-none opacity-80`}>
                      dari aku{' '}
                      <HeartS className="inline-block h-6 w-6 align-[-3px]" />
                    </p>
                  </Reveal>
                )}

                {note.herAfter && (
                  <Reveal className="mt-7 max-w-[85%]" delay={250}>
                    <p
                      className={`${HAND} -rotate-1 rounded-[3px] bg-white px-4 py-2.5 text-[1.4rem] leading-tight shadow-[0_8px_14px_-8px_rgba(60,35,80,0.5)]`}
                    >
                      <span className="block text-base opacity-60">{herName} bales</span>
                      {note.herAfter}
                    </p>
                  </Reveal>
                )}
              </div>
            ) : (
              <div className="px-5 py-8 md:px-8 md:py-9">
                {note.note && (
                  <p className={`${HAND} mb-7 text-[1.6rem] leading-[1.2] lowercase opacity-80`}>
                    {note.note}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  {note.items.map((item, i) => {
                    const src = itemImage(item, seedOf(noteIndex, i));
                    return (
                      <div
                        key={item.name}
                        className={`relative bg-white p-3 pb-4 shadow-[0_12px_22px_-12px_rgba(40,20,70,0.5)] ${ITEM_TILT[i % ITEM_TILT.length]}`}
                      >
                        <Washi
                          className="-top-3 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-3"
                          color={TAPES[i % TAPES.length]}
                        />
                        {src && (
                          <img
                            src={src}
                            alt={item.name}
                            loading="lazy"
                            draggable={false}
                            className="aspect-[4/3] w-full object-cover"
                          />
                        )}
                        <div className="px-1 pt-3">
                          <h4 className={`${HAND} text-[1.7rem] font-bold leading-[1.05]`}>
                            {item.name}
                          </h4>
                          {item.desc && (
                            <p
                              className={`${HAND} text-[1.25rem] leading-tight lowercase opacity-75`}
                            >
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Halaman ---------------- */

export default function NotesPage({ onClose }) {
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  // Hanya tampilkan daftar kesukaan (index asli tetap dipakai untuk popup & foto)
  const visible = NOTES.map((note, index) => ({ note, index })).filter(
    ({ note }) => note.type === 'favorite'
  );
  const favorites = visible.length;

  /* Kunci scroll halaman utama selama halaman ini terbuka */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, []);

  /* Satu momen masuk: halaman naik dari bawah */
  useLayoutEffect(() => {
    if (prefersReduced() || !pageRef.current) return undefined;
    const a = animate(pageRef.current, {
      opacity: [0, 1],
      translateY: [48, 0],
      duration: 650,
      ease: 'outExpo',
    });
    return () => a.revert();
  }, []);

  /* Kartu muncul bergantian tiap ganti filter */
  useLayoutEffect(() => {
    if (prefersReduced() || !gridRef.current) return undefined;
    const cards = gridRef.current.querySelectorAll('[data-card]');
    const a = animate(cards, {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 700,
      delay: stagger(70, { start: 150 }),
      ease: 'outExpo',
    });
    return () => a.revert();
  }, []);

  const close = useCallback(() => {
    if (prefersReduced() || !pageRef.current) {
      onClose();
      return;
    }
    animate(pageRef.current, {
      opacity: [1, 0],
      translateY: [0, 32],
      duration: 300,
      ease: 'inQuad',
      onComplete: onClose,
    });
  }, [onClose]);

  const closeModal = useCallback(() => setOpenIndex(null), []);

  /* Esc menutup halaman, kecuali popup lagi terbuka (popup punya Esc sendiri) */
  useEffect(() => {
    if (openIndex !== null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, close]);

  const openNote = openIndex !== null ? NOTES[openIndex] : null;

  return (
    <div
      ref={pageRef}
      data-lenis-prevent
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-cream text-ink"
    >
      <ScrapStyles />

      {/* Latar meja scrapbook yang menempel di layar saat halaman discroll */}
      <div aria-hidden="true" className="pointer-events-none sticky top-0 z-0 h-0">
        <div className="absolute left-0 top-0 h-svh w-full">
          <MomentsBackdrop note="" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-28 pt-6 md:px-10">
        <NoteButton
          onClick={() => {
            playPop();
            close();
          }}
          className="mb-12 md:mb-16"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>kembali</span>
        </NoteButton>

        <header className="mb-12 max-w-3xl md:mb-14">
          <div className="relative mb-8 inline-block -rotate-1 bg-[#faf4eb] px-8 pb-6 pt-9 shadow-[0_10px_22px_-8px_rgba(40,20,70,0.45)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-multiply"
              style={NOISE}
            />
            <Washi className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3" />
            <h1
              className={`${HAND} relative text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1]`}
              style={{ color: INK }}
            >
              <DecryptedText
                text="catatan kecil tentang kamu"
                animateOn="view"
                sequential
                speed={38}
                maxIterations={16}
                characters="abcdefghijklmnopqrstuvwxyz"
              />
            </h1>
            <Squiggle className="relative mt-3 w-40" />
            <StarS className="absolute -right-3 -top-3 h-7 w-7 rotate-12" />
          </div>

          <div className="relative max-w-md rotate-1 bg-[#fbeaa9] px-5 pb-5 pt-8 shadow-[0_8px_16px_-6px_rgba(60,35,80,0.4)]">
            <Washi
              className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3"
              color={TAPES[0]}
            />
          </div>
        </header>

        {/* Grid bertingkat: tinggi kartu beda-beda */}
        <div ref={gridRef} className="columns-1 gap-8 md:columns-2 lg:columns-3">
          {visible.map(({ note, index }) => (
            <div key={note.id} data-card className="mb-10 break-inside-avoid pt-3">
              {note.type === 'letter' ? (
                <LetterCard
                  note={note}
                  onOpen={() => setOpenIndex(index)}
                  tilt={CARD_TILT[index % CARD_TILT.length]}
                  tape={TAPES[index % TAPES.length]}
                />
              ) : (
                <FavoriteCard
                  note={note}
                  noteIndex={index}
                  onOpen={() => setOpenIndex(index)}
                  tilt={CARD_TILT[index % CARD_TILT.length]}
                  tape={TAPES[index % TAPES.length]}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {openNote && <NoteModal note={openNote} noteIndex={openIndex} onClose={closeModal} />}
    </div>
  );
}