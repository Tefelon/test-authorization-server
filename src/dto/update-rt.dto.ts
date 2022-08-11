import {IsString, Length} from "class-validator";

export class UpdateTokenDto {
    @IsString()
    @Length(10)
    rt: string
}