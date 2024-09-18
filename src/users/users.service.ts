import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { RedisService } from 'src/redis/redis.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) { }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Retrieves a user's profile from the cache or database.
   * 
   * This function first checks if the user's profile is cached. If it is, it returns the cached profile.
   * If not, it fetches the profile from the database, caches it, and then returns it.
   * 
   * @param userId The ID of the user whose profile is to be retrieved.
   * @returns The user's profile.
   */
  async getUserProfile(userId: string): Promise<User> {
    const cacheKey = `user-profile:${userId}`;
    const cachedProfile = await this.redisService.get(cacheKey);

    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }

    const userProfile = await this.userRepository.findOne({
      where: {
        id: userId
      }
    });
    await this.redisService.insert(cacheKey, JSON.stringify(userProfile), 3600); // Cache for 1 hour
    return userProfile;
  }


  async testCache() {
    const cacheKey = 'test-cache';
    const cachedValue = await this.redisService.get(cacheKey);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    try {

      const res = await new Promise((resolve, reject) => {
        const header = { headers: { Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0NTAzZTg4NS0xMWRiLTRkY2EtOGE1NS0yOTJmNWY4MTY2ZWIiLCJpYXQiOjE3MjY2NjQwMzIsImV4cCI6MTcyNjcwMDAzMn0.OWGgwO3hxamRDiZBvmmHtUe0AnO9nE1D5CAHWShIzxU' } }
        const request = this.httpService.post(`https://ntss-hr-api-dev.apetechs.co/transfer_employee_position/pagination_for_summary`, {
          skip: 0,
          take: 100,
          where: {}
        }, header)
        lastValueFrom(request)
          .then((res) => resolve(res.data))
          .catch((err) => reject(err.response))
      })

      const value = JSON.stringify(res);
      await this.redisService.insert(cacheKey, value, 3600); // Cache for 1 hour
      return JSON.parse(value);
    } catch (error) {
      console.log("error", error);
      throw error;
    }

  }
}
