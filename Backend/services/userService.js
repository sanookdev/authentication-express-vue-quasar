// ส่วนนี้เป็นส่วนที่สร้าง Method เพื่อจัดการข้อมูลกับ Database และส่งข้อมูลกลับไปที่ Route เพื่อแสดงข้อมูลให้ Client 

// ** ต้อง สร้าง Promise สำหรับทำ asynchonize
const connection = require('../config/database');
const date = require('date-and-time');
const table = "users";
const jwt = require('jsonwebtoken');
require('dotenv').config()
const jwt_access_key= process.env.ACCESS_TOKEN_KEY
const md5 = require('md5')

module.exports = {
    onUpdate(username,user){
        return new Promise((resolve,reject)=>{
            let sqlCheckUser = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sqlCheckUser,[username],(err,row)=>{
                if(err) return reject(err)
                console.log(row)
                if(!row.length) return resolve("User not found.")
                let sql = `UPDATE user SET fname = ? , lname = ? WHERE username = ?`;
                connection.query(sql,[user.fname,user.lname,username],(err,result)=>{
                    if(err) return resolve(err);
                    resolve({
                        status : "ok",
                        message: `User ${username} has been updated.`
                    })
                })

            })
        })
    },
    onLogin(user){
        return new Promise((resolve,reject)=>{
            let sql = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sql,[user.username],(err,rows)=>{
                if(err) return reject(err)
                if(!rows.length) return resolve("User not found.")

                if(rows[0].password !== user.password) return (resolve("Username or Password is invalid!"))

                delete rows[0].password;

                const token = jwt.sign(rows[0], jwt_access_key, { expiresIn: '6h' });

                const result = {
                    status:"ok",
                    message:"Login success",
                    user:rows[0],
                    token : token
                }

                resolve(result)
            })
        })
    },
    findAll(){
        return new Promise ((resolve,reject)=>{
            let sql = `SELECT * FROM ${table}`;
            connection.execute(sql,(err,rows)=>{
                if(err) return reject(err)
                resolve(rows)
            })
        })
    },
    findOne(username){
        return new Promise ((resolve,reject) =>{
            let sql = `SELECT * FROM ${table} WHERE username = ?`
            connection.execute(sql,[username],(err,row)=>{
                if(err) return reject(err)
                if(!row.length) return resolve({status:"false" ,message: "User not found"})
                row[0].created_date = date.format(row[0].created_date,"YYYY-MM-DD HH:mm:ss")
                resolve(row)
            })
        })
    },
    onRegister(user){
        return new Promise ((resolve,reject) =>{
            let sqlCheckRow = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sqlCheckRow,[user.username],(error,row)=>{
                if(error) return resolve(error)
                if(row.length > 0) return resolve(`${user.username} already exit!`)
                let sql = `INSERT INTO ${table} SET ?`;
                connection.query(sql,[user],(err,rows)=>{
                    if(err) return resolve(err)
                    resolve({
                        status: "ok",
                        message: `${user.username} has been inserted`
                    })
                })
            })
            // return resolve(user)
           
        })
    },
    onDelete(username){
        return new Promise ((resolve,reject) =>{
            if(username === 'admin') 
            {
                return resolve({
                                status : "false",
                                message :"Cannot remove admin"
                                });
            }
            
            let sqlCheckUser = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sqlCheckUser,[username],(err,row) =>{
                if(!row.length) return resolve({
                    status: "false",
                    message: "User not found."
                })
                let sql = `DELETE FROM ${table} WHERE username = ?`;
                connection.query(sql,[username], (err,rows)=>{
                    if(err) return resolve(err)
                    resolve({
                        status: "ok",
                        message : `${username} has been deleted`
                    })
                })
            })
        })
    },
    onUpdateAuthStatus(username,newStatus){
        return new Promise ((resolve,reject) =>{
            let sqlCheckUser = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sqlCheckUser,[username],(err,row)=>{
                if(err) return reject(err)
                if(!row.length) return resolve("User not found.")
                let sql = `UPDATE user SET auth_status = ? WHERE username = ?`;
                connection.query(sql,[newStatus, username],(err,result)=>{
                    if(err) return resolve(err);
                    resolve({
                        status : "ok",
                        message: `Auth status username ${username} has been updated.`
                    })
                })

            })
        })
    },

    onUpdateStatusLock(username,newStatus){
        return new Promise ((resolve,reject) =>{
            let sqlCheckUser = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sqlCheckUser,[username],(err,row)=>{
                if(err) return reject(err)
                if(!row.length) return resolve("User not found.")
                let sql = `UPDATE user SET status_lock = ? WHERE username = ?`;
                connection.query(sql,[newStatus, username],(err,result)=>{
                    if(err) return resolve(err);
                    resolve({
                        status : "ok",
                        message: `Status lock username ${username} has been updated.`
                    })
                })

            })
        })
    },

    onUpdatePassword(username, newpassword){
        return new Promise ((resolve,reject) =>{
            let sqlCheckUser = `SELECT * FROM ${table} WHERE username = ?`;
            connection.query(sqlCheckUser,[username],(err,row)=>{
                if(err) return reject(err)
                if(!row.length) return resolve("User not found.")

                const haspassword = md5(md5(newpassword))

                let sql = `UPDATE user SET password = ? WHERE username = ?`;
                connection.query(sql,[haspassword, username],(err,result)=>{
                    if(err) return resolve(err);
                    resolve({
                        status : "ok",
                        message: `Password ${username} has been updated.`
                    })
                })

            })
        })
    },
    onDeleteMultiples(usersList){
        return new Promise((resolve,reject)=>{
            const usernames = usersList.usersList.map(username => `'${username}'`).join(',');
            let sql = `DELETE FROM ${table}
                            WHERE username IN (${usernames});`
            connection.query(sql,(err,row)=>{
                if(err) return reject(err)
                resolve({
                    status :"ok",
                    message : `User in users list has been deleted.`
                })
            })
        })
    }
}
connection.query(
    `SELECT * FROM ${table} WHERE username = 'admin'`,
    function (err, rows, fields) {
      if (rows.length > 0) return;
      if (err) return;
      const admin = {
        username: "admin",
        password: "123456",
        fname: "administrator",
        lname: "superadmin",
        user_role: "admin",
      };
        admin.password = md5(md5(admin.password));
        connection.query(
            `INSERT INTO ${table} SET ?`,
            [admin],
            function (err, rows, fields) {
            if (err) console.log(err);
            console.log("admin is generated");
            }
        );
    }
  );