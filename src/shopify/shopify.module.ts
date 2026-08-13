import { Module } from '@nestjs/common';
import { ShopifyAuthService } from './shopify-auth.service';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [ShopModule],
  controllers: [],
  providers: [ShopifyAuthService],
  exports: [ShopifyAuthService],
})
export class ShopifyModule {}
