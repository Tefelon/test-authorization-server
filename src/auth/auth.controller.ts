import {
    Controller,
    Post,
    Body,
    Response,
    UsePipes,
    ValidationPipe,
    Request
} from '@nestjs/common';
import {Response as Res, Request as Req} from 'express';
import {AuthUsersDTO} from "../dto/auth.dto";
import {AuthService} from "./auth.service";
import {UpdateTokenDto} from "../dto/update-rt.dto";
import {ITokens} from "../interfaces/tokens.interface";


@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    @UsePipes(new ValidationPipe())
    @Post()
    async authentication(@Body() user: AuthUsersDTO, @Response() res: Res) {
        const newTokens = await this.authService.authenticationUser( user );

        return res.header('Authorization', `Bearer ${ newTokens.JWT }`).status(200).send({
            RT: newTokens.RT
        })
    }



    @UsePipes(new ValidationPipe())
    @Post('refresh')
    async updateTokens(@Body() body: UpdateTokenDto, @Request() req: Req, @Response() res: Res) {
        let JWT: string = req.header('Authorization');

        if (JWT) {
            JWT = JWT.slice(7)
        }
        const newTokens: ITokens = await this.authService.updateTokens({JWT, RT: body.RT} );
        return res.header('Authorization', `Bearer ${newTokens.JWT}`).send({ RT: newTokens.RT});
    }
}
