import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthProviderType } from '../common/enums';
import { User, UserDocument } from './schemas/user.schema';
import { UserType } from '../schema/types/user.type';

export type CreateEmailUserInput = {
  email: string;
  passwordHash: string;
  displayName?: string;
};

export type UpsertGoogleUserInput = {
  googleSub: string;
  email?: string;
  displayName?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  toUserType(user: UserDocument): UserType {
    return {
      id: user.id,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      createdAt: user.createdAt,
    };
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .exec();
  }

  async findByGoogleSub(googleSub: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        providers: {
          $elemMatch: {
            type: AuthProviderType.GOOGLE,
            subject: googleSub,
          },
        },
      })
      .exec();
  }

  async createEmailUser(input: CreateEmailUserInput): Promise<UserDocument> {
    const email = input.email.toLowerCase().trim();
    return this.userModel.create({
      email,
      passwordHash: input.passwordHash,
      displayName: input.displayName?.trim() || undefined,
      emailVerified: false,
      tokenVersion: 0,
      providers: [
        {
          type: AuthProviderType.EMAIL,
          subject: email,
          linkedAt: new Date(),
        },
      ],
    });
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput): Promise<UserDocument> {
    const existingByGoogle = await this.findByGoogleSub(input.googleSub);
    if (existingByGoogle) {
      let dirty = false;
      if (!existingByGoogle.emailVerified) {
        existingByGoogle.emailVerified = true;
        dirty = true;
      }
      if (input.displayName && !existingByGoogle.displayName) {
        existingByGoogle.displayName = input.displayName;
        dirty = true;
      }
      if (dirty) {
        await existingByGoogle.save();
      }
      return existingByGoogle;
    }

    const email = input.email?.toLowerCase().trim();
    if (email) {
      const existingByEmail = await this.userModel.findOne({ email }).exec();
      if (existingByEmail) {
        const alreadyLinked = existingByEmail.providers.some(
          (p) =>
            p.type === AuthProviderType.GOOGLE && p.subject === input.googleSub,
        );
        if (!alreadyLinked) {
          existingByEmail.providers.push({
            type: AuthProviderType.GOOGLE,
            subject: input.googleSub,
            linkedAt: new Date(),
          });
        }
        existingByEmail.emailVerified = true;
        if (input.displayName && !existingByEmail.displayName) {
          existingByEmail.displayName = input.displayName;
        }
        await existingByEmail.save();
        return existingByEmail;
      }
    }

    return this.userModel.create({
      email: email || undefined,
      displayName: input.displayName?.trim() || undefined,
      emailVerified: true,
      tokenVersion: 0,
      providers: [
        {
          type: AuthProviderType.GOOGLE,
          subject: input.googleSub,
          linkedAt: new Date(),
        },
      ],
    });
  }

  async updatePasswordAndInvalidateSessions(input: {
    userId: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    const user = await this.findByIdOrFail(input.userId);
    user.passwordHash = input.passwordHash;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.passwordChangedAt = new Date();
    // Ensure email provider exists if they set a password via Google recovery.
    const hasEmailProvider = user.providers.some(
      (p) => p.type === AuthProviderType.EMAIL,
    );
    if (!hasEmailProvider && user.email) {
      user.providers.push({
        type: AuthProviderType.EMAIL,
        subject: user.email,
        linkedAt: new Date(),
      });
    }
    await user.save();
    return user;
  }
}
