import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("branches")
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  full_address: string;

  @Column({ type: "varchar", length: 30 })
  document: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
