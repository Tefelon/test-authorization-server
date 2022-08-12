import {HttpException, HttpStatus, Injectable, UseFilters} from "@nestjs/common";
import {Repository} from "typeorm";
const Crypto = require('crypto');
import {AuthEntity} from "./auth.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {AuthUsersDTO, CreateUsersDto} from "../dto/auth.dto";
import {AllExceptionFilter} from "../exception-filters/exception.filter";


interface IJWTBody {
    id: number,
    role: string,
    exp: number
}
export interface ITokens {
    jwt: string,
    rt: string
}


@UseFilters(AllExceptionFilter)
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authRepository: Repository<AuthEntity>
    ) {}

    async authenticationUser( user: AuthUsersDTO ): Promise<ITokens> {
        const findUser: AuthEntity = await this.authRepository.findOneBy({
            login: user['login']
        })
        if (!findUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (findUser.password === user.password) {
            const jwt = await this.createNewJWT( findUser );
            const rt = await this.createNewRT( jwt );
            await this.authRepository.update( findUser.id, {
                refresh_token: rt
            })
            return {
                jwt,
                rt
            }
        }
        throw new HttpException('Invalid password', HttpStatus.NOT_FOUND);
    }


    async createUser( newUser: CreateUsersDto): Promise<ITokens | string> {
        const checkUser: AuthEntity = await this.authRepository.findOneBy({ login: newUser.login });

        if (!checkUser) {
            let createdUser = await this.authRepository.save( newUser );
            createdUser.key = this.createNewKey(20);
            const jwt: string = this.createNewJWT(createdUser);
            createdUser.refresh_token = this.createNewRT( jwt );
            await this.authRepository.save(createdUser);

            return {
                rt: createdUser.refresh_token,
                jwt
            }
        }
        throw new HttpException('Login must be unique', HttpStatus.CONFLICT)
    }


    private createNewKey( lengthKey: number ): string {
        const variantSymbols: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let userKey: string = "";
        lengthKey = Math.round(lengthKey);

        for (let i = 0; i < lengthKey; i++ ) {
            userKey += variantSymbols[ Math.floor(Math.random() * variantSymbols.length) ]
        }
        return userKey
    }


    private createNewJWT( user: AuthEntity ): string {
        let headerKey: string = JSON.stringify({
            alg: "HS256",
            typ: "JWT"
        })
        headerKey = Buffer.from( headerKey ).toString('base64');

        let dataKey: string = JSON.stringify({
            id: user.id,
            role: user.role,
            exp: Math.round(this.getExpirationDate(300) )
        })
        dataKey = Buffer.from( dataKey ).toString('base64');
        const allKeys: string = headerKey + '.' + dataKey;
        const hash: string = Crypto.createHmac('sha256', user.key).update(allKeys).digest('hex');

        return allKeys + '.' + hash;
    }


    private createNewRT( jwt: string ): string {
        const expDate: string = Buffer.from( this.getExpirationDate(600).toString() ).toString('base64');
        const anyString: string = this.createNewKey(15);
        const partJWT: string = jwt.slice(-6);

        return expDate + anyString + partJWT;
    }


    private getExpirationDate(exp: number = 0): number {
        return Math.round( +new Date() / 1000) + exp;
    }


    async updateTokens( tokens: ITokens ): Promise<ITokens> {
        const split_rt: string = tokens.rt.slice(0, 16);  //check expiration date
        const expiration: number = Number( Buffer.from(split_rt, 'base64').toString() );

        if (expiration < this.getExpirationDate()) {
            throw new HttpException('RT token is expired', HttpStatus.NOT_ACCEPTABLE)
        }

        if (tokens.jwt.slice(-6) !== tokens.rt.slice(-6)) {
            throw new HttpException('Invalid tokens', HttpStatus.NOT_ACCEPTABLE)
        }
        const user = await this.authRepository.findOneBy({ refresh_token: tokens.rt });

        if (user) {
            const newJWT = await this.createNewJWT( user );
            const newRT = await this.createNewRT( newJWT );
            await this.authRepository.update(user.id, {
                refresh_token: newRT
            })

            return {
                jwt: newJWT,
                rt: newRT
            }
        }
        throw new HttpException('Not an actual refresh-token', HttpStatus.NOT_ACCEPTABLE)
    }


    async checkJWT(jwt: string): Promise<boolean> {
        const splitJWT: string[] = jwt.split('.');
        const bodyJWT: IJWTBody = this.JsonParse( Buffer.from(splitJWT[1], 'base64').toString('utf-8'), '');

        if (bodyJWT.exp <= this.getExpirationDate()) {
            return false
        }
        const user = await this.authRepository.findOneBy({id: bodyJWT.id});

        if (user) {
            const allKeys: string = splitJWT[0] + '.' + splitJWT[1];
            const hash: string = Crypto.createHmac('sha256', user.key).update(allKeys).digest('hex');

            if (hash === splitJWT[2]) {
                console.log('true')
                return true
            }
        }
        return false
    }


    private JsonParse (json: string, replacement: any): any {
        let outJsonParse: string;

        try {
            outJsonParse = JSON.parse(json);
            if (outJsonParse === undefined || outJsonParse === null) {
                outJsonParse = replacement;
            }
        } catch (e) {
            outJsonParse = replacement;
        }
        return outJsonParse;
    }
}