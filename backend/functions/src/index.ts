import express from 'express';
import * as functions from 'firebase-functions';
import compression from 'compression';
import cors from "cors";
import bodyParser = require('body-parser');
import "reflect-metadata";

import { Controllers, ControllerBase } from "./controllers/index";
import errorMiddleware from './middleware/errorMiddleware';

process.on("uncaughtException", (error): any => {
    console.log(error);
    process.exit(1);
});
  
process.on("unhandledRejection", (error): any => {
    console.log(error);
    process.exit(1);
});

const app = express();

// Initialize Middleware from Libraries
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));

// Initialize Controllers
Controllers.forEach((c: ControllerBase): void => {
    app.use("/", c.router)
})

// Initialize local Middleware (has to be last)
app.use(errorMiddleware);

exports.api = functions.region("europe-west1").https.onRequest(app);

