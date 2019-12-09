# BURide

for CS557.
BU's ride share(car pool) markup, server side. 
Handles front-end requests & database CRUD

## Port
Listening on port 3004



## Avaliable scripts

* npm start

Starts nodemon debugging

* node server.js

Run production version



## Environmental settup

*BUR_PORT*

For port listening.

This program utilizes mongoDB Atlas and Json Web Token.

**Atlas' connection string and JWT private key must be stored in environment varibles**

*BUR_PRV_KEY*

For private key

*MONGO_ATLAS_CSTRING*

For connection string