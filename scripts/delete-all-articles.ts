import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const force = process.argv.includes('--yes') || process.env.FORCE_DELETE === '1';

  const countBefore = await prisma.article.count();
  console.log(`Articles avant suppression: ${countBefore}`);

  if (!force) {
    console.error('\nATTENTION: cette commande supprimera TOUS les articles.');
    console.error('Relancez avec `npx tsx scripts/delete-all-articles.ts --yes` pour confirmer.');
    process.exit(1);
  }

  const res = await prisma.article.deleteMany({});
  console.log(`Articles supprimés: ${res.count}`);

  const countAfter = await prisma.article.count();
  console.log(`Articles après suppression: ${countAfter}`);
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
