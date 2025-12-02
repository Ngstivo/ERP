import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@database/entities/user.entity';
import { Role } from '@database/entities/role.entity';
import { Permission } from '@database/entities/permission.entity';
import { Category } from '@database/entities/category.entity';
import { UnitOfMeasure } from '@database/entities/unit-of-measure.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(UnitOfMeasure)
        private uomRepository: Repository<UnitOfMeasure>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['roles', 'roles.permissions'],
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Update last login
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date(),
        });

        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map((role) => role.name),
            permissions: user.roles.flatMap((role) =>
                role.permissions.map((p) => `${p.resource}:${p.action}`),
            ),
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map((role) => role.name),
            },
        };
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
        });

        await this.userRepository.save(user);

        const { password, ...result } = user;
        return result;
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...result } = user;
        return result;
    }
}