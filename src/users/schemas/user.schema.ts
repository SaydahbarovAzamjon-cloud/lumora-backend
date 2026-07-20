import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuthProviderType, UserLocale } from '../../common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class AuthProvider {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(AuthProviderType),
  })
  type!: AuthProviderType;

  /** Provider subject / unique id (email local subject or Google `sub`). */
  @Prop({ required: true, trim: true })
  subject!: string;

  @Prop({ type: Date, required: true, default: () => new Date() })
  linkedAt!: Date;
}

export const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider);

/**
 * Account identity for email/password + Google OAuth (DATABASE.md §5.1, ADR-009).
 * passwordHash is never exposed via GraphQL.
 */
@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  })
  email?: string;

  /** bcrypt (or similar) hash only — never plaintext (DB-05). */
  @Prop({ type: String, required: false, select: false })
  passwordHash?: string;

  @Prop({ type: [AuthProviderSchema], required: true, default: [] })
  providers!: AuthProvider[];

  @Prop({ type: String, required: false, trim: true })
  displayName?: string;

  @Prop({
    type: String,
    required: false,
    enum: Object.values(UserLocale),
  })
  locale?: UserLocale;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index(
  { 'providers.type': 1, 'providers.subject': 1 },
  { unique: true },
);
UserSchema.index({ createdAt: 1 });
