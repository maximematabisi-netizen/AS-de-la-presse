/**
 * Script pour créer le premier utilisateur admin
 * Usage: npx tsx scripts/create-admin-user.ts <username> <password> [email]
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const email = process.argv[4] || null;

  if (!username || !password) {
    console.error('Usage: npx tsx scripts/create-admin-user.ts <username> <password> [email]');
    process.exit(1);
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      console.error(`L'utilisateur "${username}" existe déjà.`);
      process.exit(1);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log(`✅ Utilisateur admin créé avec succès!`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email || 'Non défini'}`);
    console.log(`   Role: ${user.role}`);
  } catch (error: any) {
    console.error('Erreur lors de la création:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

