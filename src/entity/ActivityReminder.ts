import {Entity,Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Activity } from "./Activity";
@Entity()
export class ActivityRemainder extends CustomBaseEntity{
    constructor(payload: ActivityRemainder) {
        super();
        Object.assign(this, { ...payload });
      }
	  
    @PrimaryGeneratedColumn('uuid')
    notificationId : string;
      
    @Column({
        nullable: true
    })
    fcmWebToken:string;

    @Column({
        nullable: true
    })
    fcmAndroidToken:string;

    @Column({
        nullable: true
    })
    activitySubject:string;

    @Column({
        type:"text",
        nullable: true
    })
    description:string;

    @Column({
        type:"datetime",
        nullable: true 
    })
    notificationDateTime:Date;

    @ManyToOne(() => Activity, (Activity) => Activity.reminders, {
        cascade: true,        
        onUpdate: "CASCADE",
        nullable: true,
    })
    @JoinColumn({name:"activityId"})
    activity:Activity;

}