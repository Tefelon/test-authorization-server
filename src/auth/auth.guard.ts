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
        let jwt: string = req.header('Authorization');

        if (jwt) {
            jwt = jwt.slice(7);
            return await this.authService.checkJWT( jwt );
        } else {
            throw new HttpException('JWT token absent', HttpStatus.BAD_REQUEST)
        }

    }
}