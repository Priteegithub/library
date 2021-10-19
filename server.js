require("dotenv")
const express = require("express");
const auth = require("./routes/auth") //route
const book = require('./routes/book')
const server = express()
server.use(express.json())

server.use('/account', auth)
server.use('/book', book)

server.get('/', (req, res) => {
    res.send('your library')
})

const port = process.env.PORT;
const host = process.env.HOST;
server.listen(port, host, () => {
    console.log(host)
    console.log(port)
    console.log("Server started, honey");
})