import prisma from "../../config/prisma";

// Create new worker
export const createWorkerModel = async (
  name: string,
  email: string,
  company: string,
  location: string,
  userId?: string
) => {
  // Check if worker email already exists
  const existingWorker = await prisma.worker.findUnique({
    where: { email }
  });
  if (existingWorker) {
    throw new Error("Worker with this email already exists");
  }

  // If userId is provided, check if user exists and is not admin
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role.name === "admin") {
      throw new Error("Cannot assign admin user to worker profile");
    }

    // Check if user is already linked to a worker
    const existingUserWorker = await prisma.worker.findUnique({
      where: { userId }
    });
    if (existingUserWorker) {
      throw new Error("User is already linked to a worker profile");
    }
  }

  const worker = await prisma.worker.create({
    data: {
      name,
      email,
      company,
      location,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      team: true,
      leadingTeam: true
    }
  });

  return worker;
};

// Get all workers
export const getAllWorkersModel = async () => {
  const workers = await prisma.worker.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          location: true
        }
      },
      leadingTeam: {
        select: {
          id: true,
          name: true,
          location: true
        }
      }
    }
  });
  return workers;
};

// Get worker by ID
export const getWorkerByIdModel = async (id: string) => {
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          location: true
        }
      },
      leadingTeam: {
        select: {
          id: true,
          name: true,
          location: true
        }
      }
    }
  });
  return worker;
};

// Update worker
export const updateWorkerModel = async (
  id: string,
  name?: string,
  email?: string,
  company?: string,
  location?: string,
  userId?: string
) => {
  // Check if worker exists
  const existingWorker = await prisma.worker.findUnique({
    where: { id }
  });
  if (!existingWorker) {
    throw new Error("Worker not found");
  }

  // Check if email is being updated and if it's already taken
  if (email && email !== existingWorker.email) {
    const emailTaken = await prisma.worker.findUnique({
      where: { email }
    });
    if (emailTaken) {
      throw new Error("Email already exists");
    }
  }

  // Handle userId updates
  if (userId !== undefined) {
    // If userId is being set (not removed)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.role.name === "admin") {
        throw new Error("Cannot assign admin user to worker profile");
      }

      // Check if user is already linked to another worker
      const existingUserWorker = await prisma.worker.findUnique({
        where: { userId }
      });
      if (existingUserWorker && existingUserWorker.id !== id) {
        throw new Error("User is already linked to another worker profile");
      }
    }
  }

  const worker = await prisma.worker.update({
    where: { id },
    data: {
      name,
      email,
      company,
      location,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          location: true
        }
      },
      leadingTeam: {
        select: {
          id: true,
          name: true,
          location: true
        }
      }
    }
  });

  return worker;
};

// Delete worker
export const deleteWorkerModel = async (id: string) => {
  // Check if worker exists
  const existingWorker = await prisma.worker.findUnique({
    where: { id },
    include: {
      leadingTeam: true
    }
  });
  if (!existingWorker) {
    throw new Error("Worker not found");
  }

  // Check if worker is leading a team
  if (existingWorker.leadingTeam) {
    throw new Error("Cannot delete worker who is leading a team. Please assign a new leader first.");
  }

  await prisma.worker.delete({
    where: { id }
  });
  return { message: "Worker deleted successfully" };
};

// Get workers by company
export const getWorkersByCompanyModel = async (company: string) => {
  const workers = await prisma.worker.findMany({
    where: { company },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          location: true
        }
      },
      leadingTeam: {
        select: {
          id: true,
          name: true,
          location: true
        }
      }
    }
  });
  return workers;
};


