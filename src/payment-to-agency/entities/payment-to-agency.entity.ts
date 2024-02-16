
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { PaymentToAgencyTypeEnum } from "../../common/enums";
import { Staff } from "../../staff/entities/staff.entity";
import { Agency } from "../../agency/entities/agency.entity";
import { CrudData } from "../../common/entities/crud-data.entity";
import { ApiHideProperty } from "@nestjs/swagger";

@Entity()
export class PaymentToAgency extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ enum: PaymentToAgencyTypeEnum, default: PaymentToAgencyTypeEnum.PAID })
    type: PaymentToAgencyTypeEnum;

    @Column({ type: "float" })
    amount: number;

    @Column({ nullable: true })
    comment?: string;

    @ApiHideProperty()
    @ManyToOne(() => Staff, { cascade: true })
    @JoinColumn()
    staff: Staff

    @ApiHideProperty()
    @ManyToOne(() => Agency, agency => agency.payment)
    @JoinColumn()
    agency: Agency;


    // ************************* ?
    // @BeforeInsert()
    // async updateAgencyOnInsert() {
    //     const quantity = (this.type === PaymentToAgencyTypeEnum.PAID ? this.amount : -this.amount)

    //     const agency = await Agency.findOneOrFail({ where: { id: this.agency.id } });

    //     agency.debit += quantity;

    //     await agency.save();
    // }
}
