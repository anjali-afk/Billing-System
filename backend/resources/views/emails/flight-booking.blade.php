<!DOCTYPE html>
<html>

<head>
  <style>
    body {
      font-family: Calibri, sans-serif;
      color: #333;
    }

    .container {
      width: 95%;
      margin: auto;
      border: 1px solid #ccc;
      padding: 15px;
    }

    .header {
      background-color: #f2f2f2;
      padding: 10px;
      text-align: center;
      border-bottom: 2px solid #444;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }

    th {
      background-color: #1a73e8;
      color: white;
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    td {
      border: 1px solid #ddd;
      padding: 8px;
      vertical-align: top;
    }

    .section-head {
      background-color: #444;
      color: white;
      padding: 5px 10px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .highlight {
      background-color: #ffffcc;
      font-weight: bold;
    }

    .footer {
      font-size: 10px;
      color: #777;
      margin-top: 20px;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
  </style>
</head>

<body>

  <div class="container">
    <div class="header">
      <h2 style="margin:0;">BOOKING ENTRY DETAILS 2026-27</h2>
      <p style="margin:5px 0;">
        <strong>Booking Details</strong> | Date:
        {{ $sentDate }}
      </p>

    </div>

    <div class="section-head">GENERAL & PARTY DETAILS</div>
    <table>
      <tr>
        <th>Ref No</th>
        <th>Company</th>
        <th>Party Name</th>
        <th>GSTIN</th>
        <th>Service</th>
        <th>Trip Type</th>
      </tr>
      <tr>
        <td>
          {{ $main['ref'] }}
        </td>
        <td>
          {{ $main['company'] }}
        </td>
        <td>
          {{ $main['partyName'] }}
        </td>
        <td>
          {{ $main['gstin'] }}
        </td>
        <td>
          {{ $main['service'] }}
        </td>
        <td>
          {{ $main['tripType'] }}
        </td>
      </tr>
    </table>

    <div class="section-head">PASSENGER DETAILS</div>
    <table>
      <tr>
        <th>Passenger Name</th>
        <th>Cell No</th>
        <th>Airline PNR</th>
        <th>Ticket No</th>
        <th>CRS / PNR</th>
        <th>Invoice Type</th>
      </tr>
      <tr>
        <td class="highlight" style=" text-transform: capitalize;">
          {{ $main['passengerName'] }}
        </td>
        <td>
          {{ $main['cellNo'] }}
        </td>
        <td>
          {{ $main['airlinePnr'] }}
        </td>
        <td class="highlight">
          {{ $main['ticketNo'] }}
        </td>
        <td>
          {{ $main['crs'] }} /
          {{ $main['crsPnr'] }}
        </td>
        <td>
          {{ $main['invoiceType'] }}
        </td>
      </tr>
    </table>

    <div class="section-head">FLIGHT ITINERARY (SEGMENTS)</div>
    <table>
      <thead>
        <tr>
          <th style="background-color:#555;">Sector (From - To)</th>
          <th style="background-color:#555;">Flight No</th>
          <th style="background-color:#555;">Class</th>
          <th style="background-color:#555;">Travel Date</th>
          <th style="background-color:#555;">Dep. Time</th>
          <th style="background-color:#555;">Arr. Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>{{ $main['from'] }} - {{ $main['to'] }}</strong></td>
          <td>
            {{ $main['flightNo'] }}
          </td>
          <td>
            {{ $main['class'] }}
          </td>
          <td>
            {{ $main['travelDate'] }}
          </td>
          <td>
            {{ $main['depTime'] }}
          </td>
          <td>
            {{ $main['arrTime'] }}
          </td>
        </tr>
        @foreach($segments as $seg)
        <tr>
          <td><strong>{{ $seg['from'] }} - {{ $seg['to'] }}</strong></td>
          <td>
            {{ $seg['flightNo'] }}
          </td>
          <td>
            {{ $seg['class'] }}
          </td>
          <td>
            {{ $seg['travelDate'] }}
          </td>
          <td>
            {{ $seg['depTime'] }}
          </td>
          <td>
            {{ $seg['arrTime'] }}
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>

    <div class="section-head">FARE BREAKUP & PURCHASE</div>
    <table>
      <tr>
        <th>Basic</th>
        <th>Taxes (K3+YQ+YR)</th>
        <th>Other Chg / Markup</th>
        <th>Discount</th>
        <th style="background-color: #d93025;">Total (Net)</th>
        <th>Supplier</th>
      </tr>
      <tr>
        <td>
          {{ $main['basicAm'] }}
        </td>
        <td>
          {{ $main['taxesTotal'] }}
        </td>
        <td>
          {{ $main['otherAndMarkup'] }}
        </td>
        <td style="color:red;">-
          {{ $main['discount'] }}
        </td>
        <td class="highlight" style="font-size:14px;">
          {{ $main['total'] }}
        </td>
        <td>
          {{ $main['purchaseSupplier'] }} (
          {{ $main['purchase'] }})
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <th style="width:20%;">Paid Via</th>
        <th style="width:20%;">Due Date</th>
        <th style="width:60%;">Remarks</th>
      </tr>
      <tr>
        <td>
          {{ $main['paidVia'] }}
        </td>
        <td>
          {{ $main['dueDate'] }}
        </td>
        <td>
          {{ $main['remark'] }}
        </td>
      </tr>
    </table>

    <div class="footer">
      <p>Entry by:
        {{ $entryByEmail }}
      </p>
      <p>Holiday Chacha - Flight Management System</p>
    </div>
  </div>

</body>



</html>
