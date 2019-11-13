const socket = io()
const messageButton = document.getElementById('send')
const sendLocationButton = document.getElementById('sendLocation')
const messageInput = document.getElementById('message')
const messages = document.getElementById('messages')
const messages_list = document.getElementById('messages_list')
const chatForm = document.getElementById('chatForm')

socket.on('welcome', (msg) => {
    document.getElementById('info').innerHTML = msg.text
})
socket.on('receiveMsg', (msg) => {
    const { text, createdAt, username } = msg
    timer = new Date(createdAt)
    messages_list.innerHTML = messages_list.innerHTML + `<li><span class="badge badge-primary">${username}</span> <span style="color: gray">${timer.getHours()}:${timer.getMinutes()}:${timer.getSeconds()}</span> <p>${text}</p></li>`
    messages.scrollTop = messages.scrollHeight;
})
socket.on('roomData', ({ roomName, data }) => {
    document.getElementById('roomName').innerHTML = roomName

    roomData = ''
    data.forEach(d => {
        roomData += `<li><span class="badge badge-warning">${d.username}</span></li>`
    })
    document.getElementById('roomData').innerHTML = roomData
})
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
socket.emit('sendWelcome', username, room, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const content = messageInput.value
    messageButton.disabled = true
    socket.emit('sendMsg', content, () => {
        messageButton.disabled = false
        messageInput.value = ''
        messageInput.focus()
    })
})
sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support Geolocation')
    }
    sendLocationButton.disabled = true
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('geoLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocationButton.disabled = false
        })
    })
})