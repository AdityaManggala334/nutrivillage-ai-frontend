import { z } from "zod";

/** Konten publik: artikel gizi (FR-03) dan notifikasi pengguna (FR-21). */

export const ArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1),
  readMinutes: z.number().int().positive(),
  body: z.array(z.string().min(1)).min(1),
});
export type Article = z.infer<typeof ArticleSchema>;

export const NotificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  createdAt: z.string().min(1),
  read: z.boolean(),
  kind: z.enum(["info", "success", "warning"]),
});
export type Notification = z.infer<typeof NotificationSchema>;
