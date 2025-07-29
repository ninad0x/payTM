const { User, Account } = require('../db');
const { z } = require("zod")
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require('../config');
const express = require('express');
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middlewares/authMiddleware")

const router = express.Router();


const signupSchema = z.object({
    username: z.string().min(3, { message: "Username must contain atleast 3 characters"}).max(30),
    password: z.string().min(6, { message: "Password must contain atleast 6 characters"}).max(30),
    firstName: z.string(),
    lastName: z.string()
})

const signinSchema = z.object({
    username: z.string().min(3, { message: "Username must contain atleast 3 characters"}).max(30),
    password: z.string().min(6, { message: "Password must contain atleast 6 characters"}).max(30),
})


router.post("/signup", async (req, res) => {

    const { success, data, error } = signupSchema.safeParse(req.body)
    // console.log(signupSchema.safeParse(req.body).error.issues[0].message);

    // input validation
    if (!success) {
        return res.status(411).json({
            message: error.issues[0].message
        })
    }

    if (await User.findOne({username: data.username})) {
        return res.status(411).json({
            message: "Username taken" 
        })
    }
    
    // creating user
    let newUser;
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        newUser = await User.create({
            username: data.username,
            password: hashedPassword, 
            firstName: data.firstName,
            lastName: data.lastName
        })

        await Account.create({
            userId: newUser._id,
            balance: (1 + (Math.random() * 10000)).toFixed(2)
        })



    } catch (error) {
        return res.status(411).json({
            message:"Error while creating user, please try again"
        });
    }

    // success
    res.status(200).json({
        message:"You are signed Up",
        userId: newUser._id
    })

})



router.post("/signin", async (req, res) => {
    
    const { success, data, error } = signinSchema.safeParse(req.body);

    // input validation
    if (!success) {
        console.log("not success");
        
        return res.status(411).json({
            message: error.issues[0].message
        })
    }

    try {
        const user = await User.findOne({
            username: data.username,
        })

        if (!user) {
            return res.json({
                message: "User does not exist"
            })
        }
            
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        
        if (isMatch) {
            console.log("correct password");

            // create token
            const token = jwt.sign({
                id: user._id.toString()
            }, JWT_SECRET)
            
            res.status(200).json({
                token
            })

        } else {
            res.json({
                message: "Incorrect credentials"
            })
        }

    } catch (error) {
        console.log("not password");
        res.json({
            message: "Incorrect credentials"
        })
    }

})



router.get("/bulk", async (req, res) => {
   
    const filter = req.query.filter || "";

    // if (!filter) {
    //     return res.json({
    //         message: "filter required"
    //     })
    // }

    try {
        const users = await User.find({
            $or: [{
                    firstName: {
                        $regex: filter,
                        $options : 'i'
                    }
                }, {
                    lastName: {
                        $regex: filter,
                        $options : 'i'
                    }
                }]
        })

        if (users.length < 1) {
            return res.json({
                message: "No matches found"
            });
        }

        return res.json({
            users: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        });

    } catch (error) {
        res.json({
            error
        })
    }
        
})





module.exports = router;