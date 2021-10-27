const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const Router = require('./router')
const { addUser, removeUser, getUser, getUsersInRoom } = require("./Users")
const cors = require("cors")

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: "https://insta-chat.netlify.app",
    }
})

io.on("connect", (socket) => {

    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room })
        if (error) return callback(error)

        socket.emit("message", { user: "admin", text: `Welcome! ${user.name} to ${user.room}` })
        socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined!` })
        socket.join(user.room)
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) })
        callback()

    })
    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("message", { user: user.name, text: message })
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) })
        callback()
    })
    socket.on("disconnect", () => {
        console.log("user disconnected")
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left` })
        }
    })

})

app.use(Router)
app.use(cors())

server.listen(PORT, () => {
    console.log("server has started working at port " + PORT)
})