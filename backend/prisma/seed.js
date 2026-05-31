require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@condominio.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@condominio.com', password: adminPassword, apartment: '001', block: 'A', role: 'ADMIN' },
  });

  const residentPassword = await bcrypt.hash('morador123', 10);
  await prisma.user.upsert({
    where: { email: 'morador@condominio.com' },
    update: {},
    create: { name: 'João Silva', email: 'morador@condominio.com', password: residentPassword, apartment: '203', block: 'B' },
  });

  const spaces = [
    { name: 'Salão de Festas', description: 'Espaço amplo para comemorações com cozinha equipada.', capacity: 80, rules: 'Reserva com 7 dias de antecedência. Devolução até meia-noite.' },
    { name: 'Churrasqueira', description: 'Área coberta com churrasqueira a carvão e mesas.', capacity: 30, rules: 'Limpeza obrigatória após o uso.' },
    { name: 'Quadra Poliesportiva', description: 'Quadra coberta para futebol, vôlei e basquete.', capacity: 20, rules: 'Uso de calçado esportivo obrigatório.' },
    { name: 'Espaço Gourmet', description: 'Cozinha equipada com forno, geladeira e espaço para confraternizações.', capacity: 15, rules: 'Proibido fumar. Retirar pertences até as 22h.' },
  ];

  for (const space of spaces) {
    const existing = await prisma.space.findFirst({ where: { name: space.name } });
    if (!existing) await prisma.space.create({ data: space });
  }

  console.log('Seed concluído!');
  console.log('Admin:   admin@condominio.com / admin123');
  console.log('Morador: morador@condominio.com / morador123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
