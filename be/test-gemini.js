// Test script for the Gemini-powered translate endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const testText = "I am a student at school";

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const parsedData = JSON.parse(data);
      console.log('Translation:', parsedData.translation);
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(JSON.stringify({ text: testText }));
req.end();

console.log(`Test request sent with text: "${testText}"`);