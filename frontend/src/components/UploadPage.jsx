import { useRef, useState, useCallback } from 'react'
import styles from './UploadPage.module.css'
import { getMockScanResult, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../mock/mockScan.js'
import { getMockHotelScanResult } from '../mock/mockHotelScan.js'

export default function UploadPage({ onNext }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [bookingType, setBookingType] = useState('flight')
  const inputRef = useRef()

  /* ── drag handlers ── */
  const onDragOver = useCallback(e => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  /* ── file chosen ── */
  const handleFile = (f) => {
    if (!ALLOWED_FILE_TYPES.includes(f.type)) {
      alert('Only JPG, PNG, PDF allowed!')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      alert('File must be under 10 MB')
      return
    }
    setFile(f)
  }

  /* ── upload & scan ── */
  const handleUpload = () => {
    if (!file) { alert('Please select a file first!'); return }
    setScanning(true)
    setProgress(0)

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(timer); return 95 }
        return p + 5
      })
    }, 120)

    setTimeout(() => {
      clearInterval(timer)
      setProgress(100)
      setTimeout(() => {
        const scanData = bookingType === 'hotel' ? getMockHotelScanResult() : getMockScanResult()
        onNext(scanData, bookingType)
      }, 400)
    }, 2500)
  }

  const logoIcon = bookingType === 'train' ? '🚆' : bookingType === 'hotel' ? '🏨' : '✈️'
  const logoText = bookingType === 'train' ? 'Train Sale' : bookingType === 'hotel' ? 'Hotel Sale' : 'Flight Sale'
  const pageTitle = bookingType === 'train' ? 'Upload Train Ticket' : bookingType === 'hotel' ? 'Upload Hotel Voucher' : 'Upload Flight Ticket'

  return (
    <div className={styles.page}>

      {/* ── NAVBAR ── */}
      <header className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.logoIcon}>{logoIcon}</span>
          <span className={styles.logoText}>{logoText}</span>
        </div>
        <nav className={styles.navRight}>
          <button className={styles.btnOutline} onClick={() => onNext(null, bookingType)} disabled={scanning}>
            Skip &amp; Enter Manually
          </button>
        </nav>
      </header>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardHeaderIcon}>⬆️</span>
            <h2 className={styles.cardTitle}>{pageTitle}</h2>
          </div>

          {/* Booking Type selector */}
          <div className={styles.typeSelectorRow}>
            <span className={styles.typeSelectorLabel}>Booking Type</span>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={[styles.typeBtn, bookingType === 'flight' ? styles.typeBtnActive : ''].join(' ')}
                onClick={() => setBookingType('flight')}
                disabled={scanning}
              >
                ✈️ Flight
              </button>
              <button
                type="button"
                className={[styles.typeBtn, bookingType === 'train' ? styles.typeBtnActive : ''].join(' ')}
                onClick={() => setBookingType('train')}
                disabled={scanning}
              >
                🚆 Train
              </button>
              <button
                type="button"
                className={[styles.typeBtn, bookingType === 'hotel' ? styles.typeBtnActive : ''].join(' ')}
                onClick={() => setBookingType('hotel')}
                disabled={scanning}
              >
                🏨 Hotel
              </button>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={[styles.dropZone, dragging ? styles.dragging : '', file ? styles.hasFile : ''].join(' ')}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !scanning && inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />

            {!file && !scanning && (
              <>
                <div className={styles.uploadIcon}>
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#eff6ff" />
                    <path d="M12 16V8M9 11l3-3 3 3" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 16a3 3 0 0 1 0-6h.5A5 5 0 0 1 17 12.5V16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className={styles.dropTitle}>Drag &amp; drop your ticket here</p>
                <p className={styles.dropSub}>Supported formats: JPG, PNG, PDF (max 10MB)</p>
                <button
                  className={styles.browseBtn}
                  onClick={e => { e.stopPropagation(); inputRef.current.click() }}
                >
                  📁 Browse File
                </button>
                <p className={styles.dropHint}>
                  Once uploaded, this ticket is automatically scanned and mapped into the invoice form.
                </p>
              </>
            )}

            {file && !scanning && (
              <div className={styles.fileReady}>
                <div className={styles.fileIcon}>
                  {file.type === 'application/pdf' ? '📄' : '🖼️'}
                </div>
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB · Ready to scan</p>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                >✕</button>
              </div>
            )}

            {scanning && (
              <div className={styles.scanningWrap}>
                <div className={styles.scanIcon}>🔍</div>
                <p className={styles.scanText}>Scanning ticket…</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressPct}>{progress}%</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={handleUpload}
              disabled={scanning}
            >
              <span>⬆️</span>
              {scanning ? 'Scanning…' : 'Upload Ticket'}
            </button>
            <button
              className={styles.btnOutline}
              onClick={() => onNext(null, bookingType)}
              disabled={scanning}
            >
              Skip &amp; Enter Manually
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
