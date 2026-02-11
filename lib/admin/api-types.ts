/**
 * Admin API TypeScript Types
 *
 * Type definitions for admin API requests and responses
 */

// ============================================================================
// ENUMS
// ============================================================================

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'INCOMPLETE' | 'TRIALING';

export type ProductType = 'MAINTENANCE_BASIC' | 'MAINTENANCE_PRO' | 'SUPPORT_STANDARD' | 'SUPPORT_PREMIUM' | 'CUSTOM';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELED';

export type PaymentType = 'ONE_TIME' | 'SUBSCRIPTION' | 'DEPOSIT' | 'FINAL_PAYMENT' | 'REFUND';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';

export type RefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer';

// ============================================================================
// ENTITIES
// ============================================================================

export interface Client {
  id: string;
  email: string;
  name: string;
  company: string | null;
  phone: string | null;
  stripe_customer_id: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientWithRelations extends Client {
  subscriptions: Subscription[];
  projects: Project[];
  payments?: Payment[];
  activity_logs?: ActivityLog[];
  _count?: {
    payments: number;
  };
}

export interface Subscription {
  id: string;
  client_id: string;
  stripe_subscription_id: string;
  product_type: ProductType;
  status: SubscriptionStatus;
  amount_cents: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithRelations extends Subscription {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'phone'>;
  payments?: Payment[];
  _count?: {
    payments: number;
  };
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'phone'>;
  payments?: Payment[];
  _count?: {
    payments: number;
  };
}

export interface Payment {
  id: string;
  client_id: string;
  project_id: string | null;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount_cents: number;
  currency: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  payment_method: string | null;
  metadata: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithRelations extends Payment {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'phone'>;
  project: Pick<Project, 'id' | 'name' | 'status' | 'budget_cents'> | null;
  subscription: Pick<Subscription, 'id' | 'product_type' | 'status' | 'amount_cents' | 'current_period_start' | 'current_period_end'> | null;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  client_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ListClientsResponse {
  clients: ClientWithRelations[];
  pagination: PaginationMeta;
}

export interface ListSubscriptionsResponse {
  subscriptions: SubscriptionWithRelations[];
  pagination: PaginationMeta;
}

export interface ListProjectsResponse {
  projects: ProjectWithRelations[];
  pagination: PaginationMeta;
}

export interface ListPaymentsResponse {
  payments: PaymentWithRelations[];
  pagination: PaginationMeta;
  totals: {
    total_amount_cents: number;
  };
}

export interface DashboardStats {
  clients: {
    total: number;
    active: number;
    new_this_month: number;
    recent: Pick<Client, 'id' | 'name' | 'email' | 'created_at'>[];
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    past_due: number;
    monthly_recurring_revenue_cents: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    recent: Array<Pick<Project, 'id' | 'name' | 'status' | 'created_at'> & {
      client: Pick<Client, 'id' | 'name'>;
    }>;
  };
  payments: {
    total_revenue_cents: number;
    total_payments: number;
    this_month: {
      revenue_cents: number;
      count: number;
    };
    last_month: {
      revenue_cents: number;
      count: number;
    };
    revenue_growth_percentage: number;
    pending: {
      amount_cents: number;
      count: number;
    };
    failed_this_month: number;
    recent: Array<Pick<Payment, 'id' | 'amount_cents' | 'currency' | 'payment_type' | 'paid_at'> & {
      client: Pick<Client, 'id' | 'name'>;
    }>;
  };
  top_clients: Array<{
    client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
    total_revenue_cents: number;
    payment_count: number;
  }>;
}

// ============================================================================
// API REQUEST PAYLOADS
// ============================================================================

export interface CreateClientRequest {
  email: string;
  name: string;
  company?: string;
  phone?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface UpdateClientRequest {
  email?: string;
  name?: string;
  company?: string;
  phone?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface CreateSubscriptionRequest {
  client_id: string;
  price_id: string;
  product_type: ProductType;
  trial_days?: number;
}

export interface CancelSubscriptionRequest {
  cancel_at_period_end?: boolean;
  reason?: string;
}

export interface CreateProjectRequest {
  client_id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget_cents?: number;
  notes?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget_cents?: number;
  notes?: string;
}

export interface RefundPaymentRequest {
  amount_cents?: number;
  reason?: RefundReason;
  notes?: string;
}

// ============================================================================
// API QUERY PARAMETERS
// ============================================================================

export interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
}

export interface ListSubscriptionsParams {
  page?: number;
  limit?: number;
  client_id?: string;
  status?: SubscriptionStatus;
  product_type?: ProductType;
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  client_id?: string;
  status?: ProjectStatus;
  search?: string;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  client_id?: string;
  project_id?: string;
  subscription_id?: string;
  payment_type?: PaymentType;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ApiError = {
  message: string;
  code?: string;
  field?: string;
};

export type RefundResult = {
  payment: PaymentWithRelations;
  refund: {
    id: string;
    amount_cents: number;
    is_full_refund: boolean;
    status: string;
  };
};
