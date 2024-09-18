import { Injectable } from '@nestjs/common';
import { RateLimitOptions } from '../interfaces/rate-limit-options.interface';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) { }

  async isRateLimited(
    userId: string,
    options: RateLimitOptions,
  ): Promise<boolean> {
    const { limit, windowSeconds } = options;
    const key = `ratelimit:${userId}`;
    const count = await this.redisService.get(key);

    console.log("count", count);

    if (!count) {
      await this.redisService.insert(key, '1');
      // We'll use the insert method with an expiration time instead of directly calling expire
      await this.redisService.insert(key, '1', windowSeconds);
      return false;
    }

    if (parseInt(count) >= limit) {
      return true;
    }

    await this.redisService.insert(key, (parseInt(count) + 1).toString());
    return false;
  }
}
