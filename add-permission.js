const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function addPermission() {
  try {
    // 1. Trouver l'utilisateur avec le rôle CUSTOM
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOM' },
      include: { customRole: { include: { permissions: true } } }
    });

    if (users.length === 0) {
      console.log('Aucun utilisateur avec le rôle CUSTOM trouvé');
      return;
    }

    console.log('Utilisateurs CUSTOM trouvés:', users.length);

    // 2. Créer la permission "creer" si elle n'existe pas
    let permission = await prisma.permission.findUnique({
      where: { name: 'creer' }
    });

    if (!permission) {
      permission = await prisma.permission.create({
        data: {
          name: 'creer',
          action: 'creer',
          resource: 'users',
          description: 'Permission de créer des utilisateurs'
        }
      });
      console.log('Permission "creer" créée');
    }

    // 3. Ajouter la permission à chaque rôle custom
    for (const user of users) {
      if (user.customRole) {
        const hasPermission = user.customRole.permissions.some(p => p.name === 'creer');
        
        if (!hasPermission) {
          await prisma.customRole.update({
            where: { id: user.customRole.id },
            data: {
              permissions: {
                connect: { id: permission.id }
              }
            }
          });
          console.log(`Permission "creer" ajoutée au rôle de ${user.nom}`);
        } else {
          console.log(`Permission "creer" déjà présente pour ${user.nom}`);
        }
      }
    }

    console.log('Terminé!');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPermission();
