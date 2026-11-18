export type Language = 'en' | 'fr' | 'es' | 'de';

export type ToolCategory = 'pdf' | 'image' | 'ai' | 'security' | 'convert';

export type ToolId =
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'pdf-to-excel'
  | 'excel-to-pdf'
  | 'word-to-pdf'
  | 'ppt-to-pdf'
  | 'pdf-to-image'
  | 'image-to-pdf'
  | 'pdf-to-word'
  | 'doc-to-markdown'
  | 'image-converter'
  | 'ai-ocr'
  | 'watermark-pdf'
  | 'page-numbers'
  | 'rotate-pdf';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: 'Popular' | 'New' | 'Pro' | 'AI Powered' | 'Fast';
  acceptedFormats: string;
  accentColor: string;
  gradient: string;
  maxFilesFree: number;
  maxFilesPro: number;
  features: string[];
}

export type UserPlan = 'free' | 'pro' | 'business';
export type UserRole = 'user' | 'pro' | 'business' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  plan: UserPlan;
  billingCycle?: 'monthly' | 'annual';
  memberSince?: string;
  createdAt?: string;
  apiKey?: string;
  organization?: string;
  subscriptionEndDate?: string;
  inGracePeriod?: boolean;
  gracePeriodRemainingHours?: number;
}

export type User = UserProfile;

export interface UsageQuota {
  date: string; // YYYY-MM-DD
  usedToday: number;
  limitToday: number; // 3 for free, 99999 for pro
  totalLifetimeOperations: number;
  totalBytesSaved: number;
}

export interface HistoryItem {
  id: string;
  toolId: ToolId;
  toolName: string;
  fileName: string;
  fileSize: number;
  outputFileName: string;
  outputSize: number;
  downloadUrl?: string;
  timestamp: number;
  status: 'completed' | 'processing' | 'failed';
  pagesOrCount?: number;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  plan: 'Pro Plan (Monthly)' | 'Pro Plan (Annual)' | 'Business Plan (Monthly)' | 'Business Plan (Annual)';
  status: 'Paid' | 'Pending';
  pdfUrl?: string;
  paymentMethod: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  role: UserRole;
  usedToday: number;
  totalConversions: number;
  status: 'active' | 'suspended';
  joinedDate: string;
  lastActive: string;
}

export interface AdminLogItem {
  id: string;
  timestamp: string;
  userEmail: string;
  tool: string;
  fileName: string;
  sizeMb: number;
  durationMs: number;
  status: 'success' | 'warning' | 'error';
  ipAddress: string;
}

export interface SystemSettings {
  freeDailyLimit: number;
  maintenanceMode: boolean;
  allowGuestProcessing: boolean;
  maxFreeFileSizeMb: number;
  maxProFileSizeMb: number;
  enableAiOcr: boolean;
  announcementBanner: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
