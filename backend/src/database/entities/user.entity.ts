import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { StockMovement } from '../inventory/stock-movement.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar: string;

    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];

    @OneToMany(() => StockMovement, (movement) => movement.createdBy)
    stockMovements: StockMovement[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    lastLoginAt: Date;
}
