import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
    try {
        // Clear existing data to prevent duplicates
        await supabase.from('questions').delete().neq('id', '');
        await supabase.from('bottles').delete().neq('id', '');
        await supabase.from('packages').delete().neq('id', '');

        // Read CSV files
        const packagesData = parse(
            fs.readFileSync(path.join(process.cwd(), 'data', 'packages.csv')),
            { columns: true }
        );
        const bottlesData = parse(
            fs.readFileSync(path.join(process.cwd(), 'data', 'bottles.csv')),
            { columns: true }
        );
        const questionsData = parse(
            fs.readFileSync(path.join(process.cwd(), 'data', 'questions.csv')),
            { columns: true }
        );

        // Insert unique packages
        const packageMap = new Map();
        for (const pkg of packagesData) {
            if (!pkg.name || packageMap.has(pkg.name)) continue;
            const { data: packageData, error: packageError } = await supabase
                .from('packages')
                .insert({
                    name: pkg.name,
                    description: pkg.description
                })
                .select()
                .single();
            if (packageError) throw packageError;
            packageMap.set(pkg.name, packageData.id);
        }

        // Insert unique bottles
        const bottleMap = new Map();
        for (const bottle of bottlesData) {
            if (!bottle.name || bottleMap.has(bottle.name)) continue;
            let package_id = null;
            if (bottle.package_id && packageMap.has(bottle.package_id)) {
                package_id = packageMap.get(bottle.package_id);
            } else if (bottle.package_name && packageMap.has(bottle.package_name)) {
                package_id = packageMap.get(bottle.package_name);
            } else if (packageMap.size === 1) {
                package_id = Array.from(packageMap.values())[0];
            }
            const { data: bottleData, error: bottleError } = await supabase
                .from('bottles')
                .insert({
                    package_id,
                    name: bottle.name,
                    description: bottle.description
                })
                .select()
                .single();
            if (bottleError) throw bottleError;
            bottleMap.set(bottle.name, bottleData.id);
        }
        // Log all bottleMap keys
        console.log('BottleMap keys:', Array.from(bottleMap.keys()));

        // Insert questions for each bottle only if bottle_name matches
        const questionSet = new Set();
        let insertedCount = 0;
        for (const question of questionsData) {
            const bottleName = question.bottle_name;
            console.log(`[PROCESS] Question for bottle_name: "${bottleName}" | question: "${question.question_text}"`);
            if (!bottleName || !bottleMap.has(bottleName)) {
                console.log(`[SKIP] No matching bottle for question: "${question.question_text}" (bottle_name: "${bottleName}")`);
                continue;
            }
            const bottle_id = bottleMap.get(bottleName);
            const uniqueKey = `${bottle_id}|${question.question_text}`;
            if (!question.question_text || questionSet.has(uniqueKey)) {
                console.log(`[SKIP] Duplicate or empty question: "${question.question_text}" for bottle: "${bottleName}"`);
                continue;
            }
            console.log(`[INSERT] Question for bottle: "${bottleName}" | question: "${question.question_text}"`);
            const { error: questionError } = await supabase
                .from('questions')
                .insert({
                    bottle_id,
                    question_text: question.question_text,
                    question_type: question.question_type,
                    options: question.choices ? question.choices.split(',').map((c: string) => c.trim()) : null
                });
            if (questionError) throw questionError;
            questionSet.add(uniqueKey);
            insertedCount++;
        }

        console.log(`Migration completed successfully! Inserted ${insertedCount} questions.`);
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateData(); 