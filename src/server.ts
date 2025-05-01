import router from './router';
import cors from 'cors';
import express from 'express';
import 'dotenv/config';
import {connectDB} from './config/db';
import { corsConfig } from './config/cors';

const app = express();

connectDB();

app.use(cors(corsConfig))


app.use(express.json());

app.use('/', router);   // <== Use router

export default app;