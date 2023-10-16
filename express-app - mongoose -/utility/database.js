const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://username:@cluster0.01rgffq.mongodb.net/app-name?retryWrites=true&w=majority&appName=app-name')
        .then(client => {
            console.log('connected to mongodb');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if(_db){
        return _db;
    }else{
        throw 'No Database';
    }
}

exports.getDb = getDb;
exports.mongoConnect = mongoConnect;