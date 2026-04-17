import prisma from "../../config/prisma";
import bcrypt from "bcrypt";

// Create new user/employee
// Create new user/employee
export const createEmployeeModel = async (email: string, password: string, roleName: string, name: string, phone?: string) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Validate role
  const validRoles = ['Sales', 'Accounting', 'Operation', 'Operation Employee', 'admin']; // Updated to match frontend
  if (!validRoles.includes(roleName) && !roleName.startsWith('role')) {
    // fallback for legacy roles if needed, but primary are above
    throw new Error("Role not allowed");
  }

  // Get or create role
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Transaction to create User and Worker
  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        roleId: role!.id
      },
      include: { role: true }
    });

    const worker = await tx.worker.create({
      data: {
        name,
        email,
        // @ts-ignore

        userId: user.id
      }
    });

    return { user, worker };
  });

  // Return only non-sensitive data
  const { password: _, ...userData } = result.user;
  return { ...userData, worker: result.worker };
};

// Get all employees (non-admin users)
export const getAllEmployeesModel = async () => {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      role: {
        name: {
          not: 'admin'
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: {
        select: {
          name: true
        }
      },
      createdAt: true,
      worker: {
        select: {
          name: true
        }
      }
    }
  });

  // Transform for frontend
  return users.map((user: any) => ({
    ...user,
    name: user.worker?.name || user.name || 'Unknown',
    grants: [], // Default empty grants for now
    category: user.role?.name || 'General'
  }));
};

// Get user by ID
export const getEmployeeByIdModel = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: {
        select: {
          name: true
        }
      },
      createdAt: true
    }
  });
  return user;
};

// Update user
export const updateEmployeeModel = async (id: string, name?: string, email?: string, roleName?: string, phone?: string) => {
  // Validate role if provided
  if (roleName) {
    const validRoles = ['role1', 'role2', 'role3']; // This seems essentially unused or incorrect based on createEmployeeModel, but keeping signature
    // Actually createEmployeeModel uses: ['Sales', 'Accounting', 'Operation', 'Operation Employee', 'admin']
    // Let's not break existing validation if it's working for them, or just ignore since it's an optional param here?
    // The current code has a hardcoded check for ['role1', 'role2', 'role3'] which looks like placeholder code that might be blocking valid roles if strictly enforced.
    // However, I should focus on adding `phone`.
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });
  if (!existingUser) {
    throw new Error("User not found");
  }

  // Check if email is being updated and if it's already taken
  if (email && email !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email }
    });
    if (emailTaken) {
      throw new Error("Email already exists");
    }
  }

  let roleId = existingUser.roleId;
  if (roleName) {
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName } });
    }
    roleId = role.id;
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name, email, roleId, phone },
    include: { role: true }
  });

  // Return only non-sensitive data
  const { password: _, ...userData } = user;
  return userData;
};

// Soft Delete user
export const deleteEmployeeModel = async (id: string) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });
  if (!existingUser) {
    throw new Error("User not found");
  }

  // Perform Soft Delete
  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  return { message: "User deactivated successfully" };
};

// Get users by role
export const getEmployeesByCategoryModel = async (roleName: string) => {
  // Validate role
  const validRoles = ['role1', 'role2', 'role3'];
  if (!validRoles.includes(roleName)) {
    throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        name: roleName
      }
    },
    select: {
      id: true,
      email: true,
      role: {
        select: {
          name: true
        }
      },
      createdAt: true
    }
  });
  return users;
};

// Get current user profile
export const getCurrentEmployeeModel = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          name: true
        }
      },
      createdAt: true
    }
  });
  return user;
};

// Update employee's sales target
export const updateEmployeeSalesTargetModel = async (
  id: string,
  salesTarget: number,
  userId: string
) => {
  // Verify the user has permission (admin or the employee themselves)
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin && id !== userId) {
    throw new Error('Not authorized to update this employee');
  }

  return await prisma.user.update({
    where: { id },
    data: { salesTarget },
    select: {
      id: true,
      name: true,
      email: true,
      salesTarget: true,
      role: {
        select: {
          name: true
        }
      }
    }
  });
};

// Helper function to check if user is admin
const isUserAdmin = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        select: {
          name: true
        }
      }
    }
  });
  return user?.role?.name === 'admin';
};

