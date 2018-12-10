const Router = require('koa-router');

const router = new Router();

router.use('/assignments', require('./assignments'));
router.use('/setup', require('./setup'));
router.use('/integrations', require('./integrations'));
router.user('/students', require('./students'));
