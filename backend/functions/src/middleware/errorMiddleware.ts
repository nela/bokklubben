import { HttpError } from '../utils/errors/HttpErrors';

import { Request, Response, NextFunction } from 'express';

function errorMiddleware(
    error: HttpError,
    req: Request,
    res: Response, 
    next: NextFunction
): void {
    const status = error.status || 500;
    const message = error.message || 'Something went terribly wrong';
    res.status(status).json({ status, message });
}

export default errorMiddleware;
