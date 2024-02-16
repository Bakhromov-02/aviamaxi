import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiHideProperty } from "@nestjs/swagger";

import { CrudData } from "../../common/entities/crud-data.entity";
import { Payment } from "../../payment/entities/payment.entity";

@Entity()
export class Card extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    number: string;

    @ApiHideProperty()
    @OneToMany(() => Payment, payment => payment.card, { cascade: true })
    payments: Payment[]
}
