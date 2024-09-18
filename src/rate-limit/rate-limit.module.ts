import { Module } from '@nestjs/common';
import { RateLimitService } from './services/rate-limit.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RedisModule } from '../redis/redis.module'; // Adjust the import path as needed
import { RateLimitController } from './rate-limit.controller';

@Module({
  imports: [RedisModule],
  providers: [RateLimitService, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard],
  controllers: [RateLimitController],
})
export class RateLimitModule { }
