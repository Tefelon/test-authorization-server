import {Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity()
export class AuthEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 20, unique: true })
    login: string

    @Column({ length: 20 })
    password: string

    @Column({ length: 5 })
    role: string

    @Column({ length: 20, default: "" })
    key: string

    @Column({default: ""})
    refresh_token: string
}