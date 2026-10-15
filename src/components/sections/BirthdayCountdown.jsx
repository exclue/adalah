import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useReveal } from '../story/kit';

// Tanggal ulang tahun (bulan mulai dari 0, jadi 0 = Januari)
const BIRTH_MONTH = 0;
const BIRTH_DAY = 10;

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

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center px-1 py-8 md:py-12">
      <span className="font-display text-[clamp(2.4rem,9vw,6rem)] font-medium leading-none tabular-nums text-ink">
        {value}
      </span>
      <span className="mt-3 text-xs text-ink-soft md:text-sm">{label}</span>
    </div>
  );
}

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
    <section id="countdown" ref={ref} className="bg-paper-warm px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-4xl text-center">
        {state.isBirthday ? (
          <>
            <Heart className="mx-auto mb-6 h-9 w-9 animate-pulse text-purple-600" />
            <h2
              data-r
              className="mb-4 font-display text-[clamp(2.6rem,7vw,5rem)] font-medium leading-[1.02] tracking-tight text-ink"
            >
              selamat ulang tahun!
            </h2>
            <p data-r className="mx-auto max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
              Hari ini hari kamu. Semoga semua yang kamu harapin pelan-pelan jadi nyata, dan
              aku masih jadi bagian dari harinya.
            </p>
          </>
        ) : (
          <>
            <h2
              data-r
              className="mb-4 font-display text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-[1.05] tracking-tight text-ink"
            >
              hitung mundur ke hari spesialmu
            </h2>
            <p data-r className="mx-auto mb-12 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
              Tinggal sebentar lagi sampai {dateText}.
            </p>

            <div
              data-r
              className="grid grid-cols-4 divide-x divide-line border-y border-line"
              role="timer"
              aria-live="off"
            >
              <Unit value={state.days} label="hari" />
              <Unit value={pad(state.hours)} label="jam" />
              <Unit value={pad(state.minutes)} label="menit" />
              <Unit value={pad(state.seconds)} label="detik" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}