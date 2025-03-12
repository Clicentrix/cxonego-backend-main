import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { referStatus } from "../common/utils";
import { IsEmail, Matches } from "class-validator";
import { User } from "./User";
import { Organisation } from "./Organisation";
@Entity()
export class Refer extends CustomBaseEntity {
  constructor(payload: Refer) {
    super();
    Object.assign(this, { ...payload });
  }

  @PrimaryGeneratedColumn("uuid")
  referId: string;

  @Column({
    nullable: true,
  })
  referIdForUsers: string;

  @ManyToOne(() => User, {
    // onDelete:"CASCADE",
    onUpdate: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: null })
  countryCode: string;

  @Column({
    unique: false,
    nullable: true,
  })
  phone: string;

  @Column({ unique: false, nullable: true })
  @IsEmail()
  email: string;

  @Column({
    nullable: false,
  })
  referBy: string;

  @Column({
    type: "enum",
    enum: referStatus,
    default: referStatus.New,
  })
  status: referStatus;

  @Column({
    nullable: true,
  })
  company: string;

  @Column({
    length: 10000,
    nullable: true,
  })
  description: string;

  @ManyToOne(() => Organisation, (Organisation) => Organisation.refers, {
    cascade: true,
    // onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: "organizationId" })
  organization: Organisation;
}
