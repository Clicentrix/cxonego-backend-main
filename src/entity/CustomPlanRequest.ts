import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { customRequestStatus } from "../common/utils";

@Entity()
export class CustomPlanRequest extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  countryCode: string;

  @Column()
  phone: string;

  @Column()
  organization: string;

  @Column({
    type: "enum",
    enum: customRequestStatus,
    default: customRequestStatus.PENDING,
  })
  onboardingStatus: customRequestStatus;

  @Column()
  message: string;
}
