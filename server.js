const express = require("express");

const crypto = require('crypto')

const server = express()

server.use(express.json())

let bList = []

server.get('/', (req, res) => {
    res.send('your library')
})

server.get('/addbook', (req, res) => {
    res.send('')
})

server.post('/savebook', (req, res) => {
    let bname = req.body.bname;
    let newbookid = crypto.randomUUID();
    const book = { id: newbookid, name: bname };
    bList.push(book);
    res.json({ ...book, message: 'book has been added' })
})

server.post('/deletebook', (req, res) => {
    let del = req.body.id
    let delb = null
    bList = bList.filter((val, index) => {
        if (val.id == del) {
            delb = val
            return false;

        }
        return true;

    })
    if (delb) {
        return res.json({ ...delb, message: 'book has been deleted.' })
    }
    res.json({ message: "book does not exist" })
})

server.get('/viewbook/:bid', (req, res) => {
    let bid = req.params.bid
    let viewB = bList.filter((val, index) => val.id == bid);
    if (!viewB.length) {
        return res.json({ message: 'book does not exist' })
    }
    res.json(viewB[0])
})

server.get('/viewall', (req, res) => {
    res.json(bList)
})

server.post('/multibook', (req, res) => {
    let bnames = req.body.names;
    bnames.forEach(name => {
        let newbookid = crypto.randomUUID();
        const book = { id: newbookid, name: name };
        bList.push(book);
    });
    res.json({ message: 'all books are added.' })
})


const port = 3000;
server.listen(port, 'localhost', () => {
    console.log(port)
    console.log("Server started, honey");
})
