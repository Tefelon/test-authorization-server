import {IsEnum, IsNotEmpty, IsString, MaxLength} from "class-validator";

enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

export class CreateUsersDto {
    @IsNotEmpty({ message: 'Login is empty'})
    @IsString({ message: 'Login is not string'})
    @MaxLength(20, { message: 'Login is too long'})
    login: string;

    @IsNotEmpty({ message: 'Password is empty'})
    @IsString({ message: 'Password is not string'})
    @MaxLength(20, { message: 'Password is too long'})
    password: string;

    @IsNotEmpty({ message: 'Role is empty'})
    @IsEnum(Role,{ message: 'Role not "admin" or "user"'})
    role: Role
}

export class AuthUsersDTO {
    @IsNotEmpty({ message: 'Login is empty'})
    @IsString({ message: 'Login is not string'})
    @MaxLength(20, { message: 'Login is too long'})
    login: string;

    @IsNotEmpty({ message: 'Password is empty'})
    @IsString({ message: 'Password is not string'})
    @MaxLength(20, { message: 'Password is too long'})
    password: string;
}