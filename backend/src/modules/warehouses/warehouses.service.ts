import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Warehouse } from '@database/entities/warehouse.entity';
import { StorageLocation } from '@database/entities/storage-location.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class WarehousesService {
    constructor(
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(StorageLocation)
        private locationRepository: TreeRepository<StorageLocation>,
    ) { }

    async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
        const warehouse = this.warehouseRepository.create(createWarehouseDto);
        return await this.warehouseRepository.save(warehouse);
    }

    async findAll(): Promise<Warehouse[]> {
        return await this.warehouseRepository.find({
            relations: ['storageLocations'],
        });
    }

    async findOne(id: string): Promise<Warehouse> {
        const warehouse = await this.warehouseRepository.findOne({
            where: { id },
            relations: ['storageLocations', 'stockLevels'],
        });

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }

        return warehouse;
    }

    async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
        const warehouse = await this.findOne(id);
        Object.assign(warehouse, updateWarehouseDto);
        return await this.warehouseRepository.save(warehouse);
    }

    async remove(id: string): Promise<void> {
        const warehouse = await this.findOne(id);
        await this.warehouseRepository.remove(warehouse);
    }

    // Storage Location Management
    async createLocation(warehouseId: string, createLocationDto: CreateLocationDto): Promise<StorageLocation> {
        const warehouse = await this.findOne(warehouseId);

        const location = this.locationRepository.create({
            ...createLocationDto,
            warehouse,
        });

        if (createLocationDto.parentId) {
            const parent = await this.locationRepository.findOne({
                where: { id: createLocationDto.parentId },
            });
            if (parent) {
                location.parent = parent;
            }
        }

        return await this.locationRepository.save(location);
    }

    async getLocationTree(warehouseId: string): Promise<StorageLocation[]> {
        const locations = await this.locationRepository.find({
            where: { warehouse: { id: warehouseId } },
            relations: ['parent', 'children'],
        });

        return await this.locationRepository.findTrees();
    }

    async getWarehouseUtilization(warehouseId: string): Promise<any> {
        const warehouse = await this.warehouseRepository.findOne({
            where: { id: warehouseId },
            relations: ['stockLevels', 'stockLevels.product'],
        });

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
        }

        const totalProducts = warehouse.stockLevels.length;
        const totalQuantity = warehouse.stockLevels.reduce(
            (sum, stock) => sum + Number(stock.quantity),
            0,
        );
        const totalValue = warehouse.stockLevels.reduce(
            (sum, stock) => sum + Number(stock.quantity) * Number(stock.product.costPrice),
            0,
        );

        return {
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            totalCapacity: warehouse.totalCapacity,
            totalProducts,
            totalQuantity,
            totalValue,
            utilizationPercentage: warehouse.totalCapacity
                ? (totalQuantity / Number(warehouse.totalCapacity)) * 100
                : 0,
        };
    }
}
