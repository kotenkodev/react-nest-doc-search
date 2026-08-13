import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '../types/request.types';

@Injectable()
export class EmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const emailHeader = request.headers['x-user-email'];
    const email = Array.isArray(emailHeader) ? emailHeader[0] : emailHeader;

    if (!email) {
      throw new UnauthorizedException('Email is required');
    }

    request.email = email;

    return true;
  }
}
