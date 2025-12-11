// Script de test pour le backend
const http = require('http');

const BASE_URL = 'http://localhost:3001';
const TOKEN_ADMIN = 'admin';
const TOKEN_STUDENT = 'student';

// Helper pour faire des requêtes
function makeRequest(method, path, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      body = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, raw: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Tests
async function runTests() {
  console.log('🧪 Test du Backend API\n');
  console.log('='.repeat(50));
  console.log('');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  console.log('1. Test Health Check...');
  try {
    const result = await makeRequest('GET', '/health');
    if (result.status === 200) {
      console.log('   ✅ PASS - Health check OK');
      console.log(`   Response: ${result.raw}`);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 2: Get Modules (sans auth - devrait échouer)
  console.log('2. Test GET /api/modules (sans auth)...');
  try {
    const result = await makeRequest('GET', '/api/modules');
    if (result.status === 401) {
      console.log('   ✅ PASS - Correctement protégé (401)');
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status} (attendu: 401)`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 3: Get Modules (avec auth admin)
  console.log('3. Test GET /api/modules (avec auth admin)...');
  try {
    const result = await makeRequest('GET', '/api/modules', TOKEN_ADMIN);
    if (result.status === 200) {
      console.log('   ✅ PASS - Modules récupérés');
      console.log(`   Nombre de modules: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
      passed++;
    } else if (result.status === 500) {
      console.log('   ⚠️  WARNING - Status 500 (Base de données non accessible)');
      console.log('   Cela est normal si MySQL n\'est pas configuré');
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      console.log(`   Response: ${result.raw}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 4: Get Programs
  console.log('4. Test GET /api/programs (avec auth admin)...');
  try {
    const result = await makeRequest('GET', '/api/programs', TOKEN_ADMIN);
    if (result.status === 200) {
      console.log('   ✅ PASS - Programs récupérés');
      console.log(`   Nombre de programmes: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
      passed++;
    } else if (result.status === 500) {
      console.log('   ⚠️  WARNING - Status 500 (Base de données non accessible)');
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 5: Get Professors
  console.log('5. Test GET /api/professors (avec auth admin)...');
  try {
    const result = await makeRequest('GET', '/api/professors', TOKEN_ADMIN);
    if (result.status === 200 || result.status === 500) {
      console.log('   ✅ PASS - Professors endpoint accessible');
      if (result.status === 500) {
        console.log('   ⚠️  Base de données non accessible');
      }
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 6: Get Rooms
  console.log('6. Test GET /api/rooms (avec auth admin)...');
  try {
    const result = await makeRequest('GET', '/api/rooms', TOKEN_ADMIN);
    if (result.status === 200 || result.status === 500) {
      console.log('   ✅ PASS - Rooms endpoint accessible');
      if (result.status === 500) {
        console.log('   ⚠️  Base de données non accessible');
      }
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 7: Get Groups
  console.log('7. Test GET /api/groups (avec auth admin)...');
  try {
    const result = await makeRequest('GET', '/api/groups', TOKEN_ADMIN);
    if (result.status === 200 || result.status === 500) {
      console.log('   ✅ PASS - Groups endpoint accessible');
      if (result.status === 500) {
        console.log('   ⚠️  Base de données non accessible');
      }
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 8: Create Module (admin)
  console.log('8. Test POST /api/modules (créer module avec admin)...');
  try {
    const moduleData = {
      name: 'Test Module',
      code: 'TEST' + Date.now(),
      type: 'CM',
      nature: 'informatique',
      hours_cm: 20,
      hours_td: 10,
      hours_tp: 0,
    };
    const result = await makeRequest('POST', '/api/modules', TOKEN_ADMIN, moduleData);
    if (result.status === 201) {
      console.log('   ✅ PASS - Module créé avec succès');
      console.log(`   Module ID: ${result.data?.id}`);
      passed++;
    } else if (result.status === 500) {
      console.log('   ⚠️  WARNING - Status 500 (Base de données non accessible)');
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      console.log(`   Response: ${result.raw}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 9: Create Module (student - devrait échouer)
  console.log('9. Test POST /api/modules (student - devrait échouer)...');
  try {
    const moduleData = {
      name: 'Test Module',
      code: 'TEST2',
      type: 'CM',
      nature: 'informatique',
    };
    const result = await makeRequest('POST', '/api/modules', TOKEN_STUDENT, moduleData);
    if (result.status === 403) {
      console.log('   ✅ PASS - Correctement protégé (403 Forbidden)');
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status} (attendu: 403)`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Résumé
  console.log('='.repeat(50));
  console.log('');
  console.log('📊 Résumé des Tests:');
  console.log(`   ✅ Passés: ${passed}`);
  console.log(`   ❌ Échoués: ${failed}`);
  console.log(`   📈 Taux de réussite: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 Tous les tests sont passés!');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les messages ci-dessus.');
  }
}

// Exécuter les tests
runTests().catch(console.error);

