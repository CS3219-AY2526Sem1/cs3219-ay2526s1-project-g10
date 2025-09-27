import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function connectToDB() {
  // Prisma automatically connects to the database when you use the client
  console.log("Prisma client initialized");
}

export async function createUser(username, email, password) {
  return prisma.user.create({
    data: { username, email, password },
  });
}

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function findUserByUsernameOrEmail(username, email) {
  return prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
}

export async function findAllUsers() {
  return prisma.user.findMany();
}

export async function updateUserById(userId, username, email, password) {
  return prisma.user.update({
    where: { id: userId },
    data: { username, email, password },
  });
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  });
}

export async function deleteUserById(userId) {
  return prisma.user.delete({
    where: { id: userId },
  });
}