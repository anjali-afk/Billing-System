import { useState } from "react";
import "./Hotel.css";
import {
  AGENCIES, CITIES, HOTELS_BY_CITY, ROOMS_BY_HOTEL,
  SUPPLIERS, CURRENCIES, TRANSPORT_TYPES, ACTIVITIES,
  PRICE_TYPES, PAYMENT_MODES,
} from "../../mock/mockQuoteData.js";

const num = (v) => parseFloat(v) || 0;

const EMPTY_HOTEL_BLOCK = {
  checkIn: "", nights: "", checkOut: "",
  city: "", hotelName: "", roomCategory: "",
  room: "", awb: "", cwb: "", cnb: "",
  currency: "INR", roomRate: "", awbRate: "", cwbRate: "", cnbRate: "",
  hotelStatus: "Pending", confirmationNumber: "", confirmedBy: "",
  supplier: "", billingStatus: "Pending",
  remark: "",
};

const EMPTY_ACTIVITY_BLOCK = {
  date: "", pickupTime: "",
  tourType: "", activityName: "",
  transportType: "None",
};

function activityLookup(name) {
  return ACTIVITIES.find((a) => a.name === name) || null;
}

function transportLookup(label) {
  return TRANSPORT_TYPES.find((t) => t.label === label) || TRANSPORT_TYPES[0];
}

function HotelQuoteForm() {
  const [leadRefNo, setLeadRefNo] = useState("");

  const [agency, setAgency] = useState({ agencyName: "", contactName: "", mobileNo: "", city: "" });

  const [tourSummary, setTourSummary] = useState({ nights: "", adults: "", cwb: "", cnb: "", infant: "" });
  const totalPax = num(tourSummary.adults) + num(tourSummary.cwb) + num(tourSummary.cnb);

  const [hotelBlocks, setHotelBlocks] = useState([{ ...EMPTY_HOTEL_BLOCK }]);
  const [activityBlocks, setActivityBlocks] = useState([{ ...EMPTY_ACTIVITY_BLOCK }]);

  const [pricePayment, setPricePayment] = useState({
    priceType: "", priceAdult: "", priceCWB: "", priceCNB: "", paymentMode: "", finalRemark: "",
  });

  const [saveMessage, setSaveMessage] = useState(null);

  const handleAgencyChange = (e) => {
    const { name, value } = e.target;
    setAgency((prev) => ({ ...prev, [name]: value }));
  };

  const handleTourSummaryChange = (e) => {
    const { name, value } = e.target;
    setTourSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handlePricePaymentChange = (e) => {
    const { name, value } = e.target;
    setPricePayment((prev) => ({ ...prev, [name]: value }));
  };

  /* ── hotel blocks ── */
  const updateHotelBlock = (index, field, value) => {
    setHotelBlocks((prev) => prev.map((block, i) => {
      if (i !== index) return block;
      const next = { ...block, [field]: value };
      if (field === "city") { next.hotelName = ""; next.roomCategory = ""; }
      if (field === "hotelName") { next.roomCategory = ""; }
      return next;
    }));
  };

  const addHotelBlock = () => setHotelBlocks((prev) => [...prev, { ...EMPTY_HOTEL_BLOCK }]);
  const removeHotelBlock = (index) =>
    setHotelBlocks((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  /* ── activity blocks ── */
  const updateActivityBlock = (index, field, value) => {
    setActivityBlocks((prev) => prev.map((block, i) => (i !== index ? block : { ...block, [field]: value })));
  };

  const addActivityBlock = () => setActivityBlocks((prev) => [...prev, { ...EMPTY_ACTIVITY_BLOCK }]);
  const removeActivityBlock = (index) =>
    setActivityBlocks((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  /* ── save ── */
  const handleSave = () => {
    if (!agency.agencyName) {
      setSaveMessage({ type: "error", text: "Please select an Agency Name before saving." });
      return;
    }

    const payload = {
      leadRefNo,
      agency,
      tourSummary: { ...tourSummary, totalPax },
      hotelBlocks,
      activityBlocks: activityBlocks.map((b) => {
        const activity = activityLookup(b.activityName);
        const transport = transportLookup(b.transportType);
        const adultRate = activity?.adultRate || 0;
        const childRate = activity?.childRate || 0;
        return {
          ...b,
          tourCode: activity?.code || "",
          adultRate,
          childRate,
          transportRate: transport.rate,
          totalAdult: adultRate * num(tourSummary.adults) + transport.rate,
          totalChild: childRate * (num(tourSummary.cwb) + num(tourSummary.cnb)),
        };
      }),
      pricePayment,
    };

    // No backend endpoint has been wired up for quotes yet — this just
    // assembles the payload so it's ready for a future save() call.
    console.log("Quote payload", payload);
    setSaveMessage({ type: "success", text: "Quote prepared — backend save isn't wired up yet, see console for the payload." });
  };

  const handleBack = () => window.location.reload();

  return (
    <div className="qf-page">
      {/* {header section} */}
      <header className="qf-header">
        <div className="qf-header-content">
          <span>🧾</span>
          <h1>B2B Quote Form</h1>
        </div>
        <div className="qf-header-line"></div>
        <div className="qf-header-button">
          <button className="qf-back-button" onClick={handleBack}>← Back</button>
        </div>
      </header>

      {/* {ref row} */}
      <div className="qf-ref-row">
        <div className="qf-system-ref-field">
          <label htmlFor="systemRef">System Ref</label>
          <input type="text" id="systemRef" value="Auto: QTYYYYMMDD###" readOnly />
        </div>

        <div className="qf-lead-ref-field">
          <label htmlFor="leadRefNo">Lead Ref No</label>
          <input type="text" id="leadRefNo" name="leadRefNo" placeholder="Enter Lead Ref No" value={leadRefNo} onChange={(e) => setLeadRefNo(e.target.value)} />
        </div>
      </div>

      {/* {agency details section} */}
      <div className="qf-agency-box">
        <div className="qf-agency-header">
          <span className="qf-agency-title">🏢 Agency Details</span>
        </div>

        <div className="qf-agency-body">
          <div className="qf-agency-row">
            <div className="qf-agency-name-field">
              <label htmlFor="agencyName">Agency Name</label>
              <select id="agencyName" name="agencyName" value={agency.agencyName} onChange={handleAgencyChange}>
                <option value="" disabled>Select Agency</option>
                {AGENCIES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="qf-contact-name-field">
              <label htmlFor="contactName">Contact Name</label>
              <input type="text" id="contactName" name="contactName" placeholder="Contact Name" value={agency.contactName} onChange={handleAgencyChange} />
            </div>

            <div className="qf-mobile-no-field">
              <label htmlFor="mobileNo">Mobile No</label>
              <input type="tel" id="mobileNo" name="mobileNo" placeholder="Mobile No" value={agency.mobileNo} onChange={handleAgencyChange} />
            </div>

            <div className="qf-agency-city-field">
              <label htmlFor="agencyCity">City</label>
              <input type="text" id="agencyCity" name="city" placeholder="City" value={agency.city} onChange={handleAgencyChange} />
            </div>
            <div className="qf-summary-nights-field">
              <label htmlFor="summaryNights">Nights</label>
              <input type="number" id="summaryNights" name="nights" min="0" placeholder="0" value={tourSummary.nights} onChange={handleTourSummaryChange} />
            </div>

            <div className="qf-summary-adults-field">
              <label htmlFor="summaryAdults">Adults</label>
              <input type="number" id="summaryAdults" name="adults" min="0" placeholder="0" value={tourSummary.adults} onChange={handleTourSummaryChange} />
            </div>

            <div className="qf-summary-cwb-field">
              <label htmlFor="summaryCwb">CWB (Child w/ Bed)</label>
              <input type="number" id="summaryCwb" name="cwb" min="0" placeholder="0" value={tourSummary.cwb} onChange={handleTourSummaryChange} />
            </div>
            <div className="qf-summary-cnb-field">
              <label htmlFor="summaryCnb">CNB (Child no Bed)</label>
              <input type="number" id="summaryCnb" name="cnb" min="0" placeholder="0" value={tourSummary.cnb} onChange={handleTourSummaryChange} />
            </div>
            <div className="qf-summary-infant-field">
              <label htmlFor="summaryInfant">Infant</label>
              <input type="number" id="summaryInfant" name="infant" min="0" placeholder="0" value={tourSummary.infant} onChange={handleTourSummaryChange} />
            </div>
            <div className="qf-summary-total-pax-field">
              <label htmlFor="summaryTotalPax">Total Pax</label>
              <input type="number" id="summaryTotalPax" value={totalPax} readOnly />
            </div>
          </div>
        </div>
      </div>



      {/* {hotel block section — repeatable} */}
      <div className="qf-hotel-block-box">
        <div className="qf-hotel-block-header">
          <span className="qf-hotel-block-title">🏨 Hotel Block</span>
        </div>

        <div className="qf-hotel-block-body">
          {hotelBlocks.map((block, i) => {
            const total = num(block.room) * num(block.roomRate)
              + num(block.awb) * num(block.awbRate)
              + num(block.cwb) * num(block.cwbRate)
              + num(block.cnb) * num(block.cnbRate);

            return (
            <div className="qf-hotel-block-card" key={i}>
              <div className="qf-hotel-block-card-header">
                <span className="qf-hotel-block-number">Block #{i + 1}</span>
                {hotelBlocks.length > 1 && (
                  <button type="button" className="qf-remove-hotel-block-btn" onClick={() => removeHotelBlock(i)}>🗑 Remove Block</button>
                )}
              </div>

              <div className="qf-hotel-row-dates">
                <div className="qf-hotel-checkin-field">
                  <label htmlFor={`hotelCheckIn-${i}`}>Check-In</label>
                  <input type="date" id={`hotelCheckIn-${i}`} value={block.checkIn} onChange={(e) => updateHotelBlock(i, "checkIn", e.target.value)} />
                </div>

                <div className="qf-hotel-nights-field">
                  <label htmlFor={`hotelNights-${i}`}>Nights</label>
                  <input type="number" id={`hotelNights-${i}`} min="0" placeholder="0" value={block.nights} onChange={(e) => updateHotelBlock(i, "nights", e.target.value)} />
                </div>

                <div className="qf-hotel-checkout-field">
                  <label htmlFor={`hotelCheckOut-${i}`}>Check-Out</label>
                  <input type="date" id={`hotelCheckOut-${i}`} value={block.checkOut} onChange={(e) => updateHotelBlock(i, "checkOut", e.target.value)} />
                </div>
                <div className="qf-hotel-city-field">
                  <label htmlFor={`hotelCity-${i}`}>City</label>
                  <select id={`hotelCity-${i}`} value={block.city} onChange={(e) => updateHotelBlock(i, "city", e.target.value)}>
                    <option value="" disabled>Select City</option>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="qf-hotel-name-field">
                  <label htmlFor={`hotelName-${i}`}>Hotel Name</label>
                  <select id={`hotelName-${i}`} value={block.hotelName} onChange={(e) => updateHotelBlock(i, "hotelName", e.target.value)} disabled={!block.city}>
                    <option value="" disabled>{block.city ? "Select Hotel" : "Select City first"}</option>
                    {(HOTELS_BY_CITY[block.city] || []).map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
                 <div className="qf-hotel-room-category-field">
                  <label htmlFor={`hotelRoomCategory-${i}`}>Room Category</label>
                  <select id={`hotelRoomCategory-${i}`} value={block.roomCategory} onChange={(e) => updateHotelBlock(i, "roomCategory", e.target.value)} disabled={!block.hotelName}>
                    <option value="" disabled>{block.hotelName ? "Select Room" : "Select Hotel first"}</option>
                    {(ROOMS_BY_HOTEL[block.hotelName] || []).map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="qf-hotel-room-field">
                  <label htmlFor={`hotelRoom-${i}`}>Total Rooms</label>
                  <input type="number" id={`hotelRoom-${i}`} min="0" placeholder="0" value={block.room} onChange={(e) => updateHotelBlock(i, "room", e.target.value)} />
                </div>
              </div>

              <div className="qf-supplier-subheading">Occupancy, Rates &amp; Confirmation</div>

              <div className="qf-hotel-row-occupancy2">
                <div className="qf-hotel-awb-field">
                  <label htmlFor={`hotelAwb-${i}`}>Adult With Bed</label>
                  <input type="number" id={`hotelAwb-${i}`} min="0" placeholder="0" value={block.awb} onChange={(e) => updateHotelBlock(i, "awb", e.target.value)} />
                </div>

                <div className="qf-hotel-cwb-field">
                  <label htmlFor={`hotelCwb-${i}`}>Child With Bed</label>
                  <input type="number" id={`hotelCwb-${i}`} min="0" placeholder="0" value={block.cwb} onChange={(e) => updateHotelBlock(i, "cwb", e.target.value)} />
                </div>

                <div className="qf-hotel-cnb-field">
                  <label htmlFor={`hotelCnb-${i}`}>No Bed</label>
                  <input type="number" id={`hotelCnb-${i}`} min="0" placeholder="0" value={block.cnb} onChange={(e) => updateHotelBlock(i, "cnb", e.target.value)} />
                </div>

                <div className="qf-hotel-awb-rate-field">
                  <label htmlFor={`hotelAwbRate-${i}`}>Adult With Bed Rate</label>
                  <input type="number" id={`hotelAwbRate-${i}`} min="0" placeholder="0" value={block.awbRate} onChange={(e) => updateHotelBlock(i, "awbRate", e.target.value)} />
                </div>

                <div className="qf-hotel-cwb-rate-field">
                  <label htmlFor={`hotelCwbRate-${i}`}>Child With Bed Rate</label>
                  <input type="number" id={`hotelCwbRate-${i}`} min="0" placeholder="0" value={block.cwbRate} onChange={(e) => updateHotelBlock(i, "cwbRate", e.target.value)} />
                </div>

                <div className="qf-hotel-cnb-rate-field">
                  <label htmlFor={`hotelCnbRate-${i}`}>No Bed Rate</label>
                  <input type="number" id={`hotelCnbRate-${i}`} min="0" placeholder="0" value={block.cnbRate} onChange={(e) => updateHotelBlock(i, "cnbRate", e.target.value)} />
                </div>

                <div className="qf-hotel-total-field">
                  <label htmlFor={`hotelTotal-${i}`}>Total</label>
                  <input type="number" id={`hotelTotal-${i}`} value={total} readOnly />
                </div>

                <div className="qf-hotel-status-field">
                  <label htmlFor={`hotelStatus-${i}`}>Status</label>
                  <select id={`hotelStatus-${i}`} value={block.hotelStatus} onChange={(e) => updateHotelBlock(i, "hotelStatus", e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>

                <div className="qf-hotel-confirmation-number-field">
                  <label htmlFor={`hotelConfirmationNumber-${i}`}>Confirmation Number</label>
                  <input type="text" id={`hotelConfirmationNumber-${i}`} placeholder="Conf. No." value={block.confirmationNumber} onChange={(e) => updateHotelBlock(i, "confirmationNumber", e.target.value)} />
                </div>

                <div className="qf-hotel-confirmed-by-field">
                  <label htmlFor={`hotelConfirmedBy-${i}`}>Confirmed By</label>
                  <input type="text" id={`hotelConfirmedBy-${i}`} placeholder="Name" value={block.confirmedBy} onChange={(e) => updateHotelBlock(i, "confirmedBy", e.target.value)} />
                </div>

                <div className="qf-hotel-supplier-field">
                  <label htmlFor={`hotelSupplier-${i}`}>Supplier</label>
                  <select id={`hotelSupplier-${i}`} value={block.supplier} onChange={(e) => updateHotelBlock(i, "supplier", e.target.value)}>
                    <option value="" disabled>Select Supplier</option>
                    {SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="qf-hotel-billing-status-field">
                  <label htmlFor={`hotelBillingStatus-${i}`}>Billing Status</label>
                  <select id={`hotelBillingStatus-${i}`} value={block.billingStatus} onChange={(e) => updateHotelBlock(i, "billingStatus", e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
              </div>

              <div className="qf-hotel-row-supplier">
                <div className="qf-hotel-currency-field">
                  <label htmlFor={`hotelCurrency-${i}`}>Currency</label>
                  <select id={`hotelCurrency-${i}`} value={block.currency} onChange={(e) => updateHotelBlock(i, "currency", e.target.value)}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="qf-hotel-room-rate-field">
                  <label htmlFor={`hotelRoomRate-${i}`}>Room Rate</label>
                  <input type="number" id={`hotelRoomRate-${i}`} min="0" placeholder="0" value={block.roomRate} onChange={(e) => updateHotelBlock(i, "roomRate", e.target.value)} />
                </div>

                <div className="qf-hotel-remark-field">
                  <label htmlFor={`hotelRemark-${i}`}>Remark</label>
                  <input type="text" id={`hotelRemark-${i}`} placeholder="Optional remarks" value={block.remark} onChange={(e) => updateHotelBlock(i, "remark", e.target.value)} />
                </div>
              </div>
            </div>
            );
          })}

          <button type="button" className="qf-add-hotel-block-btn" onClick={addHotelBlock}>➕ Add Another Hotel Block</button>
        </div>
      </div>

      {/* {activity / tour block section — repeatable} */}
      <div className="qf-activity-block-box">
        <div className="qf-activity-block-header">
          <span className="qf-activity-block-title">🎟️ Activity / Tour Block</span>
        </div>

        <div className="qf-activity-block-body">
          {activityBlocks.map((block, i) => {
            const activity = activityLookup(block.activityName);
            const transport = transportLookup(block.transportType);
            const adultRate = activity?.adultRate || 0;
            const childRate = activity?.childRate || 0;
            const totalAdult = adultRate * num(tourSummary.adults) + transport.rate;
            const totalChild = childRate * (num(tourSummary.cwb) + num(tourSummary.cnb));

            return (
              <div className="qf-activity-block-card" key={i}>
                <div className="qf-activity-block-card-header">
                  <span className="qf-activity-block-number">Row #{i + 1}</span>
                  {activityBlocks.length > 1 && (
                    <button type="button" className="qf-remove-activity-block-btn" onClick={() => removeActivityBlock(i)}>🗑 Remove Row</button>
                  )}
                </div>

                <div className="qf-activity-row-datetime">
                  <div className="qf-activity-date-field">
                    <label htmlFor={`activityDate-${i}`}>Date</label>
                    <input type="date" id={`activityDate-${i}`} value={block.date} onChange={(e) => updateActivityBlock(i, "date", e.target.value)} />
                  </div>

                  <div className="qf-activity-pickup-time-field">
                    <label htmlFor={`activityPickupTime-${i}`}>Pick-up Time</label>
                    <input type="time" id={`activityPickupTime-${i}`} value={block.pickupTime} onChange={(e) => updateActivityBlock(i, "pickupTime", e.target.value)} />
                  </div>
                </div>

                <div className="qf-activity-row-tour">
                  <div className="qf-activity-tour-type-field">
                    <label htmlFor={`activityTourType-${i}`}>Tour Type</label>
                    <input type="text" id={`activityTourType-${i}`} placeholder="e.g. Sightseeing" value={block.tourType} onChange={(e) => updateActivityBlock(i, "tourType", e.target.value)} />
                  </div>

                  <div className="qf-activity-tour-code-field">
                    <label htmlFor={`activityTourCode-${i}`}>Tour Code</label>
                    <input type="text" id={`activityTourCode-${i}`} value={activity?.code || "Auto-linked to Activity"} readOnly />
                  </div>
                </div>

                <div className="qf-activity-row-name">
                  <div className="qf-activity-name-field">
                    <label htmlFor={`activityName-${i}`}>Activity Name</label>
                    <select id={`activityName-${i}`} value={block.activityName} onChange={(e) => updateActivityBlock(i, "activityName", e.target.value)}>
                      <option value="" disabled>Select Activity</option>
                      {ACTIVITIES.map((a) => <option key={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="qf-activity-row-rates">
                  <div className="qf-activity-adult-rate-field">
                    <label htmlFor={`activityAdultRate-${i}`}>Adult Rate (PPP)</label>
                    <input type="number" id={`activityAdultRate-${i}`} value={adultRate} readOnly />
                  </div>

                  <div className="qf-activity-child-rate-field">
                    <label htmlFor={`activityChildRate-${i}`}>Child Rate (PPP)</label>
                    <input type="number" id={`activityChildRate-${i}`} value={childRate} readOnly />
                  </div>
                </div>

                <div className="qf-transport-subheading">Private Transport (optional)</div>

                <div className="qf-activity-row-transport">
                  <div className="qf-activity-transport-type-field">
                    <label htmlFor={`activityTransportType-${i}`}>Transport Type</label>
                    <select id={`activityTransportType-${i}`} value={block.transportType} onChange={(e) => updateActivityBlock(i, "transportType", e.target.value)}>
                      {TRANSPORT_TYPES.map((t) => <option key={t.label}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="qf-activity-row-transport-rate">
                  <div className="qf-activity-transport-rate-field">
                    <label htmlFor={`activityTransportRate-${i}`}>Transport Rate</label>
                    <input type="number" id={`activityTransportRate-${i}`} value={transport.rate} readOnly />
                  </div>
                </div>

                <div className="qf-activity-row-totals">
                  <div className="qf-activity-total-adult-field">
                    <label htmlFor={`activityTotalAdult-${i}`}>Total Adult</label>
                    <input type="number" id={`activityTotalAdult-${i}`} value={totalAdult} readOnly />
                  </div>

                  <div className="qf-activity-total-child-field">
                    <label htmlFor={`activityTotalChild-${i}`}>Total Child</label>
                    <input type="number" id={`activityTotalChild-${i}`} value={totalChild} readOnly />
                  </div>
                </div>
              </div>
            );
          })}

          <button type="button" className="qf-add-activity-block-btn" onClick={addActivityBlock}>➕ Add Another Activity Row</button>
        </div>
      </div>

      {/* {price & payment section} */}
      <div className="qf-price-payment-box">
        <div className="qf-price-payment-header">
          <span className="qf-price-payment-title">💰 Price &amp; Payment</span>
        </div>

        <div className="qf-price-payment-body">
          <div className="qf-price-payment-row">
            <div className="qf-price-type-field">
              <label htmlFor="priceType">Price Type</label>
              <select id="priceType" name="priceType" value={pricePayment.priceType} onChange={handlePricePaymentChange}>
                <option value="" disabled>Select Price Type</option>
                {PRICE_TYPES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="qf-price-adult-field">
              <label htmlFor="priceAdult">Price - Adult</label>
              <input type="number" id="priceAdult" name="priceAdult" min="0" placeholder="0" value={pricePayment.priceAdult} onChange={handlePricePaymentChange} />
            </div>

            <div className="qf-price-cwb-field">
              <label htmlFor="priceCWB">Price - CWB</label>
              <input type="number" id="priceCWB" name="priceCWB" min="0" placeholder="0" value={pricePayment.priceCWB} onChange={handlePricePaymentChange} />
            </div>

            <div className="qf-price-cnb-field">
              <label htmlFor="priceCNB">Price - CNB</label>
              <input type="number" id="priceCNB" name="priceCNB" min="0" placeholder="0" value={pricePayment.priceCNB} onChange={handlePricePaymentChange} />
            </div>

            <div className="qf-payment-mode-field">
              <label htmlFor="paymentMode">Payment Mode</label>
              <select id="paymentMode" name="paymentMode" value={pricePayment.paymentMode} onChange={handlePricePaymentChange}>
                <option value="" disabled>Select Payment Mode</option>
                {PAYMENT_MODES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="qf-final-remark-field">
              <label htmlFor="finalRemark">Final Remark</label>
              <input type="text" id="finalRemark" name="finalRemark" placeholder="Optional remarks" value={pricePayment.finalRemark} onChange={handlePricePaymentChange} />
            </div>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className={saveMessage.type === "success" ? "qf-save-status-success" : "qf-save-status-error"}>
          {saveMessage.text}
        </div>
      )}

      {/* {form actions} */}
      <div className="qf-form-actions-row">
        <button type="button" className="qf-save-quote-btn" onClick={handleSave}>💾 SAVE QUOTE</button>
        <button type="button" className="qf-back-btn-footer" onClick={handleBack}>🔙 BACK</button>
      </div>
    </div>
  );
}

export default HotelQuoteForm;
