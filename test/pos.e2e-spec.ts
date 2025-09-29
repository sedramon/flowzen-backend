import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// Realni test user i facility ID iz baze
const TEST_USER = { email: 'test@flowzen.com', password: 'test123' };
const FACILITY_ID = '68d855f9f07f767dc2582ba2';
// Artikli iz seed-all-test-data (primer: Šampon)
const ARTICLE_ID = '68d8769eb9543b6f82264156'; // Šampon

// Primer body-ja za čišćenje sesija:
// {
//   "facility": "68d855f9f07f767dc2582ba2",
//   "userId": "68d8516738bf736b02a94809"
// }

describe('POS End-to-End Flow', () => {
  let app: INestApplication;
  let sessionId: string;
  let saleId: string;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get JWT
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(TEST_USER);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    jwt = 'Bearer ' + res.body.access_token;

    // Zatvori sve otvorene sesije za test usera i facility
    await request(app.getHttpServer())
      .post('/pos/sessions/close-all-test-sessions?secret=flowzen-setup-2025')
      .send({ facility: FACILITY_ID, userId: '68d8516738bf736b02a94809' });
  });

  it('should open a cash session', async () => {
    const res = await request(app.getHttpServer())
      .post('/pos/sessions/open')
      .set('Authorization', jwt)
      .send({ facility: FACILITY_ID, openingFloat: 100 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    sessionId = res.body.id;
  });

  it('should create a sale', async () => {
    const res = await request(app.getHttpServer())
      .post('/pos/sales')
      .set('Authorization', jwt)
      .send({
        facility: FACILITY_ID,
        items: [
          { refId: ARTICLE_ID, type: 'product', name: 'Šampon', qty: 1, unitPrice: 500, discount: 0, taxRate: 20, total: 500 },
        ],
        payments: [
          { method: 'cash', amount: 500 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    saleId = res.body.id;
  });

  it('should refund the sale', async () => {
    const res = await request(app.getHttpServer())
      .post(`/pos/sales/${saleId}/refund`)
      .set('Authorization', jwt)
      .send({ amount: 100 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should close the cash session', async () => {
    const res = await request(app.getHttpServer())
      .post(`/pos/sessions/${sessionId}/close`)
      .set('Authorization', jwt)
      .send({ closingCount: 100 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('variance');
  });

  afterAll(async () => {
    await app.close();
  });
});
