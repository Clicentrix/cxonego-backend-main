import { Column, Entity, ManyToOne } from "typeorm";
import  {Note}  from "../entity/Note";
import { encryption } from "../common/utils";
@Entity()
class Attachment{
@Column()
name:string;
@Column() 
url:string; 
@Column()
action:string; 
@ManyToOne(()=>Note,{
    // onDelete:"CASCADE",
    onUpdate:"CASCADE",
    eager:true
})
note :Note;
}