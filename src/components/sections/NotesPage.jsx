import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate, stagger } from 'animejs';
import { ArrowLeft, Heart, Mail, Reply, X } from 'lucide-react';
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

/* Kartu dasar: satu gaya, satu radius, smooth elevation tanpa efek AI berlebihan */
function Card({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => {
        playPop();
        onClick();
      }}
      className={`group block w-full cursor-pointer rounded-[14px] border border-line bg-[#fffdf9] p-6 text-left shadow-[0_4px_16px_-4px_rgba(60,40,75,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-[0_12px_28px_-8px_rgba(60,40,75,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600 md:p-7 ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- Kartu ---------------- */

function LetterCard({ note, onOpen }) {
  const hasHer = Boolean(note.herText);
  const excerpt = (hasHer ? note.herText : note.myText).replace(/\s+/g, ' ');

  return (
    <Card onClick={onOpen}>
      <span className="mb-5 flex items-center justify-between text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          {hasHer ? 'surat dari dia' : 'surat dariku'}
        </span>
        <Heart className="h-4 w-4 text-purple-400" />
      </span>

      <span className="mb-3 block font-display text-[1.7rem] font-medium leading-[1.1] tracking-tight text-ink">
        {note.title}
      </span>

      <span className="line-clamp-5 block font-display text-[17px] italic leading-7 text-ink/75">
        “{excerpt}”
      </span>

      {hasHer && note.myText && (
        <span className="mt-5 flex items-center gap-1.5 text-xs text-purple-700">
          <Reply className="h-3.5 w-3.5" />
          ada balasanku di dalamnya
        </span>
      )}

      <span className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-soft">
        <span>{note.date}</span>
        <span className="font-medium text-purple-700">baca surat</span>
      </span>
    </Card>
  );
}

const STACK_ROT = ['-rotate-6', 'rotate-3', '-rotate-1'];
const STACK_LEFT = ['left-0', 'left-[72px]', 'left-[36px]'];

function FavoriteCard({ note, noteIndex, onOpen }) {
  return (
    <Card onClick={onOpen}>
      <span className="relative mb-7 block h-44">
        {note.items.slice(0, 3).map((item, i) => {
          const src = itemImage(item, seedOf(noteIndex, i));
          return (
            <span
              key={item.name}
              className={`absolute top-0 block h-40 w-32 overflow-hidden rounded-[6px] border-4 border-[#fffdf9] bg-paper-2 shadow-[0_8px_20px_-10px_rgba(43,36,51,0.5)] transition-transform duration-300 group-hover:-translate-y-1 ${STACK_LEFT[i]} ${STACK_ROT[i]}`}
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

      <span className="mb-1 block text-xs text-ink-soft">{note.category}</span>
      <span className="mb-2 block font-display text-[1.7rem] font-medium leading-[1.1] tracking-tight text-ink">
        {note.title}
      </span>
      <span className="mb-4 block text-sm leading-relaxed text-ink-soft">{note.note}</span>
      <span className="block text-sm leading-relaxed text-ink/80">
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
        role="dialog"
        aria-modal="true"
        aria-label={note.title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[20px] border border-line bg-paper shadow-[0_25px_60px_-15px_rgba(46,36,54,0.35)] md:rounded-[20px]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-8 md:py-5">
          <div>
            <span className="mb-1 block text-xs text-ink-soft">
              {isLetter ? note.date : note.category}
            </span>
            <h3 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
              {note.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Tutup"
            className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-purple-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Isi */}
        <div data-lenis-prevent className="overflow-y-auto overscroll-contain">
          {isLetter ? (
            <div className="px-5 py-7 md:px-8 md:py-9">
              {hasHer && (
                <>
                  <p className="mb-4 flex items-center gap-2 text-xs text-ink-soft">
                    <Mail className="h-3.5 w-3.5" />
                    dari {herName}
                  </p>
                  <div className="border-l-2 border-purple-300 pl-5 md:pl-7">
                    {paragraphs(note.herText).map((p, i) => (
                      <p
                        key={i}
                        className="mb-5 font-display text-[19px] leading-[1.7] text-ink last:mb-0 md:text-[22px]"
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  {note.myText && (
                    <div className="my-9 flex items-center gap-3">
                      <span className="h-px flex-1 bg-line" />
                      <span className="flex items-center gap-1.5 text-xs font-medium text-purple-700">
                        <Reply className="h-3.5 w-3.5" />
                        balasanku
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                  )}
                </>
              )}

              {note.myText && (
                <Reveal className="rounded-[12px] border border-purple-200/80 bg-purple-100/70 px-6 py-7 text-purple-950 md:px-9 md:py-9">
                  {!hasHer && (
                    <p className="mb-4 flex items-center gap-2 text-xs text-purple-800/70">
                      <Heart className="h-3.5 w-3.5" />
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
                  <p className="text-right font-display text-lg italic text-purple-800/70">
                    dari aku
                  </p>
                </Reveal>
              )}

              {note.herAfter && (
                <Reveal className="mt-5 max-w-[85%]" delay={250}>
                  <p className="rounded-[10px] rounded-bl-sm bg-paper-2 px-4 py-3 text-sm text-ink">
                    <span className="mb-1 block text-[11px] text-ink-soft">{herName} bales</span>
                    {note.herAfter}
                  </p>
                </Reveal>
              )}
            </div>
          ) : (
            <div className="px-5 py-6 md:px-8 md:py-8">
              {note.note && (
                <p className="mb-6 text-sm leading-relaxed text-ink-soft md:text-base">
                  {note.note}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {note.items.map((item, i) => {
                  const src = itemImage(item, seedOf(noteIndex, i));
                  return (
                    <div
                      key={item.name}
                      className="overflow-hidden rounded-[10px] border border-line bg-[#fffdf9]"
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
                        <h4 className="mb-1 text-base font-semibold text-ink">{item.name}</h4>
                        {item.desc && (
                          <p className="text-xs leading-relaxed text-ink-soft md:text-sm">
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
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-paper text-ink"
    >
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-6 md:px-10">
        <button
          type="button"
          onClick={() => {
            playPop();
            close();
          }}
          className="mb-14 inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600 md:mb-20"
        >
          <ArrowLeft className="h-4 w-4" />
          kembali
        </button>

        <header className="mb-14 max-w-3xl md:mb-16">
          <h1 className="mb-6 font-display text-[clamp(2.8rem,8vw,6rem)] font-medium leading-[1] tracking-tight text-ink">
            <DecryptedText
              text="catatan kecil tentang kamu"
              animateOn="view"
              sequential
              speed={38}
              maxIterations={16}
              characters="abcdefghijklmnopqrstuvwxyz"
            />
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-ink-soft md:text-base">
            {letters} surat yang aku simpan, dan {favorites} daftar hal yang kamu suka. Ketuk satu
            buat buka.
          </p>
        </header>

        {/* Filter: tab bergaris bawah */}
        <div
          role="tablist"
          aria-label="Filter catatan"
          className="mb-10 flex gap-7 border-b border-line"
        >
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
                className={`-mb-px cursor-pointer border-b-2 pb-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${
                  active
                    ? 'border-purple-600 font-medium text-ink'
                    : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid bertingkat: tinggi kartu beda-beda */}
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