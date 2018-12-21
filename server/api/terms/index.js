const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./terms.controller');

router.get('/', Ctrl.getTerms);

module.exports = router.routes();
