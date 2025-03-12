import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Currency, planType } from "../common/utils";
import { Subscription } from "./Subscription";

@Entity()
export class Plan extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  planId: string;

  @Column()
  planamount: string;

  @Column()
  annualAmount: string;

  @Column()
  planname: string;

  @Column()
  gst: string;

  @Column({
    type: "enum",
    enum: Currency,
    default: Currency.INR,
  })
  currency: Currency;

  @Column()
  description: string;

  @Column()
  noOfUsers: string;

  @Column()
  features: string;

  @Column({
    nullable: true,
  })
  noOfDays: string;

  @Column({
    type: "enum",
    enum: planType,
    default: planType.SUBSCRIPTION,
  })
  planType: planType;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
