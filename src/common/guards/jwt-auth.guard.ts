import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const authHeader = req.headers.authorization;

      const bearer = authHeader?.split(" ")[0];
      const token = authHeader?.split(" ")[1];

      if (bearer !== "Bearer" || !token) {
        throw new UnauthorizedException({ message: "Not authenticated" });
      }

      const userFromToken = this.jwtService.verify(token, { secret: process.env.PRIVATE_KEY });

      req.user = userFromToken;
      return true;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException({ message: "Not authenticated" });
    }
  }

}