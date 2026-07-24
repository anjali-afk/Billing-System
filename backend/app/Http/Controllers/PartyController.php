<?php

namespace App\Http\Controllers;

use App\Models\Party;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PartyController extends Controller
{
    /**
     * Get parties, scoped to a single company (mirrors the old
     * Google Apps Script getPartyData() company-based filter).
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required|integer|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $parties = Party::where('company_id', $request->query('company_id'))
            ->orderBy('account_name')
            ->get();

        return response()->json($parties, 200);
    }

    /**
     * Get a single party.
     */
    public function show(Party $party)
    {
        return response()->json($party, 200);
    }

    /**
     * Create a new party.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->rules($request));

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $party = Party::create($validator->validated());

        return response()->json($party, 201);
    }

    /**
     * Update an existing party.
     */
    public function update(Request $request, Party $party)
    {
        $validator = Validator::make($request->all(), $this->rules($request, $party));

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $party->update($validator->validated());

        return response()->json($party, 200);
    }

    /**
     * Delete a party.
     */
    public function destroy(Party $party)
    {
        $party->delete();

        return response()->json(['success' => true], 200);
    }

    /**
     * Shared validation rules for store/update. The company_id + account_name
     * unique constraint is scoped per company and ignores the current row on update.
     */
    private function rules(Request $request, ?Party $party = null): array
    {
        return [
            'company_id' => 'required|integer|exists:companies,id',
            'account_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('parties')
                    ->where('company_id', $request->input('company_id'))
                    ->ignore($party?->id),
            ],
            'party_type' => 'nullable|string|max:255',
            'customer_code' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('parties')
                    ->where('company_id', $request->input('company_id'))
                    ->ignore($party?->id),
            ],
            'address' => 'nullable|string',
            'place_of_supply' => 'nullable|string|max:255',
            'gstin' => 'nullable|string|size:15',
        ];
    }
}
