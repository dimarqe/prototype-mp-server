const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        let err = new Error('Unauthorized access');
        err.status = 401;
        return next(err);
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user)=>{
        if(err){
            let err = new Error('Invalid access token');
            err.status = 403;
            return next(err);
        }

        req.user = user;
        next();
    });
}