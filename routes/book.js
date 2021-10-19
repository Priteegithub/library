const express = require("express");
const Joi = require("joi");
const prisma = require("../db");
const route = express.Router();

const { authCheck } = require("../middlewares/auth.js")

route.get('/add', async (req, res) => {
    let c = await prisma.book.count()
    res.send(`total ${c}`)
})

route.post('/save', authCheck, async (req, res) => {
    const schema = Joi.object({
        bname: Joi.string().required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message, ok: false })
    const title = value.bname
    const book = { title, creatorId: req.user.id };
    try {
        const exists = await prisma.book.findFirst({ where: { creatorId: req.user.id, title: title } })
        if (exists) return res.json({ message: `'${title}' already exists in your account`, ok: false })
        const resl = await prisma.book.create({ data: book })
        res.json({ ...resl, message: 'book has been added', ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t save book.', ok: false })
    }

})

route.post('/multisave', authCheck, async (req, res) => {
    const schema = Joi.object({
        names: Joi.array().items(Joi.string().required()).required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message, ok: false })
    let bnames = value.names;
    let bList = []
    bnames.forEach(name => {
        const book = { title: name, creatorId: req.user.id };
        bList.push(book);
    });
    try {
        const exists = await prisma.book.findFirst({ where: { creatorId: req.user.id, title: { in: bnames } } })
        if (exists) return res.json({ message: `some books already exist in your account`, ok: false })
        const { count } = await prisma.book.createMany({ data: bList })
        res.json({ message: 'all books are added.', total: count, ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t save books.', ok: false })
    }

})

route.post('/delete', authCheck, async (req, res) => {
    const schema = Joi.object({
        id: Joi.number().integer().required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message, ok: false })
    let del = value.id
    try {
        const exists = await prisma.book.findFirst({ where: { creatorId: req.user.id, id: del } })
        if (!exists) throw "error"
        const deleted = await prisma.book.delete({ where: { id: del } })
        res.json({ message: 'book is deleted.', deleted, ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t delete book.', ok: false })
    }
})

route.post('/multidelete', authCheck, async (req, res) => {
    const schema = Joi.object({
        ids: Joi.array().items(Joi.number().integer().required()).required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message, ok: false })

    const mdel = value.ids;
    try {
        const count = await prisma.book.count({ where: { creatorId: req.user.id, id: { in: mdel } } })
        if (count !== mdel.length) throw "error"
        const { count: total } = await prisma.book.deleteMany({ where: { id: { in: mdel } } })
        res.json({ message: "books have been deleted", total, ok: true })
    } catch (e) {
        res.json({ message: 'an eror occured, can\'t delete books', ok: false })
    }
})

route.get('/view/:bid', async (req, res) => {
    try {
        let bid = Number(req.params.bid)
        const book = await prisma.book.findFirst({ where: { id: bid } })
        res.json({ book, ok: true })
    } catch (e) {
        res.json({ message: 'book does not exist', ok: false })
    }
})
route.get('/viewall', (req, res, next) => {
    res.redirect('5')
})
route.get('/viewall/:max', async (req, res) => {
    let { max } = req.params
    const { value, error } = Joi.number().default(5).required().validate(max)
    if (error) return res.json({ meesage: 'invalid limit', ok: false })
    try {
        const books = await prisma.book.findMany({ select: { id: true, title: true }, take: value })
        res.json({
            books, ok: true
        })
    } catch (e) {

        res.status(500).json({ message: 'an error occured', ok: false })
    }
})

module.exports = route