// Lightweight wrapper that tries to import PrismaClient if available, otherwise provides a mock
let prisma: any = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {
  // No prisma installed — provide a minimal mock with same method names used later
  prisma = {
    article: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => data,
      update: async (args: any) => args,
    },
    user: {
      findUnique: async () => null,
    },
  };
}

export default prisma;
