require("dotenv")

const express = require("express");

const Joi = require("joi");

const auth = require("./routes/auth") //route

const prisma = require("./db")

const server = express()

server.use(express.json())

server.use('/authentication',auth)

server.get('/', (req, res) => {
    res.send('your library')
})

server.get('/addbook', async (req, res) => {
    let c = await prisma.book.count()
    res.send(`total ${c}`)
})

server.post('/savebook', async (req, res) => {
    const schema = Joi.object({
        bname: Joi.string().required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message })
    const title = value.bname;
    const book = { title };
    try {
        const resl = await prisma.book.create({ data: book })
        res.json({ ...resl, message: 'book has been added', ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t save book.', ok: false })
    }
})

server.post('/multibook', async (req, res) => {
    const schema = Joi.object({
        names: Joi.array().items(Joi.string().required()).required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message })
    let bnames = value.names;
    let bList = []
    bnames.forEach(name => {
        const book = { title: name };
        bList.push(book);
    });
    try {
        const { count } = await prisma.book.createMany({ data: bList })
        res.json({ message: 'all books are added.', total: count, ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t save books.', ok: false })
    }

})

server.post('/deletebook', async (req, res) => {
    const schema = Joi.object({
        id: Joi.number().integer().required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message })
    let del = value.id
    try {
        const deleted = await prisma.book.delete({ where: { id: del } })
        res.json({ message: 'book is deleted.', deleted, ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t delete book.', ok: false })
    }
})


server.post('/multidelete', async (req, res) => {
    const schema = Joi.object({
        ids: Joi.array().items(Joi.number().integer().required()).required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message })

    const mdel = value.ids;
    try {
        const { count: total } = await prisma.book.deleteMany({ where: { id: { in: mdel } } })
        res.json({ message: "books have been deleted", total, ok: true })
    } catch (e) {
        res.json({ message: 'an eror occured, can\'t delete books', ok: false })
    }
})

server.get('/viewbook/:bid', async (req, res) => {
    try {
        let bid = Number(req.params.bid)
        const book = await prisma.book.findFirst({ where: { id: bid } })
        res.json({ book, ok: true })
    } catch (e) {
        res.json({ message: 'book does not exist', ok: false })
    }
})
server.get('/viewall', (req,res,next)=>{
    res.redirect('/viewall/5')
})
server.get('/viewall/:max',async (req, res) => {
    let { max } = req.params
    const { value, error } = Joi.number().default(5).required().validate(max)
    if (error) return res.json({ meesage: 'invalid limit' })
    try {
        const books = await prisma.book.findMany({ select: { id: true, title: true }, take: value })
        res.json({
            books, ok: true
        })
    } catch (e) {

        res.status(500).json({ message: 'an error occured', ok: false })
    }
})


const port = 3000;
server.listen(port, 'localhost', () => {
    console.log(port)
    console.log("Server started, honey");
})