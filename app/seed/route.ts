import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const client = await db.connect();

async function seedUsers() {
await client.sqlCREATE EXTENSION IF NOT EXISTS "uuid-ossp";
await client.sqlCREATE TABLE IF NOT EXISTS users ( id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, name VARCHAR(255) NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL );;

const insertedUsers = await Promise.all(
users.map(async (user) => {
const hashedPassword = await bcrypt.hash(user.password, 10);
return client.sqlINSERT INTO users (id, name, email, password) VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}) ON CONFLICT (id) DO NOTHING;;
}),
);

return insertedUsers;
}

async function seedInvoices() {
await client.sqlCREATE EXTENSION IF NOT EXISTS "uuid-ossp";

await client.sqlCREATE TABLE IF NOT EXISTS invoices ( id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, customer_id UUID NOT NULL, amount INT NOT NULL, status VARCHAR(255) NOT NULL, date DATE NOT NULL );;

const insertedInvoices = await Promise.all(
invoices.map(
(invoice) => client.sqlINSERT INTO invoices (customer_id, amount, status, date) VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date}) ON CONFLICT (id) DO NOTHING;,
),
);

return insertedInvoices;
}

async function seedCustomers() {
await client.sqlCREATE EXTENSION IF NOT EXISTS "uuid-ossp";

await client.sqlCREATE TABLE IF NOT EXISTS customers ( id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, image_url VARCHAR(255) NOT NULL );;

const insertedCustomers = await Promise.all(
customers.map(
(customer) => client.sqlINSERT INTO customers (id, name, email, image_url) VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url}) ON CONFLICT (id) DO NOTHING;,
),
);

return insertedCustomers;
}

async function seedRevenue() {
await client.sqlCREATE TABLE IF NOT EXISTS revenue ( month VARCHAR(4) NOT NULL UNIQUE, revenue INT NOT NULL );;

const insertedRevenue = await Promise.all(
revenue.map(
(rev) => client.sqlINSERT INTO revenue (month, revenue) VALUES (${rev.month}, ${rev.revenue}) ON CONFLICT (month) DO NOTHING;,
),
);

return insertedRevenue;
}

export async function GET() {

try {
await client.sqlBEGIN;
await seedUsers();
await seedCustomers();
await seedInvoices();
await seedRevenue();
await client.sqlCOMMIT;

return Response.json({ message: 'Database seeded successfully' });
} catch (error) {
await client.sqlROLLBACK;
return Response.json({ error }, { status: 500 });
}
}
