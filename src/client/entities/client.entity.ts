import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { CrudData } from "../../common/entities/crud-data.entity";
import { CountryEnum, DocumentTypeEnum, GenderEnum } from "../../common/enums";
import { Ticket } from "../../ticket/entities/ticket.entity";

@Entity()
export class Client extends CrudData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ enum: GenderEnum })
    gender: GenderEnum;

    @Column({ enum: CountryEnum })
    citizenship: CountryEnum;

    @Column()
    phoneNumber: string;

    // TODO date 
    @Column()
    birthDate: string;

    @Column({ enum: DocumentTypeEnum })
    documentType: DocumentTypeEnum;

    @Column({ unique: true })
    document: string;

    // TODO date 
    @Column()
    documentDate: string;

    @OneToMany(() => Ticket, ticket => ticket.client, { cascade: true })
    tickets: Ticket[]
}
