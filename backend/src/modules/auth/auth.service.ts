import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
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

    async seed() {
        // Simple check if admin exists
        const admin = await this.userRepository.findOne({ where: { email: 'admin@erp.com' } });
        if (admin) {
            return { message: 'Database already seeded' };
        }

        // Create Admin Role
        // Note: This is a simplified seed for the MVP fix. 
        // Ideally we should reuse the logic from seeds/seed.ts but that requires more imports.
        // For now, we'll just create the admin user to allow login.

        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const user = this.userRepository.create({
            email: 'admin@erp.com',
            firstName: 'Admin',
            lastName: 'User',
            password: hashedPassword,
            isActive: true,
            roles: [], // Roles will be empty for now, but login should work
        });

        await this.userRepository.save(user);

        return { message: 'Seeding successful. Admin user created.' };
    }
}
