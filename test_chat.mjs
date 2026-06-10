import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'QL-5d0cbd75fb59031d295cb67dfa09f8a8898d078b191aa582'
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(res.statusCode, d));
});

req.write(JSON.stringify({ message: '你好' }));
req.end();