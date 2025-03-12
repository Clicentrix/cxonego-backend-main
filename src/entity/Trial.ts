import {Entity,Column, PrimaryColumn, PrimaryGeneratedColumn, OneToOne, JoinColumn, BeforeInsert, BeforeUpdate} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { encryption, trialStatus } from "../common/utils";
import { User } from "./User";

@Entity()
export class Trial extends CustomBaseEntity{
    constructor(payload: Trial) {
        super();        
        Object.assign(this, { ...payload });
    }

    @PrimaryGeneratedColumn('uuid')
    trialId:string;
    
    @Column()
    amount:string;

    @Column({
        type:"datetime",
        nullable: true 
    })
    endDateTime:Date;

    @Column({
        type:"enum",
        enum:trialStatus,
        default:trialStatus.TRIAL_EXPIRED
      })
    trialstatus:trialStatus;

    @OneToOne(()=>User,(User)=>User.userId,{
        nullable: true 
    })    
    @JoinColumn({name:"userId"})
    userId:User;

    @BeforeInsert()
    @BeforeUpdate()
    encrypt() {
        if(this.amount) this.amount = encryption(this.amount);                         
    }
}