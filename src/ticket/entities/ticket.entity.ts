import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiHideProperty } from "@nestjs/swagger";

import { CrudData } from "../../common/entities/crud-data.entity";
import { TicketTypeEnum } from "../../common/enums/ticket-type.enum";
import { Client } from "../../client/entities/client.entity";
import { Agency } from "../../agency/entities/agency.entity";
import { Order } from "../../order/entities/order.entity";

@Entity()
export class Ticket extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ enum: TicketTypeEnum, default: TicketTypeEnum.PLANE })
    type: TicketTypeEnum;

    @Column()
    status: boolean;

    @Column()
    price: number;

    @Column({ nullable: true, default: null })
    returned?: number;

    @Column()
    profit: number;

    // TODO check the date 
    // @Column({ type: 'date' })
    @Column()
    date: string;

    @Column()
    number: string;

    @Column()
    flightNumber: string;

    @Column()
    from: string;

    @Column()
    to: string;

    @Column({ nullable: true })
    comment?: string;

    // Relations

    @ApiHideProperty()
    @ManyToOne(() => Client)
    @JoinColumn()
    client: Client;

    @ApiHideProperty()
    @ManyToOne(() => Agency)
    @JoinColumn()
    agency: Agency;

    @ApiHideProperty()
    @ManyToOne(() => Order)
    @JoinColumn()
    order: Order;
}
