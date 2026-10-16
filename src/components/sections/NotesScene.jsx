import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { NOTES } from '../../data/notes';
import { allImages } from '../../data/media';
import { playPop } from '../../utils/sound';
import { useReveal } from '../story/kit';
import {
  INK,
  HAND,
  NOISE,
  TAPES,
  StarS,
  Squiggle,
  Washi,
  PatchButton,
  ScrapStyles,
  MomentsBackdrop,
} from '../story/scrap';

export { NOTES };

/* ---------------- Pengaturan ---------------- */
const STICKY_TEXT = 'ketuk satu kolom buat lihat semuanya';
const CARD_TILT = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]']; // kemiringan tiap kolom
const THUMB_TILT = ['-rotate-3', 'rotate-2', '-rotate-1']; // kemiringan polaroid kecil
/* -------------------------------------------- */

const itemImage = (item, seed) => {
  if (item?.image) return item.image;
  if (!allImages.length) return null;
  return allImages[seed % allImages.length].url;
};

export default function NotesScene({ onGoToAllFavorites }) {
  const ref = useRef(null);
  useReveal(ref);

  const favoriteNotes = NOTES.filter((n) => n.type === 'favorite');
  // taruh sementara di NotesScene.jsx, di bawah const favoriteNotes
  console.log(favoriteNotes.map((n) => n.id + ' | ' + n.title));

  const open = () => {
    playPop();
    onGoToAllFavorites?.();
  };

  return (
    <section
      id="favorites-preview"
      ref={ref}
      className="relative overflow-hidden bg-paper-warm px-5 py-24 md:px-10 md:py-36"
    >
      <ScrapStyles />
      <MomentsBackdrop note="" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div data-r>
              <div className="relative inline-block -rotate-1 bg-[#faf4eb] px-7 pb-6 pt-9 shadow-[0_10px_22px_-8px_rgba(40,20,70,0.45)]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-multiply"
                  style={NOISE}
                />
                <Washi className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3" />
                <h2
                  className={`${HAND} relative text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[1]`}
                  style={{ color: INK }}
                >
                  Semua hal hal yang kamu suka
                </h2>
                <Squiggle className="relative mt-3 w-32 md:w-40" />
                <StarS className="absolute -right-3 -top-3 h-7 w-7 rotate-12" />
              </div>
            </div>

            <div data-r className="mt-7">
              <div className="relative max-w-md rotate-1 bg-[#fbeaa9] px-5 pb-5 pt-8 shadow-[0_8px_16px_-6px_rgba(60,35,80,0.4)]">
                <Washi
                  className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3"
                  color={TAPES[0]}
                />
                <p className={`${HAND} text-[1.45rem] leading-[1.2]`} style={{ color: INK }}>
                  aku simpan semua kesukaan atau hal hal bahagia dan juga long teks yang kamu kasih
                  ke aku walaupun ngga lengkap tapi aku berusaha buat lengkapin dan ingin lebih tau
                  kamu
                </p>
              </div>
            </div>
          </div>

          <div data-r className="flex-none">
            <PatchButton onClick={open}>
              <span>Lihat Semua Kesukaan</span>
              <ArrowRight className="h-5 w-5" />
            </PatchButton>
          </div>
        </div>

        {/* Tiap kolom = selembar kertas catatan yang ditempel */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
          {favoriteNotes.map((note, index) => {
            const previewItems = (note.items || []).slice(0, 3);
            return (
              <article
                key={note.id}
                data-r
                role="button"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                  }
                }}
                className="group cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-purple-600"
              >
                <div
                  className={`relative ${CARD_TILT[index % CARD_TILT.length]} bg-[#fffaf2] px-6 pb-6 pt-9 shadow-[0_14px_28px_-12px_rgba(40,20,70,0.45)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:rotate-0`}
                  style={{ color: INK }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply"
                    style={NOISE}
                  />
                  <Washi
                    className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2"
                    color={TAPES[index % TAPES.length]}
                  />

                  <span
                    className={`${HAND} relative inline-block -rotate-2 border border-dashed border-[#d9b24c]/70 bg-[#f6df9c] px-3 py-0.5 text-[1.3rem] leading-tight`}
                  >
                    {note.category}
                  </span>

                  <h3
                    className={`${HAND} relative mt-4 text-[2rem] font-bold leading-[1.05] lowercase`}
                  >
                    {note.title}
                  </h3>
                  <p
                    className={`${HAND} relative mb-5 mt-1 text-[1.35rem] leading-[1.15] lowercase opacity-75`}
                  >
                    {note.note}
                  </p>

                  <ul className="relative border-t-2 border-dashed border-purple-300/70">
                    {previewItems.map((item, itemIdx) => {
                      const img = itemImage(item, index * 3 + itemIdx);
                      return (
                        <li
                          key={item.name}
                          className="flex items-center gap-3 border-b-2 border-dashed border-purple-300/50 py-3"
                        >
                          {img && (
                            <span
                              className={`block flex-none bg-[#fffdf8] p-1 pb-2 shadow-[0_6px_12px_-6px_rgba(40,20,70,0.5)] ${THUMB_TILT[itemIdx % THUMB_TILT.length]}`}
                            >
                              <img
                                src={img}
                                alt=""
                                draggable={false}
                                className="h-12 w-12 object-cover"
                              />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`${HAND} truncate text-[1.5rem] font-bold leading-none`}>
                              {item.name}
                            </p>
                            <p
                              className={`${HAND} truncate text-[1.15rem] leading-tight lowercase opacity-70`}
                            >
                              {item.desc}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div
                    className={`${HAND} relative mt-4 flex items-center justify-between text-[1.5rem] font-bold text-purple-700`}
                  >
                    <span>buka detail</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}