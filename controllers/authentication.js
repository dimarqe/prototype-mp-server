const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
            "error": true,
            "message": "Unauthorized access",
            "data": null
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user)=>{
        if(err){
            return res.status(403).json({
                "error": true,
                "message": "Invalid access token",
                "data": null
            });
        }

        req.user = user;
        next();
    });
}