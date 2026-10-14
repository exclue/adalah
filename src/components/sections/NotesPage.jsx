import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate, stagger } from 'animejs';
import { ArrowLeft, Heart, Mail, Reply, Sparkles, X } from 'lucide-react';
import DecryptedText from '../reactbits/DecryptedText';
import { allImages } from '../../data/media';
import { NOTES } from '../../data/notes';
import { playPop } from '../../utils/sound';
import { prefersReduced } from '../story/kit';

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

/* Kartu dengan tilt 3D + cahaya yang ngikutin kursor (gaya TiltedCard + SpotlightCard) */
function FancyCard({ children, onClick, className = '', tilt = 6 }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = (y / r.height - 0.5) * -2 * tilt;
    const ry = (x / r.width - 0.5) * 2 * tilt;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        playPop();
        onClick();
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative block w-full cursor-pointer overflow-hidden text-left transition-transform duration-200 ease-out will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(192,132,252,0.22), transparent 55%)',
        }}
      />
      <span className="relative block">{children}</span>
    </button>
  );
}

/* ---------------- Kartu ---------------- */

function LetterCard({ note, onOpen }) {
  const hasHer = Boolean(note.herText);
  const excerpt = (hasHer ? note.herText : note.myText).replace(/\s+/g, ' ');

  return (
    <FancyCard
      onClick={onOpen}
      className="rounded-[28px] border border-white/10 bg-[#1a1030] p-6 hover:border-purple-300/40 md:p-7"
    >
      <span className="mb-5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-purple-200">
          <Mail className="h-3.5 w-3.5" />
          {hasHer ? 'surat dari dia' : 'surat dariku'}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-300/15 text-purple-200">
          <Heart className="h-4 w-4" fill="currentColor" />
        </span>
      </span>

      <span className="mb-3 block text-xl font-bold text-white md:text-2xl">{note.title}</span>

      <span className="line-clamp-5 block font-serif text-[15px] italic leading-7 text-white/70">
        “{excerpt}”
      </span>

      {hasHer && note.myText && (
        <span className="mt-5 flex items-center gap-2 rounded-xl bg-purple-200/10 px-3 py-2 text-xs text-purple-200">
          <Reply className="h-3.5 w-3.5" />
          ada balasanku di dalamnya
        </span>
      )}

      <span className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/55">
        <span>{note.date}</span>
        <span className="font-medium text-purple-200">baca surat</span>
      </span>
    </FancyCard>
  );
}

const STACK_ROT = ['-rotate-6', 'rotate-3', '-rotate-1'];
const STACK_LEFT = ['left-0', 'left-[72px]', 'left-[36px]'];

function FavoriteCard({ note, noteIndex, onOpen }) {
  return (
    <FancyCard
      onClick={onOpen}
      tilt={9}
      className="rounded-[28px] border border-purple-300/20 bg-gradient-to-b from-[#241442] to-[#150d27] p-6 hover:border-purple-300/50 md:p-7"
    >
      <span className="relative mb-6 block h-44">
        {note.items.slice(0, 3).map((item, i) => {
          const src = itemImage(item, seedOf(noteIndex, i));
          return (
            <span
              key={item.name}
              className={`absolute top-0 block h-40 w-32 overflow-hidden rounded-2xl border-4 border-[#1a1030] bg-purple-300/10 shadow-xl transition-transform duration-300 group-hover:-translate-y-1 ${STACK_LEFT[i]} ${STACK_ROT[i]}`}
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

      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-purple-300">
        <Sparkles className="h-3.5 w-3.5" />
        {note.category}
      </span>
      <span className="mb-2 block text-xl font-bold text-white md:text-2xl">{note.title}</span>
      <span className="mb-5 block text-sm leading-relaxed text-white/65">{note.note}</span>

      <span className="flex flex-wrap gap-2">
        {note.items.map((item) => (
          <span
            key={item.name}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80"
          >
            {item.name}
          </span>
        ))}
      </span>
    </FancyCard>
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
        scale: [0.96, 1],
        duration: 450,
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm md:items-center md:p-6"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={note.title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#150d27] md:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-8 md:py-5">
          <div>
            <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-purple-300">
              {isLetter ? <Mail className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isLetter ? note.date : note.category}
            </span>
            <h3 className="text-lg font-semibold text-white md:text-2xl">{note.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Tutup"
            className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-purple-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Isi */}
        <div data-lenis-prevent className="overflow-y-auto overscroll-contain">
          {isLetter ? (
            <div className="px-5 py-7 md:px-8 md:py-9">
              {/* Surat dia, di atas */}
              {hasHer && (
                <>
                  <p className="mb-3 flex items-center gap-2 text-xs text-white/50">
                    <Mail className="h-3.5 w-3.5" />
                    dari {herName}
                  </p>
                  <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] px-6 pb-7 pt-9 md:px-9 md:pb-9 md:pt-11">
                    <span
                      aria-hidden="true"
                      className="absolute left-6 top-2 font-serif text-7xl leading-none text-purple-400/50 md:left-9"
                    >
                      “
                    </span>
                    {paragraphs(note.herText).map((p, i) => (
                      <p
                        key={i}
                        className="mb-5 font-serif text-[17px] leading-8 text-white/90 last:mb-0 md:text-xl md:leading-9"
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  {note.myText && (
                    <div className="my-8 flex items-center gap-3">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="flex items-center gap-1.5 rounded-full bg-purple-200 px-3.5 py-1.5 text-xs font-semibold text-purple-950">
                        <Reply className="h-3.5 w-3.5" />
                        balasanku
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                  )}
                </>
              )}

              {/* Balasanmu, di bawah */}
              {note.myText && (
                <Reveal className="rounded-3xl bg-purple-200 px-6 py-7 text-purple-950 md:px-9 md:py-9">
                  {!hasHer && (
                    <p className="mb-4 flex items-center gap-2 text-xs font-medium text-purple-900/70">
                      <Heart className="h-3.5 w-3.5" fill="currentColor" />
                      buat kamu
                    </p>
                  )}
                  {paragraphs(note.myText).map((p, i) => (
                    <p
                      key={i}
                      className="mb-5 font-serif text-[17px] leading-8 md:text-xl md:leading-9"
                    >
                      {p}
                    </p>
                  ))}
                  <p className="text-right font-serif text-base italic text-purple-900/70">
                    dari aku
                  </p>
                </Reveal>
              )}

              {note.herAfter && (
                <Reveal className="mt-5 max-w-[85%]" delay={250}>
                  <p className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-white/85">
                    <span className="mb-1 block text-[11px] text-white/45">
                      {herName} bales
                    </span>
                    {note.herAfter}
                  </p>
                </Reveal>
              )}
            </div>
          ) : (
            <div className="px-5 py-6 md:px-8 md:py-8">
              {note.note && (
                <p className="mb-5 text-sm leading-relaxed text-white/70 md:text-base">
                  {note.note}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {note.items.map((item, i) => {
                  const src = itemImage(item, seedOf(noteIndex, i));
                  return (
                    <div
                      key={item.name}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1030]"
                    >
                      {src && (
                        <img
                          src={src}
                          alt={item.name}
                          loading="lazy"
                          draggable={false}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="mb-1 text-base font-semibold text-white">{item.name}</h4>
                        {item.desc && (
                          <p className="text-xs leading-relaxed text-white/65 md:text-sm">
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
    </div>,
    document.body
  );
}

/* ---------------- Halaman ---------------- */

export default function NotesPage({ initialFilter = 'semua', onClose }) {
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const [filter, setFilter] = useState(initialFilter);
  const [openIndex, setOpenIndex] = useState(null);

  const letters = NOTES.filter((n) => n.type === 'letter').length;
  const favorites = NOTES.length - letters;

  const visible = NOTES.map((note, index) => ({ note, index })).filter(({ note }) => {
    if (filter === 'surat') return note.type === 'letter';
    if (filter === 'favorit') return note.type === 'favorite';
    return true;
  });

  /* Kunci scroll halaman utama selama halaman ini terbuka */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
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
  }, [filter]);

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
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[#0d0917] text-white"
    >
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8">
        <button
          type="button"
          onClick={() => {
            playPop();
            close();
          }}
          className="mb-12 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300 md:mb-16"
        >
          <ArrowLeft className="h-4 w-4" />
          kembali
        </button>

        <header className="mb-12 max-w-3xl md:mb-14">
          <h1 className="mb-5 text-[clamp(2.6rem,8vw,6rem)] font-semibold leading-[1] tracking-tight">
            <DecryptedText
              text="catatan kecil tentang kamu"
              animateOn="view"
              sequential
              speed={38}
              maxIterations={16}
              characters="abcdefghijklmnopqrstuvwxyz"
            />
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-white/65 md:text-base">
            {letters} surat yang aku simpan, dan {favorites} daftar hal yang kamu suka. Ketuk satu
            buat buka.
          </p>
        </header>

        {/* Filter */}
        <div role="tablist" aria-label="Filter catatan" className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  playPop();
                  setFilter(f.id);
                }}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 ${
                  active
                    ? 'bg-purple-200 text-purple-950'
                    : 'border border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid bertingkat: tinggi kartu beda-beda, jadi nggak seragam */}
        <div ref={gridRef} key={filter} className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {visible.map(({ note, index }) => (
            <div key={note.id} data-card className="mb-6 break-inside-avoid">
              {note.type === 'letter' ? (
                <LetterCard note={note} onOpen={() => setOpenIndex(index)} />
              ) : (
                <FavoriteCard note={note} noteIndex={index} onOpen={() => setOpenIndex(index)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {openNote && <NoteModal note={openNote} noteIndex={openIndex} onClose={closeModal} />}
    </div>
  );
}