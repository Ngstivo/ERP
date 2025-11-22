import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            relations: ['roles'],
            select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'phone', 'avatar', 'createdAt'],
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions'],
            select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'phone', 'avatar', 'createdAt', 'lastLoginAt'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateData);
        return await this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
}
