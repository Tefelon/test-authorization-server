import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
const Crypto = require('crypto');
import {AuthEntity} from "./auth.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {AuthUsersDTO, CreateUsersDto} from "../dto/auth.dto";

interface IAuthEntity {
    id?: number,
    login: string,
    password: string,
    role: string,
    key?: string,
    refresh_token?: string,
    jwt?: string
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authRepository: Repository<AuthEntity>
    ) {}

    async authenticationUser( user: AuthUsersDTO ): Promise<string> {
        console.log('user  ', user['login']);

        let findUser: AuthEntity | null = await this.authRepository.findOneBy({
            login: user['login']
        })
        console.log('findUser  ', findUser);

        if (findUser) {
            if (findUser.password === user.password) {
                return await this.createNewJWT( findUser );
            } else {
                return ""
            }
        } else {
            return ""
        }
    }


    async createUser( newUser: CreateUsersDto) {
        console.log('create ', newUser.login);

        let checkUser = await this.authRepository.findOneBy({ login: newUser.login });
        console.log('checkUser', checkUser);

        if (!checkUser) {
            let createdUser: AuthEntity = await this.authRepository.save( newUser );

            console.log('createdUser  ', createdUser);

            createdUser.key = this.createNewKey(20);
            const jwt: string = this.createNewJWT(createdUser);
            createdUser.refresh_token = this.createNewRT(jwt);

            await this.authRepository.save(createdUser);
            return {
                rt: createdUser.refresh_token,
                jwt
            }
        }
        return "User with this login already exists"
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
            exp: Math.round(this.getExpirationDate(900) )
        })
        dataKey = Buffer.from( dataKey ).toString('base64');

        const hash: string = Crypto.createHmac('sha256', user.key).update(headerKey).update(dataKey).digest('hex');

        return headerKey + "." + dataKey + "." + hash;
    }


    private createNewRT(jwt: string): string {
        const expDate: string = Buffer.from( this.getExpirationDate(2592000).toString() ).toString('base64');
        const anyString: string = this.createNewKey(10);
        const jwtEnd: string = jwt.slice(-6);

        console.log('expDate  ', expDate, 'anyString  ', anyString, 'jwtEnd  ', jwtEnd);
        return expDate + anyString + jwtEnd;
    }


    private getExpirationDate(exp: number = 0): number {
        return Math.round( +new Date() / 1000) + exp;
    }


    async checkCorrectRT(jwt: string, rt: string) {
        let split_rt: string = rt.slice(0, 8);  //check expiration date
        let expiration: number = Number( Buffer.from(split_rt[0], 'base64').toString() );

        if (expiration < this.getExpirationDate()) {
            return false
        }


    }
}