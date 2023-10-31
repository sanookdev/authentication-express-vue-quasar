const jwt = require('jsonwebtoken')
const md5 = require('md5')
require('dotenv').config()
const jwt_access_key = process.env.ACCESS_TOKEN_KEY

const security = {
    verifyToken (req,res,next) {
        let token = req.headers['authorization'] // Get token on headers authorization

        // Check token not empty
        if(!token) {
            const error = {
                error : {
                    message : "Not authenticated."
                },
                status: 401
            }
            return res.json(error)
        }

        token = token.replace('Bearer ', '') //  Remove string word "Bearer " from token 

        // Verify token is valid or not
        let decodedToken
        try {
            decodedToken = jwt.verify(token,jwt_access_key);
        } catch (error) {
            let errors = {
                status:"false",
                error:error
            }
            return res.json(errors)
        }
        next()
    },

    // hash password for store to database or for check compare with login page
    password_hash(password){
        return md5(md5(password))
    },

    isInRole : (roles = []) => (req,res,next) =>{
        let token = req.headers['authorization'] // Get token on headers authorization

        // Check token not empty
        if(!token) {
            const error = {
                error : {
                    message : "Not authenticated."
                },
                status: 401
            }
            return res.json(error)
        }

        token = token.replace('Bearer ', '') //  Remove string word "Bearer " from token 

        // Verify token is valid or not
        let decodedToken
        try {
            decodedToken = jwt.verify(token,jwt_access_key);
        } catch (error) {
            let errors = {
                status:"false",
                error:error
            }
            return res.json(errors)
        }

        let user_role = decodedToken.user_role;
        const authorized = roles.includes(user_role);

        if(!authorized) {
            const error = {
                error : {
                    message : "Your role cannot use this acction."
                },
                status: 401
            }
            return res.json(error)
        }
        next()
    }
}

module.exports = security