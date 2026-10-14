import { useRef } from 'react';
import { ArrowRight, Heart, Utensils } from 'lucide-react';
import { NOTES } from '../../data/notes';
import { allImages } from '../../data/media';
import { playPop } from '../../utils/sound';
import { useReveal, Magnetic } from '../story/kit';

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

  return (
    <section
      id="favorites-preview"
      ref={ref}
      className="bg-[#0d0917] px-4 py-20 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span
              data-r
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300"
            >
              <Heart className="h-3.5 w-3.5 fill-purple-300" />
              hal-hal kesukaan
            </span>
            <h2
              data-r
              className="text-3xl font-semibold tracking-tight text-white md:text-5xl"
            >
              yang selalu bikin kamu senyum
            </h2>
            <p
              data-r
              className="mt-3 text-sm leading-relaxed text-white/65 md:text-base"
            >
              Daftar hal-hal kecil yang kamu suka, dari makanan favorit sampai tempat yang bikin kamu nyaman.
            </p>
          </div>

          <div data-r className="flex-none">
            <Magnetic>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  onGoToAllFavorites?.();
                }}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-purple-300/30 bg-purple-500/10 px-5 py-3 text-sm font-medium text-purple-200 transition-all hover:border-purple-300/60 hover:bg-purple-500/20 active:scale-95"
              >
                <span>Lihat Semua Kesukaan</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {favoriteNotes.map((note, index) => {
            const previewItems = note.items || [];
            return (
              <div
                key={note.id}
                data-r
                onClick={() => {
                  playPop();
                  onGoToAllFavorites?.();
                }}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 bg-[#1a1030]/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300/40 hover:bg-[#20143d] hover:shadow-[0_12px_30px_-10px_rgba(168,85,247,0.2)] md:p-7"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-purple-300/15 px-3 py-1 text-xs font-medium text-purple-200">
                      {note.category}
                    </span>
                    <Heart className="h-4 w-4 text-purple-300/50 transition-colors group-hover:text-purple-300" />
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-purple-200">
                    {note.title}
                  </h3>
                  <p className="mb-6 text-xs leading-relaxed text-white/65">
                    {note.note}
                  </p>

                  <div className="space-y-2">
                    {previewItems.slice(0, 3).map((item, itemIdx) => {
                      const img = itemImage(item, index * 3 + itemIdx);
                      return (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 rounded-xl bg-black/25 p-2.5 transition-colors group-hover:bg-black/35"
                        >
                          {img && (
                            <img
                              src={img}
                              alt=""
                              draggable={false}
                              className="h-10 w-10 flex-none rounded-lg object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                              {item.name}
                            </p>
                            <p className="truncate text-[11px] text-white/50">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-purple-300">
                  <span className="font-medium">Buka detail</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}