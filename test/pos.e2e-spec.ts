import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const TEST_USER = { email: 'test@flowzen.com', password: 'test123' };
const FACILITY_ID = '68d855f9f07f767dc2582ba2';
const SUPERADMIN_CREDENTIALS = { email: 'global.admin@flowzen.io', password: 'superadmin' };

describe('POS End-to-End Flow', () => {
    let app: INestApplication;
    let agent: ReturnType<typeof request.agent>;
    let sessionId: string;
    let csrfToken: string | undefined;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();

        agent = request.agent(app.getHttpServer());

        const loginRes = await agent.post('/auth/login').send(TEST_USER);
        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toEqual(expect.objectContaining({
            message: 'Login successful',
            user: expect.objectContaining({ email: TEST_USER.email }),
        }));
        userId = loginRes.body.user.userId;
        rotateCsrfFromResponse(loginRes);

        await ensurePosAdminScope(app, userId, TEST_USER.email);

        const reloginRes = await agent.post('/auth/login').send(TEST_USER);
        expect(reloginRes.status).toBe(200);
        rotateCsrfFromResponse(reloginRes);

        const closeAllRes = await agent
            .post('/pos/sessions/close-all-test-sessions?secret=flowzen-setup-2025')
            .set('X-CSRF-Token', csrfToken ?? '')
            .send({ facility: FACILITY_ID, userId });
        expect([200, 201, 204, 404]).toContain(closeAllRes.status);
        rotateCsrfFromResponse(closeAllRes);
    });

    const rotateCsrfFromResponse = (res: request.Response) => {
        const headerToken = res.headers['x-csrf-token'];
        if (typeof headerToken === 'string') {
            csrfToken = headerToken;
        }
    };

    const authedPost = (url: string) => {
        let req = agent.post(url);
        if (csrfToken) {
            req = req.set('X-CSRF-Token', csrfToken);
        }
        return req;
    };

    const authedGet = (url: string) => {
        let req = agent.get(url);
        if (csrfToken) {
            req = req.set('X-CSRF-Token', csrfToken);
        }
        return req;
    };

    it('opens a cash session and retrieves session id', async () => {
        const res = await authedPost('/pos/sessions/open').send({ facility: FACILITY_ID, openingFloat: 100, note: 'Test session' });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ success: true, message: 'Cash session opened successfully' });
        rotateCsrfFromResponse(res);

        sessionId = res.body.data?.id || res.body.data?._id;

        if (!sessionId) {
            const sessionsRes = await authedGet(`/pos/sessions?status=open&facility=${FACILITY_ID}`);
            expect(sessionsRes.status).toBe(200);
            expect(sessionsRes.body).toMatchObject({ success: true, data: expect.any(Array) });
            rotateCsrfFromResponse(sessionsRes);

            const openSessions = sessionsRes.body.data as Array<{ _id?: string; id?: string; openedBy?: { _id?: string } | string }>;
            expect(openSessions.length).toBeGreaterThan(0);
            const ownSession = openSessions.find((session) => {
                if (typeof session.openedBy === 'string') {
                    return session.openedBy === userId;
                }
                return session.openedBy?._id === userId;
            });
            expect(ownSession).toBeDefined();
            sessionId = ownSession?._id || ownSession?.id as string;
        }

        expect(sessionId).toBeDefined();
    });

    it('closes the cash session', async () => {
        const res = await authedPost(`/pos/sessions/${sessionId}/close`).send({ closingCount: 100, note: 'Closing test session' });
        if (res.status !== 200) {
            // eslint-disable-next-line no-console
            console.error('close-session response:', res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            message: 'Cash session closed successfully',
            data: expect.objectContaining({ id: expect.any(String), variance: expect.any(Number) }),
        });
        rotateCsrfFromResponse(res);
    });

    afterAll(async () => {
        await app.close();
    });

    async function ensurePosAdminScope(nestApp: INestApplication, targetUserId: string, targetEmail: string) {
        const superAdminAgent = request.agent(nestApp.getHttpServer());
        let superCsrf: string | undefined;

        const loginRes = await superAdminAgent.post('/auth/login').send(SUPERADMIN_CREDENTIALS);
        expect(loginRes.status).toBe(200);
        superCsrf = loginRes.headers['x-csrf-token'];

        const rotate = (res: request.Response) => {
            const headerToken = res.headers['x-csrf-token'];
            if (typeof headerToken === 'string') {
                superCsrf = headerToken;
            }
        };

        const usersRes = await superAdminAgent
            .get(`/admin/users?email=${encodeURIComponent(targetEmail)}`)
            .set('X-CSRF-Token', superCsrf ?? '');
        expect(usersRes.status).toBe(200);
        rotate(usersRes);

        const userRecord = usersRes.body.items?.find((item: any) => item._id === targetUserId || item.userId === targetUserId);
        expect(userRecord).toBeDefined();
        const existingScopes: string[] = userRecord?.scopes || [];
        const updatedScopes = Array.from(new Set([...existingScopes, 'scope_pos_admin']));

        const patchRes = await superAdminAgent
            .patch(`/admin/users/${targetUserId}`)
            .set('X-CSRF-Token', superCsrf ?? '')
            .send({ scopes: updatedScopes });
        expect([200, 204]).toContain(patchRes.status);
        rotate(patchRes);
    }
});
