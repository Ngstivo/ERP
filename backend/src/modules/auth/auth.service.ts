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

                    return user;
                }

                async seed(): Promise<{ message: string }> {
                    // Check if admin role exists
                    let adminRole = await this.roleRepository.findOne({
                        where: { name: 'Admin' },
                        relations: ['permissions'],
                    });

                    if (!adminRole) {
                        // Create permissions
                        const permissions = await Promise.all([
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'create_user', description: 'Can create users' })),
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'read_user', description: 'Can read users' })),
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'update_user', description: 'Can update users' })),
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'delete_user', description: 'Can delete users' })),
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'manage_roles', description: 'Can manage roles' })),
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'manage_inventory', description: 'Can manage inventory' })),
                            this.permissionRepository.save(this.permissionRepository.create({ name: 'view_reports', description: 'Can view reports' })),
                        ]);

                        // Create admin role
                        adminRole = await this.roleRepository.save(
                            this.roleRepository.create({
                                name: 'Admin',
                                description: 'Administrator with full access',
                                permissions: permissions,
                            })
                        );

                        // Create admin user
                        const hashedPassword = await bcrypt.hash('admin123', 10);
                        const adminUser = this.userRepository.create({
                            email: 'admin@erp.com',
                            password: hashedPassword,
                            firstName: 'Admin',
                            lastName: 'User',
                            roles: [adminRole],
                        });

                        await this.userRepository.save(adminUser);

                        return { message: 'Seeding successful. Admin role, permissions, and user created.' };
                    } else {
                        // Check if admin user exists
                        let adminUser = await this.userRepository.findOne({
                            where: { email: 'admin@erp.com' },
                            relations: ['roles'],
                        });

                        if (!adminUser) {
                            // Create admin user if doesn't exist
                            const hashedPassword = await bcrypt.hash('admin123', 10);
                            adminUser = this.userRepository.create({
                                email: 'admin@erp.com',
                                password: hashedPassword,
                                firstName: 'Admin',
                                lastName: 'User',
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
