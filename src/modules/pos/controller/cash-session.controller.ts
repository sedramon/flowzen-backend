import { Controller, Post, Body, Param, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { CashSessionService } from '../service/cash-session.service';
import { OpenSessionDto } from '../dto/open-session.dto';
import { CloseSessionDto } from '../dto/close-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Facility } from '../../facility/schema/facility.schema';
import { Article } from '../../articles/schema/article.schema';
// OBRISANO: import { hashSync } from 'bcryptjs';

@Controller('pos/sessions')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class CashSessionController {
  constructor(
    private readonly cashSessionService: CashSessionService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
  ) {}

  @Post('open')
  async open(@Body() dto: OpenSessionDto, @Req() req) {
    return this.cashSessionService.openSession(dto, req.user);
  }

  @Post(':id/close')
  async close(@Param('id') id: string, @Body() dto: CloseSessionDto, @Req() req) {
    return this.cashSessionService.closeSession(id, dto, req.user);
  }

  // TEST ONLY: Close all open test sessions for a user/facility
  @Post('close-all-test-sessions')
  async closeAllTestSessions(@Query('secret') secret: string, @Body() body: { facility: string, userId: string }) {
    if (secret !== 'flowzen-setup-2025') {
      return { error: 'Unauthorized' };
    }
    const result = await this.cashSessionService.closeAllTestSessions(body.facility, body.userId);
    return { closed: result };
  }

  // TEST ONLY: Seed all test data (articles, clients, services, appointments)
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
    // 1a. Proveri i ažuriraj scope_pos_admin na roli pos-test-admin (kao ObjectId, ne string!)
    const rolesCol = this.userModel.db.collection('roles');
    const scopesCol = this.userModel.db.collection('scopes');
    let posAdminScope = await scopesCol.findOne({ name: 'scope_pos_admin' });
    if (!posAdminScope) {
      const insertResult = await scopesCol.insertOne({ name: 'scope_pos_admin', description: 'POS admin scope' });
      posAdminScope = { _id: insertResult.insertedId, name: 'scope_pos_admin', description: 'POS admin scope' };
    }
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
      await rolesCol.updateOne({ _id: posTestAdminRole._id }, { $set: { availableScopes } });
    }
    // 1c. Obezbedi da je test user vezan za pravu rolu i tenant
    const posTestAdminRoleId = posTestAdminRole?._id;
    if (user) {
      let needsUpdate = false;
      if (String(user.role) !== String(posTestAdminRoleId)) needsUpdate = true;
      if (String(user.tenant?._id || user.tenant) !== String(tenant._id)) needsUpdate = true;
      if (needsUpdate) {
        await this.userModel.updateOne({ _id: user._id }, { $set: { role: posTestAdminRoleId, tenant: tenant._id } });
      }
    }
    // 1d. Obezbedi da je facility vezan za pravi tenant
    if (facility && String(facility.tenant) !== String(tenant._id)) {
      await this.facilityModel.updateOne({ _id: facility._id }, { $set: { tenant: tenant._id } });
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
      { employee: user._id, client: (await clientModel.findOne({ phone: '0601111111', tenant: tenant._id }))._id, tenant: tenant._id, facility: facility._id, startHour: 10, endHour: 11, service: (await serviceModel.findOne({ name: 'Pranje kose', tenant: tenant._id }))._id, date: now.toISOString().slice(0, 10), paid: false },
      { employee: user._id, client: (await clientModel.findOne({ phone: '0602222222', tenant: tenant._id }))._id, tenant: tenant._id, facility: facility._id, startHour: 12, endHour: 13, service: (await serviceModel.findOne({ name: 'Šišanje', tenant: tenant._id }))._id, date: now.toISOString().slice(0, 10), paid: false },
    ];
    for (const ap of appointments) {
      const exists = await appointmentModel.findOne({ client: ap.client, date: ap.date, service: ap.service });
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
    };
  }

  // TEST ONLY: Get all test users and facilities
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

  // TEST ONLY: Get ALL users, facilities, tenants, roles (Mongoose lean)
  @Get('all-entities')
  async getAllEntities(@Query('secret') secret: string) {
    if (secret !== 'flowzen-setup-2025') {
      return { error: 'Unauthorized' };
    }
    const roles = await this.userModel.db.collection('roles').find({}).toArray();
    const scopes = await this.userModel.db.collection('scopes').find({}).toArray();
    return { roles, scopes };
  }

  @Get()
  async findAll(@Query() query, @Req() req) {
    return this.cashSessionService.findAll(query, req.user);
  }
}
