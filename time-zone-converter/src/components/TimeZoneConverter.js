'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { DateTime } from 'luxon'
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import styles from './TimeZoneConverter.module.css';

export default function TimeZoneConverter() {
  // --- load IANA zones ---
  const [zones, setZones] = useState(['UTC'])
  useEffect(() => {
    if (Intl.supportedValuesOf) setZones(Intl.supportedValuesOf('timeZone'))
  }, [])

  // --- user state ---
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState('PM')
  const [use12h, setUse12h] = useState(true)
  const [srcZone, setSrcZone] = useState('Asia/Makassar')
  const [tgtZone, setTgtZone] = useState('Europe/Amsterdam')
  const [reversed, setReversed] = useState(false)

  // --- favorites logic ---
  const [favs, setFavs] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('tzFavorites') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tzFavorites', JSON.stringify(favs));
  }, [favs]);

  const toggleFav = (z) =>
    setFavs((f) => (f.includes(z) ? f.filter((x) => x !== z) : [...f, z]))
  const favoriteZones = useMemo(() => zones.filter((z) => favs.includes(z)), [zones, favs])
  const otherZones = useMemo(() => zones.filter((z) => !favs.includes(z)).sort(), [zones, favs])

  // --- dropdown data arrays ---
  const hoursArr = useMemo(
    () =>
      use12h
        ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
        : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
    [use12h]
  )
  const minutesArr = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
  const ampmArr = ['AM', 'PM']

  // --- figure out which side is source vs target ---
  const baseZone = reversed ? tgtZone : srcZone
  const otherZone = reversed ? srcZone : tgtZone

  // --- build a Luxon DateTime from dropdown inputs ---
  const dtBase = useMemo(() => {
    let h = parseInt(hour, 10)
    if (use12h) {
      if (ampm === 'PM' && h < 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
    }
    return DateTime.fromObject(
      { hour: h, minute: parseInt(minute, 10) },
      { zone: baseZone }
    )
  }, [hour, minute, ampm, baseZone, use12h])

  const dtOther = useMemo(() => dtBase.setZone(otherZone), [dtBase, otherZone])
  const fmtBase = dtBase.toFormat(use12h ? 'hh:mm a' : 'HH:mm')
  const fmtOther = dtOther.toFormat(use12h ? 'hh:mm a' : 'HH:mm')

  // --- ZoneSelect sub-component ---
  function ZoneSelect({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef()

    useEffect(() => {
      const handler = (e) => {
        if (
          !ref.current.contains(e.target) &&
          !e.target.closest(`.${styles.starIcon}`)
        ) {
          setOpen(false)
        }
      }
      // capture-phase mousedown to catch before React handlers
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }, [])

    const favList = favoriteZones.filter((z) =>
      z.toLowerCase().includes(search.toLowerCase())
    )
    const othList = otherZones.filter((z) =>
      z.toLowerCase().includes(search.toLowerCase())
    )

    return (
      <div className={styles.zoneSelect} ref={ref}>
        <button
          className={styles.toggleButton}
          onClick={() => { setSearch(''); setOpen((o) => !o) }}
        >
          <span>{value}</span>
          <span className={styles.arrowIcon}>{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className={styles.dropdownMenu}>
            <div className={styles.searchContainer}>
              <input
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search time zones…"
              />
            </div>

            {favList.length > 0 && <div className={styles.favoritesHeader}>Favorites</div>}
            {favList.map((z) => (
              <div
                key={z}
                className={styles.dropdownItem}
                onClick={(e) => {
                  if (e.target.closest(`.${styles.starIcon}`)) return
                  onChange(z)
                  setOpen(false)
                }}
              >
                <span>{z}</span>
                <span
                  className={styles.starIcon}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleFav(z)
                  }}
                >
                  {favs.includes(z) ? '★' : '☆'}
                </span>
              </div>
            ))}

            {favList.length > 0 && <hr />}
            {othList.map((z) => (
              <div
                key={z}
                className={styles.dropdownItem}
                onClick={(e) => {
                  if (e.target.closest(`.${styles.starIcon}`)) return
                  onChange(z)
                  setOpen(false)
                }}
              >
                <span>{z}</span>
                <span
                  className={styles.starIcon}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleFav(z)
                  }}
                >
                  {favs.includes(z) ? '★' : '☆'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function TimeDropdowns(){
  return(
  <div className={styles.timeDropdowns}>
        <label>
          HOUR:
          <select className={styles.timeSelect} value={hour} onChange={(e) => setHour(e.target.value)}>
            {hoursArr.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
        <label>
          MINUTE:
          <select className={styles.timeSelect} value={minute} onChange={(e) => setMinute(e.target.value)}>
            {minutesArr.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        {use12h && (
          <label>
            AM/PM:
            <select value={ampm} onChange={(e) => setAmpm(e.target.value)}>
              {ampmArr.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        )}
      </div>
  );
}

  return (
    <div className={styles.timeZoneApp}>
      {/* header + 12h/24h switch */}
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Time Zone Converter</h2>
        <div
          className={`${styles.toggleSwitch} ${use12h ? styles.is12h : ''}`}
          onClick={() => setUse12h((f) => !f)}
        >
          <span className={use12h ? styles.activeLabel : ''}>12h</span>
          <div className={styles.sliderTrack}>
            <div
              className={`${styles.sliderKnob} ${use12h ? styles.sliderKnobOn : ''}`}
            />
          </div>
          <span className={!use12h ? styles.activeLabel : ''}>24h</span>
        </div>
      </div>

      {/* two clocks */}
     <div className={styles.clockRow}>
        <div className={styles.clock}>
          <p className={styles.clockNumbers}>{!reversed ? fmtBase : fmtOther}</p>
          <ZoneSelect
  value={srcZone}
  onChange={setSrcZone}
/>
{!reversed && (
<TimeDropdowns className={styles.leftToRight}/>
)}
        </div>
        <button
  className={styles.swapButton}
  onClick={() => setReversed((r) => !r)}
>
  {reversed
    ? <ArrowLeftIcon width={24} className={styles.rotatedIcon}/>
    : <ArrowRightIcon width={24} className={styles.rotatedIcon}/>}
</button>
        <div className={styles.clock}>
          <p className={styles.clockNumbers}>{!reversed ? fmtOther : fmtBase}</p>
          <ZoneSelect
  value={tgtZone}
  onChange={setTgtZone}
/>
{reversed && (<TimeDropdowns className={styles.rightToLeft}/>
)}
        </div>
      </div>

      {/* zone selectors + swap */}

      {/* time pickers */}
      

      

    </div>
  )
}
