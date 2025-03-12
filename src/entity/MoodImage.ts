import {Entity,PrimaryGeneratedColumn,Column, OneToOne, JoinColumn} from "typeorm";
import { moodCategory } from "../common/utils";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { User } from "./User";

@Entity()
export class MoodImage extends CustomBaseEntity{
    constructor(payload: MoodImage) {
        super();
        Object.assign(this,payload );
      }

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    imageUrl:string;
    
    @Column({
        type:"enum",
        enum:moodCategory,       
    })
    moodCategory:moodCategory;   

    @OneToOne(()=>User,(User)=>User.mood,{     
        eager:true
      })
    @JoinColumn({ name: "ownerId" })
    owner : User 
}