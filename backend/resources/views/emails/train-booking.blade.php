<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* --- AAPKA ORIGINAL CODE (NO CHANGES) --- */
    body { font-family: Calibri, sans-serif; color: #333; margin: 0; padding: 10px; }
    .container { width: 95%; margin: auto; border: 1px solid #ccc; padding: 15px; }
    .header { background-color: #f2f2f2; padding: 10px; text-align: center; border-bottom: 2px solid #444; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; min-width: 600px; } /* min-width structure bachane ke liye */
    th { background-color: #1a73e8; color: white; border: 1px solid #ddd; padding: 8px; text-align: left; }
    td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    .section-head { background-color: #444; color: white; padding: 5px 10px; font-weight: bold; margin-bottom: 5px; }
    .highlight { background-color: #ffffcc; font-weight: bold; }
    .footer { font-size: 10px; color: #777; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }

    /* --- RESPONSIVE WRAPPER (STRUCTURE BACHANE KE LIYE) --- */
    .table-wrapper {
      width: 100%;
      overflow-x: auto; /* Mobile par table ko scrollable banayega, structure nahi todega */
      -webkit-overflow-scrolling: touch;
    }

    @media screen and (max-width: 600px) {
      .container { width: 100%; padding: 5px; border: none; }
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <h2 style="margin:0; color: #1a73e8;">TRAIN BOOKING ENTRY DETAILS</h2>
      <p style="margin:5px 0;">
        <strong>Booking Date:</strong> {{ $sentDate }}
      </p>
    </div>

    <div class="section-head">GENERAL & PARTY DETAILS</div>
    <div class="table-wrapper">
      <table>
        <tr>
          <th>Ref No</th>
          <th>Company</th>
          <th>Party Name</th>
          <th>GSTIN</th>
          <th>Service</th>
          <th>PNR Number</th>
        </tr>
        <tr>
          <td>{{ $main['ref'] }}</td>
          <td>{{ $main['companyName'] }}</td>
          <td>{{ $main['partyName'] }}</td>
          <td>{{ $main['gstin'] }}</td>
          <td>{{ $main['service'] }}</td>
          <td class="highlight">{{ $main['pnr'] }}</td>
        </tr>
      </table>
    </div>

    <div class="section-head">PASSENGER & JOURNEY DETAILS</div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Passenger Name</th>
            <th>Train No</th>
            <th>Class</th>
            <th>Ticket No</th>
            <th>Seat / Berth</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="highlight" style="text-transform: capitalize;">{{ $main['passengerName'] }}</td>
            <td>{{ $main['trainNumber'] }}</td>
            <td>{{ $main['classType'] }}</td>
            <td>{{ $main['ticketNumber'] }}</td>
            <td>{{ $main['seatNumber'] }}</td>
            <td>{{ $main['status'] ?: 'Confirmed' }}</td>
          </tr>
          @if(count($segments) > 0)
            @foreach($segments as $seg)
            <tr>
              <td style="text-transform: capitalize;">{{ $seg['passengerName'] }}</td>
              <td>{{ $seg['trainNumber'] ?: $main['trainNumber'] }}</td>
              <td>{{ $seg['classType'] ?: $main['classType'] }}</td>
              <td>{{ $seg['ticketNumber'] }}</td>
              <td>{{ $seg['seatNumber'] }}</td>
              <td>{{ $seg['status'] ?: 'Confirmed' }}</td>
            </tr>
            @endforeach
          @endif
        </tbody>
      </table>
    </div>

    <div class="section-head">ITINERARY (STATION DETAILS)</div>
    <div class="table-wrapper">
      <table>
        <tr>
          <th>From Station</th>
          <th>To Station</th>
          <th>Travel Date</th>
          <th>Due Date</th>
        </tr>
        <tr>
          <td><strong>{{ $main['from'] }}</strong></td>
          <td><strong>{{ $main['to'] }}</strong></td>
          <td>{{ $main['travelDate'] }}</td>
          <td>{{ $main['dueDate'] }}</td>
        </tr>
      </table>
    </div>

    <div class="section-head">FARE BREAKUP & SUPPLIER</div>
    <div class="table-wrapper">
      <table>
        <tr>
          <th>Basic Fare</th>
          <th>IRCTC Chg</th>
          <th>Gateway/Other</th>
          <th>Markup</th>
          <th style="background-color: #d93025; color: white;">Total Amount</th>
          <th>Supplier</th>
        </tr>
        <tr>
          <td>{{ $main['basic'] }}</td>
          <td>{{ $main['irctc'] }}</td>
          <td>{{ $main['gatewayAndOther'] }}</td>
          <td>{{ $main['markup'] }}</td>
          <td class="highlight" style="font-size:14px;">₹{{ $main['total'] }}</td>
          <td>{{ $main['supplier'] }}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Entry by: {{ $userEmail }} | Team Member: {{ $main['teamMember'] }}</p>
      <p>Holiday Chacha - Railway Management System</p>
    </div>
  </div>

</body>
</html>
