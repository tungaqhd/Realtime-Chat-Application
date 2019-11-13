const generateMessage = (text, username) => {
    return {
        text,
        createdAt: Date.now(),
        username
    }
}

module.exports = {
    generateMessage
}