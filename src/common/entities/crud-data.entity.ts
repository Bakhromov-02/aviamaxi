import {
    BaseEntity,
    CreateDateColumn,
    Entity,
    UpdateDateColumn
} from "typeorm";

@Entity()
export class CrudData extends BaseEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}