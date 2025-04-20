import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Account } from "./Account";
import { Contact } from "./Contact";
import { Lead } from "./Lead";
import {
  activityPriority,
  activityType,
  activityStatus,
  auditType,
} from "../common/utils";
import { Oppurtunity } from "./Oppurtunity";
import { User } from "./User";
import { v4 } from "uuid";
import { Subscription } from "./Subscription";

@Entity()
export class Audit extends CustomBaseEntity {
  constructor(payload: Audit) {
    super();
    Object.assign(this, { ...payload, auditId: v4() });
  }
  @PrimaryColumn("uuid")
  auditId: string;

  @Column({
    type: "enum",
    enum: auditType,
    nullable: false,
  })
  auditType: auditType;

  @Column({ length: 2500, nullable: true })
  description: string;

  @ManyToOne(() => Subscription, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: "subscriptionId" })
  subscription: Subscription;

  @ManyToOne(() => Account, {
    // onDelete:"CASCADE",
    onUpdate: "CASCADE",
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: "accountId" })
  company: Account;

  @ManyToOne(() => Contact, {
    // onDelete:"CASCADE",
    onUpdate: "CASCADE",
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: "contactId" })
  contact: Contact;

  @ManyToOne(() => Lead, { 
    nullable: true,
    onDelete: "SET NULL" 
  })
  @JoinColumn({ name: "leadId" })
  lead: Lead;

  @ManyToOne(() => Oppurtunity, {
    // onDelete:"CASCADE",
    onUpdate: "CASCADE",
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: "opportunityId" })
  // oppurtunity :Oppurtunity;
  opportunity: Oppurtunity;

  @ManyToOne(() => User, {
    // onDelete:"CASCADE",
    onUpdate: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "ownerId" })
  owner: User;
}
