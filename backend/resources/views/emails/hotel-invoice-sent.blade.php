<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:30px 0;">
<tr>
<td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #d0dce8;">
<tr>
<td style="background:#0f3460;padding:16px 24px;">
<span style="color:#ffffff;font-size:16px;font-weight:700;">Hotel Booking Invoice</span>
</td>
</tr>
<tr>
<td style="padding:24px;">
<p style="margin:0 0 12px;font-size:13px;color:#1a1a2e;">Dear Team,</p>
<p style="margin:0 0 16px;font-size:13px;color:#1a1a2e;line-height:1.6;">
Please find attached the hotel booking invoice <strong>{{ $invoiceNumber }}</strong>
for <strong>{{ $main['billToName'] ?? '' }}</strong>
@if(!empty($main['refNo']))
(Ref: {{ $main['refNo'] }})
@endif
.
</p>
<table cellpadding="0" cellspacing="0" style="font-size:12.5px;color:#1a1a2e;line-height:1.8;">
<tr><td style="font-weight:600;padding-right:10px;">Hotel</td><td>{{ $main['stays'][0]['hotelName'] ?? '' }}</td></tr>
<tr><td style="font-weight:600;padding-right:10px;">City</td><td>{{ $main['stays'][0]['city'] ?? '' }}</td></tr>
<tr><td style="font-weight:600;padding-right:10px;">Grand Total</td><td>{{ $main['currency'] ?? 'INR' }} {{ $main['grandTotal'] ?? '0.00' }}</td></tr>
</table>
<p style="margin:20px 0 0;font-size:11px;color:#5b6779;">This is an automated notification — no reply is required.</p>
</td>
</tr>
<tr>
<td style="background:#eef4ff;padding:12px 24px;font-size:10.5px;color:#5b6779;">
{{ $main['compName'] ?? '' }}
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
