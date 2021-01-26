const pool = require('../config/dbConnection');

class Driver {
    constructor(driver) {
        this.TRN = driver.TRN;
        this.firstName = driver.firstName;
        this.lastName = driver.lastName;
        this.emailAddress = driver.emailAddress;
        this.accessCode = driver.accessCode;
        this.telNumber = driver.telNumber;
        this.licensePlateNumber = driver.licensePlateNumber;
        this.vehicleCapacity = driver.vehicleCapacity;
    }

    static save(newDriver, result){
        pool.query("insert into Driver set ?", newDriver, (err, doc) => {
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }

    static delete(driverID, result){
        //check to make sure that LIMIT 1 would work as a part of this query
        pool.query("delete from Driver where driverID = ?", driverID, (err, doc) => {
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }

    static findByEmail(emailAddress, result){
        pool.query("select * from Driver where emailAddress = ? limit 1", emailAddress, (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc[0]);
            }
        });
    }

    static updatePassword(driverID, newPassword, result){
        pool.query("update Driver set accessCode = ? where driverID = ?", [newPassword, driverID], (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }

    static updatePhoneNumber(driverID, newPhoneNumber, result){
        pool.query("update Driver set telNumber = ? where driverID = ?", [newPhoneNumber, driverID], (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }

    static updateEmailAddress(driverID, newEmailAddress, result){
        pool.query("update Driver set emailAddress = ? where driverID = ?", [newEmailAddress, driverID], (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }
}

module.exports = Driver;