const CAS = require('koa2-cas');

//cas.configure({ host: 'https://cas-auth.rpi.edu/cas' });

const cas = new CAS({
  cas_url: 'https://cas-auth.rpi.edu/cas',
  service_url: 'http://localhost:3000',
  cas_version: '3.0'
});

module.exports = cas;
