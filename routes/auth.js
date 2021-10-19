const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const route = express.Router();

route.post('/register', async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(150).required(),
        email: Joi.string().email().required(),
        pin: Joi.number().integer().min(10000).max(99999).required(),
        phone: Joi.number().integer().min(1000000000).max(9999999999)
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message, ok: false })
    const exist = await prisma.user.findFirst({ where: { email: value.email } })
    if (exist)
        return res.json({ message: "email id already exist!", ok: false })
    try {
        const resl = await prisma.user.create({ data: value })
        delete resl.pin
        res.json({ ...resl, message: 'registred successfully!!', ok: true })
    } catch (e) {
        res.json({ message: 'an error occured, can\'t save book.', ok: false })
    }

})

route.post('/login',async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        pin: Joi.number().integer().required()
    })
    const { value, error } = schema.validate(req.body)
    if (error) return res.json({ message: error.message, ok: false })
    try {
        const user = await prisma.user.findFirst({ where: { email: value.email, pin: value.pin } })
        if (!user) return res.json({ message: "invalid credentials", ok: false })
        const token = jwt.sign({ id: user.id }, process.env.PRIVATE_KEY, {
            expiresIn: "2d"
        });
        res.json({ message: 'login successfull!!', ok: true, token })
    } catch (e) {
        res.json({ message: 'an error occured.', ok: false,})
    }
})

module.exports = route;