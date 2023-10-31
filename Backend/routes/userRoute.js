const express = require('express')
const router = express.Router();
const service = require('../services/userService')
const { password_hash , verifyToken , isInRole } = require('../config/security')
const { check  , validationResult} = require('express-validator')

router.post('/login',[
    check("username").notEmpty().withMessage("Username is required!"),
    check("password").notEmpty().withMessage("Password is required!")
], async (req,res) =>{
    const checkErr = validationResult(req);
    if(!checkErr.isEmpty()){
        return res.json({status:"false" , errors: checkErr.errors})
    }
    const user = {
        username: req.body.username,
        password: password_hash(req.body.password)
    }
    const result = await service.onLogin(user);
    if(result.status === "ok") return res.json(result)
    res.json({status:"false",message: result})
})

/* FOR ADMIN ONLY */

// Get user list
router.get('/', verifyToken, isInRole(['admin']), async (req,res)=>{
    const users = await service.findAll();
    let status = ""
    if (users.length > 0)  {status = "ok"} else {status = "User not found"}
    res.json({status: status ,data : users, rows : users.length })
})


// Get one details by username
router.get('/:username', async (req,res)=>{
    const username = req.params.username
    const user = await service.findOne(username)

    res.json(user)
})

// register user
router.post('/register', verifyToken, isInRole(['admin']) , [
    check('username').notEmpty().withMessage('username is required!'),
    check('password').notEmpty().withMessage('password is required!'),
    check('fname').notEmpty().withMessage('firstname is required!'),
    check('lname').notEmpty().withMessage('lastname is required!')
], async (req,res)=>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){
        return res.json({status:"false",errors: checkErr.errors})
    }
    const user = req.body;
    user.password = password_hash(user.password);
    const result = await service.onRegister(user);
    if(result.status === "ok") return res.json(result)
    res.json({status:"false" , message: result})
})

router.post('/registerMultiple', verifyToken, isInRole(['admin']) , [
    check('users').notEmpty().withMessage('Users stuctor is required!')
], async (req,res)=>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){
        return res.json({status:"false",errors: checkErr.errors})
    }
    const users = req.body.users;

    const requestfalse = [];

    const results = [];

    if(users.length === 0){
        return res.json({ status:"false", message : "Users not empty!" })
    }

    for(let user of users){
        if(user.username && user.password && user.fname && user.lname){
            user.password = await password_hash(user.password);
            let result = await service.onRegister(user);
            if(result.status === 'ok') {results.push(result)}
            else { results.push({ status : 'false' , message : result}) }
        }else{
            requestfalse.push({status:"false" , user : user.username , message : `${user.username} cannot insert : please check required!`})
        }
    }
    res.json({requestfalse : requestfalse , results : results})
})

router.put('/:username',verifyToken,[
    check('fname').notEmpty().withMessage("Firstname is required."),
    check('lname').notEmpty().withMessage("Lastname is required.")
],async (req,res)=>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){ return res.json({status: 'false' , error : checkErr.errors})}

    const user = req.body;
    const username =req.params.username

    const result = await service.onUpdate(username,user);
    if(result.status === "ok") return res.json(result)
    res.json({status:"false",message: result})

})

router.put('/authstatus/:username',verifyToken , isInRole(['admin']),[
    check('newStatus').notEmpty().withMessage("New status is required.")
],async (req,res)=>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){ return res.json({status: 'false' , error : checkErr.errors})}

    const username =req.params.username
    const newStatus = req.body.newStatus

    const result = await service.onUpdateAuthStatus(username,newStatus);
    if(result.status === "ok") return res.json(result)
    res.json({status:"false",message: result})

})
router.put('/statuslock/:username',verifyToken , isInRole(['admin']),[
    check('newStatus').notEmpty().withMessage("New status is required.")
],async (req,res)=>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){ return res.json({status: 'false' , error : checkErr.errors})}

    const username =req.params.username
    const newStatus = req.body.newStatus

    const result = await service.onUpdateStatusLock(username,newStatus);
    if(result.status === "ok") return res.json(result)
    res.json({status:"false",message: result})

})

router.put('/passwordchange/:username',verifyToken , isInRole(['admin']),[
    check('newpassword').notEmpty().withMessage("New password is required.")
],async (req,res)=>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){ return res.json({status: 'false' , error : checkErr.errors})}

    const username =req.params.username
    const newpassword = req.body.newpassword

    const result = await service.onUpdatePassword(username,newpassword);
    if(result.status === "ok") return res.json(result)
    res.json({status:"false",message: result})

})

// Delete user by username 
router.delete('/:username', verifyToken,isInRole(['admin']), async (req,res)=>{
    const username = req.params.username;
    const result = await service.onDelete(username);
    if(result.status === "ok") return res.json(result)
    res.json({error : result})
})

router.post('/deleteMultiples', verifyToken , isInRole(['admin']), [
    check('usersList').notEmpty().withMessage('userList is required!')
],async (req,res) =>{
    const checkErr = await validationResult(req);
    if(!checkErr.isEmpty()){ return res.json({status: 'false' , error : checkErr.errors})}

    const result = await service.onDeleteMultiples(req.body);


    res.json(result)
})
module.exports = router