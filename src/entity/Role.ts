import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Role extends BaseEntity{
    @PrimaryGeneratedColumn()
    roleId:number;
    @Column({
        type:"enum",
        enum:["SALESPERSON","SALESMANAGER","ADMIN","USER"],
        unique:true
    })
    roleName:string;
    @Column()
    description:string;

    @ManyToMany(() => User, user => user.roles,{
        // onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    users: User[];
}
