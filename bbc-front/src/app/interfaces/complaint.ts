export interface Complaint {
  id?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: ComplaintCategory;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComplaintResponse {
  id?: number;
  complaintId: number;
  adminId: number;
  adminName: string;
  responseMessage: string;
  isPublic: boolean;
  createdAt?: Date;
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ComplaintCategory {
  PRODUCT_ISSUE = 'PRODUCT_ISSUE',
  DELIVERY_ISSUE = 'DELIVERY_ISSUE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  WEBSITE_ISSUE = 'WEBSITE_ISSUE',
  RETURN_REFUND = 'RETURN_REFUND',
  OTHER = 'OTHER'
}

export interface ComplaintWithResponses {
  complaint: Complaint;
  responses: ComplaintResponse[];
}