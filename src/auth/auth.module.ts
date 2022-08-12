import { Module } from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthEntity} from "./auth.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AuthEntity])],
    controllers:[AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}
