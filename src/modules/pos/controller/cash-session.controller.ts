import { Controller, Post, Body, Param, Get, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { CashSessionService } from '../service/cash-session.service';
import { OpenSessionDto } from '../dto/open-session.dto';
import { CloseSessionDto } from '../dto/close-session.dto';
import { CashCountingDto, CashVerificationDto, CashVarianceDto } from '../dto/cash-counting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Facility } from '../../facility/schema/facility.schema';
import { Employee } from '../../employees/schema/employee.schema';
import { Client } from '../../clients/schemas/client.schema';
import { Article } from '../../articles/schema/article.schema';
import { Service } from '../../services/schemas/service.schema';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { CashSession } from '../schemas/cash-session.schema';

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
   * Otvaranje nove cash sesije
   */
  @Post('open')
  async open(@Body() dto: OpenSessionDto, @Req() req) {
    return this.cashSessionService.openSession(dto, req.user);
  }

  /**
   * Zatvaranje cash sesije
   */
  @Post(':id/close')
  async close(@Param('id') id: string, @Body() dto: CloseSessionDto, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    return this.cashSessionService.closeSession(id, dto, req.user);
  }

  /**
   * Pronalaženje svih sesija
   */
  @Get()
  async findAll(@Query() query, @Req() req) {
    return this.cashSessionService.findAll(query, req.user);
  }

  /**
   * Pronalaženje trenutne aktivne sesije
   */
  @Get('current')
  @UseGuards(ScopesGuard)
  async getCurrentSession(@Req() req) {
    return this.cashSessionService.getCurrentSession(req.user);
  }

  // ============================================================================
  // CASH REPORTS ENDPOINTS
  // ============================================================================

  /**
   * Generalni POS izveštaji
   */
  @Get('reports')
  @UseGuards(ScopesGuard)
  async getReports(
    @Query('tenant') tenant: string,
    @Query('facility') facility: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Req() req
  ) {
    return this.cashSessionService.getReports(tenant, facility, dateFrom, dateTo, req.user);
  }

  /**
   * Kreiranje realnih testnih podataka za POS sistem
   */
  @Post('seed-real-data')
  async seedRealData(@Req() req) {
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
   * Pregled baze podataka - svi entiteti i broj zapisa
   */
  @Get('database-overview')
  async getDatabaseOverview(@Query('secret') secret: string) {
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
   * Pronalaženje sesije po ID
   */
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    return this.cashSessionService.findById(id, req.user);
  }

  // ============================================================================
  // CASH COUNTING & VERIFICATION ENDPOINTS
  // ============================================================================

  /**
   * Brojanje novca u sesiji
   */
  @Post(':id/count-cash')
  async countCash(@Param('id') id: string, @Body() dto: CashCountingDto, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    return this.cashSessionService.countCash(id, dto, req.user);
  }

  /**
   * Verifikacija brojanja novca
   */
  @Post(':id/verify-cash')
  async verifyCashCount(@Param('id') id: string, @Body() dto: CashVerificationDto, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    return this.cashSessionService.verifyCashCount(id, dto, req.user);
  }

  /**
   * Rukovanje variance (nedostatak/višak novca)
   */
  @Post(':id/handle-variance')
  async handleCashVariance(@Param('id') id: string, @Body() dto: CashVarianceDto, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    return this.cashSessionService.handleCashVariance(id, dto, req.user);
  }

  // ============================================================================
  // CASH RECONCILIATION ENDPOINTS
  // ============================================================================

  /**
   * Usklađivanje cash-a za sesiju
   */
  @Get(':id/reconcile')
  async reconcileSession(@Param('id') id: string, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid session ID format');
    }
    return this.cashSessionService.reconcileSession(id, req.user);
  }

  /**
   * Dnevni cash izveštaj
   */
  @Get('reports/daily')
  async getDailyCashReport(
    @Query('facility') facility: string,
    @Query('date') date: string,
    @Req() req
  ) {
    if (!Types.ObjectId.isValid(facility)) {
      throw new BadRequestException('Invalid facility ID format');
    }
    return this.cashSessionService.getDailyCashReport(facility, date, req.user);
  }

  /**
   * Nedeljni cash izveštaj
   */
  @Get('reports/weekly')
  async getWeeklyCashReport(
    @Query('facility') facility: string,
    @Query('week') week: string, // YYYY-WW format
    @Req() req
  ) {
    if (!Types.ObjectId.isValid(facility)) {
      throw new BadRequestException('Invalid facility ID format');
    }
    // TODO: Implement weekly report
    return { message: 'Weekly report not implemented yet' };
  }

  /**
   * Mesečni cash izveštaj
   */
  @Get('reports/monthly')
  async getMonthlyCashReport(
    @Query('facility') facility: string,
    @Query('month') month: string, // YYYY-MM format
    @Req() req
  ) {
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
   * Zatvaranje svih test sesija (samo za development)
   */
  @Post('close-all-test-sessions')
  async closeAllTestSessions(
    @Query('secret') secret: string, 
    @Body() body: { facility: string, userId: string }
  ) {
    if (secret !== 'flowzen-setup-2025') {
      return { error: 'Unauthorized' };
    }
    const result = await this.cashSessionService.closeAllTestSessions(body.facility, body.userId);
    return { closed: result };
  }

  /**
   * Kreiranje svih test podataka (samo za development)
   */
  @Post('seed-all-test-data')
  async seedAllTestData(@Query('secret') secret: string) {
    if (secret !== 'flowzen-setup-2025') {
      return { error: 'Unauthorized' };
    }

    // 1. Pronađi test usera, facility, tenant
    const user = await this.userModel.findOne({ email: 'test@flowzen.com' });
    const facility = await this.facilityModel.findOne({ name: 'Test Facility' });
    const tenant = user?.tenant || facility?.tenant;
    
    if (!user || !facility || !tenant) {
      return { error: 'Test user, facility, or tenant not found. Run all-entities and create them first.' };
    }

    // 1a. Proveri i ažuriraj scope_pos_admin na roli pos-test-admin
    const rolesCol = this.userModel.db.collection('roles');
    const scopesCol = this.userModel.db.collection('scopes');
    
    // Kreiraj sve potrebne POS scope-ove (uključujući postojeće i nove)
    const posScopes = [
      // Postojeći scope-ovi iz create-test-role.ts
      { name: 'scope_pos:read', description: 'POS Read Access' },
      { name: 'scope_pos:sale', description: 'POS Sales Access' },
      { name: 'scope_pos:refund', description: 'POS Refund Access' },
      { name: 'scope_pos:session', description: 'POS Sessions Access' },
      { name: 'scope_pos:report', description: 'POS Reports Access' },
      { name: 'scope_pos:settings', description: 'POS Settings Access' },
      // Novi scope-ovi za Cash Management
      { name: 'scope_pos_admin', description: 'POS admin scope' },
      { name: 'scope_pos:cash_management', description: 'Cash Management Access' },
      { name: 'scope_pos:cash_reports', description: 'Cash Reports Access' },
      { name: 'scope_pos:cash_analytics', description: 'Cash Analytics Access' }
    ];
    
    const createdScopes = [];
    const existingScopes = [];
    
    for (const scope of posScopes) {
      let existingScope = await scopesCol.findOne({ name: scope.name });
      if (!existingScope) {
        // Kreiraj novi scope samo ako ne postoji
        const insertResult = await scopesCol.insertOne({ 
          name: scope.name, 
          description: scope.description,
          module: 'pos',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        existingScope = { 
          _id: insertResult.insertedId, 
          name: scope.name, 
          description: scope.description,
          module: 'pos',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        createdScopes.push(existingScope);
        console.log(`✅ Kreiran novi scope: ${scope.name}`);
      } else {
        existingScopes.push(existingScope);
        console.log(`ℹ️ Scope već postoji: ${scope.name}`);
      }
    }
    
    // Kombinuj sve scope-ove (postojeće i nove)
    const allScopes = [...createdScopes, ...existingScopes];
    
    const posAdminScope = createdScopes.find(s => s.name === 'scope_pos_admin');

    const posTestAdminRole = await rolesCol.findOne({ name: 'pos-test-admin', tenant: tenant._id });
    if (posTestAdminRole) {
      // Učitaj sve validne scope _id iz kolekcije scopes
      const allScopes = await scopesCol.find({}).toArray();
      const validScopeIds = new Set(allScopes.map(s => String(s._id)));
      let availableScopes = Array.isArray(posTestAdminRole.availableScopes) ? posTestAdminRole.availableScopes : [];
      
      // Očisti duplikate i nepostojeće scope-ove
      availableScopes = Array.from(new Set(availableScopes.map(id => String(id))))
        .filter(id => validScopeIds.has(id))
        .map(id => allScopes.find(s => String(s._id) === id)._id);
      
      // Dodaj sve POS scope-ove u rolu (postojeće i nove)
      const posScopeIds = allScopes.map(s => s._id);
      availableScopes = [...new Set([...availableScopes, ...posScopeIds])];
      
      await rolesCol.updateOne({ _id: posTestAdminRole._id }, { $set: { availableScopes } });
    }

    // 1c. Obezbedi da je test user vezan za pravu rolu i tenant
    const posTestAdminRoleId = posTestAdminRole?._id;
    if (user) {
      let needsUpdate = false;
      if (String(user.role) !== String(posTestAdminRoleId)) needsUpdate = true;
      if (String(user.tenant?._id || user.tenant) !== String(tenant._id)) needsUpdate = true;
      
      if (needsUpdate) {
        await this.userModel.updateOne(
          { _id: user._id }, 
          { $set: { role: posTestAdminRoleId, tenant: tenant._id } }
        );
      }
    }

    // 1d. Obezbedi da je facility vezan za pravi tenant
    if (facility && String(facility.tenant) !== String(tenant._id)) {
      await this.facilityModel.updateOne(
        { _id: facility._id }, 
        { $set: { tenant: tenant._id } }
      );
    }

    // 2. Kreiraj artikle
    const articleModel = this.userModel.db.collection('articles');
    const articles = [
      { name: 'Šampon', unitOfMeasure: 'kom', price: 500, tenant: tenant._id, isActive: true, stock: 100 },
      { name: 'Feniranje', unitOfMeasure: 'usluga', price: 1200, tenant: tenant._id, isActive: true, stock: 0 },
      { name: 'Maska za kosu', unitOfMeasure: 'kom', price: 800, tenant: tenant._id, isActive: true, stock: 50 },
    ];
    
    for (const a of articles) {
      const exists = await articleModel.findOne({ name: a.name, tenant: tenant._id });
      if (!exists) await articleModel.insertOne(a);
    }

    // 3. Kreiraj klijente
    const clientModel = this.userModel.db.collection('clients');
    const clients = [
      { firstName: 'Mina', lastName: 'Test', phone: '0601111111', tenant: tenant._id },
      { firstName: 'Jovana', lastName: 'Test', phone: '0602222222', tenant: tenant._id },
    ];
    
    for (const c of clients) {
      const exists = await clientModel.findOne({ phone: c.phone, tenant: tenant._id });
      if (!exists) await clientModel.insertOne(c);
    }

    // 4. Kreiraj usluge
    const serviceModel = this.userModel.db.collection('services');
    const services = [
      { name: 'Pranje kose', price: 400, tenant: tenant._id, isActive: true },
      { name: 'Šišanje', price: 1000, tenant: tenant._id, isActive: true },
    ];
    
    for (const s of services) {
      const exists = await serviceModel.findOne({ name: s.name, tenant: tenant._id });
      if (!exists) await serviceModel.insertOne(s);
    }

    // 5. Kreiraj appointments
    const appointmentModel = this.userModel.db.collection('appointments');
    const now = new Date();
    const appointments = [
      { 
        employee: user._id, 
        client: (await clientModel.findOne({ phone: '0601111111', tenant: tenant._id }))._id, 
        tenant: tenant._id, 
        facility: facility._id, 
        startHour: 10, 
        endHour: 11, 
        service: (await serviceModel.findOne({ name: 'Pranje kose', tenant: tenant._id }))._id, 
        date: now.toISOString().slice(0, 10), 
        paid: false 
      },
      { 
        employee: user._id, 
        client: (await clientModel.findOne({ phone: '0602222222', tenant: tenant._id }))._id, 
        tenant: tenant._id, 
        facility: facility._id, 
        startHour: 12, 
        endHour: 13, 
        service: (await serviceModel.findOne({ name: 'Šišanje', tenant: tenant._id }))._id, 
        date: now.toISOString().slice(0, 10), 
        paid: false 
      },
    ];
    
    for (const ap of appointments) {
      const exists = await appointmentModel.findOne({ 
        client: ap.client, 
        date: ap.date, 
        service: ap.service 
      });
      if (!exists) await appointmentModel.insertOne(ap);
    }

    // 6. Vrati ID-jeve
    return {
      userId: user._id,
      facilityId: facility._id,
      tenantId: tenant._id,
      articles: await articleModel.find({ tenant: tenant._id }).toArray(),
      clients: await clientModel.find({ tenant: tenant._id }).toArray(),
      services: await serviceModel.find({ tenant: tenant._id }).toArray(),
      appointments: await appointmentModel.find({ tenant: tenant._id }).toArray(),
      scopes: allScopes,
      createdScopes: createdScopes,
      existingScopes: existingScopes,
      role: posTestAdminRole
    };
  }

  /**
   * Pronalaženje test ID-jeva (samo za development)
   */
  @Get('test-ids')
  async getTestIds(@Query('secret') secret: string) {
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
   * Pronalaženje svih entiteta (samo za development)
   */
  @Get('all-entities')
  async getAllEntities(@Query('secret') secret: string) {
    if (secret !== 'flowzen-setup-2025') {
      return { error: 'Unauthorized' };
    }

    const roles = await this.userModel.db.collection('roles').find({}).toArray();
    const scopes = await this.userModel.db.collection('scopes').find({}).toArray();
    
    return { roles, scopes };
  }

}