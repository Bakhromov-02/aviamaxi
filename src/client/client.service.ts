import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto';
import { ClientFilter } from '../common/filter-dtos';
import { CountryEnum } from 'src/common/enums';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
  ) { }

  async create(dto: CreateClientDto) {
    const {
      document, documentDate, documentType, citizenship,
      firstName, lastName, gender, birthDate, phoneNumber
    } = dto;

    const isExists = await this.clientRepository
      .createQueryBuilder()
      .where({ document })
      .getOne()

    if (isExists) {
      throw new BadRequestException('The document already exists')
    }

    const documentValues = {
      document,
      documentDate,
      documentType,
      birthDate,
      citizenship,
      firstName,
      gender,
      lastName,
      phoneNumber
    }

    try {
      const client = await this.clientRepository
        .createQueryBuilder()
        .insert()
        .into(Client)
        .values(documentValues)
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return client;
    } catch (error) {
      console.log(error);

      // TODO error handling;
    }
  }

  async findAll(query: ClientFilter) {
    const { name, page = 1, limit = 20 } = query;

    const clientQuery = this.clientRepository
      .createQueryBuilder('client')
    // TODO .leftJoinAndSelect('client.tickets', 'tickets') add count of tickets by type

    // TODO add search by lastname and firstname and document
    // if (name) {
    //   clientQuery
    //     .where('client.name LIKE :name', { name: `%${name}%` })
    // }

    const [clients, count] = await clientQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { clients, totalPages, currentPage: page }
  }

  async findOne(id: number) {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.tickets', 'tickets')
      .where({ id })
      .getOne()

    if (!client) {
      throw new NotFoundException('The client with this id not found')
    }

    return client;
  }

  async findOneByDocument(document: string) {
    const client = await this.clientRepository
      .createQueryBuilder()
      .where({ document })
      .getOne()

    if (!client) {
      throw new NotFoundException('The client with this id not found')
    }

    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    const {
      document, documentDate, documentType, citizenship,
      firstName, lastName, gender, birthDate, phoneNumber
    } = dto;

    const client = await this.clientRepository
      .createQueryBuilder()
      .where({ id })
      .getOne()

    if (!client) {
      throw new NotFoundException('The client with this id not found')
    }

    const updatedValues = {
      document,
      documentDate,
      documentType,
      birthDate,
      citizenship,
      firstName,
      gender,
      lastName,
      phoneNumber
    }

    try {
      const updatedClient = await this.clientRepository
        .createQueryBuilder()
        .update(Client)
        .set(updatedValues)
        .where({ id })
        .returning("*")
        .execute()
        .then(result => result.raw[0])

      return updatedClient;
    } catch (error) {
      console.log(error);
      // TODO Error handling
    }
  }
}
