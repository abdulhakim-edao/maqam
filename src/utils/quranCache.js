const DB_NAME = "maqam_quran";
const STORE = "pages";
const VERSION = 4; // v4: back to standard Uthmani Unicode (Scheherazade New font)

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE);
      db.createObjectStore(STORE, { keyPath: "page" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

export function openQuranDB() {
  return openDB();
}

export function getPageCached(db, pageNum) {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(pageNum);
    req.onsuccess = () => resolve(req.result?.verses ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function downloadFullQuran(onProgress) {
  const db = await openDB();

  // Already cached with v4 format?
  const count = await new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
  if (count >= 604) {
    const sample = await getPageCached(db, 1);
    if (sample && sample.length > 0 && sample[0].text !== undefined) {
      onProgress(1);
      return db;
    }
  }

  onProgress(0.04);

  // Fetch full Uthmani Quran from alquran.cloud (single request, ~2MB)
  const res = await fetch("https://api.alquran.cloud/v1/quran/quran-uthmani");
  const data = await res.json();
  onProgress(0.55);

  if (data.code !== 200) throw new Error("API error");

  // Organize ayahs into Mushaf page buckets
  const pageMap = {};
  for (const surah of data.data.surahs) {
    for (const ayah of surah.ayahs) {
      const p = ayah.page;
      if (!pageMap[p]) pageMap[p] = [];
      pageMap[p].push({
        key: surah.number + ":" + ayah.numberInSurah,
        text: ayah.text,
        surahNum: surah.number,
        verseNum: ayah.numberInSurah,
        surahName: surah.name,
        revType: surah.revelationType, // 'Meccan' | 'Medinan'
        hizbQuarter: ayah.hizbQuarter,
        juz: ayah.juz,
      });
    }
  }

  onProgress(0.7);

  // Write all 604 pages in one transaction
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  for (let p = 1; p <= 604; p++) {
    store.put({ page: p, verses: pageMap[p] ?? [] });
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });

  onProgress(1);
  return db;
}
