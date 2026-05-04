import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Always succeed — attach user if JWT is valid, null if not
  handleRequest(_err: any, user: any) {
    return user ?? null;
  }
}
