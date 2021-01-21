const router = require('express').Router();
const bodyParser = require('body-parser');

const authenticateToken = require('../controllers/authentication')
const adminController = require('../controllers/adminController');

//body parser middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/admin/login', adminController.login);

module.exports = router;