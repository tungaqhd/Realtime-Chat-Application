const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const message = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user')
const port = process.env.PORT || 3000

const generateMessage = message.generateMessage

app.use(express.static('public'))
app.set('view engine', 'ejs')

io.on('connection', (socket) => {
    socket.on('sendWelcome', (username, room, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('receiveMsg', generateMessage(`Welcome ${user.username}`, 'admin'))
        socket.broadcast.to(user.room).emit('receiveMsg', generateMessage(`${user.username} has joined this room`, 'admin'))
        io.to(user.room).emit('roomData', {
            roomName: user.room,
            data: getUsersInRoom(user.room)
        })
    })
    socket.on('sendMsg', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('receiveMsg', generateMessage(msg, user.username))
        callback()
    })
    socket.on('geoLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('receiveMsg', generateMessage(`Location: ${coords.latitude}, ${coords.longitude} | <a href="https://www.google.com/maps?q=${coords.latitude},${coords.longitude}">My current location</a>`, user.username))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('receiveMsg', generateMessage(`${user.username} has left this room`))
            io.to(user.room).emit('roomData', {
                roomName: user.room,
                data: getUsersInRoom(user.room)
            })
        }
    })
})
app.get('/', (req, res) => {
    res.render('index')
})
app.get('/chat', (req, res) => {
    res.render('chat')
})
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})