<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    // GET /api/users?search=abc
    public function search(Request $request)
    {
        $search = $request->input('search', '');
        $users = User::where('name', 'LIKE', $search . '%')
            ->limit(10)
            ->get(['id', 'name', 'profile_pic']);
        return response()->json(['data' => $users]);
    }
}
