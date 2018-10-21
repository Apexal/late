const Router = require('koa-router');
const router = new Router();
const Routes = require('../controllers/assignments');

router.get('/new', Routes.getNew);
router.post('/new', Routes.postNew);

router.get('/list', Routes.getList);

module.exports = router.routes();
