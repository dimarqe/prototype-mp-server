const router = require('express').Router();
const bodyParser = require('body-parser');

const authenticateToken = require('../controllers/authentication');
const driverController = require('../controllers/driverController');

//body parser middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.get('/driver', authenticateToken, driverController.getDriver);


router.post('/driver/signUp', authenticateToken, driverController.signUp);

router.post('/driver/login',driverController.login);


router.patch('/driver/password', authenticateToken, driverController.updatePassword);

router.patch('/driver/phoneNumber', authenticateToken, driverController.updatePhoneNumber);

router.patch('/driver/emailAddress', authenticateToken, driverController.updateEmailAddress);

router.delete('/driver', authenticateToken, driverController.deleteAccount);


module.exports = router;