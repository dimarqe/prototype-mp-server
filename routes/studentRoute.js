const router = require('express').Router();
const bodyParser = require('body-parser');

const authenticateToken = require('../controllers/authentication')
const studentController = require('../controllers/studentController');

//body parser middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/student/signUp', studentController.signUp);

router.post('/student/login',studentController.login);

router.patch('/student/password', authenticateToken, studentController.updatePassword);

module.exports = router;