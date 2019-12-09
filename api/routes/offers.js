const express = require('express')
const ROUTE = express.Router()

// handle upload unused
// const multer = require('multer');

const mongoose = require('mongoose');
const modOffers = require('../model/offers');
const modOrders = require('../model/orders');

const checkAuth = require('../middlewares/auth-check');


// ** TODO : standar messages **
ROUTE
  // posting a new offer
  .post('/', checkAuth, (req, res, next) => {
    let BODY = req.body;
    // get each param from a body object now instead of getting each seperately
    const model = new modOffers({
      _id: mongoose.Types.ObjectId(),
      "from": BODY.from,
      "to": BODY.to,
      "date": BODY.date,
      "time": BODY.time,
      "seats": BODY.seats,
      "user": req.tokenData.id
    });

    model.save()
      .then(result => {
        console.log(result);
        res.status(201).json(result);
      })
      .catch(error => {
        console.log(error);
        res.status(500).json(error)
      });

  })
  // listing all offers
  .get('/', (req, res, next) => {
    modOffers.find().populate({ path: 'user', select: "_id username" }).exec()
      .then(result => {
        if (result) {

          const response = {
            count: result.length,
            result: result.map(entry => {
              return {
                ...entry._doc
              }
            })
          }

          res.status(200).json(response);
        } else {
          res.status(404).json('no entry');
        }
      })
      .catch(error => res.status(500).json(error));
  })
  // Listing *the user's* offer
  .get('/own', checkAuth, (req, res, next) => {
    modOffers.find({ user: req.tokenData.id }).populate({ path: 'user', select: "_id username" }).exec()
      .then(result => {
        if (result) {

          const response = {
            count: result.length,
            result: result.map(entry => {
              return {
                ...entry._doc
              }
            })
          }

          res.status(200).json(response);
        }
      })
      .catch(error => res.status(500).json(error));
  })
  // Listing *all other's* offer
  .get('/others', checkAuth, (req, res, next) => {
    modOffers.find({
      user: {
        $ne: req.tokenData.id
      }
    }).populate({ path: 'user', select: "_id username" }).exec()
      .then(result => {
        if (result) {

          const response = {
            count: result.length,
            result: result.map(entry => {
              return {
                ...entry._doc
              }
            })
          }

          res.status(200).json(response);
        }
      })
      .catch(error => res.status(500).json(error));
  })
  // getting a specific offer
  .get('/offer/:oId', checkAuth, (req, res, next) => {
    let oId = req.params['oId']

    modOffers.findOne({ _id: oId }).exec()
      .then(result => {
        if (result) {

          const response = {
            result: result._doc
          }
          res.status(200).json(response);
        } else {
          res.status(404).json('no entry');
        }
      })
      .catch(error => res.status(500).json(error));

  })
  // deleting a specific offer *** Also delete accociated orders ***
  .delete('/offer/:oId', checkAuth, (req, res, next) => {
    let oId = req.params['oId'];

    modOrders.deleteMany({ offer: oId }).exec()
      .then(result => {
        // debugger;
        return modOffers.deleteOne({ '_id': oId }).exec();
      })
      .then(result => {
        // if(result)
        res.status(200).json(result);
      })
      .catch(error => {
        console.log(error);
        res.status(500).json(error)
      });

  })
  // modify offers
  .patch('/offer/:oId', checkAuth, (req, res, next) => {
    let oId = req.params['oId'];
    let BODY = req.body;

    let updateOps = {};
    for (const ops of BODY) {
      updateOps[ops.propName] = ops.value;
    }

    modOffers.updateOne(
      { _id: oId },
      {
        $set: updateOps
      }).exec()
      .then(result => {
        res.status(200).json(result);
      })
      .catch(error => {
        res.status(500).json(error);
      })

  });


module.exports = ROUTE