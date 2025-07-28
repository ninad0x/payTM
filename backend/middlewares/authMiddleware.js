const { JWT_SECRET } = require("../config")
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {

    // const authHeader = req.headers.Authorization;

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return res.status(403).json({});
    // }

    // const token = authHeader.split(' ')[1];
    const token = req.headers.token
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET)

        if (decoded) {
            req.userId = decoded.id
            next()
        }
    } catch (error) {
        return res.status(403).json({
            message: "You are not signed in"
        });
        
    }
}

module.exports = {
    authMiddleware
}