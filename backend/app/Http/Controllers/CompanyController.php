<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    /**
     * Get a list of all companies.
     */
    public function index()
    {
        return response()->json(Company::orderBy('name')->get(), 200);
    }

    /**
     * Get a single company.
     */
    public function show(Company $company)
    {
        return response()->json($company, 200);
    }

    /**
     * Create a new company.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'logo_path' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'gstin' => 'nullable|string|size:15',
            'pan' => 'nullable|string|max:10',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'ifsc_code' => 'nullable|string|max:255',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $company = Company::create($validator->validated());

        return response()->json($company, 201);
    }

    /**
     * Update an existing company.
     */
    public function update(Request $request, Company $company)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'logo_path' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'gstin' => 'nullable|string|size:15',
            'pan' => 'nullable|string|max:10',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'ifsc_code' => 'nullable|string|max:255',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $company->update($validator->validated());

        return response()->json($company, 200);
    }

    /**
     * Delete a company.
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json(['success' => true], 200);
    }
}
