import {
    Controller,
    Post,
    Body,
    Param,
    Get,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { SalesService } from '../service/sales.service';
import { CreateSaleDto } from '../dto/sales/create-sale.dto';
import { RefundSaleDto } from '../dto/sales/refund-sale.dto';
import { JwtUserPayload, PosApiResponse } from '../types';

/**
 * Sales Controller
 * 
 * Manages sales transactions in the POS system.
 * Provides endpoints for creating, retrieving, refunding, and fiscalizing sales.
 * 
 * @example
 * ```typescript
 * // Create a new sale
 * POST /pos/sales
 * {
 *   "facility": "64a1b2c3d4e5f6789012345a",
 *   "items": [...],
 *   "payments": [...]
 * }
 * ```
 */
@Controller('pos/sales')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) {}

    // ============================================================================
    // CORE SALES MANAGEMENT
    // ============================================================================

  /**
   * Create a new sale transaction
   * 
   * @param dto - Sale creation data
   * @param req - Request object containing user information
   * @returns Created sale with generated receipt number
   * 
   * @example
   * ```typescript
   * POST /pos/sales
   * {
   *   "facility": "64a1b2c3d4e5f6789012345a",
   *   "items": [
   *     {
   *       "refId": "64a1b2c3d4e5f6789012345b",
   *       "type": "service",
   *       "name": "Haircut",
   *       "qty": 1,
   *       "unitPrice": 1500,
   *       "discount": 0,
   *       "taxRate": 20,
   *       "total": 1500
   *     }
   *   ],
   *   "payments": [
   *     {
   *       "method": "cash",
   *       "amount": 1500
   *     }
   *   ]
   * }
   * ```
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
    async create(
    @Body() dto: CreateSaleDto,
    @Req() req: { user: JwtUserPayload }
    ): Promise<PosApiResponse> {
        try {
            const sale = await this.salesService.createSale(dto, req.user);
            return {
                success: true,
                data: sale,
                message: 'Sale created successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to create sale');
        }
    }

  /**
   * Retrieve all sales with optional filtering
   * 
   * @param query - Query parameters for filtering
   * @param req - Request object containing user information
   * @returns Paginated list of sales
   * 
   * @example
   * ```typescript
   * GET /pos/sales?facility=64a1b2c3d4e5f6789012345a&status=final&limit=10
   * ```
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: any,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          const sales = await this.salesService.findAll(query, req.user);
          return {
              success: true,
              data: sales,
              message: 'Sales retrieved successfully'
          };
      } catch (error) {
          throw new BadRequestException(error.message || 'Failed to retrieve sales');
      }
  }

  /**
   * Retrieve a specific sale by ID
   * 
   * @param id - Sale ID (MongoDB ObjectId)
   * @param req - Request object containing user information
   * @returns Sale details
   * 
   * @example
   * ```typescript
   * GET /pos/sales/64a1b2c3d4e5f6789012345c
   * ```
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id') id: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid sale ID format');
          }

          const sale = await this.salesService.findById(id, req.user);
          if (!sale) {
              throw new NotFoundException('Sale not found');
          }
      
          return {
              success: true,
              data: sale,
              message: 'Sale retrieved successfully'
          };
      } catch (error) {
          if (error instanceof NotFoundException || error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to retrieve sale');
      }
  }

  // ============================================================================
  // REFUND OPERATIONS
  // ============================================================================

  /**
   * Refund a sale transaction
   * 
   * @param id - Sale ID to refund
   * @param dto - Refund data
   * @param req - Request object containing user information
   * @returns Refund transaction details
   * 
   * @example
   * ```typescript
   * POST /pos/sales/64a1b2c3d4e5f6789012345c/refund
   * {
   *   "items": [
   *     {
   *       "refId": "64a1b2c3d4e5f6789012345b",
   *       "qty": 1,
   *       "amount": 1500
   *     }
   *   ],
   *   "reason": "Customer request"
   * }
   * ```
   */
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  async refund(
    @Param('id') id: string,
    @Body() dto: RefundSaleDto,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid sale ID format');
          }

          const refund = await this.salesService.refundSale(id, dto, req.user);
          return {
              success: true,
              data: refund,
              message: 'Sale refunded successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to refund sale');
      }
  }

  // ============================================================================
  // RECEIPT & FISCALIZATION
  // ============================================================================

  /**
   * Generate receipt for a sale
   * 
   * @param id - Sale ID
   * @param req - Request object containing user information
   * @returns Receipt HTML content
   * 
   * @example
   * ```typescript
   * GET /pos/sales/64a1b2c3d4e5f6789012345c/receipt
   * ```
   */
  @Get(':id/receipt')
  @HttpCode(HttpStatus.OK)
  async getReceipt(
    @Param('id') id: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid sale ID format');
          }

          const receipt = await this.salesService.getReceipt(id, req.user);
          return {
              success: true,
              data: receipt,
              message: 'Receipt generated successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to generate receipt');
      }
  }

  /**
   * Fiscalize a sale transaction
   * 
   * @param id - Sale ID to fiscalize
   * @param body - Request body containing facility ID
   * @param req - Request object containing user information
   * @returns Fiscalization result
   * 
   * @example
   * ```typescript
   * POST /pos/sales/64a1b2c3d4e5f6789012345c/fiscalize
   * {
   *   "facility": "64a1b2c3d4e5f6789012345a"
   * }
   * ```
   */
  @Post(':id/fiscalize')
  @HttpCode(HttpStatus.OK)
  async fiscalize(
    @Param('id') id: string,
    @Body() body: { facility: string },
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid sale ID format');
          }
          if (!Types.ObjectId.isValid(body.facility)) {
              throw new BadRequestException('Invalid facility ID format');
          }

          const result = await this.salesService.fiscalize(id, body.facility, req.user);
          return {
              success: true,
              data: result,
              message: 'Sale fiscalized successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to fiscalize sale');
      }
  }

  /**
   * Reset pending fiscalizations for a tenant
   * 
   * @param req - Request object containing user information
   * @returns Reset operation result
   * 
   * @example
   * ```typescript
   * POST /pos/sales/reset-pending-fiscalizations
   * ```
   */
  @Post('reset-pending-fiscalizations')
  @HttpCode(HttpStatus.OK)
  async resetPendingFiscalizations(
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          const result = await this.salesService.resetPendingFiscalizations(req.user.tenant);
          return {
              success: true,
              data: result,
              message: 'Pending fiscalizations reset successfully'
          };
      } catch (error) {
          throw new BadRequestException(error.message || 'Failed to reset pending fiscalizations');
      }
  }

  /**
   * Get detailed sale information
   * 
   * @param id - Sale ID
   * @param req - Request object containing user information
   * @returns Detailed sale information
   * 
   * @example
   * ```typescript
   * GET /pos/sales/64a1b2c3d4e5f6789012345c/details
   * ```
   */
  @Get(':id/details')
  @HttpCode(HttpStatus.OK)
  async getSaleDetails(
    @Param('id') id: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid sale ID format');
          }

          const sale = await this.salesService.findById(id, req.user);
          if (!sale) {
              throw new NotFoundException('Sale not found');
          }

          return {
              success: true,
              data: sale,
              message: 'Sale details retrieved successfully'
          };
      } catch (error) {
          if (error instanceof NotFoundException || error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to retrieve sale details');
      }
  }

  /**
   * Reset fiscalization for a sale
   * 
   * @param id - Sale ID
   * @param req - Request object containing user information
   * @returns Reset operation result
   * 
   * @example
   * ```typescript
   * POST /pos/sales/64a1b2c3d4e5f6789012345c/reset-fiscalization
   * ```
   */
  @Post(':id/reset-fiscalization')
  @HttpCode(HttpStatus.OK)
  async resetFiscalization(
    @Param('id') id: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid sale ID format');
          }

          const result = await this.salesService.resetFiscalization(id, req.user);
          return {
              success: true,
              data: result,
              message: 'Fiscalization reset successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to reset fiscalization');
      }
  }
}