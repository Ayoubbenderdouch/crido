<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Catalog\Models\Category;
use Illuminate\Database\Seeder;
use RuntimeException;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/categories.json');

        if (! is_file($path)) {
            throw new RuntimeException("Seed data file missing: {$path}");
        }

        $raw = (string) file_get_contents($path);
        $rows = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($rows)) {
            throw new RuntimeException('Invalid JSON structure in categories.json (expected array)');
        }

        // Pass 1: upsert every category WITHOUT parent_id (we may not know it yet).
        foreach ($rows as $row) {
            Category::updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'slug' => $row['slug'],
                    'name_ar' => $row['name_ar'],
                    'name_fr' => $row['name_fr'],
                    'icon_name' => $row['icon_name'] ?? null,
                    'image_url' => $row['image_url'] ?? null,
                    'sort_order' => (int) ($row['sort_order'] ?? 0),
                    'is_active' => (bool) ($row['is_active'] ?? true),
                    // parent_id is set in pass 2
                ],
            );
        }

        // Build slug => id map once for pass 2.
        $idsBySlug = Category::query()->pluck('id', 'slug')->all();

        // Pass 2: now wire up parent_id from parent_slug.
        $linked = 0;
        foreach ($rows as $row) {
            $parentSlug = $row['parent_slug'] ?? null;

            if ($parentSlug === null || $parentSlug === '') {
                // Top-level: ensure parent_id is null (in case it was set previously).
                Category::where('slug', $row['slug'])->update(['parent_id' => null]);
                continue;
            }

            $parentId = $idsBySlug[$parentSlug] ?? null;
            if ($parentId === null) {
                $this->command?->warn(
                    "Category {$row['slug']} references unknown parent slug '{$parentSlug}'.",
                );
                continue;
            }

            Category::where('slug', $row['slug'])->update(['parent_id' => $parentId]);
            $linked++;
        }

        $this->command?->info(
            'Seeded ' . count($rows) . " categories (linked {$linked} children to parents)."
        );
    }
}
