import {HttpException, HttpStatus, Injectable, UseFilters} from "@nestjs/common";
import {Repository} from "typeorm";
const Crypto = require('crypto');
import {InjectRepository} from "@nestjs/typeorm";
import {AuthUsersDTO} from "../dto/auth.dto";
import {AllExceptionFilter} from "../exception-filters/exception.filter";
import {IDataJWT, ITokens} from "../interfaces/tokens.interface";
import {UserEntity} from "../user/user.entity";
import {TokenService} from "../services/token.service";
import {ConfigService} from "@nestjs/config";
import {JsonParse, getExpirationDate} from "../services/helpers.service";



@UseFilters(AllExceptionFilter)
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService
    ) {}

    async authenticationUser( user: AuthUsersDTO ): Promise<ITokens> {
        const findUser: UserEntity = await this.userRepository.findOneBy({
            login: user['login']
        })
        if (!findUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const password = this.tokenService.hashPassword( user.login, user.password );

        if (findUser.password === password) {
            const JWT = this.tokenService.createNewJWT( findUser.login, findUser.role );
            const RT = await this.tokenService.createNewRT( JWT );
            await this.userRepository.update( findUser.id, {
                refresh_token: RT
            })
            return {
                JWT,
                RT
            }
        }
        throw new HttpException('Invalid password', HttpStatus.NOT_FOUND);
    }


    async updateTokens( tokens: ITokens ): Promise<ITokens> {
        const splitRT: string = tokens.RT.slice(0, 16);  //check expiration date
        const expiration: number = Number( Buffer.from(splitRT, 'base64').toString() );

        if (expiration < getExpirationDate()) {
            throw new HttpException('RT token is expired', HttpStatus.NOT_ACCEPTABLE)
        }

        const ConfigJWTEndPartLength = this.configService.get<number>('JWT.endPartLength');

        if (tokens.JWT.slice( -ConfigJWTEndPartLength ) !== tokens.RT.slice( -ConfigJWTEndPartLength )) {
            throw new HttpException('Invalid tokens', HttpStatus.NOT_ACCEPTABLE)
        }
        const dataKeyJWT: IDataJWT = this.tokenService.getDataFromJWT( tokens.JWT );
    console.log('dataKeyJWT   ', dataKeyJWT);
        const user = await this.userRepository.findOneBy({
            login: dataKeyJWT.login,
            refresh_token: tokens.RT
        });

        if (user) {
            const newJWT = await this.tokenService.createNewJWT( user.login, user.role );
            const newRT = await this.tokenService.createNewRT( newJWT );
            await this.userRepository.update(user.id, {
                refresh_token: newRT
            })

            return {
                JWT: newJWT,
                RT: newRT
            }
        }
        throw new HttpException('Not an actual refresh-token', HttpStatus.NOT_ACCEPTABLE)
    }


    async checkJWT(jwt: string): Promise<boolean> {
        const splitJWT: string[] = jwt.split('.');
        const bodyJWT: IDataJWT = JsonParse( Buffer.from(splitJWT[1], 'base64').toString('utf-8'), '');

        if (bodyJWT.exp <= getExpirationDate()) {
            return false
        }
        const user = await this.userRepository.findOneBy({login: bodyJWT.login});

        if (user) {
            const allKeys: string = splitJWT[0] + '.' + splitJWT[1];
            const userKey: string = this.tokenService.getUserKey( user.login );
            const hash: string = Crypto.createHmac('sha256', userKey ).update(allKeys).digest('hex');

            if (hash === splitJWT[2]) {
                return true
            }
        }
        return false
    }
}