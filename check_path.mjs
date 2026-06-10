console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('file://' + process.argv[1].replace(/\\/g, '/'));
console.log('match:', import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`);