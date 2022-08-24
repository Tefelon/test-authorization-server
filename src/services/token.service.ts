import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/user.entity";
import {ConfigService} from "@nestjs/config";
import {RoleUser} from '../interfaces/users.interface';
import {IDataJWT} from "../interfaces/tokens.interface";
import {JsonParse, getExpirationDate} from "./helpers.service";

const Crypto = require('crypto');


export class TokenService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly configService: ConfigService) {
    }


    getUserKey(userLogin: string): string {
        const KEY = this.configService.get<string>('KEY');

        if (!KEY) {
            throw new SyntaxError("Invalid KEY");
        }
        const UserKey = Crypto.createHmac('sha256', KEY).update(userLogin).digest('hex');
        return UserKey
    }


    createNewJWT( login: string, role: RoleUser ): string {
        const userKey = this.getUserKey( login );
        let headerKey: string = JSON.stringify({
            alg: "HS256",
            typ: "JWT"
        })
        headerKey = Buffer.from( headerKey ).toString('base64');

        let dataKey: string = JSON.stringify({
            login,
            role,
            exp: Math.round( getExpirationDate( this.configService.get<number>('JWT.expirationTimeSec') ) )
        })
        dataKey = Buffer.from( dataKey ).toString('base64');
        const allKeys: string = headerKey + '.' + dataKey;
        const hash: string = Crypto.createHmac('sha256', userKey).update(allKeys).digest('hex');

        return allKeys + '.' + hash;
    }


    createNewRT( JWT: string ): string {
        const expDate: string = Buffer.from( getExpirationDate( this.configService.get<number>('RT.expirationTimeSec') ).toString() ).toString('base64');
        const anyString: string = this.createNewKey( this.configService.get<number>('JWT.middlePartLength') );
        const partJWT: string = JWT.slice( -this.configService.get<number>('JWT.middlePartLength') );

        return expDate + anyString + partJWT;
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


    hashPassword( login: string, password: string ): string {
        if (password.length > 0) {
            const userKey: string = this.getUserKey( login );

            if (!userKey) throw new SyntaxError('Incorrect Login');

            return Crypto.createHmac('sha256', userKey).update( password ).digest('hex');
        }
    }


    getDataFromJWT( JWT: string ): IDataJWT {
        const splitJWT: string[] = JWT.split('.');
        const bodyJWT: IDataJWT = JsonParse( Buffer.from(splitJWT[1], 'base64').toString('utf-8'), undefined);

        return bodyJWT;
    }
}