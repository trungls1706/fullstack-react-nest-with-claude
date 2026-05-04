import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../shared/guards/optional-jwt-auth.guard';
import { User } from '../auth/entities/user.entity';
import { CartService, CART_SESSION_COOKIE } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  async getCart(
    @CurrentUser() user: User | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;
    const { cart, newSessionId } = await this.cartService.getCart(
      user?.id ?? null,
      sessionId ?? null,
    );
    if (newSessionId) this.setSessionCookie(res, newSessionId);
    return cart;
  }

  @Post('items')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  async addItem(
    @CurrentUser() user: User | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
  ) {
    const sessionId = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;
    const { cart, newSessionId } = await this.cartService.addItem(
      user?.id ?? null,
      sessionId ?? null,
      dto,
    );
    if (newSessionId) this.setSessionCookie(res, newSessionId);
    return cart;
  }

  @Patch('items/:id')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User | null,
    @Req() req: Request,
    @Body() dto: UpdateCartItemDto,
  ) {
    const sessionId = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;
    return this.cartService.updateItem(id, user?.id ?? null, sessionId ?? null, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User | null,
    @Req() req: Request,
  ) {
    const sessionId = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;
    return this.cartService.removeItem(id, user?.id ?? null, sessionId ?? null);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  clearCart(@CurrentUser() user: User | null, @Req() req: Request) {
    const sessionId = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;
    return this.cartService.clearCart(user?.id ?? null, sessionId ?? null);
  }

  @Post('merge')
  async mergeCart(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;
    const cart = await this.cartService.mergeGuestCart(user.id, sessionId ?? '');
    res.clearCookie(CART_SESSION_COOKIE);
    return cart;
  }

  private setSessionCookie(res: Response, sessionId: string): void {
    res.cookie(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
