import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../auth/user.entity';
interface RequestWithUser extends Request {
  user: User;
}

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext): User => {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
