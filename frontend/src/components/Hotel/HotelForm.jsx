import { useState } from "react";
import "./HotelForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const INITIAL_FORM_DATA = {
  deal: "",
  adults: 4,
  children: 2,

  guestName: "",
  destination: "",
  city: "",
  hotelName: "",
  tourType: "Domestic",
  bookingType: "B2B",
  handledBy: "",
  entryBy: "",
  tourDate: "",
  checkIn: "",
  checkOut: "",
  nights: "",

  numRooms: 2,
  totalRoom: 2,
  awb: "",
  cwb: "",
  noBed: "",
  rate: "",
  roomStatus: "Pending",
  roomConfirmationNumber: "",
  roomBillingStatus: "Pending",
  rpTotalPax: 6,
  rpAdults: 4,
  rpChild: 2,
  rpInfant: 0,
  roomCategory: "Standard",
  mealPlan: "MAPAI",
  extraBed: "No",
  roomPreference: "Non Smoking",

  supplierName: "",
  confirmationNumber: "",
  hotelEmail: "",
  hotelStatus: "Pending",
  billingStatus: "Pending",
  billTo: "Holiday Chacha PVT LTD",
  voucherStatus: "Pending",
  remark: "",

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

const num = (v) => parseFloat(v) || 0;

function HotelForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const awbAmount = (num(formData.awb) * num(formData.rate) * num(formData.nights)).toFixed(2);
  const cwbAmount = (num(formData.cwb) * num(formData.rate) * num(formData.nights)).toFixed(2);
  const noBedAmount = (num(formData.noBed) * num(formData.rate) * num(formData.nights)).toFixed(2);
  const roomTotal = (parseFloat(awbAmount) + parseFloat(cwbAmount) + parseFloat(noBedAmount)).toFixed(2);

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_URL}/hotel-quick-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, grandTotal, balanceAmount, awbAmount, cwbAmount, noBedAmount, roomTotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save booking");
      }
      setSaveMessage({ type: "success", text: `Saved successfully — Ref No. ${data.ref}` });
      setFormData(INITIAL_FORM_DATA);
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
              <input type="text" id="deal" name="deal" placeholder="Enter Deal ID" value={formData.deal} onChange={handleChange} />
            </div>

            <div className="deal-divider"></div>

            <div className="ref-number">
              <label htmlFor="ref">Ref No.</label>
              <input type="text" id="ref" name="ref" value="Auto" readOnly />
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

        {/* {booking information section} */}
        <div className="booking-info-box">
            <div className="booking-info-header">
                <span className="booking-info-title">📋 Hotel Booking Information</span>
            </div>

            <div className="booking-info-body">
                <div className="guest-name-row">
                    <div className="guest-name-field">
                        <label htmlFor="tourDate">Travel Date</label>
                        <input type="date" id="tourDate" name="tourDate" value={formData.tourDate} onChange={handleChange} />
                    </div>
                    <div className="nights-field">
                        <label htmlFor="nights">Nights</label>
                        <input type="number" id="nights" name="nights" min="0" placeholder="0" value={formData.nights} onChange={handleChange} />
                    </div>
                    <div className="checkout-field">
                        <label htmlFor="checkOut">Check-Out</label>
                        <input type="date" id="checkOut" name="checkOut" value={formData.checkOut} onChange={handleChange} />
                    </div>

                    <div className="city-field">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" name="city" placeholder="Enter City" value={formData.city} onChange={handleChange} />
                    </div>

                    <div className="hotel-name-field">
                        <label htmlFor="hotelName">Hotel Name</label>
                        <select id="hotelName" name="hotelName" value={formData.hotelName} onChange={handleChange}>
                            <option value="" disabled>Select Hotel</option>
                            <option value="Taj Palace">Taj Palace</option>
                            <option value="Leela Grand">Leela Grand</option>
                            <option value="Radisson Blu">Radisson Blu</option>
                        </select>
                    </div>
                </div>


                <div className="tour-booking-handled-row">
                    <div className="room-category-field">
                        <label htmlFor="roomCategory">Room Category</label>
                        <select id="roomCategory" name="roomCategory" value={formData.roomCategory} onChange={handleChange}>
                            <option value="Standard">Standard</option>
                            <option value="Deluxe">Deluxe</option>
                            <option value="Suite">Suite</option>
                            <option value="Executive">Executive</option>
                        </select>
                    </div>
                    <div className="meal-plan-field">
                        <label htmlFor="mealPlan">Meal Plan</label>
                        <select id="mealPlan" name="mealPlan" value={formData.mealPlan} onChange={handleChange}>
                            <option value="EPAI">EPAI</option>
                            <option value="CPAI">CPAI</option>
                            <option value="MAPAI">MAPAI</option>
                            <option value="APAI">APAI</option>
                        </select>
                    </div>
                    <div className="rooms-count-field">
                        <label htmlFor="numRooms">Total Rooms</label>
                        <input type="number" id="numRooms" name="numRooms" min="0" value={formData.numRooms} onChange={handleChange} />
                    </div>
                    <div className="destination-field">
                        <label htmlFor="destination">Destination</label>
                        <select id="destination" name="destination" value={formData.destination} onChange={handleChange}>
                            <option value="" disabled>Select Destination</option>
                            <option value="Jaipur">Jaipur</option>
                            <option value="Goa">Goa</option>
                            <option value="Dubai">Dubai</option>
                            <option value="Europe">Europe</option>
                        </select>
                    </div>
                    <div className="tour-type-field">
                        <label htmlFor="tourType">Tour Type</label>
                        <select id="tourType" name="tourType" value={formData.tourType} onChange={handleChange}>
                            <option value="Domestic">Domestic</option>
                            <option value="International">International</option>
                        </select>
                    </div>

                    <div className="booking-type-field">
                        <label htmlFor="bookingType">Booking Type</label>
                        <select id="bookingType" name="bookingType" value={formData.bookingType} onChange={handleChange}>
                            <option value="B2B">B2B</option>
                            <option value="B2C">B2C</option>
                        </select>
                    </div>

                    <div className="handled-by-field">
                        <label htmlFor="handledBy">Handled By</label>
                        <select id="handledBy" name="handledBy" value={formData.handledBy} onChange={handleChange}>
                            <option value="" disabled>Select</option>
                            <option value="Rajesh Kumar">Rajesh Kumar</option>
                            <option value="Priya Sharma">Priya Sharma</option>
                            <option value="Amit Verma">Amit Verma</option>
                            <option value="Neha Singh">Neha Singh</option>
                        </select>
                    </div>
                      <div className="entry-by-field">
                        <label htmlFor="entryBy">Entry By</label>
                        <input type="text" id="entryBy" name="entryBy" placeholder="Enter Name" value={formData.entryBy} onChange={handleChange} />
                    </div>
                </div>

                <div className="entry-tourdate-row">
                    <div className="tour-date-field">
                        <label htmlFor="tourDate">Tour Date</label>
                        <input type="date" id="tourDate" name="tourDate" value={formData.tourDate} onChange={handleChange} />
                    </div>
                       <div className="checkin-field">
                        <label htmlFor="checkIn">Check-In</label>
                        <input type="date" id="checkIn" name="checkIn" value={formData.checkIn} onChange={handleChange} />
                    </div>
                </div>

            </div>
        </div>

        {/* {room & passenger details section} */}
        <div className="room-info-box">
            <div className="room-info-header">
                <span className="room-info-title">🛏️ Room &amp; Passenger Details</span>
            </div>

            <div className="room-info-body">

                <div className="room-count-row">


                    <div className="total-room-field">
                        <label htmlFor="totalRoom">Total Room</label>
                        <input type="number" id="totalRoom" name="totalRoom" min="0" value={formData.totalRoom} onChange={handleChange} />
                    </div>

                    <div className="awb-field">
                        <label htmlFor="awb">Adult With Bed</label>
                        <input type="number" id="awb" name="awb" min="0" placeholder="0" value={formData.awb} onChange={handleChange} />
                    </div>

                    <div className="cwb-field">
                        <label htmlFor="cwb">Child With Bed</label>
                        <input type="number" id="cwb" name="cwb" min="0" placeholder="0" value={formData.cwb} onChange={handleChange} />
                    </div>

                    <div className="no-bed-field">
                        <label htmlFor="noBed">No Bed</label>
                        <input type="number" id="noBed" name="noBed" min="0" placeholder="0" value={formData.noBed} onChange={handleChange} />
                    </div>

                    <div className="rate-field">
                        <label htmlFor="rate">Rate</label>
                        <input type="number" id="rate" name="rate" min="0" placeholder="0" value={formData.rate} onChange={handleChange} />
                    </div>

                    <div className="awb-amount-field">
                        <label htmlFor="awbAmount">Adult With Bed Amount</label>
                        <input type="number" id="awbAmount" value={awbAmount} readOnly />
                    </div>

                    <div className="cwb-amount-field">
                        <label htmlFor="cwbAmount">Child With Bed Amount</label>
                        <input type="number" id="cwbAmount" value={cwbAmount} readOnly />
                    </div>

                    <div className="no-bed-amount-field">
                        <label htmlFor="noBedAmount">No Bed Amount</label>
                        <input type="number" id="noBedAmount" value={noBedAmount} readOnly />
                    </div>

                    <div className="room-total-field">
                        <label htmlFor="roomTotal">Total</label>
                        <input type="number" id="roomTotal" value={roomTotal} readOnly />
                    </div>

                    <div className="room-status-field">
                        <label htmlFor="roomStatus">Status</label>
                        <select id="roomStatus" name="roomStatus" value={formData.roomStatus} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                        </select>
                    </div>

                    <div className="room-confirmation-number-field">
                        <label htmlFor="roomConfirmationNumber">Confirmation Number</label>
                        <input type="text" id="roomConfirmationNumber" name="roomConfirmationNumber" placeholder="Conf. No." value={formData.roomConfirmationNumber} onChange={handleChange} />
                    </div>

                    <div className="room-billing-status-field">
                        <label htmlFor="roomBillingStatus">Billing Status</label>
                        <select id="roomBillingStatus" name="roomBillingStatus" value={formData.roomBillingStatus} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                        </select>
                    </div>

                    <div className="rp-total-pax-field">
                        <label htmlFor="rpTotalPax">Total Pax</label>
                        <input type="number" id="rpTotalPax" name="rpTotalPax" min="0" value={formData.rpTotalPax} onChange={handleChange} />
                    </div>

                    <div className="rp-adults-field">
                        <label htmlFor="rpAdults">Adults</label>
                        <input type="number" id="rpAdults" name="rpAdults" min="0" value={formData.rpAdults} onChange={handleChange} />
                    </div>

                    <div className="rp-child-field">
                        <label htmlFor="rpChild">Child</label>
                        <input type="number" id="rpChild" name="rpChild" min="0" value={formData.rpChild} onChange={handleChange} />
                    </div>

                    <div className="rp-infant-field">
                        <label htmlFor="rpInfant">Infant</label>
                        <input type="number" id="rpInfant" name="rpInfant" min="0" value={formData.rpInfant} onChange={handleChange} />
                    </div>


                        <div className="extra-bed-field">
                        <label htmlFor="extraBed">Extra Bed</label>
                        <select id="extraBed" name="extraBed" value={formData.extraBed} onChange={handleChange}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    <div className="room-preference-field">
                        <label htmlFor="roomPreference">Room Preference</label>
                        <select id="roomPreference" name="roomPreference" value={formData.roomPreference} onChange={handleChange}>
                            <option value="Smoking">Smoking</option>
                            <option value="Non Smoking">Non Smoking</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* {supplier details section} */}
        <div className="supplier-info-box">
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
        </div>

        {/* {price details section} */}
        <div className="price-info-box">
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
                        <input type="number" id="taxes" name="taxes" min="0" placeholder="0" value={