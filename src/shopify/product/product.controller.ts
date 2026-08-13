import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ShopId } from '../../common/decorators/shop-id.decorator.js';
import { Body, Patch } from '@nestjs/common';
import type { UpdateProductInput } from './product.service';
import { GeminiService } from '../../ai/gemini.service';
import { FileInterceptor } from '@nestjs/platform-express';

interface GenerateContentBody {
  title: string;
  promptTemplateId?: string;
}

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly geminiService: GeminiService,
  ) {}

  @Get()
  async getProducts(
    @ShopId() shopId: string,
    @Query('limit') limit?: string,
    @Query('after') after?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    return this.productService.getProducts(shopId, {
      limit:
        parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined,
      after,
    });
  }

  @Get('search')
  async getProductByTitle(
    @ShopId() shopId: string,
    @Query('title') title: string,
  ) {
    return this.productService.getProductByTitle(shopId, title);
  }

  @Get(':id')
  async getProductById(@ShopId() shopId: string, @Param('id') id: string) {
    const product = await this.productService.getProductById(shopId, id);

    if (!product) {
      throw new NotFoundException(`No product found with id "${id}"`);
    }

    return product;
  }

  @Patch(':id')
  async updateProduct(
    @ShopId() shopId: string,
    @Param('id') id: string,
    @Body() body: UpdateProductInput,
  ) {
    return this.productService.updateProduct(shopId, id, body);
  }

  @Post(':id/generate-content')
  async generateContent(
    @Param('id') id: string,
    @Body() body: GenerateContentBody,
  ) {
    if (!body?.title) {
      throw new BadRequestException('Missing "title" in request body');
    }

    return this.geminiService.generateProductContent(
      body.title,
      body.promptTemplateId,
    );
  }

  /**
   * POST /products/:id/images
   * multipart/form-data, field name: "file"
   */
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async addImage(
    @ShopId() shopId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Missing "file" in request');
    }
    return this.productService.addProductImage(shopId, id, file);
  }

  /**
   * DELETE /products/:id/images
   * Body: { mediaIds: string[] }
   */
  @Delete(':id/images')
  async deleteImages(
    @ShopId() shopId: string,
    @Param('id') id: string,
    @Body('mediaIds') mediaIds: string[],
  ) {
    if (!mediaIds || mediaIds.length === 0) {
      throw new BadRequestException('Missing "mediaIds" in request body');
    }
    return this.productService.deleteProductImages(shopId, id, mediaIds);
  }

  /**
   * GET /products/:id/images
   * Dedicated endpoint for the image-management dialog — returns reliable,
   * deletable MediaImage GIDs via REST. Call this only when the user opens
   * the image manager for a specific product.
   */
  @Get(':id/images')
  async getProductImages(@ShopId() shopId: string, @Param('id') id: string) {
    return this.productService.getProductImagesViaRest(shopId, id);
  }
}
