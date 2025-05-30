import { pgTable, text, serial, integer, timestamp, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'pending', 'signed', 'expired', 'cancelled']);
export const contractTypeEnum = pgEnum('contract_type', [
  // Common Business Contracts
  'nda', 'freelance', 'employment', 'founder', 'lease', 
  // Indian Business & Commercial Contracts
  'sale_of_goods', 'distribution', 'franchise', 'agency', 'joint_venture', 'partnership',
  // Service Contracts
  'consulting', 'outsourcing', 'maintenance', 'logistics',
  // Financial Contracts
  'loan', 'investment', 'venture_capital', 'guarantee', 'security', 
  // Real Estate
  'property_sale', 'rent_residential', 'rent_commercial', 'construction', 'development',
  // Intellectual Property
  'ip_licensing', 'ip_transfer', 'technology_transfer', 'software_development', 'publishing',
  // Specific to Indian Markets
  'e_commerce', 'startup_incorporation', 'fdi_compliance', 'gst_compliance', 'msme',
  // Miscellaneous
  'other'
]);
export const partyRoleEnum = pgEnum('party_role', ['client', 'provider', 'employer', 'employee', 'lessor', 'lessee', 'other']);

// Payment & Subscription Enums
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
]);

export const paymentTypeEnum = pgEnum('payment_type', [
  'consultation',
  'subscription',
  'contract_analysis',
  'document_generation',
  'other'
]);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'basic',
  'professional',
  'enterprise'
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'expired',
  'trial',
  'past_due'
]);

// Lawyer Marketplace Enums
export const lawyerPracticeAreaEnum = pgEnum('practice_area', [
  'contract_law',
  'property_law',
  'criminal_law',
  'corporate_law',
  'family_law',
  'intellectual_property',
  'startup_law',
  'real_estate',
  'tax_law',
  'employment_law',
  'immigration_law',
  'environmental_law',
  'bankruptcy_law',
  'constitutional_law',
  'entertainment_law',
  'medical_law',
  'cyber_law',
  'international_law',
  'human_rights',
  'other'
]);

export const consultationModeEnum = pgEnum('consultation_mode', [
  'video',
  'call',
  'chat'
]);

export const consultationStatusEnum = pgEnum('consultation_status', [
  'scheduled',
  'ongoing',
  'completed',
  'cancelled',
  'no_show'
]);

export const verificationStatusEnum = pgEnum('verification_status', [
  'pending',
  'verified',
  'rejected'
]);

// Users
export const users = pgTable('users', {
  uid: text('uid').notNull().primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role'),
  avatar: text('avatar'),
  isVerified: boolean('is_verified').default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contracts
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: contractTypeEnum('type').notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  jurisdiction: text('jurisdiction').notNull(),
  userId: text('user_id').notNull().references(() => users.uid),
  pdfUrl: text('pdf_url'),
  parties: json('parties').$type<Party[]>().notNull(),
  clauses: json('clauses').$type<Clause[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Templates
export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: contractTypeEnum('type').notNull(),
  content: text('content').notNull(),
  description: text('description').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  userId: text('user_id').references(() => users.uid),
  clauses: json('clauses').$type<Clause[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clients
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  userId: text('user_id').notNull().references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clauses
export const clauses = pgTable('clauses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  userId: text('user_id').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Conversations
export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid),
  messages: json('messages').$type<AIMessage[]>().notNull(),
  context: text('context'),
  contractId: integer('contract_id').references(() => contracts.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lawyer profile schema
export const lawyers = pgTable('lawyers', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  name: text('name').notNull(),
  profilePhoto: text('profile_photo'),
  about: text('about'),
  barCouncilId: text('bar_council_id'),
  practiceAreas: text('practice_areas').array().notNull(),
  specializations: text('specializations').array(),
  experience: integer('experience').notNull().default(0),
  languages: text('languages').array().notNull(),
  location: json('location').notNull(), // { country, state, city }
  rating: integer('rating').default(0),
  reviewCount: integer('review_count').default(0),
  hourlyRate: integer('hourly_rate').notNull(),
  isAvailable: boolean('is_available').default(true),
  availabilityCalendar: json('availability_calendar'),
  verified: boolean('verified').default(false),
  verifications: json('verifications').default({
    barCouncil: false,
    aadhaar: false,
    email: false,
    phone: false,
    lexiScreened: false
  }),
  awards: json('awards').array(),
  education: json('education').array(),
  consultationModes: text('consultation_modes').array(),
  badges: text('badges').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Lawyer review schema
export const lawyerReviews = pgTable('lawyer_reviews', {
  id: serial('id').primaryKey(),
  lawyerId: integer('lawyer_id').references(() => lawyers.id).notNull(),
  userId: text('user_id').references(() => users.uid).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  consultationId: integer('consultation_id'), // Optional reference to a specific consultation
  createdAt: timestamp('created_at').defaultNow()
});

// Legal consultation schema
export const consultations = pgTable('consultations', {
  id: serial('id').primaryKey(),
  lawyerId: integer('lawyer_id').references(() => lawyers.id).notNull(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  duration: integer('duration').notNull(), // in minutes
  mode: consultationModeEnum('mode').notNull(),
  status: consultationStatusEnum('status').default('scheduled'),
  documents: json('documents').array(),
  price: integer('price').notNull(),
  paymentStatus: text('payment_status').default('pending'),
  paymentId: text('payment_id'),
  notes: text('notes'),
  transcription: text('transcription'),
  lexiAssistEnabled: boolean('lexi_assist_enabled').default(false),
  lexiCertId: text('lexi_cert_id'),
  feedbackId: integer('feedback_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Documents shared during consultations
export const sharedDocuments = pgTable('shared_documents', {
  id: serial('id').primaryKey(),
  consultationId: integer('consultation_id').references(() => consultations.id).notNull(),
  name: text('name').notNull(),
  fileUrl: text('file_url').notNull(),
  uploadedBy: text('uploaded_by').references(() => users.uid).notNull(),
  type: text('type'),
  size: integer('size'),
  createdAt: timestamp('created_at').defaultNow()
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  amount: integer('amount').notNull(), // in paise (1/100th of INR)
  currency: text('currency').default('INR').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  type: paymentTypeEnum('type').notNull(),
  paymentMethod: text('payment_method'),
  paymentProvider: text('payment_provider'),
  paymentProviderId: text('payment_provider_id'),
  metadata: json('metadata'),
  relatedEntityId: integer('related_entity_id'), // ID of related contract/consultation
  relatedEntityType: text('related_entity_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  plan: subscriptionPlanEnum('plan').notNull(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  trialEndsAt: timestamp('trial_ends_at'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  paymentProviderId: text('payment_provider_id'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Contract Analysis table
export const contractAnalyses = pgTable('contract_analyses', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id').references(() => contracts.id).notNull(),
  userId: text('user_id').references(() => users.uid).notNull(),
  riskScore: integer('risk_score'),
  completeness: integer('completeness'),
  issues: json('issues').array(),
  strengths: json('strengths').array(),
  weaknesses: json('weaknesses').array(),
  recommendations: json('recommendations').array(),
  compliantWithIndianLaw: boolean('compliant_with_indian_law'),
  analysisMetadata: json('analysis_metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Document Versions table
export const documentVersions = pgTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull(),
  documentType: text('document_type').notNull(),
  version: integer('version').notNull(),
  content: text('content').notNull(),
  changes: json('changes'),
  createdBy: text('created_by').references(() => users.uid).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  metadata: json('metadata'),
  relatedEntityId: integer('related_entity_id'),
  relatedEntityType: text('related_entity_type'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Chat Rooms table
export const chatRooms = pgTable('chat_rooms', {
  id: serial('id').primaryKey(),
  name: text('name'),
  type: text('type').notNull(),
  participants: text('participants').array().notNull(),
  lastMessageAt: timestamp('last_message_at'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Chat Messages table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => chatRooms.id).notNull(),
  senderId: text('sender_id').references(() => users.uid).notNull(),
  content: text('content').notNull(),
  attachments: json('attachments').array(),
  read: boolean('read').default(false).notNull(),
  relatedEntityId: integer('related_entity_id'),
  relatedEntityType: text('related_entity_type'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Document Activities table
export const documentActivities = pgTable('document_activities', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull(),
  userId: text('user_id').notNull().references(() => users.uid),
  activityType: text('activity_type').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Custom types
export type Party = {
  name: string;
  role: string;
  email?: string;
  address?: string;
};

export type Clause = {
  id: string;
  title: string;
  content: string;
  explanation?: string;
};

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  createdAt: true, 
  updatedAt: true,
  uid: true // Make uid optional since we generate it
});
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClauseSchema = createInsertSchema(clauses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAIConversationSchema = createInsertSchema(aiConversations).omit({ id: true, createdAt: true, updatedAt: true });

// Lawyer marketplace schema inserts
export const insertLawyerSchema = createInsertSchema(lawyers);
export const insertLawyerReviewSchema = createInsertSchema(lawyerReviews);
export const insertConsultationSchema = createInsertSchema(consultations);
export const insertSharedDocumentSchema = createInsertSchema(sharedDocuments);

// New schema inserts for payment, subscription, etc.
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractAnalysisSchema = createInsertSchema(contractAnalyses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertDocumentActivitySchema = createInsertSchema(documentActivities).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type ClauseModel = typeof clauses.$inferSelect;
export type InsertClause = z.infer<typeof insertClauseSchema>;

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;

// Lawyer marketplace types
export type Lawyer = typeof lawyers.$inferSelect;
export type InsertLawyer = z.infer<typeof insertLawyerSchema>;

export type LawyerReview = typeof lawyerReviews.$inferSelect;
export type InsertLawyerReview = z.infer<typeof insertLawyerReviewSchema>;

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type SharedDocument = typeof sharedDocuments.$inferSelect;
export type InsertSharedDocument = z.infer<typeof insertSharedDocumentSchema>;

// New types for payment, subscription, etc.
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type ContractAnalysis = typeof contractAnalyses.$inferSelect;
export type InsertContractAnalysis = z.infer<typeof insertContractAnalysisSchema>;

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type DocumentActivity = typeof documentActivities.$inferSelect;
export type InsertDocumentActivity = z.infer<typeof insertDocumentActivitySchema>;

// Permissions table
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  controller: text('controller').notNull(),
  action: text('action').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Roles table
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  permissions: json('permissions').$type<Permission[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Permission type
export type Permission = {
  controller: string;
  action: string;
  enabled: boolean;
};

// Role type
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

// Insert schemas
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true, updatedAt: true });