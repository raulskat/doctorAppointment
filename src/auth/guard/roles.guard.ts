// auth/guard/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    const { user } = context.switchToHttp().getRequest();

    if (!user || user.role !== requiredRole) {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
