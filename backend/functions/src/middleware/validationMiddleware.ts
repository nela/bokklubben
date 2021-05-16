

import { Http400Error } from '../utils/errors/HttpErrors';

import { RequestHandler } from 'express';
import { ValidationError } from 'class-validator';
import { transformAndValidate } from 'class-transformer-validator';

function validationMiddleware<T>(Type: any): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      await transformAndValidate(Type, req.body);
      return next();
    } catch (errors) {
      if (errors.length > 0) {
        console.log(errors);
        const message = errors
          .map((error: ValidationError): string[] =>
            Object.values(error.constraints)
          )
          .join(', ');
        return next(new Http400Error(message));
      }
    }
  };
}

export default validationMiddleware;
