const EXPRESS = require('express');
const APP = EXPRESS();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const offerRoute = require('./api/routes/offers');
const orderRoute = require('./api/routes/orders');
const userRoute = require('./api/routes/users');

if (!process.env.MONGO_ATLAS_CSTRING) {
  console.error('Atlas Connection string not found. Exiting....');
  process.exit()
}

if (!process.env.BUR_PRV_KEY) {
  console.error('Private key not found. Exiting....');
  process.exit()
}

// database
// deprecation warnings suppressor
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// TODO: add password to env
mongoose.connect(process.env.MONGO_ATLAS_CSTRING, { useNewUrlParser: true });

// hosting static content
APP.use("/static", EXPRESS.static('./static'));
// body parsing
APP.use(bodyParser.urlencoded({ extended: false }));
APP.use(bodyParser.json());

// logging
APP.use(morgan('dev'));

// OLD CORS
// APP.use('/', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', '*');

//   if (req.method === 'OPTION') {
//     res.header('Access-Control-Allow-Method', "GET, PUT, POST, DELETE, PATCH");
//     return res.status(200).json({});
//   }
//   next();
// });

// new CORs
APP.use(cors());

// All Routers
APP.use('/offers', offerRoute);
APP.use('/orders', orderRoute);
APP.use('/user', userRoute);

APP.use('/server', (req, res, next) => {
  res.status(200).json('Server is running...');
});

// error handling
APP.use((req, res, next) => {
  // reachs this middle ware means page not found
  const error = new Error('Path Not Found');
  error['status'] = '404'
  next(error)
});

APP.use((error, req, res, next) => {
  // TODO: handle all error
  res.status(error.status || 500)
  res.json({
    status: 'error',
    errorCode: error['status'],
    message: error.message
  })
})

module.exports = APP