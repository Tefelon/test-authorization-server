import {RoleUser} from "./users.interface";

export interface ITokens {
    JWT: string,
    RT: string
}

export interface IDataJWT {
    login: string,
    role: RoleUser,
    exp: number
}