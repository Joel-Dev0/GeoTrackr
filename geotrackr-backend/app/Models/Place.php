<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'lat',
        'lng',
        'description',
        'category',
    ];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
    ];
}
