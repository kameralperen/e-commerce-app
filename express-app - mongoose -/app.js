const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer');

app.set('view engine', 'pug');
app.set('views', './views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const accountRoutes = require('./routes/account');

const errorController = require('./controllers/errors');

const User = require('./models/user');

const connectionString = 'mongodb+srv://username:@cluster0.01rgffq.mongodb.net/app-name?retryWrites=true&w=majority&appName=app-name';

var store = new mongoDbStore({
    uri: connectionString,
    collection: 'mySessions'
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/img/');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: storage}).single('image'));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 36000000
    },
    store: store
}));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    if(!req.session.user){
        return next(); //burası true dönerse kullanıcı zaten giriş yapmamış, middleware kaldığı yerden devam etsin
    }

    User.findById(req.session.user._id)
        .then( user => {
            req.user = user;
            next();
        }).catch((err) => {
            console.log(err);
        });
});

app.use(csurf());


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(accountRoutes);

app.use('/500', errorController.get500Page);
app.use(errorController.get404Page);
app.use((error, req, res, next) => {
    res.status(500).render('error/500', {title: 'HATA!!!'})
});

mongoose.connect(connectionString)
    .then(() => {
        console.log('connected to mongodb');
        app.listen(3000);
    })
    .catch(err => { console.log(err)});
