import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type AuthProviderType = 'email' | 'google';

@Schema({ _id: false })
export class AuthProvider {
  @Prop({ required: true, enum: ['email', 'google'] })
  type!: AuthProviderType;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true, default: () => new Date() })
  linkedAt!: Date;
}

export const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: false, select: false })
  passwordHash?: string;

  @Prop({ type: [AuthProviderSchema], default: [] })
  providers!: AuthProvider[];
  @Prop({ required: false, trim: true })
  displayName?: string;

  @Prop({ required: false, enum: ['en', 'ko', 'uz'] })
  locale?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { 'providers.type': 1, 'providers.subject': 1 },
  { unique: true },
);
