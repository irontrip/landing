import { useEffect, useMemo, useRef, useState } from 'react'

const STRINGS = {
  en: {
    placeholder: 'Start typing your city or location',
    loading: 'Searching…',
    noResults: 'No matches found. Try another spelling.',
    manualPrompt: "Can't find your city?",
    manualAction: 'Use manual entry',
    manualHint: 'We will review manually added locations.',
    structuredHint: 'Selected',
  },
  es: {
    placeholder: 'Escribe tu ciudad o ubicación',
    loading: 'Buscando…',
    noResults: 'Sin coincidencias. Intenta otra escritura.',
    manualPrompt: '¿No encuentras tu ciudad?',
    manualAction: 'Usar entrada manual',
    manualHint: 'Revisaremos las ubicaciones agregadas manualmente.',
    structuredHint: 'Seleccionado',
  },
}

const MIN_QUERY = 3
const DEBOUNCE_MS = 200

function normalizeSuggestion(place) {
  const address = place.address || {}
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    ''
  const state = address.state || address.county || address.region || ''
  const country = address.country || ''
  const labelParts = [city, state, country].filter(Boolean)
  const label = labelParts.length ? labelParts.join(', ') : place.display_name
  return {
    label,
    city,
    state,
    country,
    latitude: place.lat,
    longitude: place.lon,
    raw: place,
    manual: false,
    needsReview: false,
    source: 'nominatim',
  }
}

export default function LocationAutocomplete({
  lang = 'en',
  label,
  value,
  selected,
  onTextChange,
  onSelect,
  error,
}) {
  const strings = useMemo(() => STRINGS[lang] ?? STRINGS.en, [lang])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [fetchError, setFetchError] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef(null)
  const abortRef = useRef()
  const debounceRef = useRef()

  useEffect(() => {
    const onClick = (event) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (selected && selected.label === value) {
      setSuggestions([])
      setLoading(false)
      setFetchError('')
      return
    }
    if (!value || value.trim().length < MIN_QUERY) {
      setSuggestions([])
      setLoading(false)
      setFetchError('')
      if (abortRef.current) abortRef.current.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setFetchError('')
      try {
        const params = new URLSearchParams({
          q: value.trim(),
          format: 'jsonv2',
          addressdetails: '1',
          limit: '6',
        })
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: { 'Accept-Language': lang === 'es' ? 'es' : 'en' },
            signal: controller.signal,
          }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const results = await response.json()
        setSuggestions(Array.isArray(results) ? results.map(normalizeSuggestion) : [])
        setFetchError('')
      } catch (err) {
        if (controller.signal.aborted) return
        setFetchError(String(err))
        setSuggestions([])
      } finally {
        setLoading(false)
        setActiveIndex(-1)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, lang, selected])

  function handleInputChange(event) {
    const next = event.target.value
    onTextChange?.(next)
    onSelect?.(null)
    setOpen(true)
  }

  function selectSuggestion(suggestion) {
    onTextChange?.(suggestion.label)
    onSelect?.(suggestion)
    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
  }

  function handleManualEntry() {
    const trimmed = value?.trim()
    if (!trimmed) return
    const manualSelection = {
      label: trimmed,
      manual: true,
      needsReview: true,
    }
    onTextChange?.(trimmed)
    onSelect?.(manualSelection)
    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
  }

  function handleKeyDown(event) {
    if (!open) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => {
        const next = prev + 1
        return next >= suggestions.length ? 0 : next
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => {
        const next = prev - 1
        return next < 0 ? suggestions.length - 1 : next
      })
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault()
        selectSuggestion(suggestions[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const showDropdown = open && (loading || suggestions.length > 0 || fetchError)

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setOpen(true)
          if (value && value.trim().length >= MIN_QUERY) {
            setOpen(true)
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={strings.placeholder}
        className={`w-full rounded-md border px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
          error ? 'border-rose-500/70 bg-rose-500/10' : 'border-white/15 bg-white/10'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-autocomplete="list"
        aria-expanded={showDropdown ? 'true' : 'false'}
        aria-controls="location-suggestions"
      />
      {selected?.manual && (
        <p className="mt-1 text-xs text-amber-200/90">{strings.manualHint}</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
      {showDropdown && (
        <div
          id="location-suggestions"
          role="listbox"
          className="absolute z-30 mt-1 w-full rounded-lg border border-white/10 bg-slate-900/95 shadow-xl shadow-black/40 backdrop-blur"
        >
          {loading && (
            <p className="px-3 py-2 text-sm text-slate-300/80">{strings.loading}</p>
          )}
          {!loading && fetchError && (
            <p className="px-3 py-2 text-sm text-amber-300/90">{fetchError}</p>
          )}
          {!loading && !fetchError && !suggestions.length && value?.trim().length >= MIN_QUERY && (
            <p className="px-3 py-2 text-sm text-slate-300/80">{strings.noResults}</p>
          )}
          {!loading &&
            !fetchError &&
            suggestions.map((suggestion, index) => {
              const active = index === activeIndex
              return (
                <button
                  key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}-${index}`}
                  type="button"
                  role="option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`block w-full px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-indigo-500/20 text-indigo-100' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-medium">{suggestion.label}</span>
                  <span className="block text-xs text-slate-400">
                    {suggestion.country || suggestion.raw?.display_name}
                  </span>
                </button>
              )
            })}
          <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-400">
            <p className="text-slate-300/80">{strings.manualPrompt}</p>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleManualEntry}
              className="mt-1 inline-flex items-center rounded-md border border-white/15 px-2 py-1 text-xs font-medium text-slate-100 transition hover:border-white/30 hover:text-white"
            >
              {strings.manualAction}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
