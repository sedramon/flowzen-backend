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
import { CashSessionService } from '../service/cash-session.service';
import { OpenSessionDto } from '../dto/sessions/open-session.dto';
import { CloseSessionDto } from '../dto/sessions/close-session.dto';
import { CashCountingDto, CashVerificationDto, CashVarianceDto } from '../dto/sessions/cash-counting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Facility } from '../../facility/schema/facility.schema';
import { Employee } from '../../employees/schema/employee.schema';
import { Client } from '../../clients/schemas/client.schema';
import { Article } from '../../articles/schema/article.schema';
import { Service } from '../../services/schemas/service.schema';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { CashSession } from '../schemas/cash-session.schema';
import { JwtUserPayload, PosApiResponse } from '../types';

@Controller('pos/sessions')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class CashSessionController {
    constructor(
    private readonly cashSessionService: CashSessionService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
    ) {}

    // ============================================================================
    // CORE SESSION MANAGEMENT ENDPOINTS
    // ============================================================================

  /**
   * Open a new cash session
   * 
   * @param dto - Session opening data
   * @param req - Request object containing user information
   * @returns Created session information
   * 
   * @example
   * ```typescript
   * POST /pos/sessions/open
   * {
   *   "facility": "64a1b2c3d4e5f6789012345a",
   *   "openingFloat": 1000,
   *   "note": "Morning shift"
   * }
   * ```
   */
  @Post('open')
  @HttpCode(HttpStatus.CREATED)
    async open(
    @Body() dto: OpenSessionDto,
    @Req() req: { user: JwtUserPayload }
    ): Promise<PosApiResponse> {
        try {
            const session = await this.cashSessionService.openSession(dto, req.user);
            return {
                success: true,
                data: session,
                message: 'Cash session opened successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to open cash session');
        }
    }

  /**
   * Close a cash session
   * 
   * @param id - Session ID to close
   * @param dto - Session closing data
   * @param req - Request object containing user information
   * @returns Closed session summary
   * 
   * @example
   * ```typescript
   * POST /pos/sessions/64a1b2c3d4e5f6789012345a/close
   * {
   *   "closingCount": 1500,
   *   "note": "End of shift"
   * }
   * ```
   */
  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @Param('id') id: string,
    @Body() dto: CloseSessionDto,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
      // Validate ObjectId format
          if (!Types.ObjectId.isValid(id)) {
              throw new BadRequestException('Invalid session ID format');
          }

          const result = await this.cashSessionService.closeSession(id, dto, req.user);
          return {
              success: true,
              data: result,
              message: 'Cash session closed successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to close cash session');
      }
  }

  /**
   * Get all cash sessions with optional filtering
   * 
   * @param query - Query parameters for filtering
   * @param req - Request object containing user information
   * @returns List of cash sessions
   * 
   * @example
   * ```typescript
   * GET /pos/sessions?facility=64a1b2c3d4e5f6789012345a&status=open&limit=10
   * ```
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: { status?: string; facility?: string; employee?: string; limit?: string },
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          const sessions = await this.cashSessionService.findAll(query, req.user);
          return {
              success: true,
              data: sessions,
              message: 'Cash sessions retrieved successfully'
          };
      } catch (error) {
          throw new BadRequestException(error.message || 'Failed to retrieve cash sessions');
      }
  }

  /**
   * Get current active cash session
   * 
   * @param query - Query parameters (facility)
   * @param req - Request object containing user information
   * @returns Current active session or null
   * 
   * @example
   * ```typescript
   * GET /pos/sessions/current?facility=64a1b2c3d4e5f6789012345a
   * ```
   */
  @Get('current')
  @HttpCode(HttpStatus.OK)
  async getCurrentSession(
    @Query() query: { facility?: string },
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          const session = await this.cashSessionService.getCurrentSession(req.user, query.facility);
          return {
              success: true,
              data: session,
              message: session ? 'Current session found' : 'No active session found'
          };
      } catch (error) {
          throw new BadRequestException(error.message || 'Failed to get current session');
      }
  }

  // ============================================================================
  // CASH REPORTS ENDPOINTS
  // ============================================================================

  /**
   * General POS reports
   * @param tenant - Tenant ID
   * @param facility - Facility ID
   * @param dateFrom - Start date
   * @param dateTo - End date
   * @param req - Request object
   * @returns POS reports data
   */
  @Get('reports')
  @UseGuards(ScopesGuard)
  async getReports(
    @Query('tenant') tenant: string,
    @Query('facility') facility: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      return this.cashSessionService.getReports(tenant, facility, dateFrom, dateTo, req.user);
  }

  /**
   * Create real test data for POS system
   * @param req - Request object
   * @returns Seed data results
   */
  @Post('seed-real-data')
  async seedRealData(@Req() req: { user: JwtUserPayload }): Promise<{
    success: boolean;
    message: string;
    counts?: {
      articles: number;
      services: number;
      employees: number;
      clients: number;
      appointments: number;
      cashSessions: number;
    };
    error?: string;
  }> {
      const tenant = req.user.tenant;
      const facilityId = '68d855f9f07f767dc2582ba2'; // Test Facility ID
    
      try {
      // 1. Kreiranje artikala
          const articles = [
              {
                  tenant,
                  name: 'Šampon za kose',
                  description: 'Profesionalni šampon za sve tipove kose',
                  price: 1500,
                  category: 'Kozmetika',
                  sku: 'SH-001',
                  stock: 50,
                  minStock: 10,
                  active: true,
                  unitOfMeasure: 'kom',
                  taxRates: 20,
                  isOnSale: false,
                  salePrice: 0,
                  code: 'SH-001',
                  supplier: null,
                  remark: ''
              },
              {
                  tenant,
                  name: 'Krema za lice',
                  description: 'Regenerišuća krema za lice',
                  price: 2500,
                  category: 'Kozmetika',
                  sku: 'KL-002',
                  stock: 30,
                  minStock: 5,
                  active: true,
                  unitOfMeasure: 'kom',
                  taxRates: 20,
                  isOnSale: false,
                  salePrice: 0,
                  code: 'KL-002',
                  supplier: null,
                  remark: ''
              },
              {
                  tenant,
                  name: 'Maske za lice',
                  description: 'Hidratantne maske za lice',
                  price: 1800,
                  category: 'Kozmetika',
                  sku: 'ML-003',
                  stock: 25,
                  minStock: 8,
                  active: true,
                  unitOfMeasure: 'kom',
                  taxRates: 20,
                  isOnSale: false,
                  salePrice: 0,
                  code: 'ML-003',
                  supplier: null,
                  remark: ''
              },
              {
                  tenant,
                  name: 'Sapun za ruke',
                  description: 'Antibakterijski sapun',
                  price: 800,
                  category: 'Higijena',
                  sku: 'SR-004',
                  stock: 100,
                  minStock: 20,
                  active: true,
                  unitOfMeasure: 'kom',
                  taxRates: 20,
                  isOnSale: false,
                  salePrice: 0,
                  code: 'SR-004',
                  supplier: null,
                  remark: ''
              },
              {
                  tenant,
                  name: 'Krema za ruke',
                  description: 'Hidratantna krema za ruke',
                  price: 1200,
                  category: 'Higijena',
                  sku: 'KR-005',
                  stock: 40,
                  minStock: 10,
                  active: true,
                  unitOfMeasure: 'kom',
                  taxRates: 20,
                  isOnSale: false,
                  salePrice: 0,
                  code: 'KR-005',
                  supplier: null,
                  remark: ''
              }
          ];

          // 2. Kreiranje usluga
          const services = [
              {
                  tenant,
                  name: 'Šišanje muško',
                  description: 'Profesionalno šišanje muške kose',
                  price: 2000,
                  durationMinutes: 30,
                  category: 'Šišanje',
                  active: true
              },
              {
                  tenant,
                  name: 'Šišanje žensko',
                  description: 'Profesionalno šišanje ženske kose',
                  price: 3000,
                  durationMinutes: 45,
                  category: 'Šišanje',
                  active: true
              },
              {
                  tenant,
                  name: 'Pranje kose',
                  description: 'Pranje i kondicioniranje kose',
                  price: 1500,
                  durationMinutes: 20,
                  category: 'Pranje',
                  active: true
              },
              {
                  tenant,
                  name: 'Feniranje',
                  description: 'Profesionalno feniranje kose',
                  price: 2500,
                  durationMinutes: 30,
                  category: 'Feniranje',
                  active: true
              },
              {
                  tenant,
                  name: 'Farbanje kose',
                  description: 'Profesionalno farbanje kose',
                  price: 5000,
                  durationMinutes: 120,
                  category: 'Farbanje',
                  active: true
              },
              {
                  tenant,
                  name: 'Manikir',
                  description: 'Kompletni manikir',
                  price: 3500,
                  durationMinutes: 60,
                  category: 'Manikir',
                  active: true
              },
              {
                  tenant,
                  name: 'Pedikir',
                  description: 'Kompletni pedikir',
                  price: 4000,
                  durationMinutes: 90,
                  category: 'Pedikir',
                  active: true
              }
          ];

          // 3. Kreiranje zaposlenih
          const employees = [
              {
                  tenant,
                  firstName: 'Ana',
                  lastName: 'Petrović',
                  contactEmail: 'ana.petrovic@flowzen.com',
                  contactPhone: '+381 11 123 4567',
                  jobRole: 'Frizer',
                  dateOfBirth: new Date('1990-05-15'),
                  isActive: true,
                  includeInAppoitments: true,
                  facilities: [facilityId],
                  avatarUrl: ''
              },
              {
                  tenant,
                  firstName: 'Marko',
                  lastName: 'Nikolić',
                  contactEmail: 'marko.nikolic@flowzen.com',
                  contactPhone: '+381 11 234 5678',
                  jobRole: 'Frizer',
                  dateOfBirth: new Date('1988-03-20'),
                  isActive: true,
                  includeInAppoitments: true,
                  facilities: [facilityId],
                  avatarUrl: ''
              },
              {
                  tenant,
                  firstName: 'Jovana',
                  lastName: 'Stojanović',
                  contactEmail: 'jovana.stojanovic@flowzen.com',
                  contactPhone: '+381 11 345 6789',
                  jobRole: 'Manikirista',
                  dateOfBirth: new Date('1992-02-10'),
                  isActive: true,
                  includeInAppoitments: true,
                  facilities: [facilityId],
                  avatarUrl: ''
              },
              {
                  tenant,
                  firstName: 'Stefan',
                  lastName: 'Jovanović',
                  contactEmail: 'stefan.jovanovic@flowzen.com',
                  contactPhone: '+381 11 456 7890',
                  jobRole: 'Recepcioner',
                  dateOfBirth: new Date('1985-04-01'),
                  isActive: true,
                  includeInAppoitments: false,
                  facilities: [facilityId],
                  avatarUrl: ''
              }
          ];

          // 4. Kreiranje klijenata
          const clients = [
              {
                  tenant,
                  firstName: 'Milica',
                  lastName: 'Đorđević',
                  contactEmail: 'milica.djordjevic@email.com',
                  contactPhone: '+381 11 567 8901',
                  address: 'Knez Mihailova 15, Beograd',
                  dateOfBirth: new Date('1990-05-15'),
                  notes: 'Redovni klijent, preferira kratku kosu',
                  isActive: true
              },
              {
                  tenant,
                  firstName: 'Nikola',
                  lastName: 'Milošević',
                  contactEmail: 'nikola.milosevic@email.com',
                  contactPhone: '+381 11 678 9012',
                  address: 'Terazije 8, Beograd',
                  dateOfBirth: new Date('1985-08-22'),
                  notes: 'Koristi usluge šišanja i manikira',
                  isActive: true
              },
              {
                  tenant,
                  firstName: 'Sara',
                  lastName: 'Popović',
                  contactEmail: 'sara.popovic@email.com',
                  contactPhone: '+381 11 789 0123',
                  address: 'Vračar, Beograd',
                  dateOfBirth: new Date('1992-12-03'),
                  notes: 'Specijalizovana za farbanje kose',
                  isActive: true
              },
              {
                  tenant,
                  firstName: 'Aleksandar',
                  lastName: 'Radić',
                  contactEmail: 'aleksandar.radic@email.com',
                  contactPhone: '+381 11 890 1234',
                  address: 'Zvezdara, Beograd',
                  dateOfBirth: new Date('1988-07-18'),
                  notes: 'Muški klijent, redovno šišanje',
                  isActive: true
              },
              {
                  tenant,
                  firstName: 'Jelena',
                  lastName: 'Tomić',
                  contactEmail: 'jelena.tomic@email.com',
                  contactPhone: '+381 11 901 2345',
                  address: 'Novi Beograd',
                  dateOfBirth: new Date('1995-03-25'),
                  notes: 'Mlada klijentkinja, eksperimentiše sa bojama',
                  isActive: true
              }
          ];

          // 5. Ubacivanje podataka u bazu
          // Obriši postojeće testne podatke
          await this.articleModel.deleteMany({ tenant });
          await this.serviceModel.deleteMany({ tenant });
          await this.employeeModel.deleteMany({ tenant });
          await this.clientModel.deleteMany({ tenant });
          await this.appointmentModel.deleteMany({ tenant });
          await this.cashSessionModel.deleteMany({ tenant });

          // Ubaci nove podatke
          const insertedArticles = await this.articleModel.insertMany(articles);
          const insertedServices = await this.serviceModel.insertMany(services);
          const insertedEmployees = await this.employeeModel.insertMany(employees);
          const insertedClients = await this.clientModel.insertMany(clients);

          // 6. Kreiranje termina sa stvarnim ID-jima
          const today = new Date();
          const appointments = [];
          const clientIds = insertedClients.map(c => c._id);
          const employeeIds = insertedEmployees.map(e => e._id);
          const serviceIds = insertedServices.map(s => s._id);
      
          for (let i = 0; i < 20; i++) {
              const appointmentDate = new Date(today);
              appointmentDate.setDate(today.getDate() + i);
              appointmentDate.setHours(9 + (i % 8), (i % 2) * 30, 0, 0);
        
              const endTime = new Date(appointmentDate.getTime() + (30 + (i % 60)) * 60000);
              appointments.push({
                  tenant,
                  facility: facilityId,
                  client: clientIds[i % clientIds.length],
                  employee: employeeIds[i % employeeIds.length],
                  service: serviceIds[i % serviceIds.length],
                  date: appointmentDate.toISOString().split('T')[0],
                  startHour: appointmentDate.getHours(),
                  endHour: endTime.getHours(),
                  status: i < 15 ? 'confirmed' : 'pending',
                  notes: `Termin ${i + 1} - ${services[i % services.length].name}`,
                  totalPrice: services[i % services.length].price,
                  paid: i < 10
              });
          }

          // 7. Kreiranje cash sesija sa realnim podacima
          const cashSessions = [];
          for (let i = 0; i < 10; i++) {
              const sessionDate = new Date(today);
              sessionDate.setDate(today.getDate() - i);
        
              const openingFloat = 3000 + (i * 500);
              const totalSales = 15000 + (i * 2000);
              const variance = (i % 3 === 0) ? 100 : (i % 3 === 1) ? -50 : 0;
        
              cashSessions.push({
                  tenant,
                  facility: facilityId,
                  openedBy: req.user.userId,
                  openedAt: new Date(sessionDate.getTime() - 8 * 60 * 60 * 1000), // 8h ranije
                  closedAt: new Date(sessionDate.getTime() - 1 * 60 * 60 * 1000), // 1h ranije
                  openingFloat,
                  closingCount: openingFloat + totalSales + variance,
                  totalSales,
                  totalRefunds: i % 4 === 0 ? 500 : 0,
                  variance,
                  variancePercentage: (variance / (openingFloat + totalSales)) * 100,
                  status: 'closed',
                  notes: `Dnevna sesija ${i + 1}`,
                  totalsByMethod: {
                      cash: Math.floor(totalSales * 0.6),
                      card: Math.floor(totalSales * 0.3),
                      voucher: Math.floor(totalSales * 0.05),
                      gift: Math.floor(totalSales * 0.03),
                      bank: Math.floor(totalSales * 0.02),
                      other: 0
                  }
              });
          }

          // Ubaci termine i sesije
          const insertedAppointments = await this.appointmentModel.insertMany(appointments);
          const insertedSessions = await this.cashSessionModel.insertMany(cashSessions);

          return {
              success: true,
              message: 'Realni testni podaci uspešno kreirani',
              counts: {
                  articles: insertedArticles.length,
                  services: insertedServices.length,
                  employees: insertedEmployees.length,
                  clients: insertedClients.length,
                  appointments: insertedAppointments.length,
                  cashSessions: insertedSessions.length
              }
          };

      } catch (error) {
          console.error('Error seeding real data:', error);
          return {
              success: false,
              message: 'Greška pri kreiranju testnih podataka',
              error: error.message
          };
      }
  }

  /**
   * Database overview - all entities and record counts
   * @param secret - Secret key for authorization
   * @returns Database overview data
   */
  @Get('database-overview')
  async getDatabaseOverview(@Query('secret') secret: string): Promise<{
    error?: string;
    success?: boolean;
    overview?: any;
    detailedInfo?: any;
    message?: string;
  }> {
      if (secret !== 'flowzen-setup-2025') {
          return { error: 'Unauthorized' };
      }

      try {
      // Uzmi sve kolekcije iz baze
          const db = this.userModel.db;
          const collections = await db.listCollections();
      
          const overview = {
              collections: {},
              totalRecords: 0,
              timestamp: new Date().toISOString()
          };

          // Prođi kroz sve kolekcije i prebroj zapise
          for (const collection of collections) {
              const collectionName = collection.name;
              const count = await db.collection(collectionName).countDocuments();
              overview.collections[collectionName] = count;
              overview.totalRecords += count;
          }

          // Dodaj detaljne informacije za ključne kolekcije
          const detailedInfo = {
              users: await db.collection('users').find({}).limit(5).toArray(),
              facilities: await db.collection('facilities').find({}).limit(5).toArray(),
              tenants: await db.collection('tenants').find({}).limit(5).toArray(),
              roles: await db.collection('roles').find({}).limit(5).toArray(),
              scopes: await db.collection('scopes').find({}).limit(5).toArray(),
              clients: await db.collection('clients').find({}).limit(5).toArray(),
              employees: await db.collection('employees').find({}).limit(5).toArray(),
              services: await db.collection('services').find({}).limit(5).toArray(),
              articles: await db.collection('articles').find({}).limit(5).toArray(),
              appointments: await db.collection('appointments').find({}).limit(5).toArray(),
              cashSessions: await db.collection('cashsessions').find({}).limit(5).toArray(),
              suppliers: await db.collection('suppliers').find({}).limit(5).toArray(),
              workingShifts: await db.collection('workingshifts').find({}).limit(5).toArray()
          };

          return {
              success: true,
              overview,
              detailedInfo,
              message: 'Database overview retrieved successfully'
          };

      } catch (error) {
          console.error('Error getting database overview:', error);
          return {
              success: false,
              error: error.message,
              message: 'Failed to get database overview'
          };
      }
  }

  /**
   * Find session by ID
   * @param id - Session ID
   * @param req - Request object
   * @returns Session details
   */
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: { user: JwtUserPayload }): Promise<CashSession> {
      if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException('Invalid session ID format');
      }
      return this.cashSessionService.findById(id, req.user);
  }

  // ============================================================================
  // CASH COUNTING & VERIFICATION ENDPOINTS
  // ============================================================================

  /**
   * Count cash in session
   * @param id - Session ID
   * @param dto - Cash counting data
   * @param req - Request object
   * @returns Cash counting results
   */
  @Post(':id/count-cash')
  async countCash(
    @Param('id') id: string, 
    @Body() dto: CashCountingDto, 
    @Req() req: { user: JwtUserPayload }
  ): Promise<{
    sessionId: string;
    expectedCash: number;
    countedCash: number;
    variance: number;
    variancePercentage: number;
    status: string;
    recommendations: string[];
  }> {
      if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException('Invalid session ID format');
      }
      return this.cashSessionService.countCash(id, dto, req.user);
  }

  /**
   * Verify cash count
   * @param id - Session ID
   * @param dto - Cash verification data
   * @param req - Request object
   * @returns Verification results
   */
  @Post(':id/verify-cash')
  async verifyCashCount(
    @Param('id') id: string, 
    @Body() dto: CashVerificationDto, 
    @Req() req: { user: JwtUserPayload }
  ): Promise<{
    sessionId: string;
    verified: boolean;
    expectedCash: number;
    actualCash: number;
    variance: number;
    variancePercentage: number;
    timestamp: Date;
  }> {
      if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException('Invalid session ID format');
      }
      return this.cashSessionService.verifyCashCount(id, dto, req.user);
  }

  /**
   * Handle cash variance (shortage/excess)
   * @param id - Session ID
   * @param dto - Variance handling data
   * @param req - Request object
   * @returns Variance handling results
   */
  @Post(':id/handle-variance')
  async handleCashVariance(
    @Param('id') id: string, 
    @Body() dto: CashVarianceDto, 
    @Req() req: { user: JwtUserPayload }
  ): Promise<{
    sessionId: string;
    action: string;
    variance: number;
    reason: string;
    timestamp: Date;
    handledBy: string;
  }> {
      if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException('Invalid session ID format');
      }
      return this.cashSessionService.handleCashVariance(id, dto, req.user);
  }

  // ============================================================================
  // CASH RECONCILIATION ENDPOINTS
  // ============================================================================

  /**
   * Reconcile cash for session
   * @param id - Session ID
   * @param req - Request object
   * @returns Reconciliation results
   */
  @Get(':id/reconcile')
  async reconcileSession(@Param('id') id: string, @Req() req: { user: JwtUserPayload }): Promise<any> {
      if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException('Invalid session ID format');
      }
      return this.cashSessionService.reconcileSession(id, req.user);
  }

  /**
   * Daily cash report
   * @param facility - Facility ID
   * @param date - Report date
   * @param req - Request object
   * @returns Daily cash report data
   */
  @Get('reports/daily')
  async getDailyCashReport(
    @Query('facility') facility: string,
    @Query('date') date: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<any> {
      if (!Types.ObjectId.isValid(facility)) {
          throw new BadRequestException('Invalid facility ID format');
      }
      return this.cashSessionService.getDailyCashReport(facility, date, req.user);
  }

  /**
   * Weekly cash report
   * @param facility - Facility ID
   * @param week - Week in YYYY-WW format
   * @param req - Request object
   * @returns Weekly cash report data
   */
  @Get('reports/weekly')
  async getWeeklyCashReport(
    @Query('facility') facility: string,
    @Query('week') week: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<{ message: string }> {
      if (!Types.ObjectId.isValid(facility)) {
          throw new BadRequestException('Invalid facility ID format');
      }
      // TODO: Implement weekly report
      return { message: 'Weekly report not implemented yet' };
  }

  /**
   * Monthly cash report
   * @param facility - Facility ID
   * @param month - Month in YYYY-MM format
   * @param req - Request object
   * @returns Monthly cash report data
   */
  @Get('reports/monthly')
  async getMonthlyCashReport(
    @Query('facility') facility: string,
    @Query('month') month: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<{ message: string }> {
      if (!Types.ObjectId.isValid(facility)) {
          throw new BadRequestException('Invalid facility ID format');
      }
      // TODO: Implement monthly report
      return { message: 'Monthly report not implemented yet' };
  }

  // ============================================================================
  // TEST & DEVELOPMENT ENDPOINTS
  // ============================================================================

  /**
   * Close all test sessions (development only)
   * @param secret - Secret key for authorization
   * @param body - Request body with facility and userId
   * @returns Number of closed sessions
   */
  @Post('close-all-test-sessions')
  async closeAllTestSessions(
    @Query('secret') secret: string, 
    @Body() body: { facility: string; userId: string }
  ): Promise<{ error?: string; closed?: number }> {
      if (secret !== 'flowzen-setup-2025') {
          return { error: 'Unauthorized' };
      }
      const result = await this.cashSessionService.closeAllTestSessions(body.facility, body.userId);
      return { closed: result };
  }

  /**
   * Find test IDs (development only)
   * @param secret - Secret key for authorization
   * @returns Test user and facility IDs
   */
  @Get('test-ids')
  async getTestIds(@Query('secret') secret: string): Promise<{ 
    error?: string; 
    users?: any[]; 
    facilities?: any[] 
  }> {
      if (secret !== 'flowzen-setup-2025') {
          return { error: 'Unauthorized' };
      }

      // Pronađi sve test user-e (npr. email sadrži 'test')
      const users = await this.userModel.find({ email: /test/i }).select('_id email name').lean();
      // Pronađi sve facility-je (npr. ime sadrži 'test' ili sve)
      const facilities = await this.facilityModel.find({ name: /test/i }).select('_id name').lean();
    
      return { users, facilities };
  }

  /**
   * Find all entities (development only)
   * @param secret - Secret key for authorization
   * @returns All roles and scopes
   */
  @Get('all-entities')
  async getAllEntities(@Query('secret') secret: string): Promise<{ 
    error?: string; 
    roles?: any[]; 
    scopes?: any[] 
  }> {
      if (secret !== 'flowzen-setup-2025') {
          return { error: 'Unauthorized' };
      }

      const roles = await this.userModel.db.collection('roles').find({}).toArray();
      const scopes = await this.userModel.db.collection('scopes').find({}).toArray();
    
      return { roles, scopes };
  }

}