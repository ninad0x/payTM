const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { Account } = require('../db');
const { z } = require('zod');
const mongoose  = require('mongoose');

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    
    const userId  = req.userId
    
    if (!userId) {
        res.status(400).json({
            message: "You are not signed in"
        })
    }

    console.log("user ID  ", userId);
    
    const account = await Account.findOne({
        userId: userId
    })

    res.json({
        balance: account.balance.toFixed(2)
    })

})


router.post("/transfer", authMiddleware, async (req, res) => {
    
    const { amount, to } = req.body;
    
    if (!amount) {
        return res.json({
            message: "Please provide amount to be transfered"
        })
    }
    
    if (!to) {
        return res.json({
            message: "Please provide Account"
        })
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
});


























module.exports = router;