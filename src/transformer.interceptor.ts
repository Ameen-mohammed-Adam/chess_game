import { ResponseInterface } from './Response';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === 'object' && value !== null;

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseInterface<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseInterface<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<{ statusCode: number }>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: T): ResponseInterface<T> => {
        // 1. Turn class instances into plain objects safely
        const transformedData: unknown = instanceToPlain(data);
        const plainData = isPlainObject(transformedData)
          ? transformedData
          : { value: transformedData };

        // 2. Check if the controller already returned a custom message/data structure
        const message =
          typeof plainData.message === 'string'
            ? plainData.message
            : 'Request successful';
        const actualData =
          plainData?.data !== undefined ? plainData.data : plainData;

        // 3. Return the strictly typed response matching our interface
        return {
          success: true,
          statusCode,
          message,
          data: actualData as T,
        };
      }),
    );
  }
}
