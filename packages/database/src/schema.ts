import { relations } from 'drizzle-orm';
import { index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { createTable } from './_table';
import { user } from './auth-schema';
import { timestamps } from './lib/utils';

export const Feedback = createTable(
  'feedback',
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: t.text().notNull(),

    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: 'date', withTimezone: true })
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [
    index('feedback_user_id_idx').on(table.userId),
    index('feedback_created_at_idx').on(table.createdAt),
  ]
);

export const FeedbackRelations = relations(Feedback, ({ one }) => ({
  user: one(user, {
    fields: [Feedback.userId],
    references: [user.id],
  }),
}));

// Zod schemas for validation
export const insertFeedbackSchema = createInsertSchema(Feedback, {
  content: z.string().min(1),
}).omit(timestamps);

export const insertFeedbackParams = insertFeedbackSchema.omit({
  id: true,
  userId: true,
});

export const updateFeedbackSchema = createUpdateSchema(Feedback);

export const feedbackIdSchema = z.object({
  id: z.uuid(),
});

// Types for API - using direct infer types
export type Feedback = typeof Feedback.$inferSelect;
export type NewFeedback = typeof Feedback.$inferInsert;
export type NewFeedbackParams = z.infer<typeof insertFeedbackParams>;
export type UpdateFeedbackParams = z.infer<typeof updateFeedbackSchema>;
export type FeedbackId = Feedback['id'];

// Export other schemas
export * from './auth-schema';
export * from './protein-schema';
