import { connect, connection, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI;

async function main() {
    await connect(MONGO_URI);

    // 1. Pronađi tenant
    const tenant = await connection.collection('tenants').findOne({ name: 'Test Tenant' });
    if (!tenant) throw new Error('Test Tenant not found');
    const tenantId = tenant._id;

    // 2. Pronađi admin rolu
    const role = await connection.collection('roles').findOne({ name: 'admin', tenant: tenantId });
    if (!role) throw new Error('Admin role not found');
    const roleId = role._id;

    // 3. Kreiraj korisnika
    const passwordHash = await bcrypt.hash('test123', 10);
    await connection.collection('users').findOneAndUpdate(
        { email: 'test@flowzen.com' },
        {
            $set: {
                name: 'Test User',
                password: passwordHash,
                role: roleId,
                tenant: tenantId,
            },
            $setOnInsert: {
                email: 'test@flowzen.com',
            },
        },
        { upsert: true }
    );

    console.log('Test user created/updated successfully!');
    await connection.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
