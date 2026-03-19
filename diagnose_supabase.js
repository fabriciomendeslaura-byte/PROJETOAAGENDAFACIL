const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler variáveis do .env.local
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- Diagnóstico do Supabase ---');
    console.log('URL:', supabaseUrl);
    
    // 1. Verificar tabela 'companies'
    const { data: companies, error: compError } = await supabase.from('companies').select('*');
    if (compError) console.error('Erro ao ler companies:', compError.message);
    else console.log('Empresas encontradas:', companies.length);

    // 2. Verificar tabela 'users'
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) console.error('Erro ao ler users:', userError.message);
    else console.log('Usuários encontrados:', users.length);

    // 3. Tentar ver se existem tabelas "escondidas" ou se o schema é diferente
    console.log('\n--- Detalhes das Empresas ---');
    if (companies && companies.length > 0) {
        console.log(JSON.stringify(companies[0], null, 2));
    }

    console.log('\n--- Detalhes dos Usuários ---');
    if (users && users.length > 0) {
        console.log(JSON.stringify(users[0], null, 2));
    }
}

diagnose();
