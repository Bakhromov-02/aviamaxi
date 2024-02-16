import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../../common/enums";

@Entity()
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ enum: RolesEnum })
    name: RolesEnum;

    @Column({ nullable: true })
    description: string;
}
