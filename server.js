'use strict';
// Requires //
const express = require('express');
const corsSetup = require('./controllers/corsSetup');
const dbConnection = require('./mongodb/dbConnection');
const bodyParser = require('body-parser');
const expressFileUpload = require('express-fileupload');

const authRouter = require('./routers/authRouter');
const authController = require('./controllers/authController');
const productsRouter = require('./routers/productsRouter');
const uActivityRouter = require('./routers/userActivityRouter');
const cartRouter = require('./routers/cartRouter');
const orderRouter = require('./routers/orderRouter');

// create express server
const server = express();
const PORT = process.env.PORT || 4000;

// connect mongodb via mongoose
dbConnection.connect();

/*** middlewares ***/
// log any request
server.use((req, res, next) => {
    // traffic statistics and analytics go here - for now just log them requests
    console.log('requested url is', req.url);
    next();
})

// cors and parsers
server.use(corsSetup)
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(expressFileUpload());

// Routing
server.use("/auth", authRouter);
server.use("/api", authController.verifyToken);
server.use("/api/products", productsRouter);
server.use("/api/useractivity", uActivityRouter);
server.use("/api/cart", cartRouter);
server.use("/api/orders", orderRouter);

//Port listening
server.listen(PORT, () => {
    console.log(`Server listening on port : ${PORT}`);
});