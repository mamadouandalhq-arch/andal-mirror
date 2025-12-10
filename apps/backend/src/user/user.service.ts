import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import argon from 'argon2';
import { GoogleProfileDto } from '../auth/google/dto';
import { CreateUserDto, UpdateUserDto } from './dto';
import omit from 'lodash/omit';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return omit(user, 'password') as Omit<User, 'password'>;
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    return omit(newUser, ['password']) as Omit<User, 'password'>;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.getOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await argon.hash(createUserDto.password);

    return this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });
  }

  async getOrCreateGoogleUser(dto: GoogleProfileDto) {
    const user = await this.getOneByEmail(dto.email);

    if (user) {
      await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          googleId: dto.googleId,
        },
      });

      return user;
    }

    return await this.createGoogleUser(dto);
  }

  async getOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  private getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  private async createGoogleUser(dto: GoogleProfileDto) {
    return await this.prisma.user.create({
      data: dto,
    });
  }
}
