const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const socket = require('./socket')
const morgan = require('morgan')
const fs = require('fs')
const { check, validationResult } = require('express-validator')

const app = express()

let notifArray = [
    { name: 'notification 1' },
    { name: 'notification 2' }
]

app.use(express.static(path.join(__dirname, 'views')))
app.use(express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')))
app.use(bodyparser.urlencoded({ extended: true }))

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: "a" })

app.use(morgan("combined", { stream: accessLogStream }))

app.set("view-engine", 'ejs')

app.get('/', (req, res, next) => {
    res.render('index.ejs', {
        notifications: notifArray
    })
})

app.post('/add-notification', check('notification', 'notification must be 5 length greater').isLength({ min: 5 }), (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log('Notification length is too short')
        return res.status(422).render('index.ejs', {
            notifications: notifArray
        })
    }
    notifArray.push({
        name: req.body.notification
    })
    socket.getIO().emit('unique', `Hi ${socket.id}`)
    socket.getIO().emit('notifications', {
        action: 'create',
        notif: req.body.notification
    })
    return res.redirect('/')
})

const server = app.listen(8080, () => console.log('listening'))
const io = require('./socket').init(server)

// io.on("connection", socket => {
//     io.to(socket.id).emit('unique', `Hi ${socket.id}`)
// })