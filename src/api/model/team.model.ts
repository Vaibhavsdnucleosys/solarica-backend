import prisma from "../../config/prisma";

// Create new team
export const createTeamModel = async (
  name: string,
  location: string,
  leaderId: string,
  company: string // New parameter
) => {
  // Check if team name already exists
  const existingTeam = await prisma.team.findFirst({
    where: { name }
  });
  if (existingTeam) {
    throw new Error("Team with this name already exists");
  }

  // Check if leader exists and is a worker
  const leader = await prisma.worker.findUnique({
    where: { id: leaderId },
    include: {
      leadingTeam: true
    }
  });
  if (!leader) {
    throw new Error("Worker not found");
  }
  if (leader.leadingTeam) {
    throw new Error("This worker is already leading another team");
  }

  const team = await prisma.team.create({
    data: {
      name,
      location,
      leaderId,
      company // Save company
    },
    include: {
      leader: {
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
          }
        }
      },
      workers: {
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
          }
        }
      },
      _count: {
        select: {
          workers: true
        }
      }
    }
  });

  return team;
};

// Get all teams
export const getAllTeamsModel = async () => {
  const teams = await prisma.team.findMany({
    include: {
      leader: {
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
          }
        }
      },
      workers: {
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
          }
        }
      },
      _count: {
        select: {
          workers: true
        }
      }
    }
  });
  return teams;
};

// Get team by ID
export const getTeamByIdModel = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      leader: {
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
          }
        }
      },
      workers: {
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
          }
        }
      },
      _count: {
        select: {
          workers: true
        }
      }
    }
  });
  return team;
};

// Update team
export const updateTeamModel = async (
  id: string,
  name?: string,
  location?: string,
  leaderId?: string
) => {
  // Check if team exists
  const existingTeam = await prisma.team.findUnique({
    where: { id },
    include: {
      leader: true
    }
  });
  if (!existingTeam) {
    throw new Error("Team not found");
  }

  // Check if name is being updated and if it's already taken
  if (name && name !== existingTeam.name) {
    const nameTaken = await prisma.team.findFirst({
      where: { name }
    });
    if (nameTaken) {
      throw new Error("Team name already exists");
    }
  }

  // Handle leaderId updates
  if (leaderId !== undefined) {
    // If leaderId is being set (not changed to null)
    if (leaderId) {
      const newLeader = await prisma.worker.findUnique({
        where: { id: leaderId },
        include: {
          leadingTeam: true
        }
      });
      if (!newLeader) {
        throw new Error("Worker not found");
      }
      if (newLeader.leadingTeam && newLeader.leadingTeam.id !== id) {
        throw new Error("This worker is already leading another team");
      }
    }
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      name,
      location,
      leaderId
    },
    include: {
      leader: {
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
          }
        }
      },
      workers: {
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
          }
        }
      },
      _count: {
        select: {
          workers: true
        }
      }
    }
  });

  return team;
};

// Delete team
export const deleteTeamModel = async (id: string) => {
  // Check if team exists
  const existingTeam = await prisma.team.findUnique({
    where: { id },
    include: {
      workers: true
    }
  });
  if (!existingTeam) {
    throw new Error("Team not found");
  }

  // Check if team has workers (optional - you might want to allow deletion with workers)
  if (existingTeam.workers.length > 0) {
    throw new Error("Cannot delete team with workers. Please remove all workers first.");
  }

  await prisma.team.delete({
    where: { id }
  });
  return { message: "Team deleted successfully" };
};


// Add worker to team
export const addWorkerToTeamModel = async (teamId: string, workerId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });
  if (!team) {
    throw new Error("Team not found");
  }

  const worker = await prisma.worker.findUnique({
    where: { id: workerId }
  });
  if (!worker) {
    throw new Error("Worker not found");
  }

  // Check if worker is already in a team
  if (worker.teamId) {
    throw new Error("Worker is already in a team");
  }

  const updatedWorker = await prisma.worker.update({
    where: { id: workerId },
    data: { teamId },
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

  return updatedWorker;
};

// Remove worker from team
export const removeWorkerFromTeamModel = async (workerId: string) => {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId }
  });
  if (!worker) {
    throw new Error("Worker not found");
  }

  const updatedWorker = await prisma.worker.update({
    where: { id: workerId },
    data: { teamId: null },
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

  return updatedWorker;
};

// Get team members
export const getTeamMembersModel = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      workers: {
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
          }
        }
      },
      leader: {
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
          }
        }
      }
    }
  });

  if (!team) {
    throw new Error("Team not found");
  }

  return team;
};

// Get workers without teams
export const getWorkersWithoutTeamsModel = async () => {
  const workers = await prisma.worker.findMany({
    where: {
      teamId: null,
      leadingTeam: null
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

