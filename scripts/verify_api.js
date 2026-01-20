
async function verify() {
  const endpoints = [
    'http://localhost:5173/api/track',
    'http://localhost:5173/api/upload-image'
  ];

  for (const url of endpoints) {
    try {
      console.log(`Checking ${url}...`);
      const res = await fetch(url);
      console.log(`Status: ${res.status} ${res.statusText}`);
      if (res.status === 200) {
        console.log('PASS: GET request handled correctly.');
        const text = await res.text();
        console.log('Response:', text);
      } else if (res.status === 405) {
        console.log('FAIL: Still returning 405 Method Not Allowed.');
      } else {
        console.log(`WARN: Unexpected status ${res.status}`);
      }
    } catch (err) {
      console.error(`ERROR: Could not fetch ${url}`, err.message);
    }
    console.log('---');
  }
}

verify();
