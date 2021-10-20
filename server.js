require("dotenv")
const express = require("express");
const auth = require("./routes/auth") //route
const book = require('./routes/book')
const server = express()
server.use(express.json())

server.set('view engine', 'ejs')

server.use('/account', auth)
server.use('/book', book)

server.get('/', (req, res) => {

    res.render('index', {
        name: "Library"
    })
})

const port = process.env.PORT;
const host = process.env.HOST;
server.listen(port, host, () => {
    console.log(host)
    console.log(port)
    console.log("Server started, honey");
})