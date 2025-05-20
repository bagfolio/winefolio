import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
// Test environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey);
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables are not properly set up!');
    process.exit(1);
}
// Test Supabase connection
const supabase = createClient(supabaseUrl, supabaseKey);
async function testConnection() {
    try {
        const { data, error } = await supabase.from('packages').select('count').limit(1);
        if (error) {
            console.error('❌ Failed to connect to Supabase:', error.message);
            process.exit(1);
        }
        console.log('✅ Successfully connected to Supabase!');
        console.log('✅ Environment variables are properly configured!');
    }
    catch (error) {
        console.error('❌ Error testing connection:', error);
        process.exit(1);
    }
}
testConnection();
