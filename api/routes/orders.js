const express = require('express');
const ROUTE = express.Router();

const mongoose = require('mongoose');

const modOrders = require('../model/orders');
const modOffers = require('../model/offers');

const checkAuth = require('../middlewares/auth-check');
const ACCESS_BLOCKER = require('../middlewares/access-blocker');

ROUTE
  // posting a new order
  .post('/', checkAuth, (req, res, next) => {
    let BODY = req.body;

    const model = new modOrders({
      _id: mongoose.Types.ObjectId(),
      offer: BODY.offerID,
      seats: BODY.seats,
      user: req.tokenData.id
    });

    modOffers.findById(BODY.offerID).exec()
      .then((offerResult) => {

        if (!offerResult) {
          throw {
            message: 'Offer ID associated dose not exist.',
            status: 404
          }
        }

        if (offerResult.seats < BODY.seats) {
          throw {
            message: 'not enough seats for this order',
            status: 409
          }
        }

        return modOffers.findOneAndUpdate({
          '_id': BODY.offerID
        }, {
          'seats': offerResult.seats - BODY.seats
        }).exec();

      })
      .then(result => {
        model.save()
      })
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Order added"
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(error.status || 500).json(error);
      });
  })

  // getting a specific order *Base on it's offer*
  .get('/offer/:oId', checkAuth, (req, res, next) => {
    let oId = req.params['oId']

    modOrders.find({ offer: oId }).populate({ path: 'user' }).exec()
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

  // getting the token owner's order
  .get('/own', checkAuth, (req, res, next) => {
    let uId = req.tokenData.id

    modOrders.find({ user: uId }).populate('offer').exec()
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
          res.status(404).json({
            message: 'no entry'
          });
        }
      })
      .catch(error => res.status(500).json(error));

  })

  // ---- deprecated ---
  // deleting a specific order
  .delete('/order/:oId', ACCESS_BLOCKER, checkAuth, (req, res, next) => {
    let oId = req.params['oId'];

    // if()

    modOrders.findOne({ '_id': oId }).populate({ path: 'user offer' })
      .then((theOrder) => {

        if (!theOrder) {
          return res.status(404).json({
            message: "Order id not found."
          })
        }

        if (theOrder.user.id !== req.tokenData.id) {
          throw { message: "Can't delete other's order", status: 401 }

        }

        modOffers.findOneAndUpdate({
          '_id': theOrder.offer
        }, {
          $inc: {
            seats: theOrder.seats
          }
        }).exec();

        return theOrder.remove();

      })
      .then(result => {
        if (!result) {
          throw { message: 'Delete Order failed' }
        }
        res.status(200).json({
          message: 'Order deleted'
        });
      })
      .catch(error => {
        console.log(error);
        res.status(error.status || 500).json(error)
      });
  })

  // getting a specific order
  .get('/order/:oId', ACCESS_BLOCKER, checkAuth, (req, res, next) => {
    let oId = req.params['oId']

    modOrders.findOne({ _id: oId }).exec()
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

  // listing all orders
  .get('/', ACCESS_BLOCKER, checkAuth, (req, res, next) => {

    modOrders.find().populate('offer').populate({ path: 'user', select: 'username _id' }).exec()
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
          res.status(404).json({
            message: 'no entry found'
          });
        }
      })
      .catch(error => res.status(500).json(error));
  })

  .patch('/order/:oId', ACCESS_BLOCKER, checkAuth, (req, res, next) => {
    let oId = req.params['oId'];
    let body = req.body;

    let updateOps = {};
    for (const ops of body) {
      updateOps[ops.propName] = ops.value;
    }

    modOrders.updateOne(
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