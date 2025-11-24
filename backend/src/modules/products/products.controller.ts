import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all categories' })
    findAllCategories() {
        return this.productsService.findAllCategories();
    }

    @Get('uom')
    @ApiOperation({ summary: 'Get all units of measure' })
    findAllUOMs() {
        return this.productsService.findAllUOMs();
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'categoryId', required: false })
    findAll(
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.productsService.findAll(search, categoryId);
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Get low stock products' })
    @ApiQuery({ name: 'threshold', required: false })
    getLowStock(@Query('threshold') threshold?: number) {
        return this.productsService.getLowStockProducts(threshold);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update product' })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product' })
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
