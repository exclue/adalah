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
    <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-[#1a1030] px-2 py-5 md:py-8">
      <span className="text-[clamp(2rem,9vw,5rem)] font-semibold leading-none tabular-nums tracking-tight text-white">
        {value}
      </span>
      <span className="mt-3 text-xs font-medium text-purple-300 md:text-sm">{label}</span>
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
    <section
      id="countdown"
      ref={ref}
      className="bg-[#0d0917] px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-4xl text-center">
        {state.isBirthday ? (
          <>
            <Heart className="mx-auto mb-6 h-10 w-10 animate-pulse text-purple-300" />
            <h2
              data-r
              className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-6xl"
            >
              selamat ulang tahun!
            </h2>
            <p data-r className="mx-auto max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              Hari ini hari kamu. Semoga semua yang kamu harapin pelan-pelan jadi nyata, dan
              aku masih jadi bagian dari harinya.
            </p>
          </>
        ) : (
          <>
            <h2
              data-r
              className="mb-3 text-3xl font-semibold tracking-tight text-white md:text-5xl"
            >
              hitung mundur ke hari spesialmu
            </h2>
            <p data-r className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-white/65 md:text-base">
              Tinggal sebentar lagi sampai {dateText}.
            </p>

            <div data-r className="grid grid-cols-4 gap-2 md:gap-5" role="timer" aria-live="off">
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