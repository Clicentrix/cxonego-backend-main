import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Organisation } from "./Organisation";

@Entity("lead_assignment")
export class LeadAssignment {
  @PrimaryGeneratedColumn("uuid")
  leadAssignmentId: string;

  @Column({ unique: false })
  leadType: string; // Product name from IndiaMart

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Organisation)
  @JoinColumn({ name: "organisationId" })
  organisation: Organisation;

  @Column()
  organisationId: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  modifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial?: Partial<LeadAssignment>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
} 