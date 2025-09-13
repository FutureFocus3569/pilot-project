import { PrismaClient } from '@prisma/client';
import { DashboardPage } from '@/lib/prisma-enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  centreId: string;
  centreIds?: string[];
  pagePermissions: {
    page: DashboardPage;
    enabled: boolean;
    centreIds?: string[]; // Centre-specific permissions per page
  }[];
}

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  centreId: string;
  createdAt: Date;
  updatedAt: Date;
  centrePermissions: {
    centreId: string;
    centreName: string;
    centreCode: string;
    permissions: {
      canViewOccupancy: boolean;
      canEditOccupancy: boolean;
      canViewFinancials: boolean;
      canEditFinancials: boolean;
      canViewEnrollments: boolean;
      canEditEnrollments: boolean;
      canViewReports: boolean;
      canManageStaff: boolean;
    };
  }[];
  pagePermissions: {
    page: string;
    canAccess: boolean;
  }[];
}

class ProductionUserService {
  private databaseConnected = false;

  async testDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$connect();
      await prisma.user.findFirst(); // Simple test query
      this.databaseConnected = true;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Database connection failed:', error);
      this.databaseConnected = false;
      return false;
    }
  }

  async getAllUsers(centreId: string): Promise<UserWithPermissions[]> {
    if (!this.databaseConnected) {
      await this.testDatabaseConnection();
    }

    if (!this.databaseConnected) {
      throw new Error('Database not available');
    }

    try {
      const users = await prisma.user.findMany({
        where: {
          centreId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          centreId: true,
          createdAt: true,
          updatedAt: true,
          centrePermissions: {
            include: {
              centre: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                }
              }
            }
          },
          pagePermissions: {
            select: {
              page: true,
              canAccess: true,
            }
          }
        },
      });

      return users.map(user => ({
        ...user,
        name: user.name || '',
        centreId: user.centreId ?? '',
        centrePermissions: user.centrePermissions.map(cp => ({
          centreId: cp.centreId ?? '',
          centreName: cp.centre.name,
          centreCode: cp.centre.code,
          permissions: {
            canViewOccupancy: cp.canViewOccupancy,
            canEditOccupancy: cp.canEditOccupancy,
            canViewFinancials: cp.canViewFinancials,
            canEditFinancials: cp.canEditFinancials,
            canViewEnrollments: cp.canViewEnrollments,
            canEditEnrollments: cp.canEditEnrollments,
            canViewReports: cp.canViewReports,
            canManageStaff: cp.canManageStaff,
          }
        }))
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<Omit<UserWithPermissions, 'centrePermissions' | 'pagePermissions'>> {
    if (!this.databaseConnected) {
      await this.testDatabaseConnection();
    }

    if (!this.databaseConnected) {
      throw new Error('Database not available');
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user in transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            centreId: userData.centreId ?? '',
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            centreId: true,
            createdAt: true,
            updatedAt: true,
          }
        });

        // Create centre permissions based on pagePermissions
        if (userData.pagePermissions && userData.pagePermissions.length > 0) {
          for (const pagePermission of userData.pagePermissions) {
            if (pagePermission.enabled && pagePermission.centreIds && pagePermission.centreIds.length > 0) {
              // Create page permission
              await tx.userPagePermission.create({
                data: {
                  userId: user.id,
                  page: pagePermission.page,
                  canAccess: true,
                }
              });

              // Create centre permissions for this page
              for (const centreId of pagePermission.centreIds) {
                const permissions = this.getPermissionsForPageAndRole(pagePermission.page, userData.role);
                
                // Check if permission already exists for this centre
                const existingPermission = await tx.userCentrePermission.findFirst({
                  where: {
                    userId: user.id,
                    centreId: centreId ?? '',
                  }
                });

                if (!existingPermission) {
                  await tx.userCentrePermission.create({
                    data: {
                      userId: user.id,
                      centreId: centreId ?? '',
                      ...permissions,
                    }
                  });
                } else {
                  // Update existing permission with higher level if needed
                  await tx.userCentrePermission.update({
                    where: { id: existingPermission.id },
                    data: {
                      ...this.mergePermissions(existingPermission, permissions),
                    }
                  });
                }
              }
            }
          }
        }

  user.name = user.name || '';
  return user;
      });

      console.log('✅ User created successfully:', result.id);
      if (result) {
        return {
          ...result,
          name: result.name || '',
          centreId: result.centreId ?? '',
        };
      }
      return result;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: Partial<CreateUserData>): Promise<UserWithPermissions> {
    if (!this.databaseConnected) {
      await this.testDatabaseConnection();
    }

    if (!this.databaseConnected) {
      throw new Error('Database not available');
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Update basic user data
  const updatePayload: Partial<CreateUserData> = {};
        if (updateData.name) updatePayload.name = updateData.name;
        if (updateData.email) updatePayload.email = updateData.email;
        if (updateData.role) updatePayload.role = updateData.role;
        if (updateData.password) {
          updatePayload.password = await bcrypt.hash(updateData.password, 12);
        }

        // Remove undefined properties from updatePayload
        const filteredPayload = Object.fromEntries(
          Object.entries(updatePayload).filter(([_, v]) => v !== undefined)
        );
        const user = await tx.user.update({
          where: { id: userId },
          data: filteredPayload,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            organizationId: true,
            createdAt: true,
            updatedAt: true,
          }
        });

        // Update permissions if provided
        if (updateData.pagePermissions) {
          // Clear existing permissions
          await tx.userPagePermission.deleteMany({
            where: { userId }
          });
          await tx.userCentrePermission.deleteMany({
            where: { userId }
          });

          // Recreate permissions
          for (const pagePermission of updateData.pagePermissions) {
            if (pagePermission.enabled && pagePermission.centreIds && pagePermission.centreIds.length > 0) {
              await tx.userPagePermission.create({
                data: {
                  userId: user.id,
                  page: pagePermission.page,
                  canAccess: true,
                }
              });

              for (const centreId of pagePermission.centreIds) {
                const permissions = this.getPermissionsForPageAndRole(pagePermission.page, user.role as any);
                await tx.userCentrePermission.create({
                  data: {
                    userId: user.id,
                    centreId: centreId ?? '',
                    ...permissions,
                  }
                });
              }
            }
          }
        }

        return user;
      });

      // Fetch complete user with permissions
      return this.getUserById(result.id);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<UserWithPermissions> {
  const users = await this.getAllUsers('centre_futurefocus'); // Default centre
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (!this.databaseConnected) {
      await this.testDatabaseConnection();
    }

    if (!this.databaseConnected) {
      throw new Error('Database not available');
    }

    try {
      await prisma.user.delete({
        where: { id: userId }
      });
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  private getPermissionsForPageAndRole(page: string, role: 'MASTER' | 'ADMIN' | 'USER') {
    const basePermissions = {
      canViewOccupancy: true,
      canEditOccupancy: false,
      canViewFinancials: false,
      canEditFinancials: false,
      canViewEnrollments: true,
      canEditEnrollments: false,
      canViewReports: true,
      canManageStaff: false,
    };

    if (role === 'MASTER') {
      return {
        canViewOccupancy: true,
        canEditOccupancy: true,
        canViewFinancials: true,
        canEditFinancials: true,
        canViewEnrollments: true,
        canEditEnrollments: true,
        canViewReports: true,
        canManageStaff: true,
      };
    }

    if (role === 'ADMIN') {
      return {
        canViewOccupancy: true,
        canEditOccupancy: true,
        canViewFinancials: page === 'XERO' || page === 'DATA_MANAGEMENT',
        canEditFinancials: false,
        canViewEnrollments: true,
        canEditEnrollments: true,
        canViewReports: true,
        canManageStaff: false,
      };
    }

    // USER role
    return basePermissions;
  }

  private mergePermissions(existing: any, newPerms: any) {
    return {
      canViewOccupancy: existing.canViewOccupancy || newPerms.canViewOccupancy,
      canEditOccupancy: existing.canEditOccupancy || newPerms.canEditOccupancy,
      canViewFinancials: existing.canViewFinancials || newPerms.canViewFinancials,
      canEditFinancials: existing.canEditFinancials || newPerms.canEditFinancials,
      canViewEnrollments: existing.canViewEnrollments || newPerms.canViewEnrollments,
      canEditEnrollments: existing.canEditEnrollments || newPerms.canEditEnrollments,
      canViewReports: existing.canViewReports || newPerms.canViewReports,
      canManageStaff: existing.canManageStaff || newPerms.canManageStaff,
    };
  }

  isUsingDatabase(): boolean {
    return this.databaseConnected;
  }
}

export const productionUserService = new ProductionUserService();
