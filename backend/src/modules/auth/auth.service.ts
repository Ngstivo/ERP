import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@database/entities/user.entity';
import { Role } from '@database/entities/role.entity';
import { Permission } from '@database/entities/permission.entity';
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
        import { Injectable, UnauthorizedException } from '@nestjs/common';
        import { InjectRepository } from '@nestjs/typeorm';
        import { Repository } from 'typeorm';
        import { JwtService } from '@nestjs/jwt';
        import * as bcrypt from 'bcrypt';
        import { User } from '@database/entities/user.entity';
        import { Role } from '@database/entities/role.entity';
        import { Permission } from '@database/entities/permission.entity';
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
                // 1. Create Permissions
                const permissionsData = [
                    { name: 'products:create', resource: 'products', action: 'create', description: 'Create products' },
                    { name: 'products:read', resource: 'products', action: 'read', description: 'View products' },
                    { name: 'products:update', resource: 'products', action: 'update', description: 'Update products' },
                    { name: 'products:delete', resource: 'products', action: 'delete', description: 'Delete products' },
                    { name: 'inventory:manage', resource: 'inventory', action: 'manage', description: 'Manage inventory' },
                    { name: 'warehouses:manage', resource: 'warehouses', action: 'manage', description: 'Manage warehouses' },
                    { name: 'orders:manage', resource: 'orders', action: 'manage', description: 'Manage orders' },
                    { name: 'reports:view', resource: 'reports', action: 'view', description: 'View reports' },
                ];

                const savedPermissions = [];
                for (const p of permissionsData) {
                    let permission = await this.permissionRepository.findOne({ where: { name: p.name } });
                    if (!permission) {
                        permission = this.permissionRepository.create(p);
                        await this.permissionRepository.save(permission);
                    }
                    savedPermissions.push(permission);
                }

                // 2. Create Admin Role
                let adminRole = await this.roleRepository.findOne({ where: { name: 'Admin' } });
                if (!adminRole) {
                    adminRole = this.roleRepository.create({
                        name: 'Admin',
                        description: 'Full system access',
                        permissions: savedPermissions,
                    });
                    await this.roleRepository.save(adminRole);
                } else {
                    // Update permissions if role exists
                    adminRole.permissions = savedPermissions;
                    await this.roleRepository.save(adminRole);
                }

                // 3. Create/Update Admin User
                let adminUser = await this.userRepository.findOne({ where: { email: 'admin@erp.com' } });
                if (!adminUser) {
                    const hashedPassword = await bcrypt.hash('Admin@123', 10);
                    adminUser = this.userRepository.create({
                        email: 'admin@erp.com',
                        firstName: 'Admin',
                        lastName: 'User',
                        password: hashedPassword,
                        isActive: true,
                        roles: [adminRole],
                    });
                    await this.userRepository.save(adminUser);
                } else {
                    // Update roles if user exists
                    adminUser.roles = [adminRole];
                    await this.userRepository.save(adminUser);
                }

                return { message: 'Seeding successful. Admin user updated with roles and permissions.' };
            }
        }
}