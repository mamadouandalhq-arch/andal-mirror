import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import argon from 'argon2';
import { GoogleProfileDto } from '../auth/google/dto';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
    const user = await this.getOneByGoogleId(dto.googleId);

    if (user) {
      return user;
    }

    return await this.createGoogleUser(dto);
  }

  async getOneByGoogleId(googleId: string) {
    return await this.prisma.user.findUnique({
      where: {
        google_id: googleId,
      },
    });
  }

  async getOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  private async createGoogleUser({
    email,
    firstName,
    lastName,
    googleId,
  }: GoogleProfileDto) {
    return await this.prisma.user.create({
      data: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        google_id: googleId,
      },
    });
  }
}
