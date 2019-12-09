const HTTP = require('http')
const APP = require('./app')

const PORT = process.env.BUR_PORT || 3004


const SERVER = HTTP.createServer(APP)

SERVER.listen(PORT)
console.log("Server Running, listening on " + PORT)