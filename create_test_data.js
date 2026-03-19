const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdosolwhkusisbvyvddu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkb3NvbHdoa3VzaXNidnl2ZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTYzMTgsImV4cCI6MjA4OTE5MjMxOH0.SSzm3UERkVuuFocXXMyFE63kzkx-Z1MgYQ3VR-J1G_U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  console.log('Criando dados de teste...');
  
  // 1. Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert([{
      name: 'Agenda Fácil Test',
      slug: 'teste-agenda',
      business_type: 'Salão de Beleza'
    }])
    .select()
    .single();

  if (companyError) {
    if (companyError.code === '23505') {
        console.log('Empresa já existe com slug teste-agenda');
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('*')
            .eq('slug', 'teste-agenda')
            .single();
        setupServicesAndHours(existingCompany);
    } else {
        console.error('Erro ao criar empresa:', companyError);
    }
    return;
  }
  
  console.log('Empresa criada:', company.slug);
  setupServicesAndHours(company);
}

async function setupServicesAndHours(company) {
  // 2. Create service
  const { error: serviceError } = await supabase
    .from('services')
    .insert([{
      company_id: company.id,
      name: 'Corte de Cabelo',
      duration_minutes: 30,
      price: 50
    }]);

  if (serviceError && serviceError.code !== '23505') console.error('Erro ao criar serviço:', serviceError);
  else console.log('Serviço criado/verificado.');

  // 3. Create business hours
  const hours = [];
  for (let i = 0; i < 7; i++) {
    hours.push({
      company_id: company.id,
      weekday: i,
      open_time: '08:00',
      close_time: '18:00'
    });
  }
  const { error: hoursError } = await supabase
    .from('business_hours')
    .insert(hours);

  if (hoursError && hoursError.code !== '23505') console.error('Erro ao criar horários:', hoursError);
  else console.log('Horários criados/verificados.');

  console.log('Dados de teste prontos!');
  console.log('Acesse: http://localhost:3000/teste-agenda');
}

createTestData();
