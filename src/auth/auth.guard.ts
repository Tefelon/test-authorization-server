import {CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly authService: AuthService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        return this.validateReq( req );
    }

    async validateReq( req ): Promise<boolean> {
        let JWT: string = req.header('Authorization');

        if (JWT) {
            JWT = JWT.slice(7);
            console.log(JWT);
            return await this.authService.checkJWT( JWT );
        } else {
            throw new HttpException('JWT token absent', HttpStatus.BAD_REQUEST)
        }
    }
}