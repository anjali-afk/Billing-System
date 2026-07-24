<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class HotelInvoiceMail extends Mailable
{
    use Queueable;

    public function __construct(
        private readonly array $main,
        private readonly string $pdfBinary,
        private readonly string $invoiceNumber,
        private readonly string $fileName,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Hotel Booking Invoice - {$this->invoiceNumber}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.hotel-invoice-sent',
            with: [
                'main' => $this->main,
                'invoiceNumber' => $this->invoiceNumber,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfBinary, $this->fileName)
                ->withMime('application/pdf'),
        ];
    }
}
