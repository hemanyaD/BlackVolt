/**
 * SQLite-backed persistence for orders, logistics and inventory.
 *
 * This is the one place the admin backend touches a real database. It is
 * server-only — import it exclusively from API route handlers (never from a
 * client component). The connection is cached on `globalThis` so Next's dev
 * HMR doesn't open a new handle on every reload.
 *
 * The DB file lives at `<project>/data/blackvolt.db` (gitignored). Inventory is
 * seeded once from the local product catalog so stock levels exist out of the box.
 */
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { products } from "@/data/products";
import { shippingFor } from "@/lib/shipping";
import type {
  Order,
  OrderItem,
  OrderStatus,
  InventoryRow,
  User,
} from "@/types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "blackvolt.db");

/** Default starting stock seeded for every SKU on first run. */
const SEED_STOCK = 50;
/** Default low-stock threshold seeded for every SKU. */
const SEED_THRESHOLD = 10;

const globalForDb = globalThis as unknown as { __blackvoltDb?: Database.Database };

function init(): Database.Database {
  mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      created_at    TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      email         TEXT NOT NULL,
      phone         TEXT NOT NULL,
      address       TEXT NOT NULL,
      city          TEXT NOT NULL,
      pincode       TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'received',
      carrier       TEXT,
      tracking_number TEXT,
      shipping      INTEGER NOT NULL DEFAULT 0,
      total         INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      slug       TEXT NOT NULL,
      name       TEXT NOT NULL,
      mode       TEXT NOT NULL,
      quantity   INTEGER NOT NULL,
      unit_price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory (
      slug                TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      stock               INTEGER NOT NULL,
      low_stock_threshold INTEGER NOT NULL DEFAULT ${SEED_THRESHOLD}
    );

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT,
      phone         TEXT,
      address       TEXT,
      city          TEXT,
      pincode       TEXT,
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  // Migrations: add columns to pre-existing order tables.
  const orderCols = db.prepare(`PRAGMA table_info(orders)`).all() as {
    name: string;
  }[];
  if (!orderCols.some((c) => c.name === "shipping")) {
    db.exec(`ALTER TABLE orders ADD COLUMN shipping INTEGER NOT NULL DEFAULT 0`);
  }
  if (!orderCols.some((c) => c.name === "user_id")) {
    db.exec(`ALTER TABLE orders ADD COLUMN user_id TEXT`);
  }

  // Seed inventory from the catalog (idempotent — INSERT OR IGNORE on the slug).
  const seed = db.prepare(
    `INSERT OR IGNORE INTO inventory (slug, name, stock, low_stock_threshold)
     VALUES (?, ?, ?, ?)`,
  );
  const seedAll = db.transaction(() => {
    for (const p of products) seed.run(p.slug, p.name, SEED_STOCK, SEED_THRESHOLD);
  });
  seedAll();

  return db;
}

function getDb(): Database.Database {
  if (!globalForDb.__blackvoltDb) globalForDb.__blackvoltDb = init();
  return globalForDb.__blackvoltDb;
}

/* ----------------------------- row mappers ----------------------------- */

interface OrderRow {
  id: string;
  user_id: string | null;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  status: OrderStatus;
  carrier: string | null;
  tracking_number: string | null;
  shipping: number;
  total: number;
}

interface ItemRow {
  slug: string;
  name: string;
  mode: OrderItem["mode"];
  quantity: number;
  unit_price: number;
}

function toOrder(row: OrderRow, items: ItemRow[]): Order {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    status: row.status,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    shipping: row.shipping,
    total: row.total,
    items: items.map((i) => ({
      slug: i.slug,
      name: i.name,
      mode: i.mode,
      quantity: i.quantity,
      unitPrice: i.unit_price,
    })),
  };
}

/* ------------------------------- orders -------------------------------- */

/** All orders, newest first, each with its line items attached. */
export function listOrders(): Order[] {
  const db = getDb();
  const orders = db
    .prepare(`SELECT * FROM orders ORDER BY created_at DESC`)
    .all() as OrderRow[];
  const itemsStmt = db.prepare(
    `SELECT slug, name, mode, quantity, unit_price FROM order_items WHERE order_id = ?`,
  );
  return orders.map((o) => toOrder(o, itemsStmt.all(o.id) as ItemRow[]));
}

/** Orders placed by one user, newest first. */
export function listOrdersByUser(userId: string): Order[] {
  const db = getDb();
  const orders = db
    .prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId) as OrderRow[];
  const itemsStmt = db.prepare(
    `SELECT slug, name, mode, quantity, unit_price FROM order_items WHERE order_id = ?`,
  );
  return orders.map((o) => toOrder(o, itemsStmt.all(o.id) as ItemRow[]));
}

/** One order by id, or null if it doesn't exist. */
export function getOrder(id: string): Order | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as
    | OrderRow
    | undefined;
  if (!row) return null;
  const items = db
    .prepare(
      `SELECT slug, name, mode, quantity, unit_price FROM order_items WHERE order_id = ?`,
    )
    .all(id) as ItemRow[];
  return toOrder(row, items);
}

export interface NewOrderInput {
  userId: string | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
}

/**
 * Persist a new order and decrement stock for each line (clamped at 0).
 * Runs in a single transaction so a partial write can't leave stock skewed.
 */
export function createOrder(input: NewOrderInput): Order {
  const db = getDb();
  const id = `BV-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const subtotal = input.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const insertOrder = db.prepare(
    `INSERT INTO orders
       (id, user_id, created_at, customer_name, email, phone, address, city, pincode, status, shipping, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?)`,
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, slug, name, mode, quantity, unit_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const decStock = db.prepare(
    `UPDATE inventory SET stock = MAX(0, stock - ?) WHERE slug = ?`,
  );

  const tx = db.transaction(() => {
    insertOrder.run(
      id,
      input.userId,
      createdAt,
      input.customerName,
      input.email,
      input.phone,
      input.address,
      input.city,
      input.pincode,
      shipping,
      total,
    );
    for (const i of input.items) {
      insertItem.run(id, i.slug, i.name, i.mode, i.quantity, i.unitPrice);
      decStock.run(i.quantity, i.slug);
    }
  });
  tx();

  return getOrder(id)!;
}

export interface OrderUpdate {
  status?: OrderStatus;
  carrier?: string | null;
  trackingNumber?: string | null;
}

/**
 * Update logistics fields on an order. Returns the updated order, or null.
 * Cancelling an order (status → "cancelled", from any non-cancelled state)
 * returns its items to stock, in the same transaction as the status change.
 */
export function updateOrder(id: string, patch: OrderUpdate): Order | null {
  const db = getDb();
  const existing = db
    .prepare(`SELECT status FROM orders WHERE id = ?`)
    .get(id) as { status: OrderStatus } | undefined;
  if (!existing) return null;

  const sets: string[] = [];
  const values: (string | null)[] = [];
  if (patch.status !== undefined) {
    sets.push("status = ?");
    values.push(patch.status);
  }
  if (patch.carrier !== undefined) {
    sets.push("carrier = ?");
    values.push(patch.carrier);
  }
  if (patch.trackingNumber !== undefined) {
    sets.push("tracking_number = ?");
    values.push(patch.trackingNumber);
  }

  const restocking =
    patch.status === "cancelled" && existing.status !== "cancelled";

  const tx = db.transaction(() => {
    if (sets.length > 0) {
      db.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`).run(
        ...values,
        id,
      );
    }
    if (restocking) {
      const items = db
        .prepare(`SELECT slug, quantity FROM order_items WHERE order_id = ?`)
        .all(id) as { slug: string; quantity: number }[];
      const restock = db.prepare(
        `UPDATE inventory SET stock = stock + ? WHERE slug = ?`,
      );
      for (const it of items) restock.run(it.quantity, it.slug);
    }
  });
  tx();

  return getOrder(id);
}

/** Permanently delete an order (and its line items). Does not restock. */
export function deleteOrder(id: string): boolean {
  const db = getDb();
  const res = db.prepare(`DELETE FROM orders WHERE id = ?`).run(id);
  return res.changes > 0;
}

/* ----------------------------- inventory ------------------------------- */

/** Stock rows in catalog order. */
export function listInventory(): InventoryRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT slug, name, stock, low_stock_threshold FROM inventory ORDER BY name`,
    )
    .all() as {
    slug: string;
    name: string;
    stock: number;
    low_stock_threshold: number;
  }[];
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    stock: r.stock,
    lowStockThreshold: r.low_stock_threshold,
  }));
}

/** Set the absolute stock (and optionally the threshold) for one SKU. */
export function updateInventory(
  slug: string,
  patch: { stock?: number; lowStockThreshold?: number },
): InventoryRow | null {
  const db = getDb();
  const existing = db.prepare(`SELECT slug FROM inventory WHERE slug = ?`).get(slug);
  if (!existing) return null;

  const sets: string[] = [];
  const values: number[] = [];
  if (patch.stock !== undefined) {
    sets.push("stock = ?");
    values.push(Math.max(0, Math.round(patch.stock)));
  }
  if (patch.lowStockThreshold !== undefined) {
    sets.push("low_stock_threshold = ?");
    values.push(Math.max(0, Math.round(patch.lowStockThreshold)));
  }
  if (sets.length > 0) {
    db.prepare(`UPDATE inventory SET ${sets.join(", ")} WHERE slug = ?`).run(
      ...values,
      slug,
    );
  }
  return (
    listInventory().find((r) => r.slug === slug) ?? null
  );
}

/* ------------------------- users & sessions ---------------------------- */

/** How long a session stays valid, in milliseconds (30 days). */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
  };
}

/** scrypt password hash, stored as "salt:hash" (both hex). */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export class EmailTakenError extends Error {
  constructor() {
    super("An account with that email already exists");
    this.name = "EmailTakenError";
  }
}

export interface NewUserInput {
  email: string;
  password: string;
  name: string;
}

/** Create an account. Throws EmailTakenError if the email is in use. */
export function createUser(input: NewUserInput): User {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const exists = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (exists) throw new EmailTakenError();

  const id = `U-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, email, hashPassword(input.password), input.name.trim() || null, new Date().toISOString());

  return getUserById(id)!;
}

/** Look up a user by id (no password hash), or null. */
export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as
    | UserRow
    | undefined;
  return row ? toUser(row) : null;
}

/** Verify email + password. Returns the user on success, else null. */
export function verifyCredentials(email: string, password: string): User | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  if (!row) return null;
  return verifyPassword(password, row.password_hash) ? toUser(row) : null;
}

/** Update editable profile / saved-address fields. Returns the updated user. */
export function updateUserProfile(
  id: string,
  patch: Partial<Pick<User, "name" | "phone" | "address" | "city" | "pincode">>,
): User | null {
  const db = getDb();
  if (!getUserById(id)) return null;

  const fields: Record<string, string | null> = {};
  for (const key of ["name", "phone", "address", "city", "pincode"] as const) {
    if (patch[key] !== undefined) {
      const v = patch[key];
      fields[key] = v === null ? null : String(v).trim() || null;
    }
  }
  const keys = Object.keys(fields);
  if (keys.length > 0) {
    db.prepare(
      `UPDATE users SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
    ).run(...keys.map((k) => fields[k]), id);
  }
  return getUserById(id);
}

/** Create a session for a user. Returns the opaque token to store in a cookie. */
export function createSession(userId: string): string {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  db.prepare(
    `INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  ).run(
    token,
    userId,
    new Date(now).toISOString(),
    new Date(now + SESSION_TTL_MS).toISOString(),
  );
  return token;
}

/** Resolve a session token to its user, or null if missing/expired. */
export function getSessionUser(token: string): User | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT user_id, expires_at FROM sessions WHERE token = ?`)
    .get(token) as { user_id: string; expires_at: string } | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    return null;
  }
  return getUserById(row.user_id);
}

/** Invalidate a session token (logout). */
export function deleteSession(token: string): void {
  getDb().prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}
