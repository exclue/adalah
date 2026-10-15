import { useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import Footer from './components/common/Footer';
import StorySection from './components/sections/StorySection';
import NotesPage from './components/sections/NotesPage';
import './App.css';

// #/catatan atau #/catatan/favorit -> halaman Catatan terbuka
const parseHash = () => {
  const h = window.location.hash;
  if (!h.startsWith('#/catatan')) return null;
  return { filter: h.includes('favorit') ? 'favorit' : 'semua' };
};

function App() {
  const [notesRoute, setNotesRoute] = useState(parseHash);

  // Lenis smooth scroll. Instance disimpan di window supaya goTo() di kit.jsx
  // bisa memakai scroll yang sama (bukan scroll bawaan browser).
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    window.__lenis = lenis;

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  // Tombol back/forward browser ikut membuka/menutup halaman Catatan
  useEffect(() => {
    const onHash = () => setNotesRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openNotes = useCallback((filter = 'semua') => {
    window.location.hash = filter === 'favorit' ? '/catatan/favorit' : '/catatan';
  }, []);

  const closeNotes = useCallback(() => {
    // Hapus hash tanpa loncat scroll, halaman utama tetap di posisi semula
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setNotesRoute(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <main className="w-full flex-1">
        <StorySection
          onExploreFavorites={() => openNotes('favorit')}
          onOpenNotes={() => openNotes('semua')}
        />
      </main>

      <Footer />

      {notesRoute && <NotesPage initialFilter={notesRoute.filter} onClose={closeNotes} />}
    </div>
  );
}

export default App;