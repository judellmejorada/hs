// Import required packages
const db = require("../../models");
const Users = db.Users;
const helper = require("../../helpers/helper.controller");
const bcrypt = require('bcrypt');


// Admin info - checked
exports.getAdminInfo = (req, res, next) => {
    const users_id = req.user.users_id;
    // Check a user if it is logged in 
    // check if user is admin
    helper.checkAuthorization(req, res, "Admin");
    
     Users.findOne({ where: { users_id: users_id } })
    .then((data) => {
      res.send({
        error: false,
        data: data,
        message: [process.env.SUCCESS_RETRIEVED],
      });
    })
    .catch((err) => {
      res.status(500).send({
        error: true,
        data: [],
        message:
          err.errors.map((e) => e.message) || process.env.GENERAL_ERROR_MSG,
      });
    });
};


// Update admin information - checked

exports.updateAdminInfo = (req, res, next) => {

  helper.checkAuthorization(req, res, 'Admin');

  // Check if user ID is existed in database
  db.Users
      .findByPk(req.user.users_id)
      .then((result) => {

          // If no result return empty response
          if(result == null) helper.emptyDataResponse(res, 'No Record has been identified');

          // Update a Admin info
          db.Users
              .update(req.body, {
                  where: {
                      users_id: req.user.users_id
                  }
              })
              .then(() => {

                  // Get Admin info
                  db.Users
                      .findByPk(req.user.users_id)
                      .then((data) => helper.dataResponse(res, data, 'A Record has been successfully updated', 'No changes in the record'))
                      .catch((err) => helper.errResponse(res, err));
              })
              .catch((err) => helper.errResponse(res, err));
  })
  .catch((err) => helper.errResponse(res, err));
}
