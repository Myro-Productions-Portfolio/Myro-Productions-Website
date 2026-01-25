/**
 * Activity Logger Utility
 *
 * Logs admin actions to the activity_log table
 */

import { prisma } from '@/lib/prisma';
import type { AdminUser } from '@/lib/auth/session';

interface LogActivityParams {
  admin: AdminUser;
  action: string;
  entityType: string;
  entityId?: string;
  clientId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an admin action to the activity log
 */
export async function logActivity({
  admin,
  action,
  entityType,
  entityId,
  clientId,
  details,
  ipAddress,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        admin_id: admin.id,
        client_id: clientId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging failure shouldn't break the API
  }
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return undefined;
}
