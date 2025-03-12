import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  Column,
} from "typeorm";
import { encryption } from "../common/utils";
export abstract class CustomBaseEntity extends BaseEntity {
  constructor() {
    super();
  }
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({default:null})
  modifiedBy: string;

}
