import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) { }

  @Get()
  findAll(): Promise<Product[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product | null> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Product>): Promise<Product> {
    return this.service.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Product>,
  ): Promise<Product | null> {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(+id);
  }
}
