import { useState, useEffect, useRef, useMemo } from 'react'
import { getSurahForPage, getJuzForPage, getHizbQuarterForPage, SURAHS, TOTAL_PAGES } from '../utils/quranData'

const STORAGE_KEY = 'maqam_quran_page'
const BOOKMARKS_KEY = 'maqam_quran_bookmarks'
const pad = n => String(n).padStart(3, '0')
const pageUrl = n => `/quran_sources/quran-svg-opt/${pad(n)}.svg`

// Two-page spread: min content width ~1100px (sidebar ≥220 + 880 for pages)
const TWO_PAGE_QUERY = '(min-width: 1100px)'

function useTwoPage() {
  const check = () => window.matchMedia(TWO_PAGE_QUERY).matches
  const [on, setOn] = useState(check)
  useEffect(() => {
    const update = () => setOn(check())
    const mq = window.matchMedia(TWO_PAGE_QUERY)
    mq.addEventListener('change', update)
    window.addEventListener('orientationchange', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('orientationchange', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return on
}

const RECITERS = [
  { id: 'ar.alafasy',  label: 'Alafasy', eay: 'Alafasy_128kbps' },
  { id: 'ar.husary',   label: 'Husary',  eay: 'Husary_128kbps' },
]
const surahCache = {}

// Strip harakat & normalise alef variants for Arabic substring search
const normAr = s => s
  .replace(/[\u064B-\u065F\u0670]/g, '')  // harakat
  .replace(/\u0640/g, '')                  // tatweel
  .replace(/[\u0623\u0625\u0622]/g, '\u0627') // أإآ → ا
  .replace(/\u0649/g, '\u064A')            // ى → ي

// Normalised list for instant surah search (114 entries — no API needed)
const SEARCH_NORM = SURAHS.map(([startPage, ar, en], i) => ({
  num: i + 1, page: startPage, ar, en,
  key: en.toLowerCase().replace(/[āīūḥḍṣṭẓʿʾ]/g, c =>
    ({ ā:'a',ī:'i',ū:'u',ḥ:'h',ḍ:'d',ṣ:'s',ṭ:'t',ẓ:'z',ʿ:'',ʾ:'' }[c] ?? c))
}))



export default function QuranReader() {
  const twoPage = useTwoPage()
  const [page, setPage] = useState(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY))
    return saved >= 1 && saved <= TOTAL_PAGES ? saved : 1
  })
  const [imgLoaded, setImgLoaded]     = useState(false)
  const [imgError, setImgError]       = useState(false)
  const [showJump, setShowJump]       = useState(false)
  const [editingPage, setEditingPage] = useState(false)
  const [inputVal, setInputVal]       = useState('')
  const [sliderVal, setSliderVal]     = useState(page)
  const [sliding, setSliding]         = useState(false)
  const [bookmarks, setBookmarks]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [] }
    catch { return [] }
  })
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [darkMode, setDarkMode]           = useState(() =>
    localStorage.getItem('maqam_quran_dark') === '1'
  )
  const [isPlaying, setIsPlaying]         = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioLoading, setAudioLoading]   = useState(false)
  const [reciterIdx, setReciterIdx]       = useState(() => parseInt(localStorage.getItem('maqam_reciter') || '0'))
  const [showReciter, setShowReciter]     = useState(false)
  const [viewMode, setViewMode]           = useState('mushaf')
  const [textData, setTextData]           = useState(null)
  const [textLoading, setTextLoading]     = useState(false)
  const [textError, setTextError]         = useState(false)
  const [activeAyah, setActiveAyah]         = useState(null)
  const [ayahAudioState, setAyahAudioState] = useState('idle')
  const inputRef      = useRef(null)
  const wrapRef       = useRef(null)         // img-wrap DOM ref for non-passive touchmove
  const touchRef      = useRef({ x: 0, y: 0, axis: null }) // axis: null|'h'|'v'|'pinch'
  const goRef         = useRef(null)         // always-current go() for keyboard handler
  const lastLoadedUrl = useRef(null)         // cached page URL — prevents flash on page turn
  const audioRef      = useRef(null)
  const ayahAudioRef  = useRef(null)
  const seqRef        = useRef({ surahNum: null, ayahNum: null, total: null })
  const [swipeDx, setSwipeDx]       = useState(0)
  const [searchQ, setSearchQ]       = useState('')
  const [kbHeight, setKbHeight]     = useState(0)  // virtual keyboard height in px
  const [showAyahSearch, setShowAyahSearch] = useState(false)
  const [ayahQ, setAyahQ]           = useState('')
  const [ayahIndex, setAyahIndex]   = useState(null)
  const [ayahIndexLoading, setAyahIndexLoading] = useState(false)


  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, page)
    setSliderVal(page)
    setImgLoaded(false)
    setImgError(false)
    // Preload adjacent pages
    const step = twoPage ? 2 : 1
    const pre = new Image()
    pre.src = pageUrl(Math.min(page + step, TOTAL_PAGES))
    if (twoPage) {
      const pre1b = new Image()
      pre1b.src = pageUrl(Math.min(page + step + 1, TOTAL_PAGES))
    }
    const pre2 = new Image()
    pre2.src = pageUrl(Math.max(page - step, 1))
  }, [page, twoPage])

  // Track virtual keyboard height via visualViewport
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kb = window.innerHeight - vv.height - vv.offsetTop
      setKbHeight(Math.max(0, kb))
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update) }
  }, [])

  const go = d => {
    const step = twoPage ? d * 2 : d
    setPage(p => Math.max(1, Math.min(TOTAL_PAGES, p + step)))
  }
  goRef.current = go  // always-current reference so keyboard handler never goes stale

  // Keyboard navigation ([] deps safe because we use goRef)
  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft')  goRef.current(1)
      if (e.key === 'ArrowRight') goRef.current(-1)
      if (e.key === 'ArrowUp')    goRef.current(-10)
      if (e.key === 'ArrowDown')  goRef.current(10)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Touch start: record position, bail on multi-touch (pinch) or browser zoom
  const onTouchStart = e => {
    if (viewMode === 'text') return
    if ((window.visualViewport?.scale ?? 1) > 1.05) return  // zoomed: let browser pan
    if (e.touches.length > 1) { touchRef.current.axis = 'pinch'; setSwipeDx(0); return }
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, axis: null }
  }

  // Touch end: commit page turn or spring back
  const onTouchEnd = e => {
    if (viewMode === 'text') return
    if ((window.visualViewport?.scale ?? 1) > 1.05) return
    const { x: startX, axis } = touchRef.current
    touchRef.current = { x: 0, y: 0, axis: null }
    setSwipeDx(0)
    if (axis !== 'h') return
    if (e.touches.length > 0) return
    const dx = e.changedTouches[0].clientX - startX
    if (Math.abs(dx) > 55) go(dx > 0 ? 1 : -1)
  }

  // Non-passive touchmove: axis-lock, prevent vertical hijack, live drag follow
  // Skipped entirely when user has pinch-zoomed (browser handles panning)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onMove = e => {
      if (viewMode === 'text') return
      if ((window.visualViewport?.scale ?? 1) > 1.05) return  // zoomed: let browser pan
      const t = touchRef.current
      if (t.axis === 'pinch') return
      if (e.touches.length > 1) { t.axis = 'pinch'; setSwipeDx(0); return }
      const dx = e.touches[0].clientX - t.x
      const dy = e.touches[0].clientY - t.y
      if (!t.axis) {
        if (Math.abs(dx) > Math.abs(dy) + 3) t.axis = 'h'
        else if (Math.abs(dy) > 5) { t.axis = 'v'; return }
        else return
      }
      if (t.axis === 'h') { e.preventDefault(); setSwipeDx(dx) }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const surah = getSurahForPage(page)
  const surahNum = surah?.num
  const reciter = RECITERS[reciterIdx] || RECITERS[0]

  const playSeqAyah = (sNum, aNum, rec) => {
    const s = String(sNum).padStart(3, '0')
    const a = String(aNum).padStart(3, '0')
    const url = `https://everyayah.com/data/${rec.eay}/${s}${a}.mp3`
    const audio = audioRef.current
    if (!audio) return
    audio.src = url
    setAudioLoading(true)
    audio.play().catch(() => { setIsPlaying(false); setAudioLoading(false) })
  }

  const stopAyahAudio = () => {
    const el = ayahAudioRef.current
    if (!el) return
    el.pause()
    el.src = ''
    setAyahAudioState('idle')
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }
    stopAyahAudio()
    setAudioLoading(true)
    fetch(`https://api.alquran.cloud/v1/page/${page}/quran-simple`)
      .then(r => r.json())
      .then(json => {
        const first = json.data.ayahs[0]
        const sNum = first.surah.number
        const aNum = first.numberInSurah
        const total = first.surah.numberOfAyahs
        seqRef.current = { surahNum: sNum, ayahNum: aNum, total }
        playSeqAyah(sNum, aNum, reciter)
      })
      .catch(() => { setIsPlaying(false); setAudioLoading(false) })
  }

  const stopAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.src = ''
    seqRef.current = { surahNum: null, ayahNum: null, total: null }
    setIsPlaying(false)
    setAudioProgress(0)
  }

  // Text mode: fetch ayah data when surah changes or mode switches
  useEffect(() => {
    if (viewMode !== 'text' || !surahNum) return
    if (surahCache[surahNum]) { setTextData(surahCache[surahNum]); setTextLoading(false); return }
    setTextLoading(true)
    setTextError(false)
    setTextData(null)
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-simple,en.sahih`)
      .then(r => r.json())
      .then(json => {
        const [arEd, enEd] = json.data
        const data = arEd.ayahs.map((a, i) => ({
          num: a.numberInSurah,
          ar: a.text,
          en: enEd.ayahs[i]?.text || ''
        }))
        surahCache[surahNum] = data
        setTextData(data)
        setTextLoading(false)
      })
      .catch(() => { setTextError(true); setTextLoading(false) })
  }, [viewMode, surahNum]) // eslint-disable-line react-hooks/exhaustive-deps

  const playAyahAudio = (ayahNum) => {
    const s = String(surahNum).padStart(3, '0')
    const a = String(ayahNum).padStart(3, '0')
    const url = `https://everyayah.com/data/${reciter.eay}/${s}${a}.mp3`
    const el = ayahAudioRef.current
    if (!el) return
    stopAudio()  // stop seq playback
    el.src = url
    setAyahAudioState('loading')
    el.play().catch(() => setAyahAudioState('idle'))
  }

  const selectReciter = (idx) => {
    setReciterIdx(idx)
    localStorage.setItem('maqam_reciter', String(idx))
    setShowReciter(false)
    stopAudio()
  }


  const sliderJuz   = getJuzForPage(sliderVal)
  const sliderHizb  = getHizbQuarterForPage(sliderVal)
  const sliderSurah = getSurahForPage(sliderVal)
  const sliderPct   = ((sliderVal - 1) / (TOTAL_PAGES - 1)) * 100

  useEffect(() => {
    const app = document.querySelector('.app')
    if (app) {
      if (darkMode) app.classList.add('quran-dm')
      else app.classList.remove('quran-dm')
    }
    return () => document.querySelector('.app')?.classList.remove('quran-dm')
  }, [darkMode])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('maqam_quran_dark', next ? '1' : '0')
  }

  const isBookmarked = bookmarks.includes(page)

  const toggleBookmark = () => {
    const next = isBookmarked
      ? bookmarks.filter(b => b !== page)
      : [...bookmarks, page].sort((a, b) => a - b)
    setBookmarks(next)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next))
  }

  const removeBookmark = (p) => {
    const next = bookmarks.filter(b => b !== p)
    setBookmarks(next)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next))
  }

  const openPageInput = () => {
    setInputVal('')
    setEditingPage(true)
    inputRef.current?.focus()
  }
  const commitPageInput = () => {
    const n = parseInt(inputVal)
    if (n >= 1 && n <= TOTAL_PAGES) setPage(n)
    setEditingPage(false)
  }

  const openAyahSearch = async () => {
    setShowAyahSearch(true)
    if (!ayahIndex && !ayahIndexLoading) {
      setAyahIndexLoading(true)
      try {
        const r = await fetch('/quran-index.json')
        setAyahIndex(await r.json())
      } catch (e) {
        console.error('Failed to load ayah index', e)
      } finally {
        setAyahIndexLoading(false)
      }
    }
  }

  const ayahResults = useMemo(() => {
    if (!ayahIndex || !ayahQ.trim()) return []
    const q = normAr(ayahQ.trim())
    if (q.length < 2) return []
    const out = []
    for (const entry of ayahIndex) {
      if (normAr(entry[3]).includes(q)) {
        out.push(entry)
        if (out.length >= 25) break
      }
    }
    return out
  }, [ayahIndex, ayahQ])

  return (
    <div
      className={`quran-page${darkMode ? ' quran-dark' : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="quran-bar">
        <div className="quran-bar-left">
          <button className="quran-jump-btn" onClick={() => setShowJump(v => !v)} aria-label="Jump to surah">
            <MenuIcon />
          </button>
          <button className="quran-jump-btn" onClick={openAyahSearch} aria-label="Search ayah">
            <SearchIcon />
          </button>
          <button
            className={`quran-bookmark-btn${isBookmarked ? ' bookmarked' : ''}`}
            onClick={toggleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
          >
            <BookmarkIcon active={isBookmarked} />
          </button>
          {bookmarks.length > 0 && (
            <button className="quran-bookmarks-list-btn" onClick={() => setShowBookmarks(true)}>
              <BookmarksIcon />
              <span className="quran-bookmarks-badge">{bookmarks.length}</span>
            </button>
          )}
          <button className="quran-dark-btn" onClick={toggleDark} aria-label="Toggle dark mode">
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className={`quran-view-btn${viewMode === 'text' ? ' active' : ''}`}
            onClick={() => setViewMode(v => v === 'mushaf' ? 'text' : 'mushaf')}
            aria-label="Toggle text view"
          >
            {viewMode === 'text' ? <ImageIcon /> : <TextIcon />}
          </button>
          <button
            className={`quran-audio-btn${isPlaying ? ' playing' : ''}${audioLoading ? ' loading' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
          >
            {audioLoading ? <LoadingIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="quran-reciter-btn" onClick={() => setShowReciter(v => !v)} aria-label="Select reciter">
            <span className="quran-reciter-label">{reciter.label}</span>
          </button>

        </div>
        <div className="quran-bar-right">
          {surah && <span className="quran-surah-ar">{surah.ar}</span>}
          {surah && <span className="quran-surah-en">{surah.en}</span>}
        </div>
      </div>

      {/* Audio progress strip */}
      {(isPlaying || audioProgress > 0) && (
        <div className="quran-audio-bar">
          <div className="quran-audio-progress" style={{ width: `${audioProgress * 100}%` }} />
          <button className="quran-audio-stop" onClick={stopAudio} aria-label="Stop">
            <StopIcon />
          </button>
        </div>
      )}

      {/* Hidden audio elements */}
      <audio
        ref={ayahAudioRef}
        onPlay={() => setAyahAudioState('playing')}
        onCanPlay={() => setAyahAudioState('playing')}
        onEnded={() => setAyahAudioState('idle')}
        onError={() => setAyahAudioState('idle')}
      />
      <audio
        ref={audioRef}
        onCanPlay={() => setAudioLoading(false)}
        onPlay={() => { setIsPlaying(true); setAudioLoading(false) }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          const { surahNum: sNum, ayahNum, total } = seqRef.current
          if (!sNum) { setIsPlaying(false); setAudioProgress(0); return }
          const next = ayahNum + 1
          if (next > total) {
            seqRef.current = { surahNum: null, ayahNum: null, total: null }
            setIsPlaying(false)
            setAudioProgress(0)
          } else {
            seqRef.current.ayahNum = next
            setAudioProgress(0)
            playSeqAyah(sNum, next, reciter)
          }
        }}
        onTimeUpdate={() => {
          const a = audioRef.current
          if (a && a.duration) setAudioProgress(a.currentTime / a.duration)
        }}
      />

      {viewMode === 'text' ? (
        <div className="quran-text-view">
          {textLoading && <div className="quran-text-loading"><span>\u23F3</span> Loading {surah?.ar}\u2026</div>}
          {textError && <div className="quran-text-error">Could not load. Check connection.</div>}
          {textData && (
            <div className="quran-ayah-list">
              <div className="quran-ayah-surah-head">
                <span className="quran-ayah-surah-ar">{surah?.ar}</span>
                <span className="quran-ayah-surah-en">{surah?.en}</span>
              </div>
              {surahNum !== 9 && surahNum !== 1 && (
                <div className="quran-basmallah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>
              )}
              {textData.map(ayah => (
                surahNum === 1 && ayah.num === 1 ? (
                  <div key={ayah.num} className="quran-basmallah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>
                ) : (
                  <button key={ayah.num} className="quran-ayah-row" onClick={() => setActiveAyah(ayah)}>
                    <span className="quran-ayah-num">{ayah.num}</span>
                    <span className="quran-ayah-ar">{ayah.ar}</span>
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`quran-img-wrap${twoPage && page > 1 ? ' two-page' : ''}`}
          ref={wrapRef}
          style={swipeDx
            ? { transform: `translateX(${swipeDx}px)`, transition: 'none' }
            : { transition: 'transform 0.22s ease' }}
        >
          {/* Previous page stays visible while new page loads — eliminates flash */}
          {!imgLoaded && !imgError && lastLoadedUrl.current && (
            <img src={lastLoadedUrl.current} className="quran-page-img loaded quran-cached-bg" aria-hidden="true" />
          )}
          {!imgLoaded && !imgError && <div className="quran-loading-abs" />}
          {imgError && (
            <div className="quran-error-abs">
              <span style={{ fontSize: 32 }}>{'\u26a0'}</span>
              <p>Could not load page {page}</p>
            </div>
          )}
          {/* Right page */}
          <img
            src={pageUrl(page)}
            alt={`Quran page ${page}`}
            className={`quran-page-img${imgLoaded ? ' loaded' : ''}${page <= 2 ? ' wide-page' : ''}`}
            onLoad={() => { lastLoadedUrl.current = pageUrl(page); setImgLoaded(true) }}
            onError={() => { setImgError(true); setImgLoaded(false) }}
          />
          {/* Left page — two-page mode only */}
          {twoPage && page > 1 && page < TOTAL_PAGES && (
            <img
              src={pageUrl(page + 1)}
              alt={`Quran page ${page + 1}`}
              className={`quran-page-img loaded`}
            />
          )}
        </div>
      )}

      <div className="quran-footer">
        <div className="quran-footer-row">
          <span className="quran-footer-label">Juz {sliderJuz}</span>
          <div className="quran-slider-wrap">
            {sliding && (
              <div
                className="quran-slider-tip"
                style={{ left: `calc(8px + (100% - 16px) * ${sliderPct / 100} * -1 + (100% - 16px))` }}
              >
                <span className="qst-pg">{sliderVal}</span>
                {sliderSurah && <span className="qst-surah">{sliderSurah.ar}</span>}
              </div>
            )}
            <input
              className="quran-slider"
              type="range"
              min={1}
              max={TOTAL_PAGES}
              value={sliderVal}
              style={{ '--pct': `${sliderPct}%` }}
              onChange={e => { setSliderVal(Number(e.target.value)); setSliding(true) }}
              onMouseUp={e => { setPage(Number(e.target.value)); setSliding(false) }}
              onTouchEnd={() => { setPage(sliderVal); setSliding(false) }}
            />
          </div>
          <span className="quran-footer-label">{sliderHizb}</span>
        </div>
        <div className="quran-footer-pgrow">
          <input
            ref={inputRef}
            className={`quran-pg-input${editingPage ? ' visible' : ''}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={String(page)}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={commitPageInput}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
          />
          {!editingPage && (
            <button className="quran-pg-btn" onClick={openPageInput}>
              {page}
            </button>
          )}
        </div>
      </div>

      {activeAyah && (
        <div className="quran-overlay" onClick={() => setActiveAyah(null)}>
          <div className="quran-sheet quran-ayah-sheet" onClick={e => e.stopPropagation()}>
            <div className="quran-ayah-sheet-head">
              <span className="quran-ayah-sheet-num">{surah?.ar} \u2022 {activeAyah.num}</span>
              <button
                className={`quran-ayah-play-btn${ayahAudioState === 'playing' ? ' playing' : ''}`}
                onClick={() => playAyahAudio(activeAyah.num)}
              >
                {ayahAudioState === 'loading' ? <LoadingIcon /> : ayahAudioState === 'playing' ? <span>&#9646;&#9646;</span> : <><PlayIcon /><span style={{fontSize:11,marginLeft:3}}>Play</span></>}
              </button>
            </div>
            <p className="quran-ayah-sheet-ar">{activeAyah.ar}</p>
            <p className="quran-ayah-sheet-en">{activeAyah.en}</p>
          </div>
        </div>
      )}

      {showReciter && (
        <div className="quran-overlay" onClick={() => setShowReciter(false)}>
          <div className="quran-sheet" onClick={e => e.stopPropagation()}>
            <p className="quran-sheet-title">Select Reciter</p>
            <div className="quran-sheet-list">
              {RECITERS.map((r, i) => (
                <button
                  key={i}
                  className={`quran-sheet-item${i === reciterIdx ? ' active' : ''}`}
                  onClick={() => selectReciter(i)}
                >
                  <span className="qsi-num">{i + 1}</span>
                  <span className="qsi-en" style={{ fontSize: 15, fontWeight: 600 }}>{r.label}</span>
                  {i === reciterIdx && <span className="qsi-pg">\u2713</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showBookmarks && (
        <div className="quran-overlay" onClick={() => setShowBookmarks(false)}>
          <div className="quran-sheet" onClick={e => e.stopPropagation()}>
            <p className="quran-sheet-title">Saved Bookmarks</p>
            {bookmarks.length === 0 ? (
              <p className="quran-sheet-empty">No bookmarks yet</p>
            ) : (
              <div className="quran-sheet-list">
                {bookmarks.map(p => {
                  const s = getSurahForPage(p)
                  const j = getJuzForPage(p)
                  return (
                    <button
                      key={p}
                      className={'quran-sheet-item' + (p === page ? ' active' : '')}
                      onClick={() => { setPage(p); setShowBookmarks(false) }}
                    >
                      <span className="qsi-num">{p}</span>
                      {s && <span className="qsi-ar">{s.ar}</span>}
                      {s && <span className="qsi-en">{s.en}</span>}
                      <span className="qsi-pg">Juz {j}</span>
                      <button
                        className="quran-bm-del"
                        onClick={e => { e.stopPropagation(); removeBookmark(p) }}
                        aria-label="Remove bookmark"
                      >×</button>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showAyahSearch && (
        <div className="quran-overlay" onClick={() => { setShowAyahSearch(false); setAyahQ('') }}>
          <div className="quran-sheet" style={{ marginBottom: kbHeight }} onClick={e => e.stopPropagation()}>
            <p className="quran-sheet-title">Search Ayah</p>
            <div className="quran-search-bar">
              <input
                className="quran-search-input"
                type="search"
                inputMode="text"
                dir="rtl"
                placeholder="ابحث في آيات القرآن…"
                value={ayahQ}
                onChange={e => setAyahQ(e.target.value)}
                autoFocus
              />
              {ayahQ && (
                <button className="quran-search-clear" onClick={() => setAyahQ('')}>×</button>
              )}
            </div>
            <div className="quran-sheet-list">
              {ayahIndexLoading && (
                <p className="quran-sheet-empty">Loading index…</p>
              )}
              {!ayahIndexLoading && ayahQ.trim().length > 0 && ayahQ.trim().length < 2 && (
                <p className="quran-sheet-empty">Type at least 2 characters</p>
              )}
              {!ayahIndexLoading && !ayahQ.trim() && (
                <p className="quran-sheet-empty">Type Arabic text to find an ayah</p>
              )}
              {!ayahIndexLoading && ayahQ.trim().length >= 2 && ayahResults.length === 0 && (
                <p className="quran-sheet-empty">No results</p>
              )}
              {ayahResults.map(([s, a, p, t]) => (
                <button
                  key={`${s}-${a}`}
                  className="quran-sheet-item quran-ayah-result"
                  onClick={() => { setPage(p); setShowAyahSearch(false); setAyahQ('') }}
                >
                  <span className="qsi-num">{s}:{a}</span>
                  <span className="qar-text">{t.length > 70 ? t.slice(0, 70) + '…' : t}</span>
                  <span className="qsi-pg">p.{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showJump && (() => {
        const q = searchQ.trim().toLowerCase()
        const results = q
          ? SEARCH_NORM.filter(s =>
              s.ar.includes(searchQ.trim()) ||
              s.en.toLowerCase().includes(q) ||
              s.key.includes(q.replace(/[^a-z0-9 ]/g, ''))
            )
          : SEARCH_NORM
        return (
          <div className="quran-overlay" onClick={() => { setShowJump(false); setSearchQ('') }}>
            <div className="quran-sheet" style={{ marginBottom: kbHeight }} onClick={e => e.stopPropagation()}>
              <p className="quran-sheet-title">Jump to Surah</p>
              <div className="quran-search-bar">
                <input
                  className="quran-search-input"
                  type="text"
                  placeholder="Search surah…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  autoFocus
                />
                {searchQ && (
                  <button className="quran-search-clear" onClick={() => setSearchQ('')}>×</button>
                )}
              </div>
              <div className="quran-sheet-list">
                {results.map(s => (
                  <button
                    key={s.num}
                    className={'quran-sheet-item' + (page >= s.page && (s.num === SURAHS.length || page < SURAHS[s.num][0]) ? ' active' : '')}
                    onClick={() => { setPage(s.page); setShowJump(false); setSearchQ('') }}
                  >
                    <span className="qsi-num">{s.num}</span>
                    <span className="qsi-ar">{s.ar}</span>
                    <span className="qsi-en">{s.en}</span>
                    <span className="qsi-pg">{s.page}</span>
                  </button>
                ))}
                {results.length === 0 && (
                  <p className="quran-sheet-empty">No surah found</p>
                )}
              </div>
            </div>
          </div>
        )
      })()}


    </div>
  )
}

// ── Quran bar icons ───────────────────────────────────────────────────
const IC = { fill: 'none', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' }
const S = (c = 'currentColor') => ({ stroke: c })

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function BookmarkIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke={active ? '#D4975A' : 'currentColor'}>
      <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" fill={active ? 'rgba(212,151,90,0.25)' : 'none'} />
    </svg>
  )
}
function BookmarksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <path d="M5 3h11a1 1 0 0 1 1 1v14l-6.5-3.5L4 18V4a1 1 0 0 1 1-1z" />
      <path d="M19 5h1a1 1 0 0 1 1 1v14l-2-1" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}
function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <path d="M4 7V5h16v2M10 5v14M14 5v14M10 19h4" />
    </svg>
  )
}
function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polygon points="6,3 20,12 6,21" fill="currentColor" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <line x1="7" y1="4" x2="7" y2="20" strokeWidth="2.5" />
      <line x1="17" y1="4" x2="17" y2="20" strokeWidth="2.5" />
    </svg>
  )
}
function StopIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10">
      <rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor" />
    </svg>
  )
}
function LoadingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...IC} stroke="currentColor">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
