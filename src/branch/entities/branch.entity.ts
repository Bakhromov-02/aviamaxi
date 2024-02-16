import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CrudData } from "../../common/entities/crud-data.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { Staff } from "src/staff/entities/staff.entity";

@Entity()
export class Branch extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    isActive: boolean;

    // TODO relations
    @ApiHideProperty()
    @OneToMany(() => Staff, (staff) => staff.branch, {
        cascade: true
    })
    @JoinColumn()
    staff: Staff[];

}
