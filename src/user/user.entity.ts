import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {RoleUser} from "../interfaces/users.interface";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 20, unique: true })
    login: string

    @Column({ length: 100 })
    password: string

    @Column({ length: 5 })
    role: RoleUser

    @Column({default: ""})
    refresh_token: string
}