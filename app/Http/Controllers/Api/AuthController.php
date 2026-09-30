<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi inputan dari React
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Cari user di database
        $user = User::where('email', $request->email)->first();

        // 3. Cek apakah user ada dan passwordnya cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau Password salah!'
            ], 401);
        }

        // 4. Buatkan Tiket Masuk (Token API) pakai Sanctum
        $token = $user->createToken('token_perpus')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil Login!',
            'data' => $user,
            'token' => $token
        ]);
    }
}