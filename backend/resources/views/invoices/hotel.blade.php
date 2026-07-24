<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{{ $invoiceNo }}</title>
</head>
<body style="margin:0;padding:0;font-family:'DejaVu Sans',Arial,Helvetica,sans-serif;color:#1a1a2e;">

<div style="height:6px;background-color:#0f3460;font-size:0;line-height:0;">&nbsp;</div>
<div style="padding:22px 34px 20px;background:#ffffff;">

    {{-- ── HEADER ── --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding-bottom:16px;margin-bottom:16px;border-bottom:1.5px solid #d0dce8;">
    <tr>
        <td width="55%" style="vertical-align:top;padding-right:20px;">
            @if($logoPath)
                <img src="{{ $logoPath }}" style="display:block;max-height:60px;width:auto;margin-bottom:8px;">
            @endif
            <div style="font-size:18px;font-weight:700;color:#000000;margin-bottom:4px;">{{ $compName }}</div>
            <div style="font-size:9.5px;color:#1f1f1f;line-height:1.6;margin-bottom:8px;max-width:92%;">{{ $compAddr }}</div>
            <table cellpadding="0" cellspacing="2" border="0" style="font-size:9.5px;border-collapse:collapse;">
                <tr><td style="font-weight:600;color:#0f3460;padding-right:8px;white-space:nowrap;">GSTIN</td><td style="color:#1f1f1f;">: {{ $compGst }}</td></tr>
                <tr><td style="font-weight:600;color:#0f3460;padding-right:8px;">PAN</td><td style="color:#1f1f1f;">: {{ $compPan }}</td></tr>
                <tr><td style="font-weight:600;color:#0f3460;padding-right:8px;">Email</td><td style="color:#1f1f1f;">: {{ $compEmail }}</td></tr>
                <tr><td style="font-weight:600;color:#0f3460;padding-right:8px;">Web</td><td style="color:#1f1f1f;">: {{ $compWeb }}</td></tr>
            </table>
        </td>
        <td width="45%" style="vertical-align:top;text-align:right;">
            <div style="font-size:18px;font-weight:700;color:#0f3460;margin-top:30px;margin-bottom:10px;">{{ $serviceTitle }}</div>
            <table cellpadding="0" cellspacing="0" border="0" align="right" style="font-size:10px;border-collapse:collapse;">
                <tr>
                    <td style="font-weight:600;color:#000000;padding-right:10px;padding-bottom:4px;text-align:right;">Invoice Date:</td>
                    <td style="color:#e8400a;font-weight:700;padding-bottom:4px;">{{ $invoiceDate }}</td>
                </tr>
                <tr>
                    <td style="font-weight:600;color:#000000;padding-right:10px;padding-bottom:4px;text-align:right;">Invoice No:</td>
                    <td style="color:#1f1f1f;font-weight:700;padding-bottom:4px;">{{ $invoiceNo }}</td>
                </tr>
                @if($refNo)
                <tr>
                    <td style="font-weight:600;color:#000000;padding-right:10px;padding-bottom:4px;text-align:right;">Ref:</td>
                    <td style="color:#1f1f1f;font-weight:700;padding-bottom:4px;">{{ $refNo }}</td>
                </tr>
                @endif
            </table>
        </td>
    </tr>
    </table>

    {{-- ── BILL TO + OTHER DETAILS ── --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
    <tr>
        <td width="49%" style="vertical-align:top;padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef4ff;border-left:3px solid #0f3460;border-collapse:collapse;">
            <tr><td style="padding:10px 14px;">
                <div style="font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0f3460;margin-bottom:6px;">Bill To</div>
                <div style="font-size:13px;font-weight:700;color:#000000;margin-bottom:3px;">{{ $billToName }}</div>
                <div style="font-size:9.5px;color:#1f1f1f;line-height:1.6;">
                    <strong style="color:#1a1a2e;">GSTIN:</strong> {{ $billToGst }}<br>
                    <strong style="color:#1a1a2e;">Place of Supply:</strong> {{ $placeOfSupply }}
                </div>
            </td></tr>
            </table>
        </td>
        <td width="51%" style="vertical-align:top;padding-left:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #d0dce8;border-collapse:collapse;background:#ffffff;">
            <tr><td style="padding:10px 14px;">
                <div style="font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#1f1f1f;margin-bottom:7px;">Other Details</div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:9.5px;border-collapse:collapse;">
                    <tr><td style="color:#1f1f1f;padding:3px 0;border-bottom:1px dashed #d0dce8;">Due Date</td><td style="color:#1a1a2e;font-weight:600;text-align:right;padding:3px 0;border-bottom:1px dashed #d0dce8;">{{ $dueDate }}</td></tr>
                    <tr><td style="color:#1f1f1f;padding:3px 0;border-bottom:1px dashed #d0dce8;">Team Member</td><td style="color:#1a1a2e;font-weight:600;text-align:right;padding:3px 0;border-bottom:1px dashed #d0dce8;">{{ $teamMember }}</td></tr>
                    <tr><td style="color:#1f1f1f;padding:3px 0;">Supplier</td><td style="color:#1a1a2e;font-weight:600;text-align:right;padding:3px 0;">{{ $supplier }}</td></tr>
                </table>
            </td></tr>
            </table>
        </td>
    </tr>
    </table>

    {{-- ── STAY DETAILS ── --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #d0dce8;border-collapse:collapse;margin-bottom:18px;">
    <tr style="background-color:#0f3460;">
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;">Hotel Name</td>
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;">City</td>
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;text-align:center;">Check-In</td>
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;text-align:center;">Nights</td>
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;text-align:center;">Check-Out</td>
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;text-align:center;">Meal Plan</td>
        <td style="padding:7px 10px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;">Hotel Conf No</td>
    </tr>
    @forelse($stays as $i => $s)
    <tr style="background-color: {{ $i % 2 === 0 ? '#ffffff' : '#f9fbfe' }};">
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;">{{ $s['hotelName'] }}</td>
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;">{{ $s['city'] }}</td>
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;text-align:center;">{{ $s['checkIn'] }}</td>
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;text-align:center;">{{ $s['nights'] }}</td>
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;text-align:center;">{{ $s['checkOut'] }}</td>
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;text-align:center;">{{ $s['mealPlan'] }}</td>
        <td style="padding:7px 10px;font-size:9.5px;border-bottom:1px solid #d0dce8;">{{ $s['hotelConfNo'] }}</td>
    </tr>
    @empty
    <tr><td colspan="7" style="padding:10px;text-align:center;font-size:9.5px;color:#5b6779;">—</td></tr>
    @endforelse
    </table>

    {{-- ── ROOM & GUEST TABLE ── --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #d0dce8;border-collapse:collapse;margin-bottom:18px;">
    <tr style="background-color:#0f3460;">
        <td style="padding:7px 8px 7px 12px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;">Guest</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;">Room Type</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Ccy</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Qty</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:right;">Rate</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Adults</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:center;">CWB</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:center;">CNB</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:right;">Ex.Bed Rate</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:right;">Other</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:right;">Markup</td>
        <td style="padding:7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:right;">Discount</td>
        <td style="padding:7px 8px 7px 8px;font-size:8px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;text-align:right;">Total</td>
    </tr>
    @foreach($guests as $i => $g)
    <tr style="background-color: {{ $i % 2 === 0 ? '#ffffff' : '#f9fbfe' }};">
        <td style="padding:6px 8px 6px 12px;vertical-align:top;border-bottom:1px solid #d0dce8;">
            <span style="font-weight:600;font-size:10px;color:#0f3460;display:block;">{{ $g['guestName'] }}</span>
            @if(!$g['sameParty'])
            <span style="font-size:7.5px;color:#b8380a;display:block;margin-top:2px;">Billed to: {{ $g['effectivePartyName'] }} @if($g['effectiveGstin']) (GSTIN {{ $g['effectiveGstin'] }}) @endif</span>
            @endif
        </td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;border-bottom:1px solid #d0dce8;">{{ $g['roomType'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:center;border-bottom:1px solid #d0dce8;">{{ $g['currency'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:center;border-bottom:1px solid #d0dce8;">{{ $g['roomQty'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:right;border-bottom:1px solid #d0dce8;">{{ $g['roomRate'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:center;border-bottom:1px solid #d0dce8;">{{ $g['adults'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:center;border-bottom:1px solid #d0dce8;">{{ $g['cwb'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:center;border-bottom:1px solid #d0dce8;">{{ $g['cnb'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:right;border-bottom:1px solid #d0dce8;">{{ $g['extraBedRate'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:right;border-bottom:1px solid #d0dce8;">{{ $g['otherCharges'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:right;border-bottom:1px solid #d0dce8;">{{ $g['markup'] }}</td>
        <td style="padding:6px 8px;vertical-align:top;font-size:9px;text-align:right;border-bottom:1px solid #d0dce8;">{{ $g['discount'] }}</td>
        <td style="padding:6px 8px 6px 8px;vertical-align:top;font-size:9.5px;font-weight:700;color:#b8380a;text-align:right;border-bottom:1px solid #d0dce8;">{{ $g['total'] }}</td>
    </tr>
    @endforeach
    </table>

    {{-- ── BANK DETAILS + GRAND TOTAL + SUMMARY ── --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
    <tr>
        <td width="54%" style="vertical-align:top;padding-right:12px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #d0dce8;border-collapse:collapse;">
                <tr><td style="background-color:#eef4ff;padding:7px 12px;font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0f3460;">Bank Details</td></tr>
                <tr><td style="padding:10px 12px;font-size:9.5px;color:#1f1f1f;line-height:1.7;">
                    <strong style="color:#1a1a2e;">A/c Name:</strong> {{ $compName }}<br>
                    @forelse($bankDetails as $line)
                        {{ $line }}<br>
                    @empty
                        &mdash;
                    @endforelse
                </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #d0dce8;border-collapse:collapse;margin-top:10px;">
                <tr><td style="background-color:#eef4ff;padding:7px 12px;font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0f3460;">Additional Details</td></tr>
                <tr><td style="padding:10px 12px;font-size:9.5px;color:#1f1f1f;line-height:1.7;">
                    <strong style="color:#1a1a2e;">Paid Via:</strong> {{ $paidVia }} &nbsp;&nbsp;
                    <strong style="color:#1a1a2e;">Club:</strong> {{ $club }}<br>
                    @if($remark)<strong style="color:#1a1a2e;">Remark:</strong> {{ $remark }}@endif
                </td></tr>
            </table>
        </td>
        <td width="46%" style="vertical-align:top;padding-left:12px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #d0dce8;border-collapse:collapse;">
                <tr style="background-color:#0f3460;">
                    <td style="padding:12px 14px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:.3px;">Grand Total</td>
                    <td style="padding:12px 14px;font-size:15px;font-weight:700;color:#ffffff;text-align:right;">{{ $currency }} {{ $grandTotal }}</td>
                </tr>
            </table>
        </td>
    </tr>
    </table>

    {{-- ── TERMS + SIGNATURE ── --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1.5px solid #d0dce8;padding-top:8px;margin-top:8px;">
    <tr>
        <td width="60%" style="vertical-align:top;padding-right:20px;">
            @if($terms)
            <div style="font-size:8px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0f3460;margin-bottom:6px;">Terms &amp; Conditions</div>
            <div style="font-size:8px;color:#1f1f1f;line-height:1.6;">{!! nl2br(e($terms)) !!}</div>
            @endif
        </td>
        <td width="40%" style="vertical-align:bottom;text-align:right;">
            <div style="font-size:9.5px;color:#1f1f1f;margin-bottom:2px;">For <strong style="color:#0f3460;">{{ $compName }}</strong></div>
            <br>
            <span style="display:inline-block;border-top:1.5px solid #d0dce8;padding-top:5px;font-size:8px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#1f1f1f;min-width:140px;">Authorized Signatory</span>
        </td>
    </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #d0dce8;margin-top:8px;padding-top:5px;">
    <tr>
        <td style="font-size:8px;color:#1f1f1f;">Prepared by: <strong style="color:#1a1a2e;">{{ $teamMember }}</strong></td>
        <td style="font-size:8px;color:#1f1f1f;text-align:right;">This is a computer generated invoice — no signature required.</td>
    </tr>
    </table>

</div>
<div style="height:4px;background-color:#e8400a;font-size:0;line-height:0;">&nbsp;</div>

</body>
</html>
