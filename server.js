const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const https = require('https');
const fs = require('fs')

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Sutting Down...');
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config({ path: './config.env' })
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASS);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('Database connection successful'));

// const options = {
//     key: fs.readFileSync('./config/cert.key'),
//     cert: fs.readFileSync('./config/cert.crt')
// };

const port = process.env.PORT || 5000;

// create http server 
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// create https server 
// const server = https.createServer(options, app).listen(port, () => {
//     console.log(`App running on port ${port}...`);
// });

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Sutting Down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})  
