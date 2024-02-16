
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiHideProperty } from "@nestjs/swagger";

import { PaymentTypeEnum } from "../../common/enums";
import { Card } from "../../card/entities/card.entity";
import { Staff } from "../../staff/entities/staff.entity";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ enum: PaymentTypeEnum })
    type: PaymentTypeEnum;

    @Column()
    amount: number;

    @Column({ nullable: true })
    comment?: string;

    @ApiHideProperty()
    @ManyToOne(() => Staff)
    @JoinColumn()
    staff: Staff;

    @ApiHideProperty()
    @ManyToOne(() => Card)
    @JoinColumn()
    card: Card;
}
