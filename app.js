const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const socket = require('./socket')

const app = express()

let notifArray = [
    {name: 'notification 1'},
    {name: 'notification 2'}
]

app.use(express.static(path.join(__dirname, 'views')))
app.use(express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')))
app.use(bodyparser.urlencoded({extended: true}))

app.set("view-engine", 'ejs')

app.get('/', (req, res, next) => {
    res.render('index.ejs', {
        notifications: notifArray
    })
})

app.post('/add-notification', (req, res, next) => {
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