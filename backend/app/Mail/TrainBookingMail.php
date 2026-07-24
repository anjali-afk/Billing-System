<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class TrainBookingMail extends Mailable
{
    use Queueable;

    public function __construct(
        private readonly array $main,
        private readonly array $segments,
        private readonly string $sentDate,
        private readonly string $userEmail,
        private readonly string $invoiceNumber,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Train Booking Entry - Invoice {$this->invoiceNumber}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.train-booking',
            with: [
                'main' => $this->main,
                'segments' => $this->segments,
                'sentDate' => $this->sentDate,
                'userEmail' => $this->userEmail,
            ],
        );
    }
}
