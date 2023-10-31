require('dotenv').config()
const express = require('express');
const cors = require('cors');
const server = express();
const PORT = process.env.PORT || 3000
const isProduction = process.env.ENV === 'PRODUCTION';

server.use(cors())

server.use(express.json())

server.use('/api',require('./routes'))

if (isProduction) server.use(express.static(`${__dirname}/www`));

server.get('*',(req,res)=>{
    if (isProduction)
        return res.sendFile(`${__dirname}/www/index.html`);
    res.end(`<h1>Backend server is startd.</h1>`);  
})

server.listen(PORT,(req,res)=>{
    console.log(`Server started at port ${PORT} ${process.env.ENV}`)
})