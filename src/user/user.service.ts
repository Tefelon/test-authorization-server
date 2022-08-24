import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {CreateUsersDto} from "../dto/user.dto";
import {UserEntity} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ITokens} from "../interfaces/tokens.interface";
import {TokenService} from "../services/token.service";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly tokenService: TokenService) {
    }

    async createUser( newUser: CreateUsersDto): Promise<ITokens | string> {
        const checkUser: UserEntity = await this.userRepository.findOneBy({ login: newUser.login });

        if (!checkUser) {
            const JWT: string = this.tokenService.createNewJWT( newUser.login, newUser.role );
            const RT: string = this.tokenService.createNewRT( JWT );
            newUser.password = this.tokenService.hashPassword( newUser.login, newUser.password );

            await this.userRepository.save( {
                ...newUser,
                refresh_token: RT
            } );

            return {
                RT,
                JWT
            }
        }
        throw new HttpException('Login must be unique', HttpStatus.CONFLICT)
    }
}