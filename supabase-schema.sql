-- Chạy trong Supabase Dashboard > SQL Editor > New query.
-- Dùng tên bảng riêng để không đụng vào bảng của bản đăng nhập cũ (nếu đã tạo).
create table if not exists public.flower_gifts_public (
  gift_date date primary key,
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.flower_gifts_public enable row level security;
-- Không tạo policy cho anon/authenticated. API Vercel truy cập bằng service-role key ở phía máy chủ.
