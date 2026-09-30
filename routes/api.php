<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BukuController; 
use App\Http\Controllers\Api\AnggotaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KunjunganController;
use App\Http\Controllers\Api\PeminjamanController;
use App\Http\Controllers\Api\ReportController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('buku', BukuController::class);
Route::apiResource('anggota', AnggotaController::class);
Route::apiResource('peminjaman', PeminjamanController::class);
Route::apiResource('kunjungan', KunjunganController::class);
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/laporan', [ReportController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']);

