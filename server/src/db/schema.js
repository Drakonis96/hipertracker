import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar'), // emoji opcional; si es null se usa la inicial
  color: text('color').notNull().default('#10b981'),
  pinHash: text('pin_hash'), // null = sin PIN
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  accentColor: text('accent_color').notNull().default('#10b981'),
  theme: text('theme').notNull().default('system'), // light | dark | system
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('personal'), // personal | shared
  ownerId: text('owner_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'), // emoji o nombre de icono o null
  iconType: text('icon_type').notNull().default('none'), // emoji | icon | none
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
  position: integer('position').notNull().default(0),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const customStores = sqliteTable('custom_stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const itemStores = sqliteTable(
  'item_stores',
  {
    itemId: text('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    storeId: text('store_id').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.itemId, t.storeId] }),
  }),
);
