import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SuperAdmin {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    password: string;
}