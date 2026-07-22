import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleLoginInput } from './dto/google-login.input';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthPayload } from './models/auth-payload.model';
import { UserModel } from './models/user.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  register(
    @Args('input') input: RegisterInput,
  ): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload)
  loginWithGoogle(
    @Args('input') input: GoogleLoginInput,
  ): Promise<AuthPayload> {
    return this.authService.loginWithGoogle(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  logout(): boolean {
    return this.authService.logout();
  }

  @Query(() => UserModel)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: UserModel): Promise<UserModel> {
    return this.authService.me(user.id);
  }
}
