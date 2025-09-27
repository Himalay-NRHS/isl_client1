// Test script for the translate endpoint
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

const requestData = JSON.stringify({
  text: 'hello world'
});

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(requestData);
req.end();

console.log('Test request sent to /translate endpoint');