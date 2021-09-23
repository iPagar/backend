import { Response, Request } from 'express';
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { Service } from 'typedi';

@Middleware({ type: 'after' })
@Service()
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: { httpCode: number; name: string; message: string; errors: any },
    _request: Request,
    response: Response
  ): void {
    const httpCode = error.httpCode || 500;
    const { name, message, errors } = error;

    response.status(httpCode).send({ name, message, errors });
  }
}
