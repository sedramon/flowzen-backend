import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const SUPERADMIN_CREDENTIALS = {
  email: 'global.admin@flowzen.io',
  password: 'superadmin',
};

describe('Global Admin Superadmin Flow (e2e)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;
  let csrfToken: string | undefined;

  const updateCsrfFromResponse = (res: request.Response) => {
    const headerToken = res.headers['x-csrf-token'];
    if (typeof headerToken === 'string') {
      csrfToken = headerToken;
    }
  };

  beforeAll(async () => {
    jest.setTimeout(60000);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    agent = request.agent(app.getHttpServer());

    const loginResponse = await agent.post('/auth/login').send(SUPERADMIN_CREDENTIALS).expect(200);
    updateCsrfFromResponse(loginResponse);

    expect(loginResponse.body).toHaveProperty('user');
    expect(loginResponse.body.user.email).toBe(SUPERADMIN_CREDENTIALS.email);

    const cookieHeader = loginResponse.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
    expect(Array.isArray(cookieHeader)).toBe(true);
    const cookies = cookieHeader as unknown as string[];
    expect(cookies.some((cookie) => cookie.startsWith('access_token='))).toBe(true);
    expect(cookies.some((cookie) => cookie.startsWith('csrf-token='))).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });

  const authenticatedGet = async (url: string, query?: Record<string, unknown>) => {
    let requestBuilder = agent.get(url);
    if (query) {
      requestBuilder = requestBuilder.query(query);
    }
    if (csrfToken) {
      requestBuilder = requestBuilder.set('X-CSRF-Token', csrfToken);
    }
    const res = await requestBuilder.expect(200);
    updateCsrfFromResponse(res);
    return res;
  };

  it('fetches global tenant overview', async () => {
    const response = await authenticatedGet('/admin/tenants/overview');
    expect(response.body).toMatchObject({
      total: expect.any(Number),
      active: expect.any(Number),
      pending: expect.any(Number),
      suspended: expect.any(Number),
      licensesExpiringSoon: expect.any(Number),
    });
    expect(Array.isArray(response.body.recentTenants)).toBe(true);
  });

  it('lists tenants with pagination', async () => {
    const response = await authenticatedGet('/admin/tenants', { limit: 5 });
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body).toHaveProperty('total');
  });

  it('lists global users', async () => {
    const response = await authenticatedGet('/admin/users', { limit: 5 });
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('lists global scopes', async () => {
    const response = await authenticatedGet('/admin/scopes', { category: 'global' });
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('retrieves audit logs with time range filter', async () => {
    const response = await authenticatedGet('/admin/audit', {
      timeRange: '24h',
      limit: 5,
    });
    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('limit');
  });
});
