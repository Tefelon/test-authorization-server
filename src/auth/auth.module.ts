import { Module } from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../user/user.entity";
import {TokenService} from "../services/token.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers:[AuthController],
    providers: [AuthService, TokenService],
    exports: [AuthService]
})
export class AuthModule {}
