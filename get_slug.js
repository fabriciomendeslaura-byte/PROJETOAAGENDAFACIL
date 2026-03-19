const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdosolwhkusisbvyvddu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkb3NvbHdoa3VzaXNidnl2ZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTYzMTgsImV4cCI6MjA4OTE5MjMxOH0.SSzm3UERkVuuFocXXMyFE63kzkx-Z1MgYQ3VR-J1G_U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSlug() {
  const { data, error } = await supabase
    .from('companies')
    .select('slug')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  if (data && data.length > 0) {
    console.log(data[0].slug);
  } else {
    console.log('No companies found');
  }
}

getSlug();
