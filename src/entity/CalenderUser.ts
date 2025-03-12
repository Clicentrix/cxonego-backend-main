import { Entity,PrimaryGeneratedColumn,Column, ManyToOne, JoinColumn,Index } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Calender } from "./Calender";
import { User } from "./User";
@Entity()
export class CalenderUser extends CustomBaseEntity{
    constructor(payload: CalenderUser) {
        super();        
        Object.assign(this, { ...payload });
    }
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ManyToOne(() => Calender, (Calender) => Calender.calparticipaters, {
        cascade: true,
        // onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: true,
        eager:true
    })
    @JoinColumn()
    calender:Calender;

    @ManyToOne(() => User, (User) => User.userId, {
        cascade: true,
        // onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: true,
        eager:true
    })
    @JoinColumn()
    participent:User;  
        
    @Column({ default : null})
    email:string;
    
    @Column({ default : null})
    firstName:string;

    @Column({ default : null})
    lastName:string;

}
