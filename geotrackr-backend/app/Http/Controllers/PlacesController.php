<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Services\PlaceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlacesController extends Controller
{
    public function __construct(private PlaceService $placeService)
    {
    }

    /**
     * Return all places as JSON.
     */
    public function index(): JsonResponse
    {
        return response()->json($this->placeService->getAllPlaces());
    }

    /**
     * Return a single place by ID.
     */
    public function show(Place $place): JsonResponse
    {
        return response()->json($place);
    }

    /**
     * Create a new place.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'lat'         => 'required|numeric|between:-90,90',
            'lng'         => 'required|numeric|between:-180,180',
            'description' => 'nullable|string',
            'category'    => 'nullable|string|max:100',
        ]);

        return response()->json($this->placeService->createPlace($validated), 201);
    }

    /**
     * Search places by name (for OSM-style navigation).
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        return response()->json($this->placeService->searchPlaces($query));
    }
}
