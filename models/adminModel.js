const pool = require('../config/dbConnection');

class Admin {
    constructor(admin) {
        this.adminID = admin.adminID;
        this.accessCode = admin.accessCode;
    }

    static findByID(adminID, result){
        pool.query("select * from Administrator where adminID = ? limit 1", adminID, (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc[0]);
            }
        });
    }
}

module.exports = Admin;