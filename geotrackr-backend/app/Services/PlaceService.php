<?php

namespace App\Services;

use App\Models\Place;
use Illuminate\Database\Eloquent\Collection;

class PlaceService
{
    /**
     * Get all places.
     */
    public function getAllPlaces(): Collection
    {
        return Place::all();
    }

    /**
     * Create a new place.
     */
    public function createPlace(array $data): Place
    {
        return Place::create($data);
    }

    /**
     * Search places by query string.
     */
    public function searchPlaces(string $query): Collection
    {
        return Place::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('category', 'like', "%{$query}%")
            ->get();
    }
}
