import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuthProviderType,
  User,
  UserDocument,
} from './schemas/user.schema';

export type CreateEmailUserInput = {
  email: string;
  passwordHash: string;
  displayName?: string;
};

export type UpsertGoogleUserInput = {
  email: string;
  googleSubject: string;
  displayName?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  async findByProvider(
    type: AuthProviderType,
    subject: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ 'providers.type': type, 'providers.subject': subject })
      .exec();
  }

  async createEmailUser(input: CreateEmailUserInput): Promise<UserDocument> {
    const user = new this.userModel({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      providers: [
        {
          type: 'email',
          subject: input.email.toLowerCase(),
          linkedAt: new Date(),
        },
      ],
    });
    return user.save();
  }

  async upsertGoogleUser(
    input: UpsertGoogleUserInput,
  ): Promise<UserDocument> {
    const existingByGoogle = await this.findByProvider(
      'google',
      input.googleSubject,
    );
    if (existingByGoogle) {
      return existingByGoogle;
    }

    const email = input.email.toLowerCase();
    const existingByEmail = await this.findByEmail(email);
    if (existingByEmail) {
      const alreadyLinked = existingByEmail.providers.some(
        (p) => p.type === 'google' && p.subject === input.googleSubject,
      );
      if (!alreadyLinked) {
        existingByEmail.providers.push({
          type: 'google',
          subject: input.googleSubject,
          linkedAt: new Date(),
        });
        if (!existingByEmail.displayName && input.displayName) {
          existingByEmail.displayName = input.displayName;
        }
        return existingByEmail.save();
      }
      return existingByEmail;
    }

    const user = new this.userModel({
      email,
      displayName: input.displayName,
      providers: [
        {
          type: 'google',
          subject: input.googleSubject,
          linkedAt: new Date(),
        },
      ],
    });
    return user.save();
  }
}
