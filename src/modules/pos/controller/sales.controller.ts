import { Controller, Post, Body, Param, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { SalesService } from '../service/sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { RefundSaleDto } from '../dto/refund-sale.dto';

/**
 * Sales Controller
 * 
 * Upravlja prodajama u POS sistemu.
 * Omogućava kreiranje, pregled, povraćaj i fiskalizaciju prodaja.
 */
@Controller('pos/sales')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ============================================================================
  // CORE SALES MANAGEMENT
  // ============================================================================

  /**
   * Kreiranje nove prodaje
   * POST /pos/sales
   */
  @Post()
  async create(@Body() dto: CreateSaleDto, @Req() req) {
    return this.salesService.createSale(dto, req.user);
  }

  /**
   * Dohvatanje svih prodaja sa filterima
   * GET /pos/sales
   */
  @Get()
  async findAll(@Query() query, @Req() req) {
    return this.salesService.findAll(query, req.user);
  }

  /**
   * Dohvatanje prodaje po ID
   * GET /pos/sales/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req) {
    return this.salesService.findById(id, req.user);
  }

  // ============================================================================
  // REFUND OPERATIONS
  // ============================================================================

  /**
   * Povraćaj prodaje
   * POST /pos/sales/:id/refund
   */
  @Post(':id/refund')
  async refund(@Param('id') id: string, @Body() dto: RefundSaleDto, @Req() req) {
    return this.salesService.refundSale(id, dto, req.user);
  }

  // ============================================================================
  // RECEIPT & FISCALIZATION
  // ============================================================================

  /**
   * Generisanje računa za prodaju
   * GET /pos/sales/:id/receipt
   */
  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @Req() req) {
    return this.salesService.getReceipt(id, req.user);
  }

  /**
   * Fiskalizacija prodaje
   * POST /pos/sales/:id/fiscalize
   */
  @Post(':id/fiscalize')
  async fiscalize(@Param('id') id: string, @Body() body: { facility: string }, @Req() req) {
    // Mock user for testing
    const mockUser = req.user || {
      userId: '68d8516738bf736b02a94809',
      username: 'Test User',
      tenant: '68d84e453c19bcd5edb269cd',
      role: 'admin',
      scopes: ['scope_pos:sales']
    };
    return this.salesService.fiscalize(id, body.facility, mockUser);
  }

  @Post('reset-pending-fiscalizations')
  async resetPendingFiscalizations(@Req() req) {
    // Mock user for testing
    const mockUser = req.user || {
      userId: '68d8516738bf736b02a94809',
      username: 'Test User',
      tenant: '68d84e453c19bcd5edb269cd',
      role: 'admin',
      scopes: ['scope_pos:sales']
    };
    return this.salesService.resetPendingFiscalizations(mockUser.tenant);
  }

  @Get(':id/details')
  async getSaleDetails(@Param('id') id: string, @Req() req) {
    // Mock user for testing
    const mockUser = req.user || {
      userId: '68d8516738bf736b02a94809',
      username: 'Test User',
      tenant: '68d84e453c19bcd5edb269cd',
      role: 'admin',
      scopes: ['scope_pos:sales']
    };
    return this.salesService.findById(id, mockUser);
  }

  @Post(':id/reset-fiscalization')
  async resetFiscalization(@Param('id') id: string, @Req() req) {
    // Mock user for testing
    const mockUser = req.user || {
      userId: '68d8516738bf736b02a94809',
      username: 'Test User',
      tenant: '68d84e453c19bcd5edb269cd',
      role: 'admin',
      scopes: ['scope_pos:sales']
    };
    return this.salesService.resetFiscalization(id, mockUser);
  }
}