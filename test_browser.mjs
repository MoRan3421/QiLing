import('./server/brain/tools/BrowserAutomation.js').then(m => {
  const b = new m.BrowserAutomation();
  return b.initialize().then(() => console.log('OK')).catch(e => console.error('FAIL', e.message));
});