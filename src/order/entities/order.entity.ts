
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { CrudData } from "../../common/entities/crud-data.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { Ticket } from "../../ticket/entities/ticket.entity";

@Entity()
export class Order extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    totalPrice: number;

    @Column({ default: 0 })
    totalProfit: number;

    @OneToMany(
        () => Ticket,
        ticket => ticket.order, {
        cascade: true
    })
    ticket: Ticket[]

    @ManyToOne(() => Staff)
    @JoinColumn()
    staff: Staff;
}
