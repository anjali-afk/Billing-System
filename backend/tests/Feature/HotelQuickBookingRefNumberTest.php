<?php

namespace Tests\Feature;

use App\Models\HotelQuickBooking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelQuickBookingRefNumberTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_generates_sequential_ref_numbers_for_the_same_deal_and_date(): void
    {
        $first = HotelQuickBooking::create([
            'deal_id' => '3454',
            'guest_name' => 'First Guest',
            'ref_no' => HotelQuickBooking::generateUniqueRefNo('3454', '2026-07-25'),
        ]);

        $second = HotelQuickBooking::create([
            'deal_id' => '3454',
            'guest_name' => 'Second Guest',
            'ref_no' => HotelQuickBooking::generateUniqueRefNo('3454', '2026-07-25'),
        ]);

        $this->assertSame('25-07-26345401', $first->ref_no);
        $this->assertSame('25-07-26345402', $second->ref_no);
    }
}
