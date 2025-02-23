import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Branch } from "./Brancher";
import { Product } from "./Products";

@Entity("movements")
export class Movement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "destination_branch_id" })
  destination_branch: Branch;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int" })
  quantity: number;

  @Column({
    type: "enum",
    enum: ["PENDING", "IN_PROGRESS", "FINISHED"],
    default: "PENDING",
  })
  status: "PENDING" | "IN_PROGRESS" | "FINISHED";

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
