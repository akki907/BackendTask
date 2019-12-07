const express = require('express');
const app = express();
const morgan = require('morgan')
const setting = require('./config/setting')
const mongoose = require('mongoose');
const port = process.env.PORT || setting.PORT;
const api = require('./api/index');
const bodyParser = require('body-parser');

//database 
mongoose
    .connect(setting.MONGOURL)
    .then(() => {
        console.log(`Database connected at ${setting.MONGOURL}`)
    })
    .catch(err => {
        console.log(err)
    })


//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(morgan('dev'));

//routes
app.use('/api', api);

app.get('/', (req, res) => {
    res.send(`Server is running on ${port}`)
})


//server
app.listen(port, () => {
    console.log(`server running on port ${port}`)
})