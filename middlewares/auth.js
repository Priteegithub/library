const jwt = require("jsonwebtoken")
const authCheck = (req, res, next) => {
    try {
        const token = req.header("Authorization").split(" ")[1]
        const data = jwt.verify(token, process.env.PRIVATE_KEY)
        if (Date.now()>=data.exp*1000) throw "not authorized"
        if (!data.id) throw 'Error'
        req.user = { id: data.id, book:null }
        next()
    } catch (e) {
        res.status(401).json({ message: "not authorized", ok: false })
    }
}
module.exports = { authCheck }