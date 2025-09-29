import { Controller, Post, Body, Param, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { SalesService } from '../service/sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { RefundSaleDto } from '../dto/refund-sale.dto';

@Controller('pos/sales')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async create(@Body() dto: CreateSaleDto, @Req() req) {
    return this.salesService.createSale(dto, req.user);
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string, @Body() dto: RefundSaleDto, @Req() req) {
    return this.salesService.refundSale(id, dto, req.user);
  }

  @Get()
  async findAll(@Query() query, @Req() req) {
    return this.salesService.findAll(query, req.user);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req) {
    return this.salesService.findById(id, req.user);
  }

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @Req() req) {
    return this.salesService.getReceipt(id, req.user);
  }

  @Post(':id/fiscalize')
  async fiscalize(@Param('id') id: string, @Body() body: { facility: string }, @Req() req) {
    return this.salesService.fiscalize(id, body.facility, req.user);
  }
}
