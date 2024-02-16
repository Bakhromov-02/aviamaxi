import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { CrudData } from "../../common/entities/crud-data.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { Role } from "src/role/entities/role.entity";
import { Branch } from "src/branch/entities/branch.entity";
import { Payment } from "src/payment/entities/payment.entity";

@Entity()
export class Staff extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    phoneNumber: string;

    @Column({ select: false })
    password: string;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @ApiHideProperty()
    @ManyToOne(() => Role, { onDelete: 'SET NULL' })
    @JoinColumn()
    role: Role;

    @ApiHideProperty()
    @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
    @JoinColumn()
    branch: Role;


    @ApiHideProperty()
    @OneToMany(() => Payment, payment => payment.staff, { cascade: true })
    payments: Payment[]
}
