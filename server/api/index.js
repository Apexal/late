const Router = require('koa-router');

const router = new Router();

router.use('/assignments', require('./assignments'));
router.use('/exams', require('./exams'));
router.use('/setup', require('./setup'));
router.use('/integrations', require('./integrations'));
router.use('/students', require('./students'));
router.use('/terms', require('./terms'));
router.use('/blocks', require('./blocks'));
router.use('/todos', require('./todos'));

module.exports = router.routes();
