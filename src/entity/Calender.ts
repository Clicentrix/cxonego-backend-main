import { Entity,PrimaryGeneratedColumn,Column, ManyToOne, JoinColumn,Index, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Organisation } from "./Organisation";
import { User } from "./User";
import { CalenderUser } from "./CalenderUser";
import { calenderStatus, encryption } from "../common/utils";
@Entity()
export class Calender extends CustomBaseEntity{
    constructor(payload: Calender) {
        super();        
        Object.assign(this, { ...payload });
    }
    @PrimaryGeneratedColumn('uuid')
    appointmentId:string;

    @Column()
    title:string;
    
    @Column({
        length : 2500,
        nullable:true
    })
    agenda:string;

    @Column({
        type:"datetime",
        nullable: true 
    })
    startDateTime:Date;

   @Column({
        type:"datetime",
        nullable: true 
    })
    endDateTime:Date;

    @Column({
        length : 2500,
        nullable:true
    })
    Notes:string; 

    @Column({
        default:"Appointment"
    })
    type :string;

    @Column({
        type:"enum",
        enum:calenderStatus, 
        default:calenderStatus.PENDING,
        nullable: false         
    })
    status:calenderStatus


    @ManyToOne(()=>User,{     
        eager:true
    })
    @JoinColumn({ name: "ownerId" })
    orgnizerId:User; 
  
    @ManyToOne(() => Organisation, (Organisation) => Organisation.organisationId, {
        cascade: true,
        // onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: true,
        eager:true
    })
    @JoinColumn({ name: "organizationId" })
    organization:Organisation;

    @OneToMany(()=>CalenderUser,CalenderUser=>CalenderUser.calender)
    calparticipaters:CalenderUser[];

}
