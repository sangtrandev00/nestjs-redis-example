import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../services/rate-limit.service';
import { RATE_LIMIT_KEY } from '../constants/rate-limit.constants';
import { RateLimitOptions } from '../interfaces/rate-limit-options.interface';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip; // Adjust based on your authentication method

    const isLimited = await this.rateLimitService.isRateLimited(
      userId,
      options,
    );
    if (isLimited) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
