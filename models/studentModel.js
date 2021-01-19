const pool = require('../config/dbConnection');

class Student {
    constructor(student) {
        this.studentID = student.studentID;
        this.firstName = student.firstName;
        this.lastName = student.lastName;
        this.emailAddress = student.emailAddress;
        this.accessCode = student.accessCode;
        this.telNumber = student.telNumber;
        this.streetAddress = student.streetAddress;
        this.district = student.district;
    }

    save(newStudent, result){
        pool.query("insert into Student set ?", newStudent, (err, doc) => {
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }

    static findByEmail(studentID, result){
        pool.query("select * from Student where studentID = ? limit 1", studentID, (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc[0]);
            }
        });
    }

    static updatePassword(studentID, newPassword, result){
        pool.query("update Student set accessCode = ? where studentID = ?", [newPassword, studentID], (err, doc)=>{
            if (err) {
                result(err, null);
            }
            else {
                result(null, doc);
            }
        });
    }
}

module.exports = Student;