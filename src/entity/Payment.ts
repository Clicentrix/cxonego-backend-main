import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { encryption, trialStatus } from "../common/utils";
import { User } from "./User";
import { Organisation } from "./Organisation";
import { Subscription } from "./Subscription";

@Entity()
export class Payment extends CustomBaseEntity {

  @PrimaryColumn()
  paymentId: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  status: string;

  @Column()
  method: string;

  @Column()
  amountRefunded: number;

  @Column({
    nullable: true,
  })
  refundStatus: string;

  @Column()
  description: string;

  @Column()
  captured: boolean;

  @Column({
    nullable: true,
  })
  card_id: string;

  @Column({
    nullable: true,
  })
  bank: string;

  @Column({
    nullable: true,
  })
  wallet: string;

  @Column({
    nullable: true,
  })
  vpa: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  contact: string;

  @Column({
    nullable: true,
  })
  error_code: string;
  
  @Column({
    nullable: true,
  })
  error_description: string;

  @Column({
    nullable: true,
  })
  error_source: string;

  @Column({
    nullable: true,
  })
  error_step: string;
  
  @Column({
    nullable: true,
  })
  error_reason: string;

  @Column()
  bank_transaction_id: string;

  @OneToOne(() => Subscription, {
    nullable: true,
  })
  @JoinColumn({ name: "subscriptionId" })
  subscription: Subscription;
}
