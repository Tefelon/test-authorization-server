import {Controller, Get, Param, Post, Put, Body, Response, UsePipes, ValidationPipe, Request} from '@nestjs/common';
import {Response as Res, Request as Req} from 'express';
import {AuthUsersDTO, CreateUsersDto} from "../dto/auth.dto";
import {AuthService} from "./auth.service";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    @UsePipes(new ValidationPipe())
    @Post()
    async authentication(@Body() user: AuthUsersDTO, @Response() res: Res) {
        console.log('userCont  ', user);

        let newJWT = await this.authService.authenticationUser( user );

        console.log('newJWT  ', newJWT);

        if (newJWT) {
            return res.header('Authorization', `Bearer ${ newJWT }`).status(200).send('OK')
        } else {
            return res.status(404).send('Incorrect Login or Password')
        }
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
            return res.header('Authorization', 'Bearer ' + resultCreate['jwt']).status(201).send({
                rt: resultCreate['refresh_token']
            })
        }
    }


    @Post()
    async updateRToken(@Body() rt: string, @Request() req: Req) {
        let jwt: string = req.header('Authorization');
    }

}
