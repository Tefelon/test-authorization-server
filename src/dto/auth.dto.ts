import {IsNotEmpty, IsString, Matches, MaxLength} from "class-validator";


export class AuthUsersDTO {
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
}