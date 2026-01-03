import { HttpException, HttpStatus } from "@nestjs/common";


/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
require('dotenv').config({
    path: path.resolve(`${__dirname}/../../.env`),
});
export const {
    CORS_ORIGIN_WHITELIST,
    PORT,
    ENCRYPTION_ALGORITHM,
    ENCRYPTION_KEY,
} = process.env;

const corsWhitelist = CORS_ORIGIN_WHITELIST?.split(';') ?? [];
export const corsOptions = {
    origin: (origin: string, callback: (error: any, allow?: boolean) => void) => {
        // Allow requests with no origin (like same-origin requests or server-to-server requests from API gateway)
        if (!origin || corsWhitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new HttpException(`${origin} is not allowed by CORS policy`, HttpStatus.INTERNAL_SERVER_ERROR));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};