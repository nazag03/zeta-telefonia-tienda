
import { randomBytes } from "node:crypto";
import { Timestamp, type DocumentData, type Query } from "firebase-admin/firestore";
import { firestore } from "./firebase";
import { normalizePrices } from "./format";





export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string; 
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  active: boolean;
  showOnHome: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImage = { id: string; url: string; alt: string | null; order: number };


export type ProductVariant = {
  id: string;
  name: string;
  
  hex: string | null;
  
  imageIds: string[];
  ownPrice: boolean;
  price: number | null;
  promoPrice: number | null;
  priceUsd: number | null;
  promoPriceUsd: number | null;
  
  availability: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string | null;
  shortDescription: string | null;
  description: string | null;
  
  price: number | null;
  promoPrice: number | null;
  
  priceUsd: number | null;
  promoPriceUsd: number | null;
  
  currency: string;
  specs: string; 
  availability: string; 
  condition: string; 
  isFeatured: boolean;
  isNew: boolean;
  isOffer: boolean;
  active: boolean;
  order: number;
  categoryId: string | null;
  
  images: ProductImage[];
  
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type Promotion = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string; 
  badge: string | null;
  image: string | null;
  comboPrice: number | null;
  currency: string;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  showOnHome: boolean;
  order: number;
  
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Testimonial = {
  id: string;
  author: string;
  content: string;
  rating: number;
  source: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};


export type Setting = { id: string; value: string; createdAt: Date; updatedAt: Date };

export type Inquiry = {
  id: string;
  type: string; 
  productId: string | null;
  detail: string | null;
  createdAt: Date;
};

type Models = {
  users: User;
  categories: Category;
  products: Product;
  promotions: Promotion;
  testimonials: Testimonial;
  settings: Setting;
};
type Col = keyof Models;
const COLLECTIONS: Col[] = ["users", "categories", "products", "promotions", "testimonials", "settings"];

type Auto = "id" | "createdAt" | "updatedAt";

export type CreateInput<C extends Col> = Omit<Models[C], Auto | keyof (typeof DEFAULTS)[C]> &
  Partial<Pick<Models[C], Extract<keyof (typeof DEFAULTS)[C], keyof Models[C]>>> & { id?: string };
export type UpdateInput<C extends Col> = Partial<Omit<Models[C], Auto>>;

const DEFAULTS = {
  users: { role: "EDITOR", active: true, lastLoginAt: null },
  categories: { description: null, image: null, order: 0, active: true, showOnHome: true },
  products: {
    model: null, shortDescription: null, description: null, promoPrice: null, priceUsd: null, promoPriceUsd: null, currency: "ARS", specs: "[]",
    availability: "IN_STOCK", condition: "NEW", isFeatured: false, isNew: false, isOffer: false, active: true,
    order: 0, categoryId: null, images: [] as ProductImage[], variants: [] as ProductVariant[],
  },
  promotions: {
    description: null, type: "OFFER", badge: null, image: null, comboPrice: null, currency: "ARS", startsAt: null,
    endsAt: null, active: true, showOnHome: true, order: 0, productIds: [] as string[],
  },
  testimonials: { rating: 5, source: null, active: true, order: 0 },
  settings: {},
} satisfies { [C in Col]: Partial<Models[C]> };





function fromStore(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toDate();
  if (Array.isArray(v)) return v.map(fromStore);
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fromStore(x)]));
  }
  return v;
}

function docToObject<T>(id: string, data: DocumentData): T {
  return { ...(fromStore(data) as object), id } as T;
}


function upgrade(col: Col, obj: unknown): unknown {
  if (col === "products") {
    const p = normalizePrices(obj as Product);
    return { ...p, variants: Array.isArray(p.variants) ? p.variants : [] };
  }
  return obj;
}

function toStore(obj: Record<string, unknown>) {
  const { id: _id, ...rest } = obj;
  return rest;
}

export function newId() {
  
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(randomBytes(20), (b) => chars[b % chars.length]).join("");
}





const META_DOC = "_meta/versions";


const CHECK_EVERY_MS = 15_000;

type CacheState = {
  
  versions: Partial<Record<Col, number>>;
  
  remote: Partial<Record<Col, number>>;
  data: Partial<Record<Col, Map<string, unknown>>>;
  loading: Partial<Record<Col, Promise<Map<string, unknown>>>>;
  checkedAt: number;
  checking?: Promise<void>;
};

const g = globalThis as unknown as { __zetaCache?: CacheState };
const state: CacheState = (g.__zetaCache ??= { versions: {}, remote: {}, data: {}, loading: {}, checkedAt: 0 });

async function syncVersions() {
  if (Date.now() - state.checkedAt < CHECK_EVERY_MS) return;
  state.checking ??= (async () => {
    try {
      const snap = await firestore().doc(META_DOC).get();
      const remote = (snap.data() ?? {}) as Partial<Record<Col, number>>;
      for (const c of COLLECTIONS) {
        state.remote[c] = remote[c] ?? 0;
        if (state.data[c] && state.versions[c] !== state.remote[c]) delete state.data[c];
      }
      state.checkedAt = Date.now();
    } finally {
      state.checking = undefined;
    }
  })();
  await state.checking;
}

async function loadCollection<C extends Col>(col: C): Promise<Map<string, Models[C]>> {
  await syncVersions();
  const cached = state.data[col];
  if (cached) return cached as Map<string, Models[C]>;
  state.loading[col] ??= (async () => {
    try {
      
      const version = state.remote[col] ?? 0;
      const snap = await firestore().collection(col).get();
      const map = new Map<string, unknown>(snap.docs.map((d) => [d.id, upgrade(col, docToObject<Models[C]>(d.id, d.data()))]));
      state.data[col] = map;
      state.versions[col] = version;
      return map;
    } finally {
      delete state.loading[col];
    }
  })();
  return (await state.loading[col]) as Map<string, Models[C]>;
}





export type Op =
  | { [C in Col]: { op: "create"; col: C; data: CreateInput<C> } }[Col]
  | { [C in Col]: { op: "update"; col: C; id: string; data: UpdateInput<C> } }[Col]
  | { [C in Col]: { op: "set"; col: C; id: string; data: Omit<CreateInput<C>, "id"> } }[Col]
  | { op: "delete"; col: Col; id: string };

type Prepared = { col: Col; id: string; kind: "create" | "update" | "delete"; data?: Record<string, unknown> };

function prepare(op: Op, now: Date): Prepared {
  if (op.op === "delete") return { col: op.col, id: op.id, kind: "delete" };
  if (op.op === "update") return { col: op.col, id: op.id, kind: "update", data: { ...op.data, updatedAt: now } };
  const id = op.op === "set" ? op.id : (op.data as { id?: string }).id || newId();
  const full = { ...DEFAULTS[op.col], ...(op.data as object), createdAt: now, updatedAt: now };
  return { col: op.col, id, kind: "create", data: toStore(full) };
}


export async function write(ops: Op[]): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < ops.length; i += 450) ids.push(...(await writeChunk(ops.slice(i, i + 450))));
  return ids;
}

async function writeChunk(ops: Op[]): Promise<string[]> {
  if (ops.length === 0) return [];
  const now = new Date();
  const prepared = ops.map((o) => prepare(o, now));
  const touched = [...new Set(prepared.map((p) => p.col))];
  const fs = firestore();
  const metaRef = fs.doc(META_DOC);

  let before: Partial<Record<Col, number>> = {};
  await fs.runTransaction(async (tx) => {
    const meta = await tx.get(metaRef);
    before = (meta.data() ?? {}) as Partial<Record<Col, number>>;
    for (const p of prepared) {
      const ref = fs.collection(p.col).doc(p.id);
      if (p.kind === "create") {
        
        tx.set(ref, p.data as DocumentData);
      } else if (p.kind === "update") tx.update(ref, p.data as DocumentData);
      else tx.delete(ref);
    }
    tx.set(metaRef, Object.fromEntries(touched.map((c) => [c, (before[c] ?? 0) + 1])), { merge: true });
  });

  
  for (const c of touched) {
    const next = (before[c] ?? 0) + 1;
    const map = state.data[c];
    if (map && state.versions[c] === (before[c] ?? 0)) {
      for (const p of prepared.filter((x) => x.col === c)) {
        if (p.kind === "delete") map.delete(p.id);
        else if (p.kind === "create") map.set(p.id, upgrade(c, { ...p.data, id: p.id }));
        else {
          const old = map.get(p.id);
          if (old) map.set(p.id, { ...(old as object), ...p.data });
          else delete state.data[c];
        }
      }
      if (state.data[c]) state.versions[c] = next;
    } else {
      delete state.data[c];
    }
    state.remote[c] = Math.max(state.remote[c] ?? 0, next);
  }
  return prepared.map((p) => p.id);
}





class Repo<C extends Col> {
  constructor(readonly col: C) {}

  
  async all(): Promise<Models[C][]> {
    return [...(await loadCollection(this.col)).values()];
  }

  async get(id: string | null | undefined): Promise<Models[C] | null> {
    if (!id) return null;
    return (await loadCollection(this.col)).get(id) ?? null;
  }

  async find(pred: (x: Models[C]) => boolean): Promise<Models[C] | null> {
    for (const x of (await loadCollection(this.col)).values()) if (pred(x)) return x;
    return null;
  }

  async where(pred: (x: Models[C]) => boolean): Promise<Models[C][]> {
    return (await this.all()).filter(pred);
  }

  async count(pred?: (x: Models[C]) => boolean): Promise<number> {
    const all = await this.all();
    return pred ? all.filter(pred).length : all.length;
  }

  async create(data: CreateInput<C>): Promise<Models[C]> {
    const [id] = await write([{ op: "create", col: this.col, data } as unknown as Op]);
    return (await this.get(id)) as Models[C];
  }

  
  async set(id: string, data: Omit<CreateInput<C>, "id">): Promise<void> {
    await write([{ op: "set", col: this.col, id, data } as unknown as Op]);
  }

  
  async update(id: string, data: UpdateInput<C>): Promise<void> {
    await write([{ op: "update", col: this.col, id, data } as unknown as Op]);
  }

  async delete(id: string): Promise<void> {
    await write([{ op: "delete", col: this.col, id }]);
  }
}

export const db = {
  users: new Repo("users"),
  categories: new Repo("categories"),
  products: new Repo("products"),
  promotions: new Repo("promotions"),
  testimonials: new Repo("testimonials"),
  settings: new Repo("settings"),
};





const inquiriesCol = () => firestore().collection("inquiries");

export const inquiries = {
  async create(data: { type: string; productId: string | null; detail: string | null }) {
    await inquiriesCol().add({ ...data, createdAt: new Date() });
  },

  
  async count(opts: { since?: Date; productId?: string } = {}) {
    let q: Query = inquiriesCol();
    if (opts.since) q = q.where("createdAt", ">=", opts.since);
    if (opts.productId) q = q.where("productId", "==", opts.productId);
    const snap = await q.count().get();
    return snap.data().count;
  },

  async latest(limit: number): Promise<Inquiry[]> {
    const snap = await inquiriesCol().orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => docToObject<Inquiry>(d.id, d.data()));
  },

  
  async since(date: Date, max = 10000): Promise<Inquiry[]> {
    const snap = await inquiriesCol().where("createdAt", ">=", date).orderBy("createdAt", "desc").limit(max).get();
    return snap.docs.map((d) => docToObject<Inquiry>(d.id, d.data()));
  },

  async deleteOlderThan(date: Date) {
    let deleted = 0;
    for (;;) {
      const snap = await inquiriesCol().where("createdAt", "<", date).limit(400).get();
      if (snap.empty) return deleted;
      const batch = firestore().batch();
      for (const d of snap.docs) batch.delete(d.ref);
      await batch.commit();
      deleted += snap.size;
    }
  },
};





type Key<T> = keyof T | ((x: T) => unknown);
type Dir = "asc" | "desc";

function cmp(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1; 
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b, "es", { sensitivity: "base" });
  if (typeof a === "boolean" || typeof b === "boolean") return Number(a) - Number(b);
  return (a as number) - (b as number);
}


export function sortBy<T>(list: T[], ...keys: [Key<T>, Dir?][]): T[] {
  return list.sort((x, y) => {
    for (const [k, dir = "asc"] of keys) {
      const get = (o: T) => (typeof k === "function" ? k(o) : o[k]);
      const r = cmp(get(x), get(y));
      if (r !== 0) return dir === "asc" ? r : -r;
    }
    return 0;
  });
}
