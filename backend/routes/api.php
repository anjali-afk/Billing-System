<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\HotelBookingController;
use App\Http\Controllers\HotelQuickBookingController;
use App\Http\Controllers\PartyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/flights/save', [BookingController::class, 'save']);
Route::post('/trains/save', [BookingController::class, 'saveTrain']);
Route::put('/trains/{id}', [BookingController::class, 'updateTrain']);
Route::get('/bookings', [BookingController::class, 'index']);
Route::get('/bookings/{id}', [BookingController::class, 'show']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);
Route::post('/bookings/{id}/sync-tally', [BookingController::class, 'syncTally']);
Route::post('/bookings/{id}/generate-invoice-number', [BookingController::class, 'generateInvoiceNumber']);

Route::post('/hotels/save', [HotelBookingController::class, 'save']);
Route::get('/hotel-bookings', [HotelBookingController::class, 'index']);
Route::post('/hotel-bookings/{id}/sync-tally', [HotelBookingController::class, 'syncTally']);
Route::get('/hotel-bookings/{id}/invoice', [HotelBookingController::class, 'invoice']);

Route::get('/hotel-quick-bookings/preview-ref', [HotelQuickBookingController::class, 'previewRef']);
Route::post('/hotel-quick-bookings', [HotelQuickBookingController::class, 'store']);
Route::get('/hotel-quick-bookings', [HotelQuickBookingController::class, 'index']);

Route::apiResource('companies', CompanyController::class);

Route::get('/parties', [PartyController::class, 'index']);
Route::post('/parties', [PartyController::class, 'store']);
Route::get('/parties/{party}', [PartyController::class, 'show']);
Route::put('/parties/{party}', [PartyController::class, 'update']);
Route::delete('/parties/{party}', [PartyController::class, 'destroy']);
