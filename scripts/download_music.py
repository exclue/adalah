"""
Script untuk download lagu-lagu favorit ke src/assets/music/
Jalankan: python scripts/download_music.py
Format nama file: "Artis - Judul.mp3" biar kedeteksi MusicDrawer
"""

import subprocess
import os
import sys

# Folder tujuan
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'music')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Daftar lagu: (artis, judul, YouTube URL)
# URL bisa diisi langsung atau pakai ytsearch: untuk auto-search
SONGS = [
    # Taylor Swift (min 3)
    ("Taylor Swift", "Anti-Hero", "ytsearch1:Taylor Swift Anti-Hero official audio"),
    ("Taylor Swift", "Love Story (Taylor's Version)", "ytsearch1:Taylor Swift Love Story Taylor's Version audio"),
    ("Taylor Swift", "All Too Well (10 Minute Version)", "ytsearch1:Taylor Swift All Too Well 10 Minute Version audio"),
    ("Taylor Swift", "cardigan", "ytsearch1:Taylor Swift cardigan official audio"),

    # Wave to Earth (min 3)
    ("Wave to Earth", "light pt. 2", "ytsearch1:wave to earth light pt 2 audio"),
    ("Wave to Earth", "come", "ytsearch1:wave to earth come audio"),
    ("Wave to Earth", "happy hour", "ytsearch1:wave to earth happy hour audio"),

    # CAS (min 3)
    ("CAS", "Cigarettes", "ytsearch1:CAS cigarettes audio"),
    ("CAS", "SODA", "ytsearch1:CAS SODA audio"),
    ("CAS", "A Love Song", "ytsearch1:CAS a love song audio"),

    # LANY (min 3)
    ("LANY", "ILYSB", "ytsearch1:LANY ILYSB audio"),
    ("LANY", "Pink Skies", "ytsearch1:LANY Pink Skies audio"),
    ("LANY", "Malibu Nights", "ytsearch1:LANY Malibu Nights audio"),

    # NIKI (min 3)
    ("NIKI", "Before", "ytsearch1:NIKI Before audio"),
    ("NIKI", "Oceans & Engines", "ytsearch1:NIKI Oceans Engines audio"),
    ("NIKI", "Lose", "ytsearch1:NIKI Lose audio"),

    # Tulus (min 3)
    ("Tulus", "Gajah", "ytsearch1:Tulus Gajah audio"),
    ("Tulus", "Hati-Hati di Jalan", "ytsearch1:Tulus Hati Hati di Jalan audio"),
    ("Tulus", "Manusia Kuat", "ytsearch1:Tulus Manusia Kuat audio"),

    # HiVi! (min 3)
    ("HiVi", "Orang Ketiga", "ytsearch1:HiVi Orang Ketiga audio"),
    ("HiVi", "Siapkah Kau 'Tuk Jatuh Cinta Lagi", "ytsearch1:HiVi Siapkah Kau Tuk Jatuh Cinta Lagi audio"),
    ("HiVi", "Mata ke Hati", "ytsearch1:HiVi Mata ke Hati audio"),

    # Maliq & D'Essentials (min 3)
    ("Maliq & D'Essentials", "Aku", "ytsearch1:Maliq DEssentials Aku audio"),
    ("Maliq & D'Essentials", "Kamu Adalah Kamu", "ytsearch1:Maliq DEssentials Kamu Adalah Kamu audio"),
    ("Maliq & D'Essentials", "Terlalu Dalam", "ytsearch1:Maliq DEssentials Terlalu Dalam audio"),

    # Bernadya (min 3)
    ("Bernadya", "Satu Bulan", "ytsearch1:Bernadya Satu Bulan audio"),
    ("Bernadya", "Untukmu yang Merindu", "ytsearch1:Bernadya Untukmu Yang Merindu audio"),
    ("Bernadya", "Satu", "ytsearch1:Bernadya Satu audio"),

    # Olivia Rodrigo (min 3)
    ("Olivia Rodrigo", "drivers license", "ytsearch1:Olivia Rodrigo drivers license audio"),
    ("Olivia Rodrigo", "vampire", "ytsearch1:Olivia Rodrigo vampire audio"),
    ("Olivia Rodrigo", "good 4 u", "ytsearch1:Olivia Rodrigo good 4 u audio"),

    # Daniel Caesar (min 3)
    ("Daniel Caesar", "Best Part", "ytsearch1:Daniel Caesar Best Part audio"),
    ("Daniel Caesar", "Get You", "ytsearch1:Daniel Caesar Get You audio"),
    ("Daniel Caesar", "Blessed", "ytsearch1:Daniel Caesar Blessed audio"),

    # Arctic Monkeys (min 3)
    ("Arctic Monkeys", "Do I Wanna Know?", "ytsearch1:Arctic Monkeys Do I Wanna Know audio"),
    ("Arctic Monkeys", "R U Mine?", "ytsearch1:Arctic Monkeys R U Mine audio"),
    ("Arctic Monkeys", "505", "ytsearch1:Arctic Monkeys 505 audio"),

    # Ariana Grande (min 3)
    ("Ariana Grande", "thank u, next", "ytsearch1:Ariana Grande thank u next audio"),
    ("Ariana Grande", "positions", "ytsearch1:Ariana Grande positions audio"),
    ("Ariana Grande", "Into You", "ytsearch1:Ariana Grande Into You audio"),

    # Coldplay (min 3)
    ("Coldplay", "The Scientist", "ytsearch1:Coldplay The Scientist audio"),
    ("Coldplay", "Yellow", "ytsearch1:Coldplay Yellow audio"),
    ("Coldplay", "Fix You", "ytsearch1:Coldplay Fix You audio"),

    # Lana Del Rey (min 3)
    ("Lana Del Rey", "Summertime Sadness", "ytsearch1:Lana Del Rey Summertime Sadness audio"),
    ("Lana Del Rey", "Young and Beautiful", "ytsearch1:Lana Del Rey Young and Beautiful audio"),
    ("Lana Del Rey", "Video Games", "ytsearch1:Lana Del Rey Video Games audio"),
]

def safe_filename(artist, title):
    """Bersihkan nama file dari karakter ilegal."""
    name = f"{artist} - {title}"
    for ch in r'\/:*?"<>|':
        name = name.replace(ch, '')
    return name

def already_exists(artist, title):
    """Cek apakah file sudah ada di folder musik."""
    base = safe_filename(artist, title)
    for ext in ['.mp3', '.m4a', '.webm', '.opus']:
        if os.path.exists(os.path.join(OUTPUT_DIR, base + ext)):
            return True
    return False

def download(artist, title, query):
    if already_exists(artist, title):
        print(f"  [SKIP] {artist} - {title} (sudah ada)")
        return

    out_template = os.path.join(OUTPUT_DIR, f"{safe_filename(artist, title)}.%(ext)s")
    cmd = [
        sys.executable, '-m', 'yt_dlp',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '192K',
        '--no-playlist',
        '--quiet',
        '--no-warnings',
        '-o', out_template,
        query,
    ]
    print(f"  Downloading: {artist} - {title}...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  [OK] {artist} - {title}")
    else:
        print(f"  [GAGAL] {artist} - {title}: {result.stderr[:100]}")

if __name__ == '__main__':
    print(f"Output dir: {os.path.abspath(OUTPUT_DIR)}")
    print(f"Total lagu: {len(SONGS)}")
    print()
    for artist, title, query in SONGS:
        download(artist, title, query)
    print("\nSelesai!")
