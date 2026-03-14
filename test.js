const fetch = require('node-fetch');

const url = "https://script.google.com/macros/s/AKfycbw-9wW3TZx-v6oJog0D3FB8Wuc6S3Uar9ZEHht2Z3cOG1YdSqepFSpAkLxEduLiNdnLOw/exec";
const params = new URLSearchParams();
params.append('nama', 'Tester Server');
params.append('pesan', 'Pesan via Node');

fetch(url, { method: 'POST', body: params })
  .then(res => res.text())
  .then(text => console.log('POST Response:', text))
  .catch(err => console.error('POST Error:', err));

fetch(url)
  .then(res => res.text())
  .then(text => console.log('GET Response:', text))
  .catch(err => console.error('GET Error:', err));
