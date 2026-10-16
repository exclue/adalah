import {
  INK,
  HAND,
  NOISE,
  TAPES,
  HeartS,
  StarS,
  Daisy,
  Washi,
  ScrapStyles,
  float,
} from '../story/scrap';

/* ---------------- Pengaturan teks ---------------- */
const NOTE_LINES = ['dibuat pelan-pelan,', 'pakai sayang.'];
const SIGN_OFF = 'dibuat Oktober 2026';
/* ------------------------------------------------- */

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com', icon: InstagramIcon },
  { name: 'Telegram', href: 'https://t.me', icon: TelegramIcon },
  { name: 'WhatsApp', href: 'https://wa.me', icon: WhatsAppIcon },
];

// Kemiringan tiap tag (ditulis utuh supaya terbaca Tailwind)
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1'];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-cream px-5 pb-10 pt-16 md:px-12">
      <ScrapStyles />

      {/* alas titik-titik + serat kertas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(121,84,146,.22) 1.2px, transparent 1.4px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-multiply"
        style={NOISE}
      />

      {/* garis jahitan di atas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-6 border-t-2 border-dashed border-purple-300/70 md:inset-x-12"
      />

      {/* hiasan sudut */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Daisy
          className="sb-anim absolute -bottom-5 -left-5 h-24 w-24 rotate-12 drop-shadow-md md:h-28 md:w-28"
          style={float(9)}
        />
        <StarS
          className="sb-anim absolute right-[8%] top-12 h-6 w-6 rotate-12"
          style={float(6, 0.4)}
        />
        <HeartS
          className="sb-anim absolute bottom-6 right-[6%] hidden h-7 w-7 -rotate-12 md:block"
          style={float(7.5, 1.2)}
        />
        <StarS
          className="sb-anim absolute bottom-10 left-[26%] hidden h-5 w-5 -rotate-6 md:block"
          style={float(8, 0.8)}
          fill="#f4b6c8"
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-9 sm:flex-row">
        {/* sticky note kecil */}
        <div className="relative -rotate-1 bg-[#fbeaa9] px-7 pb-5 pt-8 shadow-[0_10px_18px_-8px_rgba(60,35,80,0.45)]">
          <Washi
            className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2"
            color={TAPES[0]}
          />
          <p className={`${HAND} text-[1.7rem] leading-[1.1]`} style={{ color: INK }}>
            {NOTE_LINES.map((line, i) => (
              <span key={i} className="block">
                {line}
                {i === NOTE_LINES.length - 1 && (
                  <>
                    {' '}
                    <HeartS className="inline-block h-6 w-6 align-[-4px]" />
                  </>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* link sosial: tag kertas bertape */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-5">
          {socialLinks.map(({ name, href, icon: Icon }, i) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className={`${HAND} group relative inline-flex ${TILTS[i % TILTS.length]} cursor-pointer items-center gap-2 bg-[#fffaf2] px-5 pb-2 pt-3 text-[1.5rem] leading-none shadow-[0_8px_14px_-8px_rgba(60,35,80,0.5)] transition-all duration-300 hover:-translate-y-1 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600`}
              style={{ color: INK }}
            >
              <Washi
                className="-top-2.5 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-3"
                color={TAPES[(i + 1) % TAPES.length]}
              />
              <Icon className="h-5 w-5 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
              <span>{name}</span>
            </a>
          ))}
        </div>
      </div>

      <p
        className={`${HAND} relative mt-10 text-center text-xl opacity-70`}
        style={{ color: INK }}
      >
        {SIGN_OFF}
      </p>
    </footer>
  );
}