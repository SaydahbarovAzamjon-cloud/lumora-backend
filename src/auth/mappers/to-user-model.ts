import { UserDocument } from '../../users/schemas/user.schema';
import { UserModel } from '../models/user.model';

export function toUserModel(user: UserDocument): UserModel {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName ?? null,
    createdAt: user.createdAt,
  };
}
