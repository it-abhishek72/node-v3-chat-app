const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io') 
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {getUser, removeUser, addUser, getUserInRoom} = require('./utils/user')


const app =  express()
const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')    

    socket.on('join',({username, room}, callback) => {
        const {error, user} = addUser({id:socket.id, username, room})
        if (error){
            return callback(error)
        }

        socket.join(user.room)        
        socket.emit('message',generateMessage('Welcome','Admin'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`,user.username))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    })
        
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id)
        if (user){
            io.to(user.room).emit('message',generateMessage(message,user.username))
            callback()
        }        
    })
    socket.on('sendLocation',(coords, callback) => {
        const user = getUser(socket.id)
        if (user){
            io.to(user.room).emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=/${coords.latitude},${coords.longitude}`,user.username))
            callback('Location Shared!')
        }        
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!`,'Admin'))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, () =>{    
    console.log('app is running on port',port)
})