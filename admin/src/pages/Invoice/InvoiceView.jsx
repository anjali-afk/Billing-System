import styles from './InvoiceView.module.css'

/* Direct JSX port of the official Billing HTML template (Google-Apps-Script
   flavored `<? ?>` scriptlets replaced with equivalent JS/JSX, the
   `.no-print` action bar + `google.script.run` wiring dropped since this
   view is read-only — no template switcher, no "Generate & Send", no
   Edit/Save/Update). Every inline style, table structure and pixel value
   below is copied as-is from the template; nothing here is redesigned. */
export default function InvoiceView({ data, onBack }) {
  const d = data

  return (
    <div className={styles.invoicePage}>

      <div className={styles.topBar}>
        <button className="ghost" onClick={onBack}>← Back to Dashboard</button>
        <button onClick={() => window.print()}>🖨️ Print</button>
      </div>

      <table className={styles.a4Outer} width="794" cellPadding="0" cellSpacing="0" border="0" align="center"
        style={{ width: 794, margin: '28px auto', background: '#ffffff', borderCollapse: 'collapse', boxShadow: '0 8px 40px rgba(0,85,150,0.13)' }}>

        {/* TOP BAND */}
        <tbody>
        <tr>
          <td height="6" style={{ height: 6, backgroundColor: '#003d6e', fontSize: 0, lineHeight: 0 }}>&nbsp;</td>
        </tr>

        {/* BODY */}
        <tr>
        <td style={{ padding: '36px 44px 40px', background: '#ffffff' }}>

          {/* ── HEADER ── */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0"
            style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1.5px solid #d0dce8' }}>
            <tbody>
            <tr>
              <td width="50%" style={{ verticalAlign: 'top', paddingRight: 20 }}>
                {d.logo ? (
                  <img src={d.logo} style={{ display: 'block', maxHeight: 70, width: 'auto', marginBottom: 10 }} />
                ) : null}
                <div style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 4 }}>{d.compName}</div>
                <div style={{ fontSize: 10, color: '#1f1f1f', lineHeight: 1.6, marginBottom: 10, maxWidth: '88%' }}>{d.compAddr}</div>
                <table cellPadding="0" cellSpacing="2" border="0" style={{ fontSize: 10, borderCollapse: 'collapse' }}>
                  <tbody>
                  <tr><td style={{ fontWeight: 600, color: '#005596', paddingRight: 8, whiteSpace: 'nowrap' }}>GSTIN</td><td style={{ color: '#1f1f1f' }}>: {d.compGst}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: '#005596', paddingRight: 8 }}>PAN</td>  <td style={{ color: '#1f1f1f' }}>: {d.compPan}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: '#005596', paddingRight: 8 }}>Email</td><td style={{ color: '#1f1f1f' }}>: {d.compEmail}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: '#005596', paddingRight: 8 }}>Web</td>  <td style={{ color: '#1f1f1f' }}>: {d.compWeb}</td></tr>
                  </tbody>
                </table>
              </td>

              <td width="50%" style={{ verticalAlign: 'top', textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#003d6e', marginTop: 60, marginBottom: 12 }}>{d.serviceTitle}</div>
                <table cellPadding="0" cellSpacing="0" border="0" align="right" style={{ fontSize: 10.5, borderCollapse: 'collapse' }}>
                  <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#000000', paddingRight: 10, paddingBottom: 4, textAlign: 'right' }}>Invoice Date:</td>
                    <td style={{ color: '#c0392b', fontWeight: 700, paddingBottom: 4 }}>{d.invoice_date}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#000000', paddingRight: 10, paddingBottom: 4, textAlign: 'right' }}>Invoice No:</td>
                    <td style={{ color: '#1f1f1f', fontWeight: 700, paddingBottom: 4 }}>{d.invoice_no}</td>
                  </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            </tbody>
          </table>

          {/* ── BILL TO + TRIP SUMMARY ── */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ marginBottom: 22 }}>
            <tbody>
            <tr>
              <td width="49%" style={{ verticalAlign: 'top', paddingRight: 8 }}>
                <table width="100%" cellPadding="0" cellSpacing="0" border="0"
                  style={{ backgroundColor: '#e8f2fb', borderLeft: '3px solid #005596', borderCollapse: 'collapse' }}>
                  <tbody>
                  <tr><td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: '#005596', marginBottom: 7 }}>Bill To</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 3 }}>{d.billToName}</div>
                    <div style={{ fontSize: 10, color: '#1f1f1f', lineHeight: 1.7 }}>
                      {d.billToAddr}{d.billToAddr ? <br /> : null}
                      <strong style={{ color: '#1a1a2e' }}>GSTIN:</strong> {d.billToGst}<br />
                      <strong style={{ color: '#1a1a2e' }}>Place of Supply:</strong> {d.placeOfSupply}
                    </div>
                  </td></tr>
                  </tbody>
                </table>
              </td>
              <td width="49%" style={{ verticalAlign: 'top', paddingLeft: 8 }}>
                <table width="100%" cellPadding="0" cellSpacing="0" border="0"
                  style={{ border: '1.5px solid #d0dce8', borderCollapse: 'collapse', background: '#ffffff' }}>
                  <tbody>
                  <tr><td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: '#1f1f1f', marginBottom: 8 }}>Other Details</div>
                    <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ fontSize: 10.5, borderCollapse: 'collapse' }}>
                      <tbody>
                      <tr>
                        <td style={{ color: '#1f1f1f', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>Customer ID</td>
                        <td style={{ color: '#1a1a2e', fontWeight: 600, textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>{d.customerId}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#1f1f1f', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>Airline</td>
                        <td style={{ color: '#1a1a2e', fontWeight: 600, textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>{d.airlineName}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#1f1f1f', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>PNR</td>
                        <td style={{ color: '#1a1a2e', fontWeight: 600, textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>{d.pnr_no}</td>
                      </tr>
                      {d.due_date ? (
                        <tr>
                          <td style={{ color: '#1f1f1f', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>Due Date</td>
                          <td style={{ color: '#1a1a2e', fontWeight: 600, textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>{d.due_date}</td>
                        </tr>
                      ) : null}
                      {d.ref_no && d.ref_no.toString().trim() !== '' ? (
                        <tr>
                          <td style={{ color: '#1f1f1f', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>Ordered By </td>
                          <td style={{ color: '#1a1a2e', fontWeight: 600, textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>{d.ref_no}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <td style={{ color: '#1f1f1f', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>Entry By </td>
                        <td style={{ color: '#1a1a2e', fontWeight: 600, textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #d0dce8' }}>{d.entryBy} </td>
                      </tr>
                      </tbody>
                    </table>
                  </td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
            </tbody>
          </table>

          {/* ── PASSENGER TABLE ── */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="1"
            style={{ border: '1.5px solid #d0dce8', borderCollapse: 'collapse', marginBottom: 24 }}>
            <tbody>
            <tr style={{ backgroundColor: '#003d6e' }}>
              <td width="28%" style={{ padding: '10px 8px 10px 14px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', backgroundColor: '#003d6e' }}>Passenger &amp; Ticket</td>
              <td width="18%" style={{ padding: '10px 8px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center', backgroundColor: '#003d6e' }}>Flight &amp; Route</td>
              <td width="13%" style={{ padding: '10px 8px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center', backgroundColor: '#003d6e' }}>Travel Date</td>
              <td width="10%" style={{ padding: '10px 8px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'right', backgroundColor: '#003d6e' }}>Basic</td>
              <td width="10%" style={{ padding: '10px 8px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'right', backgroundColor: '#003d6e' }}>K3</td>
              <td width="10%" style={{ padding: '10px 8px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'right', backgroundColor: '#003d6e' }}>YQ</td>
              <td width="11%" style={{ padding: '10px 8px', fontSize: 9.5, fontWeight: 600, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'right', backgroundColor: '#003d6e' }}>Other</td>
            </tr>

            {d.items.map((item, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fbfe' }}>
                <td style={{ padding: '8px 8px 8px 14px', verticalAlign: 'top', borderBottom: '1px solid #d0dce8' }}>
                  <span style={{ fontWeight: 600, fontSize: 11, color: '#003d6e', display: 'block' }}>{item.passenger_name}</span>
                  <span style={{ fontSize: 9.5, color: '#1f1f1f', display: 'block', marginTop: 2, fontFamily: "'Courier New',monospace", letterSpacing: 0.5 }}>{item.ticket_no}</span>
                </td>
                <td style={{ padding: 8, verticalAlign: 'top', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0" border="0">
                    <tbody>
                    {d.flightRouteLines.map((line, r) => (
                      <tr key={r}><td style={{ padding: '1.5px 2px', fontSize: 10, color: '#1f1f1f', textAlign: 'center' }}>{line}</td></tr>
                    ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ padding: 8, verticalAlign: 'top', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0" border="0">
                    <tbody>
                    {d.travelDateLines.map((line, dIdx) => (
                      <tr key={dIdx}><td style={{ padding: '1.5px 2px', fontSize: 10, color: '#1f1f1f', textAlign: 'center' }}>{line}</td></tr>
                    ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ padding: 8, verticalAlign: 'top', textAlign: 'right', fontSize: 10.5, borderBottom: '1px solid #d0dce8' }}>{item.basic_amount}</td>
                <td style={{ padding: 8, verticalAlign: 'top', textAlign: 'right', fontSize: 10.5, borderBottom: '1px solid #d0dce8' }}>{item.k3}</td>
                <td style={{ padding: 8, verticalAlign: 'top', textAlign: 'right', fontSize: 10.5, borderBottom: '1px solid #d0dce8' }}>{item.yq}</td>
                <td style={{ padding: 8, verticalAlign: 'top', textAlign: 'right', fontSize: 10.5, borderBottom: '1px solid #d0dce8' }}>{item.other}</td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* ── BANK + TOTALS ── */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ marginBottom: 22 }}>
            <tbody>
            <tr>
              <td width="54%" style={{ verticalAlign: 'top', paddingRight: 12 }}>
                <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ border: '1.5px solid #d0dce8', borderCollapse: 'collapse' }}>
                  <tbody>
                  <tr><td style={{ backgroundColor: '#e8f2fb', padding: '8px 14px', fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: '#005596' }}>Bank Details</td></tr>
                  <tr><td style={{ padding: '11px 14px', fontSize: 10.5, color: '#1f1f1f', lineHeight: 1.8 }}>
                    <strong style={{ color: '#1a1a2e' }}>A/c Name:</strong> {d.compName}<br />
                    {d.bankDetails.map((line, i) => <span key={i}>{line}<br /></span>)}
                  </td></tr>
                  </tbody>
                </table>
                {d.reimburseNote ? (
                  <p style={{ fontSize: 9, marginTop: 8, color: '#1f1f1f', fontStyle: 'italic' }}>* {d.reimburseNote}</p>
                ) : null}
              </td>
              <td width="46%" style={{ verticalAlign: 'top', paddingLeft: 12 }}>
                <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ border: '1.5px solid #d0dce8', borderCollapse: 'collapse' }}>
                  <tbody>
                  {d.currentTrigger !== 'Net_Invoice' && (
                    <tr><td style={{ padding: '7px 14px', fontSize: 11, color: '#1f1f1f', borderBottom: '1px solid #d0dce8' }}>Gross Total</td><td style={{ padding: '7px 14px', fontSize: 11, color: '#1a1a2e', textAlign: 'right', borderBottom: '1px solid #d0dce8' }}>{d.grossTotal}</td></tr>
                  )}
                  {(d.currentTrigger === 'Invoice_Print' || d.currentTrigger === 'Edit_Invoice') && (
                    <tr><td style={{ padding: '7px 14px', fontSize: 11, color: '#1f1f1f', borderBottom: '1px solid #d0dce8' }}>Processing Fee</td><td style={{ padding: '7px 14px', fontSize: 11, color: '#1a1a2e', textAlign: 'right', borderBottom: '1px solid #d0dce8' }}>{d.processingCharges}</td></tr>
                  )}
                  {d.currentTrigger !== 'Net_Invoice' && (
                    !d.isSplitGST ? (
                      <tr><td style={{ padding: '7px 14px', fontSize: 11, color: '#1f1f1f', borderBottom: '1px solid #d0dce8' }}>Add IGST</td><td style={{ padding: '7px 14px', fontSize: 11, color: '#1a1a2e', textAlign: 'right', borderBottom: '1px solid #d0dce8' }}>{d.igst}</td></tr>
                    ) : (
                      <>
                        <tr><td style={{ padding: '7px 14px', fontSize: 11, color: '#1f1f1f', borderBottom: '1px solid #d0dce8' }}>Add CGST</td><td style={{ padding: '7px 14px', fontSize: 11, color: '#1a1a2e', textAlign: 'right', borderBottom: '1px solid #d0dce8' }}>{d.cgst}</td></tr>
                        <tr><td style={{ padding: '7px 14px', fontSize: 11, color: '#1f1f1f', borderBottom: '1px solid #d0dce8' }}>Add SGST</td><td style={{ padding: '7px 14px', fontSize: 11, color: '#1a1a2e', textAlign: 'right', borderBottom: '1px solid #d0dce8' }}>{d.sgst}</td></tr>
                      </>
                    )
                  )}
                  <tr style={{ backgroundColor: '#003d6e' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: 0.3, backgroundColor: '#003d6e' }}>Total Amount</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#ffffff', textAlign: 'right', backgroundColor: '#003d6e' }}>₹ {d.netAmount}</td>
                  </tr>
                  </tbody>
                </table>
                <div style={{ fontSize: 9.5, color: '#1f1f1f', textAlign: 'right', marginTop: 8, fontStyle: 'italic' }}>{d.amountInWords}</div>
              </td>
            </tr>
            </tbody>
          </table>

          {/* ── GST BREAKUP ── */}
          {d.isHolidayChacha && d.currentTrigger !== 'Net_Invoice' && (
            <table width="100%" cellPadding="0" cellSpacing="0" border="0"
              style={{ border: '1.5px solid #d0dce8', borderCollapse: 'collapse', marginBottom: 24 }}>
              <tbody>
              <tr><td colSpan={7} style={{ backgroundColor: '#e8f2fb', padding: '8px 14px', fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: '#005596' }}>GST Breakup</td></tr>
              <tr style={{ backgroundColor: '#003d6e' }}>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, backgroundColor: '#003d6e' }}>Description</td>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', backgroundColor: '#003d6e' }}>SAC</td>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', backgroundColor: '#003d6e' }}>Taxable</td>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', backgroundColor: '#003d6e' }}>CGST</td>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', backgroundColor: '#003d6e' }}>SGST</td>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', backgroundColor: '#003d6e' }}>IGST</td>
                <td style={{ padding: '7px 10px', fontSize: 9.5, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', backgroundColor: '#003d6e' }}>Total</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#1f1f1f', borderBottom: '1px solid #d0dce8' }}>Processing Fee</td>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#1a1a2e', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>9985</td>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#1a1a2e', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>{d.taxableVal}</td>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#1a1a2e', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>{d.isSplitGST ? d.cgst : '—'}</td>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#1a1a2e', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>{d.isSplitGST ? d.sgst : '—'}</td>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#1a1a2e', textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>{!d.isSplitGST ? d.igst : '—'}</td>
                <td style={{ padding: '8px 10px', fontSize: 10.5, color: '#003d6e', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #d0dce8' }}>{d.gstOnlyTotal}</td>
              </tr>
              </tbody>
            </table>
          )}

          {/* ── TERMS + SIGNATURE ── */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ borderTop: '1.5px solid #d0dce8', paddingTop: 8, marginTop: 8 }}>
            <tbody>
            <tr>
              <td width="60%" style={{ verticalAlign: 'top', paddingRight: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: '#005596', marginBottom: 7 }}>Terms &amp; Conditions</div>
                <div style={{ fontSize: 9, color: '#1f1f1f', lineHeight: 1.7 }}>
                  {formatTerms(d.terms).map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              </td>
              <td width="40%" style={{ verticalAlign: 'bottom', textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: '#1f1f1f', marginBottom: 2 }}>For <strong style={{ color: '#003d6e' }}>{d.compName}</strong></div>
                <div className={styles.sigFont}>{d.preparedBy}</div><br />
                <span style={{ display: 'inline-block', borderTop: '1.5px solid #d0dce8', paddingTop: 5, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#1f1f1f', minWidth: 140 }}>Authorized Signatory</span>
              </td>
            </tr>
            </tbody>
          </table>

          {/* ── DOC FOOTER ── */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ borderTop: '1px solid #d0dce8', marginTop: 8, paddingTop: 5 }}>
            <tbody>
            <tr>
              <td style={{ fontSize: 9, color: '#1f1f1f' }}>Prepared by: <strong style={{ color: '#1a1a2e' }}>{d.preparedBy}</strong></td>
              <td style={{ fontSize: 9, color: '#1f1f1f', textAlign: 'right' }}>This is a computer generated invoice — no signature required.</td>
            </tr>
            </tbody>
          </table>

        </td>
        </tr>

        {/* BOTTOM BAND */}
        <tr>
          <td height="4" style={{ height: 4, backgroundColor: '#005596', fontSize: 0, lineHeight: 0 }}>&nbsp;</td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}

/* Same parsing rule the template used: lines separated by "#", each
   re-prefixed with "# " when rendered. Company/brand names bolded.
   Returns an array of node-lists (one per line); the caller wraps each
   in its own <span>/<br>. */
function formatTerms(raw) {
  return (raw || '')
    .split('#')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => ['# ', ...boldBrandNames(l)])
}

function boldBrandNames(text) {
  const brands = ['Holiday Chacha PVT LTD', 'HPD Tourism LLC']
  const pattern = new RegExp(`(${brands.join('|')})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    brands.some(b => b.toLowerCase() === part.toLowerCase())
      ? <strong key={i}>{part}</strong>
      : part
  )
}
