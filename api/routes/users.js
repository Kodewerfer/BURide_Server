const express = require('express');
const ROUTE = express.Router();

const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const mongoose = require('mongoose');
const modUsers = require('../model/user');

const ACCESS_BLOCKER = require('../middlewares/access-blocker');

ROUTE
  .post('/login', (req, res, next) => {
    const BODY = req.body;

    modUsers.findOne({ "username": BODY.username }).exec()
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: 'No User'
          });
        }

        // password check + JWT
        bcrypt.compare(BODY.password, user.password, (err, result) => {
          if (!result) {
            return res.status(401).json({
              message: 'Auth Failed'
            });
          }

          if (result) {

            const token = JWT.sign({
              "username": user.username,
              "id": user._id,
              "isAdmin": user.isAdmin
            },
              process.env.BUR_PRV_KEY,
              {
                "expiresIn": "1h"
              });

            return res.status(200).json({
              message: "login success",
              token: token
            });
          }

          return res.status(500);
        });



      })
      .catch(error => res.status(500).json(error));

  })
  .post('/signup', (req, res, next) => {
    const BODY = req.body;

    // check if username duplicated.
    modUsers.find({ 'username': BODY.username }).exec()
      .then((res) => {
        if (res.length) {
          throw new Error('userDuplication');
        }
        return true;
      })
      .then(() => {
        // hash the password before storing
        bcrypt.hash(BODY.password, 10, (err, hash) => {
          if (err) {
            throw err
          }
          const newUser = new modUsers({
            _id: mongoose.Types.ObjectId(),
            'username': BODY.username,
            'password': hash
          });

          newUser.save()
            .then(() => {
              res.status(200).json({
                message: 'user created',
              });
            })
            .catch((err) => res.status(500).json(err))
        })
      })
      .catch((error) => {
        if (error.message === 'userDuplication') {
          return res.status(409).json({
            message: 'user already exists'
          });
        }
        return res.status(500).json(error);
      });


  })  

  // ---- deprecated ----
  .get('/', ACCESS_BLOCKER, (req, res, next) => {
    modUsers.find().exec()
      .then((result) => {
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
      .catch();
  })
  .delete('/:uID', ACCESS_BLOCKER, (req, res, next) => {
    const uID = req.params['uID'];

    modUsers.findByIdAndRemove({ _id: uID }).exec()
      .then((result) => {
        res.status(200).json("user deleted");
      })
      .catch(error => res.status(500).json(error));
  });



module.exports = ROUTE