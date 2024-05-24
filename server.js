const express = require("express")
require('dotenv').config();

const mongoose = require("mongoose")
const session = require("express-session")
var morgan = require('morgan')
const nocache = require("nocache")
const path = require("path")
require('./config/mongo')
const app = express()
const PORT = process.env.PORT || 4000
const { v4:uuidv4} = require('uuid')

const admin_route = require('./server/routes/admin_route')
const user_route = require('./server/routes/user_route')


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.use(morgan('tiny'))
app.use(nocache());
// app.use(bodyparser.json());
// app.use(bodyparser.urlencoded({extended:true}))




// while rendering

app.set("view engine", "ejs")

app.set('/views',path.join(__dirname,'views/user'))
app.set('/views',path.join(__dirname,'views/admin'))


//load static files (public/css)


app.use('/assets',express.static(path.join(__dirname,'public/assets_user')))
app.use('/user',express.static(path.join(__dirname,'views/user/')))
app.use('/assets_admin',express.static(path.join(__dirname,'public/assets_admin')))

app.use(session({
    secret: 'mysecretkey',
    saveUninitialized: false,
    resave: false,
}))

//session message storing


app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})



//route prefix
// app.use("", require("./routes/routes"))

app.use('/',user_route)
app.use('/',admin_route)





app.listen(PORT, (req, res) => {
    console.log(`the server is running on http://localhost:${PORT}`);
})