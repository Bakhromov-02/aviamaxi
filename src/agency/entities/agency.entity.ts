import { Column, Entity, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";

import { CrudData } from "../../common/entities/crud-data.entity";
import { PaymentToAgency } from "../../payment-to-agency/entities/payment-to-agency.entity";
import { ApiHideProperty } from "@nestjs/swagger";

@Entity()
export class Agency extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    debit: number;

    @Column({ default: 0 })
    aviaTicket?: number;

    @Column({ default: 0 })
    trainTicket?: number;

    // TODO relations

    @ApiHideProperty()
    @OneToMany(() => PaymentToAgency, paymentToAgency => paymentToAgency.agency)
    payment: PaymentToAgency
}
