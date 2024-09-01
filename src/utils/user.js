const users = []

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'username and room are required!'
        }
    }

    //Check for existing method
    const exisitngUser = users.find((user) => {
        return user.room === room && user.username === username
    }) 

    //validate username
    if (exisitngUser) {
        return {
            error:'username in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)    
}

const getUserInRoom = (room) => {
   return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom

} 