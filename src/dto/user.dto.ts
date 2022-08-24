import {IsEnum, IsNotEmpty, IsString, Matches, MaxLength} from "class-validator";

import { RoleUser } from '../interfaces/users.interface'

export class CreateUsersDto {
    @IsNotEmpty({ message: 'Login is empty'})
    @IsString({ message: 'Login is not string'})
    @MaxLength(20, { message: 'Login is too long'})
    @Matches(new RegExp('^[a-zA-Z][a-zA-Z0-9-_\\.]{3,20}$'), {
        message: 'Incorrect login format'
    })
    login: string;

    @IsNotEmpty({ message: 'Password is empty'})
    @IsString({ message: 'Password is not string'})
    @MaxLength(20, { message: 'Password is too long'})
    @Matches(new RegExp('^[a-zA-Z][a-zA-Z0-9-_\\.]{3,20}$'), {
        message: 'Incorrect password format'
    })
    password: string;

    @IsNotEmpty({ message: 'Role is empty'})
    @IsEnum(RoleUser,{ message: 'Role not "admin" or "user"'})
    role: RoleUser
}