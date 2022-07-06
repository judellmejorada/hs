// import modules/packages
const express = require("express");
const dotenv = require("dotenv").config();
const db = require("./backend/src/models");
const jwt = require("jsonwebtoken");
const path = require("path");
var cors = require('cors');

//initialize app
var app = express();

// parse requests of content-type - application/json
app.use(express.json()); 

app.use(express.urlencoded({extended: true,}));

// For token secret
// console.log(require("crypto").randomBytes(64).toString("hex"));

db.sequelize
  .authenticate()
  .then(() => {console.log('Connection has been established successfully!');
  }).catch((error) => {console.error('Unable to connect to database:', error);})

  if (process.env.ALLOW_SYNC === "true"){
    // database synch
    db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
    .then (() =>{
        db.sequelize.sync ({ force: true})
        .then(() => console.log('Done adding/updating database based on the models'))
        .catch((error) => {console.log("Unable to add/update", error);})
        })
    .catch((error) => {console.log("Unable to connect", error);})
    }

  
//   Check PORT
const PORT = process.env.PORT || 5600;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
// all request will go here first (middleware)
app.use(cors())
app.use((req, res, next) => {
    // console.log("Request has been sent to " + req.url);
    next();
  });


// Authentication for TOKEN
// next - is for next function to run
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Bearer
  const token = authHeader && authHeader.split(" ") [1]

   // If token is null then send unauthorized response
   if (token == null) return res.status(401).send('No access token is detected.');
    
   // Verify the token, if not verified then forbidden
   jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

       // If token is not verified then send forbidden response
       if (err) {
           if(process.env.ENABLE_ACCESS_TOKEN_LOG === 'true') console.log(`${err}\n`);
           return res.sendStatus(403);
       }
       
       req.user = user;
       console.log(user);
       next();
   });
};

/*** ROUTES*/
// Images
app.use("/users-profile-pic", express.static(path.join(__dirname + "./backend/src/public/users_profile_pic")));
app.use("/featured_dentist", express.static(path.join(__dirname + "./backend/src/public/featured_dentist")));
app.use("/services", express.static(path.join(__dirname + "./backend/src/public/services")));
app.use("/branches", express.static(path.join(__dirname + "./backend/src/public/branches")));
// Home page
app.use(`${process.env.API_VERSION}/home`, require("./backend/src/routes/home.routes"));
// Register Page
app.use(`${process.env.API_VERSION}/register`, require ("./backend/src/routes/register.routes"));
// For log in page
app.use(`${process.env.API_VERSION}/login`, require ("./backend/src/routes/login.routes"));
//Service page
app.use(`${process.env.API_VERSION}/services`, require ("./backend/src/routes/service.routes"));

/** FOR FOUR USER TYPES ROUTEs */
// Authenticated Routes
//app.use(`${process.env.API_VERSION}/patient`, authenticateToken , require("./backend/src/routes/patient.routes"));
//app.use(`${process.env.API_VERSION}/staff`, authenticateToken , require("./backend/src/routes/staff.routes"));
app.use(`${process.env.API_VERSION}/dentist`, authenticateToken , require("./backend/src/routes/dentist.routes"));

/** Admin user route*/
app.use(`${process.env.API_VERSION}/admin`, authenticateToken , require("./backend/src/routes/admin.routes"));

