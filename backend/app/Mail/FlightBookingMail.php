<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class FlightBookingMail extends Mailable
{
    use Queueable;

    public function __construct(
        private readonly array $main,
        private readonly array $segments,
        private readonly string $sentDate,
        private readonly string $entryByEmail,
        private readonly string $invoiceNumber,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Flight Booking Entry - Invoice {$this->invoiceNumber}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.flight-booking',
            with: [
                'main' => $this->main,
                'segments' => $this->segments,
                'sentDate' => $this->sentDate,
                'entryByEmail' => $this->entryByEmail,
            ],
        );
    }
}
