


import { Controller, Get, UseGuards } from '@nestjs/common';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimit } from './decorators/rate-limit.decorator';


@Controller('rate-limit')
@UseGuards(RateLimitGuard)
export class RateLimitController {
    @Get()
    @RateLimit({ limit: 5, windowSeconds: 10 })
    getRateLimited(): string {
        return 'You have been rate limited';
    }
}
