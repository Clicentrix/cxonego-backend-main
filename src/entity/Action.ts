
import { Column, Entity, OneToOne } from "typeorm";
import { User } from "../entity/User";
import { Note } from "../entity/Note";
import { Lead } from "./Lead";
import { Contact } from "./Contact";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { encryption } from "../common/utils";
class Action extends CustomBaseEntity{
@Column()
title:string;
@Column()
describtion:string;
@Column()
startDate:Date;
@Column()
dueDate:Date;
@OneToOne(()=>User,{
    // onDelete:"CASCADE",
    onUpdate:"CASCADE",
    eager:true
})
assignedTo:User;
@Column()
priority:string; 
@Column()
sendReminder:boolean;
@OneToOne(()=>Note,{
    // onDelete:"CASCADE",
    onUpdate:"CASCADE",
    eager:true,
    cascade:true
})
note:Note;
@Column()
lead:Lead;
@Column()
contact:Contact;
@Column()
opportunity:string;
@Column()
status:string;
}
export default Action;