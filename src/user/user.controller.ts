import {Body, Controller, Post, Response, UsePipes, ValidationPipe} from "@nestjs/common";
import {CreateUsersDto} from "../dto/user.dto";
import {Response as Res} from "express";
import {UserService} from "./user.service";

@Controller('user')
export class UserController {


    constructor(private readonly userService: UserService) {
    }


    @UsePipes(new ValidationPipe())
    @Post('')
    async createUser(@Body() newUser: CreateUsersDto, @Response() res: Res) {

        console.log('newUser  ', newUser );
        let resultCreate = await this.userService.createUser( newUser );

        if (typeof resultCreate === 'string') {
            return res.status(400).send( {
                message: resultCreate
            } );
        } else {
            return res.header('Authorization', 'Bearer ' + resultCreate.JWT).status(201).send({
                RT: resultCreate.RT
            })
        }
    }
}