const router = require('express').Router();
const bodyParser = require('body-parser');

//body parser middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/student', (req, res, next) => {
    return res.status(200).json({
        "message": "User base connection",
        "data": null
    });
});

module.exports = router;