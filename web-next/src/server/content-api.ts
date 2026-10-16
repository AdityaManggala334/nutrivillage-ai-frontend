import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import { ArticleSchema, NotificationSchema, type Article, type Notification } from "@/schemas/content";
import {
  backendGetArticle,
  backendListArticles,
  backendListNotifications,
  type BackendArticle,
  type BackendNotification,
} from "@/server/backend-api";

/** Lapisan service sisi server: artikel gizi (FR-03) & notifikasi (FR-21). */

function toArticle(item: BackendArticle): Article {
  return ArticleSchema.parse({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    category: item.category,
    readMinutes: item.read_minutes,
    body: item.body,
  });
}

function toNotification(item: BackendNotification): Notification {
  return NotificationSchema.parse({
    id: item.id,
    title: item.title,
    message: item.message,
    createdAt: item.created_at,
    read: item.read,
    kind: item.kind,
  });
}

/** Daftar artikel publik (tanpa login). */
export async function getArticles(): Promise<Article[]> {
  const rows = await backendListArticles();
  return rows.map(toArticle);
}

/** Detail artikel publik; null bila tidak ditemukan. */
export async function getArticleById(id: string): Promise<Article | null> {
  const row = await backendGetArticle(id);
  return row ? toArticle(row) : null;
}

/**
 * Daftar notifikasi pengguna. Tanpa token backend tetap mengembalikan
 * notifikasi global; sakelar "Notifikasi" di Profil mengosongkan daftarnya.
 */
export async function getNotifications(): Promise<Notification[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? undefined;
  const rows = await backendListNotifications(token);
  return rows.map(toNotification);
}
