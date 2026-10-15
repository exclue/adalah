import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { NOTES } from '../../data/notes';
import { allImages } from '../../data/media';
import { playPop } from '../../utils/sound';
import { useReveal } from '../story/kit';

export { NOTES };

const itemImage = (item, seed) => {
  if (item?.image) return item.image;
  if (!allImages.length) return null;
  return allImages[seed % allImages.length].url;
};

export default function NotesScene({ onGoToAllFavorites }) {
  const ref = useRef(null);
  useReveal(ref);

  const favoriteNotes = NOTES.filter((n) => n.type === 'favorite');

  const open = () => {
    playPop();
    onGoToAllFavorites?.();
  };

  return (
    <section id="favorites-preview" ref={ref} className="bg-paper-warm px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2
              data-r
              className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.02] tracking-tight text-ink"
            >
              Semua hal hal yang kamu suka
            </h2>
            <p data-r className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
              aku simpan semua kesukaan atau hal hal bahagia dan juga long teks yang kamu kasih ke aku
              walaupun ngga lengkap tapi aku berusaha buat lengkapin dan ingin lebih tau kamu
            </p>
          </div>

          <div data-r className="flex-none">
            <button
              type="button"
              onClick={open}
              className="group inline-flex cursor-pointer items-center gap-2 border-b border-ink/30 pb-1 text-sm font-medium text-ink transition-colors hover:border-purple-600 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600"
            >
              <span>Lihat Semua Kesukaan</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Tanpa kotak: tiap kolom dibuka garis tipis, isinya daftar bergaris */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-3">
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
                className="group flex cursor-pointer flex-col border-t border-ink/15 pt-6 outline-none transition-colors duration-500 hover:border-purple-600 focus-visible:border-purple-600"
              >
                <p className="mb-5 text-sm text-ink-soft">{note.category}</p>

                <h3 className="mb-3 font-display text-[1.9rem] font-medium leading-[1.1] tracking-tight text-ink transition-colors duration-300 group-hover:text-purple-700">
                  {note.title}
                </h3>
                <p className="mb-8 text-sm leading-relaxed text-ink-soft">{note.note}</p>

                <ul className="divide-y divide-line border-y border-line">
                  {previewItems.map((item, itemIdx) => {
                    const img = itemImage(item, index * 3 + itemIdx);
                    return (
                      <li key={item.name} className="flex items-center gap-3 py-3">
                        {img && (
                          <img
                            src={img}
                            alt=""
                            draggable={false}
                            className="h-11 w-11 flex-none rounded-[6px] object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                          <p className="truncate text-xs text-ink-soft">{item.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex items-center justify-between text-sm text-purple-700">
                  <span className="font-medium">Buka detail</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}