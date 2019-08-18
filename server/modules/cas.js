const CAS = require('koa2-cas');

const cas = new CAS({
  cas_url: 'https://cas-auth.rpi.edu/cas',
  service_url: process.env.CAS_SERVICE_URL,
  cas_version: '3.0',
  renew: true
});

module.exports = cas;
