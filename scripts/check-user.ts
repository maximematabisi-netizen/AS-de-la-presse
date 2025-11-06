/**
 * Script pour vérifier si un utilisateur existe en base de données
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || 'Hermes';

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        password: true, // Pour vérifier que le mot de passe est bien hashé
      },
    });

    if (user) {
      console.log('✅ Utilisateur trouvé:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email || 'Non défini'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hashé: ${user.password.substring(0, 20)}... (${user.password.length} caractères)`);
    } else {
      console.log(`❌ Utilisateur "${username}" non trouvé`);
      
      // Lister tous les utilisateurs
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });
      
      if (allUsers.length > 0) {
        console.log('\nUtilisateurs existants:');
        allUsers.forEach(u => {
          console.log(`   - ${u.username} (${u.role})`);
        });
      } else {
        console.log('\nAucun utilisateur en base de données');
      }
    }
  } catch (error: any) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

