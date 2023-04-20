const path = require('path')
const mongoose = require('mongoose')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const index = require('./routes/index')
const session = require('express-session')
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(express.json()) // Won't parse JSON data sent to server without this
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false}))

app.use('/', index.routes)

//app.use((req, res, next) => {
    //  res.status(404).render('404', { pageTitle: 'Page Not Found' });
//});

mongoose.set('strictQuery', true)
mongoose.connect('mongodb+srv://Dude:perfect@cluster0.8uxojsl.mongodb.net/?retryWrites=true&w=majority')
    .then(res => {
        app.listen(3000)
        console.log("connected!")
    })
    .catch(err => {
        console.log('Mongoose connection error: ' + err)
    })