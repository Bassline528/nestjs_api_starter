import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { hashData } from 'src/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const {  password, ...userData } = createUserDto;

      const hashedPassword =  await hashData(password);

      const user = this.usersRepository.create({
        ...userData,
        password: hashedPassword,
      } );
      await this.usersRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.usersRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({
      id: id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;
    return user;
  }

  async findOneByTerm(term: string) {
    let user: User;

    if (isUUID(term)) {
      user = await this.usersRepository.findOneBy({
        id: term,
      });
    } else {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');

      user = await queryBuilder
        .where('user.email = :email', { email: term })
        .orWhere('user.username = :username', { username: term })
        .getOne();

      return user;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      const updatedUser = await this.usersRepository.save({
        ...user,
        ...updateUserDto,
      });
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException('Username or email already taken');

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
