require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

// Suppress CommonJS/ESM warning
process.removeAllListeners('warning');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  try {
    await supabase.from('questions').delete().neq('id', '');
    await supabase.from('bottles').delete().neq('id', '');
    await supabase.from('packages').delete().neq('id', '');

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

    console.log('Parsed bottlesData:', bottlesData);
    console.log('Parsed questionsData:', questionsData);

    // Map to keep track of inserted bottles by name
    const bottleMap = new Map();
    // Map to keep track of inserted packages by name
    const packageMap = new Map();

    // Insert all packages
    for (const pkg of packagesData) {
      const { data: insertedPackage, error: packageError } = await supabase
        .from('packages')
        .insert({
          name: pkg.name,
          description: null
        })
        .select()
        .single();
      if (packageError) throw packageError;
      packageMap.set(pkg.name, insertedPackage.id);

      // Get bottle names for this package
      const packageBottleNames = pkg.bottles
        ? pkg.bottles.split(',').map((b) => b.trim())
        : [];

      // Insert bottles for this package
      const insertedBottleNames = [];
      for (const bottle of bottlesData) {
        if (!packageBottleNames.includes(bottle.name)) continue;
        // Avoid inserting the same bottle twice (if it appears in multiple packages)
        if (bottleMap.has(bottle.name)) continue;
        const { data: insertedBottle, error: bottleError } = await supabase
          .from('bottles')
          .insert({
            package_id: insertedPackage.id,
            name: bottle.name,
            description: null
          })
          .select()
          .single();
        if (bottleError) throw bottleError;
        bottleMap.set(bottle.name, insertedBottle.id);
        insertedBottleNames.push(bottle.name);
      }

      // Update the 'bottles' column in the package with a comma-separated list of bottle names
      await supabase
        .from('packages')
        .update({ bottles: insertedBottleNames.join(',') })
        .eq('id', insertedPackage.id);
    }

    // Insert questions for all bottles
    for (const question of questionsData) {
      // Skip image-type questions
      if (question.question_type && question.question_type.toLowerCase() === 'image') continue;
      const bottleName = (question.bottle_name || question['bottle_name'] || question['bottle name'] || '').trim();
      if (!bottleName && question.question_type !== 'info') {
        continue;
      }
      const bottle_id = bottleMap.get(bottleName);
      if (!bottle_id && question.question_type !== 'info') {
        continue;
      }
      // Determine if this is a host-only question
      const isHostOnly =
        (question.question_type && ['audio', 'video'].includes(question.question_type.toLowerCase())) ||
        (question.question_text && question.question_text.trim().toLowerCase().startsWith('host:'));

      // Add varied help_text for test cases
      let helpText = question.help_text || null;
      if (!helpText) {
        if (question.question_type === 'text') {
          helpText = 'Share your thoughts in your own words.';
        } else if (question.question_type === 'multiple_choice') {
          helpText = 'Select the option that best matches your impression.';
        } else if (question.question_type === 'scale' || question.question_type === '1-10 sliding scale') {
          helpText = 'Use the slider to rate this aspect.';
        } else if (question.question_type === 'audio') {
          helpText = 'Host: Play this audio for the group.';
        } else if (question.question_type === 'video') {
          helpText = 'Host: Play this video for the group.';
        } else if (question.question_type === 'divider') {
          helpText = 'Section divider for the tasting flow.';
        }
      }

      // Support media_url column
      const mediaUrl = question.media_url || null;

      // Support ';' as delimiter for choices, fallback to ','
      let options = null;
      if (question.choices) {
        if (question.choices.includes(';')) {
          options = question.choices.split(';').map((c) => c.trim());
        } else {
          options = question.choices.split(',').map((c) => c.trim());
        }
      }

      const insertObj = {
        bottle_id: question.question_type === 'info' ? null : bottle_id,
        question_text: question.question_text,
        question_type: question.question_type,
        options,
        for_host: isHostOnly,
        help_text: helpText,
        media_url: mediaUrl
      };
      const { error: questionError } = await supabase
        .from('questions')
        .insert(insertObj);
      if (questionError) throw questionError;
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateData();