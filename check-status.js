import fetch from 'node-fetch';

console.log('🔍 Checking EcoGame Server Status...\n');

const checkServer = async (name, url) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`✅ ${name}: Running at ${url}`);
      return true;
    } else {
      console.log(`❌ ${name}: Error ${response.status} at ${url}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Not running (${error.message})`);
    return false;
  }
};

const checkAllServers = async () => {
  console.log('Checking servers...\n');
  
  const frontendOk = await checkServer('Frontend', 'http://localhost:5173');
  const backendOk = await checkServer('Backend', 'http://localhost:5000/health');
  
  console.log('\n📊 Status Summary:');
  console.log(`Frontend: ${frontendOk ? '✅ Running' : '❌ Not running'}`);
  console.log(`Backend: ${backendOk ? '✅ Running' : '❌ Not running'}`);
  
  if (frontendOk && backendOk) {
    console.log('\n🎉 All servers are running!');
    console.log('🌐 Open your browser to: http://localhost:5173');
  } else {
    console.log('\n⚠️  Some servers are not running. Check the logs above.');
  }
};

checkAllServers();
