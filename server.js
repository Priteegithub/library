const express = require("express");

const crypto = require('crypto');

const server = express()

server.use(express.json())

const mysql = require("mysql2");

var conn = mysql.createConnection({ host: "localhost", user: "root", password: "12345", database: "your_library" });


let initdb = () => {
    conn.query("CREATE TABLE book (id VARCHAR(40) PRIMARY KEY, name VARCHAR(100))", (err, result) => {
        if (err && err.code!== 'ER_TABLE_EXISTS_ERROR') throw err;
        
        let bList = []

        server.get('/', (req, res) => {
            res.send('your library')
        })

        server.get('/addbook', (req, res) => {
            res.send('')
        })

        server.post('/savebook', (req, res) => {
            let name = req.body.bname;
            let id = crypto.randomUUID();
            const book = { id, name };
            conn.query(`insert into book VALUES("${id}","${name}")`,(err,resl)=>{
                console.log(resl,err)
                if (err) res.json({message: 'an error occured, can\'t save book.'})
                else res.json({ ...book, message: 'book has been added' })
                
            })

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

        server.post('/deletebook', (req, res) => {
            let del = req.body.id
            let delb = null
            conn.query(`DELETE FROM book WHERE id="${del}" `,(err)=>{
                console.log(err)
                if (err) res.json({message: 'an error occured, can\'t delete book.'})
                else res.json({message: 'book has been deleted' })
            })
        })


        server.post('/multidelete', (req, res) => {
            const mdel = req.body.ids;
            let list = bList;
            mdel.forEach((id) => {
                list = list.filter((book) => book.id != id)
            })
            const num = bList.length - list.length
            bList = list
            res.json({ message: "books have been deleted", total_deleted: num })
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

        

        const port = 3000;
        server.listen(port, 'localhost', () => {
            console.log(port)
            console.log("Server started, honey");
        })


    })

}
const afterConnect = (err) => {
    if (err) throw err
    console.log("connected")
    initdb()
}
conn.connect(afterConnect)


