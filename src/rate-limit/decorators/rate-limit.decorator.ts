import { SetMetadata } from '@nestjs/common';
import { RATE_LIMIT_KEY } from '../constants/rate-limit.constants';
import { RateLimitOptions } from '../interfaces/rate-limit-options.interface';


// How to define and create a custom decorator in nestjs ?
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
