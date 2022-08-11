import {Controller, Get, Param, Post, Put, Body, Response, UsePipes, ValidationPipe, Request} from '@nestjs/common';
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
        console.log('userCont  ', user);

        const newTokens = await this.authService.authenticationUser( user );

        console.log('newJWT  ', newTokens);

        return res.header('Authorization', `Bearer ${ newTokens.jwt }`).status(200).send({
            rt: newTokens.rt
        })
    }


    @UsePipes(new ValidationPipe())
    @Post('create-user')
    async createUser(@Body() newUser: CreateUsersDto, @Response() res: Res) {

        let resultCreate = await this.authService.createUser( newUser );

        console.log('resultCreate  ', resultCreate);

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
        let jwt: string = req.header('Authorization').slice(7);
        console.log('jwt  ', jwt);
        const newTokens: ITokens = await this.authService.updateTokens( rt.rt );
        console.log('newTokens  ', newTokens);
        return res.header('Authorization', `Bearer ${newTokens.jwt}`).send({ rt: newTokens.rt});
    }
}
