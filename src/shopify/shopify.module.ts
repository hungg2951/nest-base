import { Module } from '@nestjs/common';
import { ShopifyAuthService } from './shopify-auth.service';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { ShopModule } from '../shop/shop.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ShopModule, AiModule],
  controllers: [ProductController],
  providers: [ShopifyAuthService, ProductService],
  exports: [ShopifyAuthService, ProductService],
})
export class ShopifyModule {}
