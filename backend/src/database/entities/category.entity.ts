import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';

@Entity('categories')
@Tree('closure-table')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ unique: true })
    code: string;

    @Column({ default: true })
    isActive: boolean;

    @TreeChildren()
    children: Category[];

    @TreeParent()
    parent: Category;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
