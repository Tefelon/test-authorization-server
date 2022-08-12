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
interface IJWTBody {
    id: number,
    role: string,
    exp: number
}
export interface ITokens {
    jwt: string,
    rt: string
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authRepository: Repository<AuthEntity>
    ) {}

    async authenticationUser( user: AuthUsersDTO ): Promise<ITokens> {
        console.log('user  ', user['login']);

        const findUser: AuthEntity = await this.authRepository.findOneByOrFail({
            login: user['login']
        })
        console.log('findUser  ', findUser);

        if (findUser.password === user.password) {
            const jwt = await this.createNewJWT( findUser );
            const rt = await this.createNewRT();
            await this.authRepository.update( findUser.id, {
                refresh_token: rt
            })
            return {
                jwt,
                rt
            }
        }
        throw new Error('Invalid password');
    }


    async createUser( newUser: CreateUsersDto): Promise<ITokens | string> {
        console.log('create ', newUser.login);

        const checkUser: AuthEntity | null = await this.authRepository.findOneBy({ login: newUser.login });
        console.log('checkUser', checkUser);

        if (!checkUser) {
            let createdUser = await this.authRepository.save( newUser );

            console.log('createdUser  ', createdUser);

            createdUser.key = this.createNewKey(20);
            const jwt: string = this.createNewJWT(createdUser);
            createdUser.refresh_token = this.createNewRT();
            await this.authRepository.save(createdUser);

            return {
                rt: createdUser.refresh_token,
                jwt
            }
        }
        return 'Login must be unique'
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
        const allKeys: string = headerKey + '.' + dataKey;
        const hash: string = Crypto.createHmac('sha256', user.key).update(allKeys).digest('hex');

        return allKeys + '.' + hash;
    }


    private createNewRT(): string {
        const expDate: string = Buffer.from( this.getExpirationDate(2592000).toString() ).toString('base64');
        const anyString: string = this.createNewKey(15);

        console.log('expDate  ', expDate, 'anyString  ', anyString);
        return expDate + anyString;
    }


    private getExpirationDate(exp: number = 0): number {
        return Math.round( +new Date() / 1000) + exp;
    }


    async updateTokens( rt: string ): Promise<ITokens> {
        const split_rt: string = rt.slice(0, 16);  //check expiration date
        const expiration: number = Number( Buffer.from(split_rt, 'base64').toString() );

        if (expiration < this.getExpirationDate()) {
            return { jwt: '', rt: ''}
        }
        const user = await this.authRepository.findOneBy({ refresh_token: rt });

        if (user) {
            const newJWT = await this.createNewJWT( user );
            const newRT = await this.createNewRT();
            await this.authRepository.update(user.id, {
                refresh_token: newRT
            })

            return {
                jwt: newJWT,
                rt: newRT
            }
        } else {
            return { jwt: '', rt: ''}
        }
    }


    async checkJWT(jwt: string): Promise<boolean> {
        const splitJWT: string[] = jwt.split('.');
        const bodyJWT: IJWTBody = this.JsonParse( Buffer.from(splitJWT[1], 'base64').toString('utf-8'), '');
        const user = await this.authRepository.findOneByOrFail({id: bodyJWT.id});

        console.log('user  ', user, 'bodyJWT  ', bodyJWT, 'splitJWT  ', splitJWT);

        if (user) {
            const allKeys: string = splitJWT[0] + '.' + splitJWT[1];
            const hash: string = Crypto.createHmac('sha256', user.key).update(allKeys).digest('hex');

            console.log('hash  ', hash);

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