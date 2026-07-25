import { useState, useEffect } from "react";
import "./HotelForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const INITIAL_FORM_DATA = {
  deal: "",
  adults: 0,

  guestName: "",
  destination: "",
  tourType: "Domestic",
  bookingType: "B2B",
  handledBy: "",
  entryBy: "",
  checkIn: "",

  totalRoom: 2,
  roomStatus: "Pending",
  rpTotalPax: 6,
  rpAdults: 4,
  rpChild: 2,
  rpInfant: 0,
  extraBed: "No",
  roomPreference: "Non Smoking",

  supplierName: "",
  confirmationNumber: "",
  hotelEmail: "",
  hotelStatus: "Pending",
  billingStatus: "",
  billTo: "Holiday Chacha PVT LTD",
  voucherStatus: "Pending",

  roomPrice: "",
  extraBedPrice: "",
  childPrice: "",
  taxes: "",
  discount: "",
  dueDate: "",

  advance1: "",
  advance2: "",
  advance3: "",
  advance4: "",
  paymentStatus: "Pending",
};

const EMPTY_BOOKING_ROW = {
  tourDate: "", nights: "", checkOut: "",
  city: "", hotelName: "", roomCategory: "Standard", mealPlan: "MAPAI",
  numRooms: 2, awb: "", cwb: "", noBed: "", markup: "", rate: "",
  roomConfirmationNumber: "", roomBillingStatus: "", remark: "",
};

const num = (v) => parseFloat(v) || 0;

const computeCheckOut = (tourDate, nights) => {
  if (!tourDate || nights === "" || nights === null || nights === undefined) return "";
  const nightsNum = parseInt(nights, 10);
  if (isNaN(nightsNum)) return "";
  const date = new Date(`${tourDate}T00:00:00`);
  if (isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + nightsNum);
  return date.toISOString().slice(0, 10);
};

const computeRowTotals = (row) => {
  const awbAmount = (num(row.awb) * num(row.rate) * num(row.nights)).toFixed(2);
  const cwbAmount = (num(row.cwb) * num(row.rate) * num(row.nights)).toFixed(2);
  const noBedAmount = (num(row.noBed) * num(row.rate) * num(row.nights)).toFixed(2);
  const markupAmount = (num(row.numRooms) * num(row.markup) * num(row.nights)).toFixed(2);
  const roomTotal = (
    parseFloat(awbAmount) + parseFloat(cwbAmount) + parseFloat(noBedAmount) + parseFloat(markupAmount)
  ).toFixed(2);
  return { awbAmount, cwbAmount, noBedAmount, markupAmount, roomTotal };
};

function HotelForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [bookingRows, setBookingRows] = useState([{ ...EMPTY_BOOKING_ROW }]);
  const [generatedRefNo, setGeneratedRefNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showPassengerTable, setShowPassengerTable] = useState(false);
  const [passengers, setPassengers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDealChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, deal: value }));

    if (!value.trim()) {
      setGeneratedRefNo("");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/hotel-quick-bookings/preview-ref?deal=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedRefNo(data.ref || "");
      } else {
        setGeneratedRefNo("");
      }
    } catch {
      setGeneratedRefNo("");
    }
  };

  const updateBookingRow = (index, field, value) => {
    setBookingRows((prev) => prev.map((row, i) => {
      if (i !== index) return row;
      const updated = { ...row, [field]: value };
      if (field === "tourDate" || field === "nights") {
        updated.checkOut = computeCheckOut(updated.tourDate, updated.nights);
      }
      return updated;
    }));
  };

  const addBookingRow = () => setBookingRows((prev) => [...prev, { ...EMPTY_BOOKING_ROW }]);
  const removeBookingRow = () => setBookingRows((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  /* ── passenger details table (driven by Total Pax) ── */
  const updatePassenger = (index, field, value) => {
    setPassengers((prev) => prev.map((p, i) => (i !== index ? p : { ...p, [field]: value })));
  };

  useEffect(() => {
    const count = Math.max(0, Math.trunc(num(formData.adults)));
    if (!count) {
      setShowPassengerTable(false);
      setPassengers([]);
      return;
    }
    setPassengers((prev) => {
      const next = prev.slice(0, count);
      while (next.length < count) next.push({ name: "", cellNo: "", email: "", dob: "", dom: "", remark: "" });
      return next;
    });
    setShowPassengerTable(true);
  }, [formData.adults]);

  const handlePassengerDropdownToggle = () => setShowPassengerTable((prev) => !prev);

  const grandTotal = (
    num(formData.roomPrice) +
    num(formData.extraBedPrice) +
    num(formData.childPrice) +
    num(formData.taxes) -
    num(formData.discount)
  ).toFixed(2);

  const balanceAmount = (
    parseFloat(grandTotal) -
    (num(formData.advance1) + num(formData.advance2) + num(formData.advance3) + num(formData.advance4))
  ).toFixed(2);

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setBookingRows([{ ...EMPTY_BOOKING_ROW }]);
    setGeneratedRefNo("");
    setPassengers([]);
    setShowPassengerTable(false);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_URL}/hotel-quick-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          grandTotal,
          balanceAmount,
          bookingRows: bookingRows.map((row) => ({ ...row, ...computeRowTotals(row) })),
          passengers,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save booking");
      }
      setGeneratedRefNo(data.ref || "");
      setSaveMessage({ type: "success", text: `Saved successfully — Ref No. ${data.ref}` });
      setFormData(INITIAL_FORM_DATA);
      setBookingRows([{ ...EMPTY_BOOKING_ROW }]);
      setPassengers([]);
      setShowPassengerTable(false);
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
        {/* {header section} */}
        <header className="header">
            <div className="header-content">
                <span>🏨</span>
                <h1>Hotel Booking Form</h1>
            </div>
            <div className="header-line"></div>
            <div className="header-button">
                <button className="back-button" onClick={() => window.location.reload()}>← Back</button>
            </div>
        </header>

        {/* {deal section} */}
        <div className="deal-form">
            <div className="deal-input">
              <label htmlFor="deal">Deal ID</label>
              <input type="text" id="deal" name="deal" placeholder="Enter Deal ID" value={formData.deal} onChange={handleDealChange} />
            </div>

            <div className="deal-divider"></div>

            <div className="ref-number">
              <label htmlFor="ref">Ref No.</label>
              <input type="text" id="ref" name="ref" value={generatedRefNo || (formData.deal ? "Generating..." : "Auto")} readOnly />
            </div>

            <div className="deal-divider"></div>

            <div className="total-pax">
              <label>Total Pax</label>
              <div className="pax-group">
                <div className="pax-counter">
                  <span className="pax-icon">👨</span>
                  <input type="number" id="adults" name="adults" min="0" value={formData.adults} onChange={handleChange} aria-label="Adults" />
                  <span className="pax-unit">Adults</span>
                </div>
              </div>
            </div>

        </div>

        {/* {passenger details table — generated from Total Pax} */}
        {passengers.length > 0 && (
          <div className="passenger-info-box">
            <div className="passenger-info-header">
              <span className="passenger-info-title">🧑‍🤝‍🧑 Passenger Details</span>
              <button
                type="button"
                className={`passenger-table-dropdown-btn${showPassengerTable ? " open" : ""}`}
                onClick={handlePassengerDropdownToggle}
                aria-expanded={showPassengerTable}
                aria-label={showPassengerTable ? "Collapse passenger details" : "Expand passenger details"}
              >
                ▾
              </button>
            </div>
            {showPassengerTable && (
              <div className="passenger-info-body">
                <table className="passenger-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Cell No.</th>
                      <th>Mail</th>
                      <th>DOB</th>
                      <th>DOM</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><input type="text" placeholder="Passenger Name" value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)} /></td>
                        <td><input type="tel" placeholder="Cell No." value={p.cellNo} onChange={(e) => updatePassenger(i, "cellNo", e.target.value)} /></td>
                        <td><input type="email" placeholder="Email" value={p.email} onChange={(e) => updatePassenger(i, "email", e.target.value)} /></td>
                        <td><input type="date" value={p.dob} onChange={(e) => updatePassenger(i, "dob", e.target.value)} /></td>
                        <td><input type="date" value={p.dom} onChange={(e) => updatePassenger(i, "dom", e.target.value)} /></td>
                        <td><input type="text" placeholder="Optional remarks" value={p.remark} onChange={(e) => updatePassenger(i, "remark", e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* {booking information section} */}
        <div className="booking-info-box">
            <div className="booking-info-header">
                <span className="booking-info-title">📋 Hotel Booking Information</span>
                <div className="booking-row-controls">
                    <button type="button" className="booking-row-btn booking-row-remove-btn" onClick={removeBookingRow} disabled={bookingRows.length <= 1} aria-label="Remove last booking row">−</button>
                    <span className="booking-row-count">{bookingRows.length}</span>
                    <button type="button" className="booking-row-btn booking-row-add-btn" onClick={addBookingRow} aria-label="Add another booking row">+</button>
                </div>
            </div>

            <div className="booking-info-body">
              {bookingRows.map((row, i) => {
                const { awbAmount, cwbAmount, noBedAmount, roomTotal } = computeRowTotals(row);
                return (
                <div className="booking-row-block" key={i}>
                  {bookingRows.length > 1 && (
                    <div className="booking-row-label">Row #{i + 1}</div>
                  )}
                  <div className="guest-name-row">
                    <div className="guest-name-field">
                        <label htmlFor={`tourDate-${i}`}>Travel Date</label>
                        <input type="date" id={`tourDate-${i}`} value={row.tourDate} onChange={(e) => updateBookingRow(i, "tourDate", e.target.value)} />
                    </div>
                    <div className="nights-field">
                        <label htmlFor={`nights-${i}`}>Nights</label>
                        <input type="number" id={`nights-${i}`} min="0" placeholder="0" value={row.nights} onChange={(e) => updateBookingRow(i, "nights", e.target.value)} />
                    </div>
                    <div className="checkout-field">
                        <label htmlFor={`checkOut-${i}`}>Check-Out</label>
                        <input type="date" id={`checkOut-${i}`} value={row.checkOut} onChange={(e) => updateBookingRow(i, "checkOut", e.target.value)} />
                    </div>

                    <div className="city-field">
                        <label htmlFor={`city-${i}`}>City</label>
                        <input type="text" id={`city-${i}`} placeholder="Enter City" value={row.city} onChange={(e) => updateBookingRow(i, "city", e.target.value)} />
                    </div>

                    <div className="hotel-name-field">
                        <label htmlFor={`hotelName-${i}`}>Hotel Name</label>
                        <select id={`hotelName-${i}`} value={row.hotelName} onChange={(e) => updateBookingRow(i, "hotelName", e.target.value)}>
                            <option value="" disabled>Select Hotel</option>
                            <option value="Taj Palace">Taj Palace</option>
                            <option value="Leela Grand">Leela Grand</option>
                            <option value="Radisson Blu">Radisson Blu</option>
                        </select>
                    </div>
                    <div className="room-category-field">
                        <label htmlFor={`roomCategory-${i}`}>Room Category</label>
                        <select id={`roomCategory-${i}`} value={row.roomCategory} onChange={(e) => updateBookingRow(i, "roomCategory", e.target.value)}>
                            <option value="Standard">Standard</option>
                            <option value="Deluxe">Deluxe</option>
                            <option value="Suite">Suite</option>
                            <option value="Executive">Executive</option>
                        </select>
                    </div>
                    <div className="meal-plan-field">
                        <label htmlFor={`mealPlan-${i}`}>Meal Plan</label>
                        <select id={`mealPlan-${i}`} value={row.mealPlan} onChange={(e) => updateBookingRow(i, "mealPlan", e.target.value)}>
                            <option value="EPAI">EPAI</option>
                            <option value="CPAI">CPAI</option>
                            <option value="MAPAI">MAPAI</option>
                            <option value="APAI">APAI</option>
                        </select>
                    </div>
                  </div>


                  <div className="tour-booking-handled-row">

                    <div className="rooms-count-field">
                        <label htmlFor={`numRooms-${i}`}>Rooms</label>
                        <input type="number" id={`numRooms-${i}`} min="0" value={row.numRooms} onChange={(e) => updateBookingRow(i, "numRooms", e.target.value)} />
                    </div>

                    <div className="awb-field">
                        <label htmlFor={`awb-${i}`}>AWB</label>
                        <input type="number" id={`awb-${i}`} min="0" placeholder="0" value={row.awb} onChange={(e) => updateBookingRow(i, "awb", e.target.value)} />
                    </div>

                    <div className="cwb-field">
                        <label htmlFor={`cwb-${i}`}>CNB</label>
                        <input type="number" id={`cwb-${i}`} min="0" placeholder="0" value={row.cwb} onChange={(e) => updateBookingRow(i, "cwb", e.target.value)} />
                    </div>

                    <div className="no-bed-field">
                        <label htmlFor={`noBed-${i}`}>No Bed</label>
                        <input type="number" id={`noBed-${i}`} min="0" placeholder="0" value={row.noBed} onChange={(e) => updateBookingRow(i, "noBed", e.target.value)} />
                    </div>

                    <div className="markup-field">
                        <label htmlFor={`markup-${i}`}>Markup</label>
                        <input type="number" id={`markup-${i}`} min="0" placeholder="0" value={row.markup} onChange={(e) => updateBookingRow(i, "markup", e.target.value)} />
                    </div>

                    <div className="rate-field">
                        <label htmlFor={`rate-${i}`}>Rate</label>
                        <input type="number" id={`rate-${i}`} min="0" placeholder="0" value={row.rate} onChange={(e) => updateBookingRow(i, "rate", e.target.value)} />
                    </div>

                    <div className="awb-amount-field">
                        <label htmlFor={`awbAmount-${i}`}>AWB Amount</label>
                        <input type="number" id={`awbAmount-${i}`} value={awbAmount} readOnly />
                    </div>

                    <div className="cwb-amount-field">
                        <label htmlFor={`cwbAmount-${i}`}>CWB Amount</label>
                        <input type="number" id={`cwbAmount-${i}`} value={cwbAmount} readOnly />
                    </div>

                    <div className="no-bed-amount-field">
                        <label htmlFor={`noBedAmount-${i}`}>No Bed Amount</label>
                        <input type="number" id={`noBedAmount-${i}`} value={noBedAmount} readOnly />
                    </div>

                    <div className="room-total-field">
                        <label htmlFor={`roomTotal-${i}`}>Total</label>
                        <input type="number" id={`roomTotal-${i}`} value={roomTotal} readOnly />
                    </div>

                    <div className="room-confirmation-number-field">
                        <label htmlFor={`roomConfirmationNumber-${i}`}>Conf. Number</label>
                        <input type="text" id={`roomConfirmationNumber-${i}`} placeholder="Conf. No." value={row.roomConfirmationNumber} onChange={(e) => updateBookingRow(i, "roomConfirmationNumber", e.target.value)} />
                    </div>

                    <div className="room-billing-status-field">
                        <label htmlFor={`roomBillingStatus-${i}`}>Conf. By</label>
                        <input
                            type="text"
                            id={`roomBillingStatus-${i}`}
                            placeholder="Enter name"
                            value={row.roomBillingStatus ?? ""}
                            onChange={(e) => updateBookingRow(i, "roomBillingStatus", e.target.value)}
                        />
                    </div>
                    <div className="remark-field">
                        <label htmlFor={`remark-${i}`}>Remark</label>
                        <input type="text" id={`remark-${i}`} placeholder="Optional remarks" value={row.remark} onChange={(e) => updateBookingRow(i, "remark", e.target.value)} />
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
        </div>



        {/* {supplier details section} */}
        {/* <div className="supplier-info-box">
            <div className="supplier-info-header">
                <span className="supplier-info-title">🧾 Supplier Details</span>
            </div>

            <div className="supplier-info-body">

                <div className="supplier-contact-row">
                    <div className="supplier-name-field">
                        <label htmlFor="supplierName">Supplier Name</label>
                        <input type="text" id="supplierName" name="supplierName" placeholder="Supplier Name" value={formData.supplierName} onChange={handleChange} />
                    </div>

                    <div className="confirmation-number-field">
                        <label htmlFor="confirmationNumber">Conf. Number</label>
                        <input type="text" id="confirmationNumber" name="confirmationNumber" placeholder="Conf. No." value={formData.confirmationNumber} onChange={handleChange} />
                    </div>

                    <div className="hotel-email-field">
                        <label htmlFor="hotelEmail">Hotel Email</label>
                        <input type="email" id="hotelEmail" name="hotelEmail" placeholder="hotel@example.com" value={formData.hotelEmail} onChange={handleChange} />
                    </div>

                    <div className="hotel-status-field">
                        <label htmlFor="hotelStatus">Hotel Status</label>
                        <select id="hotelStatus" name="hotelStatus" value={formData.hotelStatus} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                        </select>
                    </div>

                    <div className="billing-status-field">
                        <label htmlFor="billingStatus">Billing Status</label>
                        <select id="billingStatus" name="billingStatus" value={formData.billingStatus} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                        </select>
                    </div>

                    <div className="bill-to-field">
                        <label htmlFor="billTo">Bill To</label>
                        <select id="billTo" name="billTo" value={formData.billTo} onChange={handleChange}>
                            <option value="Holiday Chacha PVT LTD">Holiday Chacha</option>
                            <option value="HPD Tourism LLC">HPD Tourism LLC</option>
                        </select>
                    </div>

                    <div className="voucher-status-field">
                        <label htmlFor="voucherStatus">Voucher Status</label>
                        <select id="voucherStatus" name="voucherStatus" value={formData.voucherStatus} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Sent">Sent</option>
                            <option value="Not Required">Not Required</option>
                        </select>
                    </div>

                    <div className="remark-field">
                        <label htmlFor="remark">Remark</label>
                        <input type="text" id="remark" name="remark" placeholder="Optional remarks" value={formData.remark} onChange={handleChange} />
                    </div>
                </div>

            </div>
        </div> */}

        {/* {price details section} */}
        {/* <div className="price-info-box">
            <div className="price-info-header">
                <span className="price-info-title">💰 Price Details</span>
            </div>

            <div className="price-info-body">

                <div className="price-row">
                    <div className="room-price-field">
                        <label htmlFor="roomPrice">Room Price</label>
                        <input type="number" id="roomPrice" name="roomPrice" min="0" placeholder="0" value={formData.roomPrice} onChange={handleChange} />
                    </div>

                    <div className="extra-bed-price-field">
                        <label htmlFor="extraBedPrice">Extra Bed Price</label>
                        <input type="number" id="extraBedPrice" name="extraBedPrice" min="0" placeholder="0" value={formData.extraBedPrice} onChange={handleChange} />
                    </div>

                    <div className="child-price-field">
                        <label htmlFor="childPrice">Child Price</label>
                        <input type="number" id="childPrice" name="childPrice" min="0" placeholder="0" value={formData.childPrice} onChange={handleChange} />
                    </div>

                    <div className="taxes-field">
                        <label htmlFor="taxes">Taxes</label>
                        <input type="number" id="taxes" name="taxes" min="0" placeholder="0" value={formData.taxes} onChange={handleChange} />
                    </div>

                    <div className="discount-field">
                        <label htmlFor="discount">Discount</label>
                        <input type="number" id="discount" name="discount" min="0" placeholder="0" value={formData.discount} onChange={handleChange} />
                    </div>

                    <div className="grand-total-field">
                        <label htmlFor="grandTotal">Grand Total</label>
                        <input type="number" id="grandTotal" name="grandTotal" min="0" value={grandTotal} readOnly />
                    </div>

                    <div className="due-date-field">
                        <label htmlFor="dueDate">Due Date</label>
                        <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} />
                    </div>
                </div>

            </div>
        </div> */}

        {/* {payment details section} */}
        {/* <div className="payment-info-box">
            <div className="payment-info-header">
                <span className="payment-info-title">💳 Payment Details</span>
            </div>

            <div className="payment-info-body">

                <div className="payment-row">
                    <div className="advance1-field">
                        <label htmlFor="advance1">1st Advance</label>
                        <input type="number" id="advance1" name="advance1" min="0" placeholder="0" value={formData.advance1} onChange={handleChange} />
                    </div>

                    <div className="advance2-field">
                        <label htmlFor="advance2">2nd Advance</label>
                        <input type="number" id="advance2" name="advance2" min="0" placeholder="0" value={formData.advance2} onChange={handleChange} />
                    </div>

                    <div className="advance3-field">
                        <label htmlFor="advance3">3rd Advance</label>
                        <input type="number" id="advance3" name="advance3" min="0" placeholder="0" value={formData.advance3} onChange={handleChange} />
                    </div>

                    <div className="advance4-field">
                        <label htmlFor="advance4">4th Advance</label>
                        <input type="number" id="advance4" name="advance4" min="0" placeholder="0" value={formData.advance4} onChange={handleChange} />
                    </div>

                    <div className="balance-amount-field">
                        <label htmlFor="balanceAmount">Balance Amount</label>
                        <input type="number" id="balanceAmount" name="balanceAmount" min="0" value={balanceAmount} readOnly />
                    </div>

                    <div className="payment-status-field">
                        <label htmlFor="paymentStatus">Payment Status</label>
                        <select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
                            <option value="Full Paid">Full Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

            </div>
        </div> */}

        {saveMessage && (
            <div className={saveMessage.type === "success" ? "save-status-success" : "save-status-error"}>
                {saveMessage.text}
            </div>
        )}

        {/* {form actions} */}
        <div className="form-actions-row">
            <button type="button" className="save-button" onClick={handleSave} disabled={saving}>
                {saving ? "💾 Saving…" : "💾 SAVE"}
            </button>
            <button type="button" className="reset-button" onClick={handleReset}>🗑 RESET</button>
        </div>

    </div>
  );
}

export default HotelForm;
