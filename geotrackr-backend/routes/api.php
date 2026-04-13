<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlacesController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/places', [PlacesController::class, 'index']);
Route::get('/places/search', [PlacesController::class, 'search']);
Route::get('/places/{place}', [PlacesController::class, 'show']);
Route::post('/places', [PlacesController::class, 'store']);
