import http from 'http';

const key = 'QL-2f5528d1ef064001634bafd91cbcf34c4c2b6ac11129cdf7';

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': key
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Status:', res.statusCode, '\nResponse:', d));
});

req.write(JSON.stringify({ message: '你好绮灵' }));
req.end();