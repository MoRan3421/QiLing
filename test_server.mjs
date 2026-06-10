import('./server/index.js').then(m => {
  console.log('Module loaded');
  const { createApp } = m;
  const { app, brain, config } = createApp();
  console.log('App created');
  return brain.initialize();
}).then(() => {
  console.log('Brain initialized');
}).catch(e => {
  console.error('Error:', e);
});