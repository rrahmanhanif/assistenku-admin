# State Machine & DDL Minimum Viable Core

## Order State Machine

| State             | Deskripsi                                                                 |
| ----------------- | ------------------------------------------------------------------------- |
| OPEN              | Dibuat oleh customer, belum ada mitra.                                    |
| ASSIGNED          | Admin/auto-assign sudah menetapkan mitra.                                 |
| IN_PROGRESS       | Mitra check-in dan mulai pengerjaan.                                      |
| COMPLETED         | Mitra submit evidence dan menandai selesai.                               |
| CLOSED            | Order disahkan (oleh admin/customer/auto SLA) dan tidak bisa diubah lagi. |
| CANCELLED         | Order dibatalkan sesuai aturan.                                           |
| DISPUTED          | Order disengketakan oleh customer/admin.                                  |
| REFUND_PENDING    | Proses refund sedang berlangsung.                                         |
| REFUNDED          | Refund tuntas.                                                            |
| EVIDENCE_REJECTED | Evidence ditolak (gate untuk back to IN_PROGRESS/COMPLETED).              |

### Transition Table

| Dari              | Aksi      | Ke              | Guard                                               |
| ----------------- | --------- | --------------- | --------------------------------------------------- |
| OPEN              | ASSIGN    | ASSIGNED        | Hanya admin/operator/auto-assign.                   |
| OPEN              | CANCEL    | CANCELLED       | Customer/admin dengan kebijakan yang berlaku.       |
| ASSIGNED          | CHECKIN   | IN_PROGRESS     | Mitra yang sama dengan `assigned_mitra_id`.         |
| ASSIGNED          | CANCEL    | CANCELLED       | Admin sesuai SLA/policy.                            |
| IN_PROGRESS       | COMPLETE  | COMPLETED       | Mitra + evidence hash wajib.                        |
| IN_PROGRESS       | DISPUTE   | DISPUTED        | Customer/admin.                                     |
| COMPLETED         | CLOSE     | CLOSED          | Admin/operator/customer (sesuai rule) atau auto-SLA.|
| COMPLETED         | DISPUTE   | DISPUTED        | Customer/admin.                                     |
| DISPUTED          | CLOSE     | CLOSED          | Admin memutuskan (bisa sertakan refund).            |
| DISPUTED          | REFUND    | REFUND_PENDING  | Keputusan membutuhkan pencatatan finansial.         |
| REFUND_PENDING    | COMPLETE  | REFUNDED        | Setelah proses finansial sukses.                    |
| EVIDENCE_REJECTED | COMPLETE  | COMPLETED       | Mitra re-submit evidence sesuai koreksi.            |

Semua transisi wajib dicatat di `audit_events` dan melewati validasi RBAC + idempotency key di layer API.

## DDL Minimum (PostgreSQL)

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sla_minutes INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  area JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coverage_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pricing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number TEXT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT','ACTIVE','RETIRED')),
  published_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_version_id UUID NOT NULL REFERENCES pricing_versions(id),
  service_code TEXT NOT NULL REFERENCES services(service_code),
  currency TEXT DEFAULT 'IDR',
  base_price NUMERIC(12,2) NOT NULL,
  rule JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL, -- e.g. overtime, penalty, evidence_rule
  name TEXT NOT NULL,
  rules JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','operator','finance','customer','mitra')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  service_code TEXT NOT NULL REFERENCES services(service_code),
  status TEXT NOT NULL CHECK (status IN (
    'OPEN','ASSIGNED','IN_PROGRESS','COMPLETED','CLOSED','CANCELLED','DISPUTED','REFUND_PENDING','REFUNDED','EVIDENCE_REJECTED'
  )),
  assigned_mitra_id UUID REFERENCES users(id),
  price NUMERIC(12,2) NOT NULL,
  pricing_snapshot JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  state TEXT NOT NULL,
  note TEXT,
  evidence_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('UNPAID','PAID','FAILED','REFUNDED')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  status TEXT NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  gateway_ref TEXT,
  paid_at TIMESTAMPTZ,
  amount NUMERIC(12,2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitra_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('REQUESTED','APPROVED','SENT','FAILED')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  order_id UUID REFERENCES orders(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL, -- debit/credit
  account TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('OPEN','IN_REVIEW','RESOLVED','REJECTED')),
  reason TEXT NOT NULL,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE evidence_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_url TEXT NOT NULL,
  file_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_id UUID,
  timestamp TIMESTAMPTZ DEFAULT now(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_state TEXT,
  after_state TEXT,
  ip_address TEXT,
  device TEXT,
  request_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  evidence_hash TEXT
);
