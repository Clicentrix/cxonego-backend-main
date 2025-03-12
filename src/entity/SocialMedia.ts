import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Account } from "./Account";
import { CustomBaseEntity } from "./CustomBaseEntity";

@Entity()
export class SocialMedia extends CustomBaseEntity{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string;
    @Column()
    url:string;
    @ManyToOne(()=>Account,Account=>Account.socialMediaLink,{
        // onDelete:"CASCADE",
        onUpdate:"CASCADE"
    })
    @JoinColumn()
    account:Account;
}