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
import {AuthUsersDTO, CreateUsersDto} from "../dto/auth.dto";
import {AuthService, ITokens} from "./auth.service";
import {UpdateTokenDto} from "../dto/update-rt.dto";


@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    @UsePipes(new ValidationPipe())
    @Post()
    async authentication(@Body() user: AuthUsersDTO, @Response() res: Res) {
        const newTokens = await this.authService.authenticationUser( user );

        return res.header('Authorization', `Bearer ${ newTokens.jwt }`).status(200).send({
            rt: newTokens.rt
        })
    }


    @UsePipes(new ValidationPipe())
    @Post('create-user')
    async createUser(@Body() newUser: CreateUsersDto, @Response() res: Res) {
        let resultCreate = await this.authService.createUser( newUser );

        if (typeof resultCreate === 'string') {
            return res.status(400).send( {
                message: resultCreate
            } );
        } else {
            return res.header('Authorization', 'Bearer ' + resultCreate.jwt).status(201).send({
                rt: resultCreate.rt
            })
        }
    }


    @UsePipes(new ValidationPipe())
    @Post('refresh')
    async updateTokens(@Body() rt: UpdateTokenDto, @Request() req: Req, @Response() res: Res) {
        let jwt: string = req.header('Authorization');

        if (jwt) {
            jwt = jwt.slice(7)
        }
        const newTokens: ITokens = await this.authService.updateTokens({jwt, rt: rt.rt} );
        return res.header('Authorization', `Bearer ${newTokens.jwt}`).send({ rt: newTokens.rt});
    }
}
