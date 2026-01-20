import { prisma } from '~/utils/prisma.server';
import { hashPassword } from '~/utils/password.server';

export async function getAdminByUsername(username: string) {
  return prisma.admin.findUnique({
    where: { username }
  });
}

export async function getAdminById(id: string) {
  return prisma.admin.findUnique({
    where: { id }
  });
}

export async function createAdmin(data: {
  username: string;
  password?: string;
  email?: string;
  role?: string;
}) {
  const password = data.password || 'admin123'; // Default password if not provided
  const hashedPassword = await hashPassword(password);
  
  return prisma.admin.create({
    data: {
      username: data.username,
      password: hashedPassword,
      email: data.email,
      role: data.role || 'admin'
    }
  });
}

export async function ensureAdminExists() {
  const count = await prisma.admin.count();
  if (count === 0) {
    console.log('Creates default admin user');
    await createAdmin({
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
      email: 'admin@example.com'
    });
  }
}
// Update admin (hashes password if provided)
export async function updateAdmin(id: string, data: {
  username?: string;
  password?: string;
  email?: string;
  role?: string;
}) {
  const updateData: any = { ...data };
  
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }
  
  return prisma.admin.update({
    where: { id },
    data: updateData
  });
}
