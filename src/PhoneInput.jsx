import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/max'

const MIN_DIGITS = 3

function countryCodeToFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function detectDefaultCountry(preferredLang, supportedCountries) {
  let navigatorLocale = ''
  if (typeof navigator !== 'undefined' && navigator.language) {
    navigatorLocale = navigator.language
  }
  const localesToTry = []
  if (navigatorLocale) localesToTry.push(navigatorLocale)
  if (preferredLang) localesToTry.push(preferredLang)
  for (const locale of localesToTry) {
    if (!locale) continue
    const match = /-([a-zA-Z]{2})$/.exec(locale)
    const region = match ? match[1].toUpperCase() : locale.slice(-2).toUpperCase()
    if (supportedCountries.includes(region)) {
      return region
    }
  }
  if (preferredLang === 'es' && supportedCountries.includes('ES')) return 'ES'
  if (supportedCountries.includes('US')) return 'US'
  return supportedCountries[0] || ''
}

function getDisplayNames(lang) {
  try {
    return new Intl.DisplayNames([lang, lang === 'es' ? 'en' : 'es'], { type: 'region' })
  } catch {
    return null
  }
}

export default function PhoneInput({ lang = 'en', label, value, onChange, error }) {
  const countriesList = useMemo(() => {
    const availableCountries = getCountries()
    const displayNames = getDisplayNames(lang)
    return availableCountries
      .map((code) => {
        const name = displayNames?.of(code) || code
        return {
          code,
          name,
          dialCode: getCountryCallingCode(code),
          flag: countryCodeToFlag(code),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name, lang === 'es' ? 'es' : 'en'))
  }, [lang])

  const supportedCodes = useMemo(() => countriesList.map((country) => country.code), [countriesList])

  const normalizedValue = value || {}
  const resolvedCountry = useMemo(() => {
    if (normalizedValue.country && supportedCodes.includes(normalizedValue.country)) {
      return normalizedValue.country
    }
    return detectDefaultCountry(lang, supportedCodes)
  }, [normalizedValue.country, lang, supportedCodes])

  const selectedCountry = countriesList.find((country) => country.code === resolvedCountry) || countriesList[0]

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  useEffect(() => {
    if (!normalizedValue.country && selectedCountry) {
      handleValueChange(selectedCountry.code, normalizedValue.national || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedValue.country, selectedCountry])

  function computePhoneMeta(countryCode, nationalDigitsInput) {
    const digits = (nationalDigitsInput || '').replace(/\D/g, '')
    const dialCode = getCountryCallingCode(countryCode)
    let e164 = ''
    let isValid = false
    if (digits.length >= MIN_DIGITS) {
      const phone = parsePhoneNumberFromString(`+${dialCode}${digits}`, countryCode)
      if (phone && phone.isValid()) {
        e164 = phone.number
        isValid = true
      } else {
        const fallback = parsePhoneNumberFromString(`+${dialCode}${digits}`)
        if (fallback && (fallback.isValid() || fallback.isPossible())) {
          e164 = fallback.number
        }
      }
    }
    return { digits, dialCode, e164, isValid }
  }

  function handleValueChange(nextCountry, nationalDigitsInput) {
    const meta = computePhoneMeta(nextCountry, nationalDigitsInput)
    onChange?.({
      country: nextCountry,
      national: meta.digits,
      dialCode: meta.dialCode,
      e164: meta.e164,
      isValid: meta.isValid,
    })
  }

  function handleCountrySelect(code) {
    setDropdownOpen(false)
    handleValueChange(code, normalizedValue.national || '')
  }

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countriesList
    const lower = searchTerm.toLowerCase()
    return countriesList.filter((country) => {
      return (
        country.name.toLowerCase().includes(lower) ||
        country.dialCode.includes(lower) ||
        country.code.toLowerCase().includes(lower)
      )
    })
  }, [countriesList, searchTerm])

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <div
        className={`flex items-center rounded-md border px-1 py-1 bg-white/10 ${
          error ? 'border-rose-500/70 bg-rose-500/10' : 'border-white/15'
        }`}
      >
        <button
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen ? 'true' : 'false'}
        >
          <span className="text-lg" aria-hidden="true">
            {selectedCountry?.flag || '🌐'}
          </span>
          <span className="font-medium">+{selectedCountry?.dialCode}</span>
        </button>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={normalizedValue.national || ''}
          onChange={(event) => {
            const digitsOnly = event.target.value.replace(/\D/g, '')
            handleValueChange(resolvedCountry, digitsOnly)
          }}
          placeholder="123456789"
          className="w-full bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none"
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}

      {dropdownOpen && (
        <div
          className="absolute z-40 mt-2 max-h-72 w-72 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/95 shadow-xl shadow-black/40 backdrop-blur"
          role="listbox"
        >
          <div className="sticky top-0 bg-slate-900/95 p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={lang === 'es' ? 'Busca país o código' : 'Search country or code'}
              className="w-full rounded-md border border-white/15 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredCountries.map((country) => (
              <button
                type="button"
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                  country.code === resolvedCountry
                    ? 'bg-indigo-500/20 text-indigo-100'
                    : 'text-slate-100 hover:bg-white/10'
                }`}
                role="option"
                aria-selected={country.code === resolvedCountry}
              >
                <span className="text-lg" aria-hidden="true">
                  {country.flag}
                </span>
                <span className="flex-1 truncate">{country.name}</span>
                <span className="font-medium">+{country.dialCode}</span>
              </button>
            ))}
            {!filteredCountries.length && (
              <p className="px-3 py-2 text-sm text-slate-400">
                {lang === 'es' ? 'Sin resultados' : 'No results'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
