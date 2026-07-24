<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\Party;
use Google\Client as GoogleClient;
use Google\Service\Sheets as GoogleSheets;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ImportPartiesFromSheet extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:parties {sheetId : The Google Sheet ID containing the Customer_Master tab}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import parties (customers/agents) from the Customer_Master tab of a Google Sheet, matching each row to a company by Company Name';

    /**
     * Column headers expected on the Customer_Master sheet, in the order the
     * old Google Sheet used them. Matching is done by header name (not
     * position) so re-ordered columns in the sheet do not break the import.
     */
    private const HEADER_MAP = [
        'party type' => 'party_type',
        'customer id' => 'customer_code',
        'company name' => 'company_name',
        'account name' => 'account_name',
        'address' => 'address',
        'place of supply' => 'place_of_supply',
        'gstin' => 'gstin',
    ];

    public function handle(): int
    {
        $sheetId = $this->argument('sheetId');
        $credentialsPath = config('services.google.credentials_path');

        if (!file_exists($credentialsPath)) {
            $this->error("Google credentials file not found at: {$credentialsPath}");

            return self::FAILURE;
        }

        try {
            $client = new GoogleClient();
            $client->setAuthConfig($credentialsPath);
            $client->addScope(GoogleSheets::SPREADSHEETS_READONLY);

            $service = new GoogleSheets($client);
            $response = $service->spreadsheets_values->get($sheetId, 'Customer_Master');
            $rows = $response->getValues() ?? [];
        } catch (\Exception $e) {
            $this->error('Failed to read the Customer_Master sheet: ' . $e->getMessage());
            Log::error('import:parties failed to read Google Sheet', ['sheetId' => $sheetId, 'error' => $e->getMessage()]);

            return self::FAILURE;
        }

        if (count($rows) < 2) {
            $this->warn('Customer_Master sheet has no data rows.');

            return self::SUCCESS;
        }

        $columns = $this->mapHeaders(array_shift($rows));

        $companyCache = [];
        $imported = 0;
        $skipped = 0;

        foreach ($rows as $i => $row) {
            $rowNumber = $i + 2; // +1 for shifted header, +1 for 1-indexed sheet rows
            $data = $this->extractRow($columns, $row);

            $companyName = trim((string) ($data['company_name'] ?? ''));
            $accountName = trim((string) ($data['account_name'] ?? ''));

            if ($companyName === '' || $accountName === '') {
                $this->warn("Row {$rowNumber}: missing Company Name or Account Name, skipping.");
                Log::warning('import:parties skipped row: missing company or account name', ['row' => $rowNumber]);
                $skipped++;
                continue;
            }

            if (!array_key_exists($companyName, $companyCache)) {
                $companyCache[$companyName] = Company::where('name', $companyName)->first();
            }
            $company = $companyCache[$companyName];

            if (!$company) {
                $this->warn("Row {$rowNumber}: company \"{$companyName}\" not found, skipping.");
                Log::warning('import:parties skipped row: company not found', ['row' => $rowNumber, 'company_name' => $companyName]);
                $skipped++;
                continue;
            }

            $customerCode = trim((string) ($data['customer_code'] ?? '')) ?: null;
            $matchKey = $customerCode
                ? ['company_id' => $company->id, 'customer_code' => $customerCode]
                : ['company_id' => $company->id, 'account_name' => $accountName];

            try {
                Party::updateOrCreate($matchKey, [
                    'company_id' => $company->id,
                    'party_type' => trim((string) ($data['party_type'] ?? '')) ?: null,
                    'customer_code' => $customerCode,
                    'account_name' => $accountName,
                    'address' => trim((string) ($data['address'] ?? '')) ?: null,
                    'place_of_supply' => trim((string) ($data['place_of_supply'] ?? '')) ?: null,
                    'gstin' => trim((string) ($data['gstin'] ?? '')) ?: null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $this->warn("Row {$rowNumber}: failed to save party \"{$accountName}\": " . $e->getMessage());
                Log::warning('import:parties failed to save row', ['row' => $rowNumber, 'account_name' => $accountName, 'error' => $e->getMessage()]);
                $skipped++;
            }
        }

        $this->info("Import complete: {$imported} parties imported/updated, {$skipped} rows skipped.");

        return self::SUCCESS;
    }

    /**
     * Map header row text -> column index, using HEADER_MAP so the sheet's
     * column order doesn't matter as long as the header names match.
     *
     * @return array<string, int>
     */
    private function mapHeaders(array $headerRow): array
    {
        $columns = [];
        foreach ($headerRow as $index => $header) {
            $key = self::HEADER_MAP[strtolower(trim((string) $header))] ?? null;
            if ($key) {
                $columns[$key] = $index;
            }
        }

        return $columns;
    }

    /**
     * @param array<string, int> $columns
     * @return array<string, string|null>
     */
    private function extractRow(array $columns, array $row): array
    {
        $data = [];
        foreach ($columns as $field => $index) {
            $data[$field] = $row[$index] ?? null;
        }

        return $data;
    }
}
