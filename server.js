const HTTP = require('http')
const APP = require('./app')

const PORT = process.env.port || 3004


const SERVER = HTTP.createServer(APP)

SERVER.listen(PORT)
console.log("Server Running, listening at " + PORT)