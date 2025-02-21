import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Branch } from "./Brancher";
import { Driver } from "./Driver";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "enum", enum: ["DRIVER", "BRANCH", "ADMIN"] })
  profile: "DRIVER" | "BRANCH" | "ADMIN";

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 150 })
  password_hash: string;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Branch, { cascade: true })
  @JoinColumn({ name: "id" })
  branch?: Branch;

  @OneToOne(() => Driver, { cascade: true })
  @JoinColumn({ name: "id" })
  driver?: Driver;
}
