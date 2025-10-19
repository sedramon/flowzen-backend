import { connect, connection, Types } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flowzen';

async function main() {
    await connect(MONGO_URI);

    // 1. Pronađi tenant
    const tenant = await connection.collection('tenants').findOne({ name: 'Test Tenant' });
    if (!tenant) throw new Error('Test Tenant not found');
    const tenantId = tenant._id;

    // 2. Pronađi sve POS scope-ove
    const posScopes = await connection.collection('scopes').find({ name: { $in: [
        'scope_pos:read',
        'scope_pos:sale',
        'scope_pos:refund',
        'scope_pos:session',
        'scope_pos:report',
        'scope_pos:settings',
    ] } }).toArray();
    if (posScopes.length < 6) throw new Error('Nisu svi POS scope-ovi pronađeni!');
    const scopeIds = posScopes.map(s => s._id);

    // 3. Kreiraj rolu
    const role = await connection.collection('roles').findOneAndUpdate(
        { name: 'admin', tenant: tenantId },
        {
            $set: {
                name: 'admin',
                availableScopes: scopeIds,
                tenant: tenantId,
            },
        },
        { upsert: true, returnDocument: 'after' }
    );
    console.log('Admin rola za POS kreirana/azurirana:', role.value);
    await connection.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
