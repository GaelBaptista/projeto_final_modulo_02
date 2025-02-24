import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class MovementsTable1740270369948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "movements",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "destination_branch_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "driver_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["PENDING", "IN_PROGRESS", "FINISHED"],
            default: "'PENDING'",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["destination_branch_id"],
        referencedTableName: "branches",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedTableName: "products",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["driver_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("movements");
  }
}
