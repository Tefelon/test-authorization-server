import { Module } from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthEntity} from "./auth.entity";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([AuthEntity])],
    controllers:[AuthController],
    providers: [AuthService]
})
export class AuthModule {}
