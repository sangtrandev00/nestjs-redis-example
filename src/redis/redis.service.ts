import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { IORedisKey } from './redis.constants';

// Đến giờ vẫn chưa hiểu có những chỗ dùng @decorator inject, có những chỗ thì không dùng ? Tại sao vậy!
@Injectable()
export class RedisService {
  constructor(
    @Inject(IORedisKey)
    private redisClient: Redis,
  ) {}

  async getKeys(pattern?: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  async insert(
    key: string,
    value: string | number,
    expireInSeconds?: number,
  ): Promise<void> {
    if (expireInSeconds) {
      await this.redisClient.set(key, value, 'EX', expireInSeconds);
    } else {
      await this.redisClient.set(key, value);
      console.log(
        'this.redisClient.set(key, value)',
        await this.redisClient.set(key, value),
      );
    }
  }

  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async validate(key: string, value: string): Promise<boolean> {
    const storedValue = await this.redisClient.get(key);
    return storedValue === value;
  }
}
