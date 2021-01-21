const router = require('express').Router();
const bodyParser = require('body-parser');

const authenticateToken = require('../controllers/authentication');
const studentController = require('../controllers/studentController');

//body parser middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/student', authenticateToken, studentController.getStudent);


router.post('/student/signUp', authenticateToken, studentController.signUp);

router.post('/student/login',studentController.login);


router.patch('/student/password', authenticateToken, studentController.updatePassword);

router.patch('/student/phoneNumber', authenticateToken, studentController.updatePhoneNumber);

router.patch('/student/emailAddress', authenticateToken, studentController.updateEmailAddress);

module.exports = router;