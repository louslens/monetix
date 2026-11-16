
-- ============ ENUMS ============
create type public.app_role as enum ('admin','client');
create type public.order_status as enum ('awaiting_payment','in_queue','processing','delivered','expired_free','cancelled');
create type public.payment_status as enum ('unpaid','pending','paid','failed','refund_pending','refunded');
create type public.txn_status as enum ('pending','successful','failed');
create type public.service_category as enum ('tiktok','youtube');
create type public.refund_status as enum ('pending','processing','completed','failed');

create sequence public.client_code_seq start 1001;
create sequence public.order_number_seq start 1;

-- ============ updated_at helper ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  client_code text unique not null default ('LL-' || lpad(nextval('public.client_code_seq')::text, 6, '0')),
  full_name text not null default '' check (char_length(full_name) <= 120),
  email text not null default '',
  phone text not null default '' check (char_length(phone) <= 30),
  preferred_lang text not null default 'fr' check (preferred_lang in ('fr','en')),
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (full_name, phone, preferred_lang) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Own profile or admin read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Own profile update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ============ ADMIN SETTINGS ============
create table public.admin_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'LOUSLENS DIGITAL',
  logo_url text,
  contact_email text not null default 'louslens6@gmail.com',
  mobile_money_number text not null default '697090979',
  whatsapp_number text not null default '237697090979',
  contact_phone text not null default '697090979',
  address text not null default 'Cameroun',
  default_lang text not null default 'fr' check (default_lang in ('fr','en')),
  notify_near_deadline_hours int not null default 6 check (notify_near_deadline_hours between 1 and 47),
  notify_admin_new_order boolean not null default true,
  notify_admin_new_message boolean not null default true,
  notify_admin_new_client boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.admin_settings (id) values (1);
grant select on public.admin_settings to anon, authenticated;
grant update on public.admin_settings to authenticated;
grant all on public.admin_settings to service_role;
alter table public.admin_settings enable row level security;
create policy "Settings are public" on public.admin_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.admin_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger settings_touch before update on public.admin_settings for each row execute function public.touch_updated_at();

-- ============ SERVICES ============
create table public.services (
  id uuid primary key default gen_random_uuid(),
  category public.service_category not null,
  name_fr text not null check (char_length(name_fr) between 2 and 120),
  name_en text not null check (char_length(name_en) between 2 and 120),
  description_fr text not null default '' check (char_length(description_fr) <= 2000),
  description_en text not null default '' check (char_length(description_en) <= 2000),
  price_xaf integer not null check (price_xaf >= 0 and price_xaf <= 10000000),
  image_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "Active services are public" on public.services for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert services" on public.services for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update services" on public.services for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete services" on public.services for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

insert into public.services (category, name_fr, name_en, description_fr, description_en, price_xaf, image_url, sort_order) values
('tiktok','Création de compte TikTok professionnel','Professional TikTok account setup',
 'Création et configuration complète de votre compte TikTok : nom, nom d''utilisateur, photo, biographie optimisée et paramètres de sécurité. Vous gardez le contrôle total de votre adresse e-mail.',
 'Full creation and configuration of your TikTok account: name, username, profile photo, optimised bio and security settings. You keep full control of your email address.',
 15000,'/images/service-tiktok-setup.jpg',1),
('tiktok','Préparation TikTok à la monétisation','TikTok monetisation readiness',
 'Optimisation du profil, conseils de contenu et accompagnement pour vous rapprocher des critères d''éligibilité de TikTok. La monétisation reste soumise aux décisions et politiques de TikTok.',
 'Profile optimisation, content guidance and support to help you move toward TikTok eligibility criteria. Monetisation remains subject to TikTok''s decisions and policies.',
 25000,'/images/service-tiktok-growth.jpg',2),
('youtube','Création de chaîne YouTube','YouTube channel setup',
 'Création et personnalisation de votre chaîne YouTube : nom, identifiant, bannière, description et paramètres. Vous restez propriétaire de votre compte Google.',
 'Creation and customisation of your YouTube channel: name, handle, banner, description and settings. You remain the owner of your Google account.',
 15000,'/images/service-youtube-setup.jpg',3),
('youtube','Préparation au Programme Partenaire YouTube','YouTube Partner Program readiness',
 'Accompagnement pour structurer votre chaîne et vous rapprocher des critères du Programme Partenaire YouTube. L''accès à la monétisation dépend uniquement des critères et des politiques de YouTube.',
 'Guidance to structure your channel and move toward YouTube Partner Program criteria. Access to monetisation depends solely on YouTube''s criteria and policies.',
 30000,'/images/service-youtube-growth.jpg',4);

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('LLD-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  user_id uuid not null references public.profiles(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  service_name_fr text not null,
  service_name_en text not null,
  category public.service_category not null,
  amount_xaf integer not null check (amount_xaf >= 0),
  status public.order_status not null default 'awaiting_payment',
  payment_status public.payment_status not null default 'unpaid',
  countdown_started_at timestamptz,
  deadline_at timestamptz,
  processing_started_at timestamptz,
  delivered_at timestamptz,
  expired_at timestamptz,
  near_deadline_notified boolean not null default false,
  is_free boolean not null default false,
  rating smallint check (rating between 1 and 5),
  review text check (char_length(review) <= 1000),
  rated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
create index orders_deadline_idx on public.orders(deadline_at) where status in ('in_queue','processing');
grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Own orders or admin" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- ============ ORDER FORMS ============
create table public.order_forms (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  full_name text not null,
  birth_date date not null,
  email text not null,
  phone text not null,
  country text not null,
  platform public.service_category not null,
  desired_account_name text not null,
  desired_username text not null,
  account_type text not null,
  extra_info text not null default '',
  dedicated_email text not null,
  confirmation_accepted boolean not null,
  submitted_at timestamptz not null default now()
);
grant select on public.order_forms to authenticated;
grant all on public.order_forms to service_role;
alter table public.order_forms enable row level security;
create policy "Own forms or admin" on public.order_forms for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- ============ PAYMENTS ============
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null default 'campay',
  operator text not null check (operator in ('MTN','ORANGE')),
  phone text not null,
  amount_xaf integer not null check (amount_xaf > 0),
  currency text not null default 'XAF',
  status public.txn_status not null default 'pending',
  provider_reference text unique,
  operator_reference text,
  ussd_code text,
  failure_reason text,
  raw jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments(order_id);
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "Own payments or admin" on public.payments for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create trigger payments_touch before update on public.payments for each row execute function public.touch_updated_at();

-- ============ REFUNDS ============
create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount_xaf integer not null check (amount_xaf >= 0),
  reason text not null check (reason in ('deadline_exceeded','duplicate_payment','manual')),
  status public.refund_status not null default 'pending',
  provider_reference text,
  notes text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);
grant select on public.refunds to authenticated;
grant all on public.refunds to service_role;
alter table public.refunds enable row level security;
create policy "Own refunds or admin" on public.refunds for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create trigger refunds_touch before update on public.refunds for each row execute function public.touch_updated_at();

-- ============ PAYOUTS (reversements vers le numéro Mobile Money) ============
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  amount_xaf integer not null check (amount_xaf > 0),
  phone text not null,
  status public.txn_status not null default 'pending',
  provider_reference text,
  created_by uuid not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.payouts to authenticated;
grant all on public.payouts to service_role;
alter table public.payouts enable row level security;
create policy "Admins read payouts" on public.payouts for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger payouts_touch before update on public.payouts for each row execute function public.touch_updated_at();

-- ============ CONVERSATIONS & MESSAGES ============
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null default '' check (char_length(subject) <= 200),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index conversations_user_idx on public.conversations(user_id);
grant select, insert on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;
create policy "Own conversations or admin" on public.conversations for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Create own conversation" on public.conversations for insert to authenticated
  with check (
    public.has_role(auth.uid(), 'admin')
    or (user_id = auth.uid() and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.suspended))
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  is_admin boolean not null default false,
  kind text not null default 'text' check (kind in ('text','delivery','system')),
  body text not null default '' check (char_length(body) <= 5000),
  attachment_path text,
  attachment_name text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_conv_idx on public.messages(conversation_id, created_at);
grant select, insert on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "Read messages in own conversations" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))));
create policy "Send messages in own conversations" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and kind = 'text'
    and exists (
      select 1 from public.conversations c where c.id = conversation_id
      and (public.has_role(auth.uid(), 'admin')
        or (c.user_id = auth.uid() and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.suspended)))
    )
  );
create policy "Mark received messages read" on public.messages for update to authenticated
  using (sender_id <> auth.uid() and exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))))
  with check (sender_id <> auth.uid());

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null default 'user' check (audience in ('user','admin')),
  user_id uuid,
  type text not null,
  params jsonb not null default '{}'::jsonb,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
create index notifications_audience_idx on public.notifications(audience, created_at desc);
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Read own notifications" on public.notifications for select to authenticated
  using ((audience = 'user' and user_id = auth.uid()) or (audience = 'admin' and public.has_role(auth.uid(), 'admin')));
create policy "Mark own notifications read" on public.notifications for update to authenticated
  using ((audience = 'user' and user_id = auth.uid()) or (audience = 'admin' and public.has_role(auth.uid(), 'admin')))
  with check ((audience = 'user' and user_id = auth.uid()) or (audience = 'admin' and public.has_role(auth.uid(), 'admin')));

create or replace function public.notify(_audience text, _user_id uuid, _type text, _params jsonb, _link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (audience, user_id, type, params, link) values (_audience, _user_id, _type, coalesce(_params,'{}'::jsonb), _link);
$$;
revoke all on function public.notify(text, uuid, text, jsonb, text) from public, anon, authenticated;

-- ============ DELIVERIES ============
create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  message text not null default '',
  info text not null default '',
  instructions text not null default '',
  links jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  delivered_by uuid not null,
  delivered_at timestamptz not null default now()
);
grant select on public.deliveries to authenticated;
grant all on public.deliveries to service_role;
alter table public.deliveries enable row level security;
create policy "Own deliveries or admin" on public.deliveries for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- ============ ORDER STATUS HISTORY (immuable) ============
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  event text not null,
  from_status text,
  to_status text,
  note text,
  actor_id uuid,
  created_at timestamptz not null default now()
);
create index osh_order_idx on public.order_status_history(order_id, created_at);
grant select on public.order_status_history to authenticated;
grant select, insert on public.order_status_history to service_role;
alter table public.order_status_history enable row level security;
create policy "Own history or admin" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))));

create or replace function public.prevent_history_change()
returns trigger language plpgsql as $$
begin raise exception 'order_status_history is append-only'; end; $$;
create trigger osh_no_update before update or delete on public.order_status_history
  for each row execute function public.prevent_history_change();

create or replace function public.log_order_event(_order_id uuid, _event text, _from text, _to text, _note text, _actor uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.order_status_history (order_id, event, from_status, to_status, note, actor_id) values (_order_id, _event, _from, _to, _note, _actor);
$$;
revoke all on function public.log_order_event(uuid, text, text, text, text, uuid) from public, anon, authenticated;

-- ============ CONTACT MESSAGES ============
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  phone text not null default '' check (char_length(phone) <= 30),
  subject text not null default '' check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 5 and 3000),
  kind text not null default 'contact' check (kind in ('contact','complaint')),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone can send a contact message" on public.contact_messages for insert to anon, authenticated with check (handled = false);
create policy "Admins read contact messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update contact messages" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ SIGNUP / ADMIN BOOTSTRAP ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_is_admin boolean := lower(new.email) = 'louslens6@gmail.com';
begin
  insert into public.profiles (id, full_name, email, phone, preferred_lang)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 120),
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data->>'phone', ''), 30),
    case when new.raw_user_meta_data->>'lang' = 'en' then 'en' else 'fr' end
  );
  insert into public.user_roles (user_id, role) values (new.id, 'client');
  if v_is_admin and new.email_confirmed_at is not null then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  perform public.notify('user', new.id, 'welcome', '{}'::jsonb, '/dashboard');
  if not v_is_admin then
    perform public.notify('admin', null, 'new_client',
      jsonb_build_object('name', coalesce(new.raw_user_meta_data->>'full_name', new.email)), '/admin/clients');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.handle_user_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null and lower(new.email) = 'louslens6@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end; $$;
create trigger on_auth_user_updated after update on auth.users for each row execute function public.handle_user_confirmed();

-- ============ PUBLIC HELPERS ============
create or replace function public.server_now()
returns timestamptz language sql stable as $$ select now() $$;
grant execute on function public.server_now() to anon, authenticated;

create or replace function public.public_reviews()
returns table (first_name text, rating smallint, review text, category public.service_category, service_name_fr text, service_name_en text, rated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select split_part(p.full_name, ' ', 1), o.rating, o.review, o.category, o.service_name_fr, o.service_name_en, o.rated_at
  from public.orders o join public.profiles p on p.id = o.user_id
  where o.rating is not null
  order by o.rated_at desc limit 12
$$;
grant execute on function public.public_reviews() to anon, authenticated;

-- ============ CLIENT: CREATE ORDER ============
create or replace function public.create_order(_service_id uuid, _form jsonb)
returns table (order_id uuid, order_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_service public.services;
  v_order public.orders;
  v_birth date;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from public.profiles where id = v_uid and suspended) then raise exception 'account_suspended'; end if;
  select * into v_service from public.services where id = _service_id and active;
  if not found then raise exception 'service_unavailable'; end if;
  if coalesce((_form->>'confirmation_accepted')::boolean, false) is not true then raise exception 'confirmation_required'; end if;
  if char_length(coalesce(_form->>'full_name','')) < 2 or char_length(_form->>'full_name') > 120 then raise exception 'invalid_full_name'; end if;
  if coalesce(_form->>'email','') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  if coalesce(_form->>'dedicated_email','') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_dedicated_email'; end if;
  if char_length(coalesce(_form->>'phone','')) < 8 or char_length(_form->>'phone') > 30 then raise exception 'invalid_phone'; end if;
  if char_length(coalesce(_form->>'country','')) < 2 or char_length(_form->>'country') > 80 then raise exception 'invalid_country'; end if;
  if char_length(coalesce(_form->>'desired_account_name','')) < 2 or char_length(_form->>'desired_account_name') > 80 then raise exception 'invalid_account_name'; end if;
  if char_length(coalesce(_form->>'desired_username','')) < 2 or char_length(_form->>'desired_username') > 60 then raise exception 'invalid_username'; end if;
  if char_length(coalesce(_form->>'account_type','')) < 2 or char_length(_form->>'account_type') > 60 then raise exception 'invalid_account_type'; end if;
  if char_length(coalesce(_form->>'extra_info','')) > 2000 then raise exception 'invalid_extra_info'; end if;
  begin v_birth := (_form->>'birth_date')::date; exception when others then raise exception 'invalid_birth_date'; end;
  if v_birth is null or v_birth > (current_date - interval '13 years') or v_birth < date '1900-01-01' then raise exception 'invalid_birth_date'; end if;

  insert into public.orders (user_id, service_id, service_name_fr, service_name_en, category, amount_xaf)
  values (v_uid, v_service.id, v_service.name_fr, v_service.name_en, v_service.category, v_service.price_xaf)
  returning * into v_order;

  insert into public.order_forms (order_id, user_id, full_name, birth_date, email, phone, country, platform,
    desired_account_name, desired_username, account_type, extra_info, dedicated_email, confirmation_accepted)
  values (v_order.id, v_uid, _form->>'full_name', v_birth, lower(_form->>'email'), _form->>'phone', _form->>'country', v_service.category,
    _form->>'desired_account_name', _form->>'desired_username', _form->>'account_type', coalesce(_form->>'extra_info',''),
    lower(_form->>'dedicated_email'), true);

  insert into public.conversations (user_id, order_id, subject) values (v_uid, v_order.id, v_order.order_number);

  perform public.log_order_event(v_order.id, 'order_created', null, 'awaiting_payment', null, v_uid);
  perform public.log_order_event(v_order.id, 'form_submitted', null, null, null, v_uid);
  perform public.notify('user', v_uid, 'form_sent', jsonb_build_object('order_number', v_order.order_number), '/dashboard/orders/' || v_order.id);
  perform public.notify('user', v_uid, 'order_received', jsonb_build_object('order_number', v_order.order_number), '/dashboard/orders/' || v_order.id);
  perform public.notify('admin', null, 'new_order', jsonb_build_object('order_number', v_order.order_number, 'service', v_service.name_fr), '/admin/orders/' || v_order.id);
  perform public.notify('admin', null, 'new_form', jsonb_build_object('order_number', v_order.order_number), '/admin/orders/' || v_order.id);

  return query select v_order.id, v_order.order_number;
end; $$;
revoke all on function public.create_order(uuid, jsonb) from public, anon;
grant execute on function public.create_order(uuid, jsonb) to authenticated;

-- ============ CLIENT: RATE ORDER ============
create or replace function public.rate_order(_order_id uuid, _rating int, _review text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _rating < 1 or _rating > 5 then raise exception 'invalid_rating'; end if;
  if char_length(coalesce(_review,'')) > 1000 then raise exception 'review_too_long'; end if;
  update public.orders set rating = _rating, review = nullif(trim(_review),''), rated_at = now()
  where id = _order_id and user_id = auth.uid() and status = 'delivered' and rating is null;
  if not found then raise exception 'cannot_rate'; end if;
end; $$;
revoke all on function public.rate_order(uuid, int, text) from public, anon;
grant execute on function public.rate_order(uuid, int, text) to authenticated;

-- ============ SERVER ONLY: PAYMENT CONFIRMATION ============
create or replace function public.confirm_payment(_payment_id uuid, _operator_reference text, _amount int, _raw jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_pay public.payments;
  v_order public.orders;
begin
  select * into v_pay from public.payments where id = _payment_id for update;
  if not found then return 'not_found'; end if;
  if v_pay.status = 'successful' then return 'already_confirmed'; end if;
  if _amount is distinct from v_pay.amount_xaf then
    update public.payments set status = 'failed', failure_reason = 'amount_mismatch', raw = _raw where id = v_pay.id;
    return 'amount_mismatch';
  end if;
  update public.payments set status = 'successful', operator_reference = _operator_reference, raw = _raw, confirmed_at = now() where id = v_pay.id;

  select * into v_order from public.orders where id = v_pay.order_id for update;
  if v_order.payment_status = 'paid' or v_order.status <> 'awaiting_payment' then
    -- Double paiement : remboursement automatique planifié
    insert into public.refunds (order_id, payment_id, user_id, amount_xaf, reason) values (v_order.id, v_pay.id, v_order.user_id, v_pay.amount_xaf, 'duplicate_payment');
    perform public.log_order_event(v_order.id, 'duplicate_payment', null, null, v_pay.id::text, null);
    perform public.notify('admin', null, 'duplicate_payment', jsonb_build_object('order_number', v_order.order_number, 'amount', v_pay.amount_xaf), '/admin/refunds');
    return 'duplicate';
  end if;

  update public.orders set payment_status = 'paid', status = 'in_queue',
    countdown_started_at = now(), deadline_at = now() + interval '48 hours'
  where id = v_order.id;
  perform public.log_order_event(v_order.id, 'payment_confirmed', 'awaiting_payment', 'in_queue', v_pay.provider_reference, null);
  perform public.log_order_event(v_order.id, 'countdown_started', null, null, (now() + interval '48 hours')::text, null);
  perform public.notify('user', v_order.user_id, 'payment_confirmed', jsonb_build_object('order_number', v_order.order_number, 'amount', v_pay.amount_xaf), '/dashboard/orders/' || v_order.id);
  perform public.notify('admin', null, 'new_payment', jsonb_build_object('order_number', v_order.order_number, 'amount', v_pay.amount_xaf, 'operator', v_pay.operator), '/admin/orders/' || v_order.id);
  return 'confirmed';
end; $$;
revoke all on function public.confirm_payment(uuid, text, int, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_payment(uuid, text, int, jsonb) to service_role;

create or replace function public.fail_payment(_payment_id uuid, _reason text, _raw jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.payments set status = 'failed', failure_reason = left(_reason, 200), raw = _raw
  where id = _payment_id and status = 'pending';
  update public.orders o set payment_status = 'failed'
  from public.payments p where p.id = _payment_id and o.id = p.order_id and o.payment_status in ('unpaid','pending');
end; $$;
revoke all on function public.fail_payment(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.fail_payment(uuid, text, jsonb) to service_role;

-- ============ DEADLINES (tâche planifiée + appel à la demande) ============
create or replace function public.process_order_deadlines()
returns int language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_count int := 0;
  v_hours int;
  v_paid record;
begin
  for r in select * from public.orders where status in ('in_queue','processing') and deadline_at is not null and deadline_at <= now() and delivered_at is null for update skip locked loop
    update public.orders set status = 'expired_free', is_free = true, expired_at = now() where id = r.id;
    perform public.log_order_event(r.id, 'deadline_exceeded', r.status::text, 'expired_free', 'Délai de 48 heures dépassé', null);
    perform public.notify('user', r.user_id, 'deadline_exceeded', jsonb_build_object('order_number', r.order_number), '/dashboard/orders/' || r.id);
    perform public.notify('user', r.user_id, 'order_free', jsonb_build_object('order_number', r.order_number), '/dashboard/orders/' || r.id);
    perform public.notify('admin', null, 'order_late', jsonb_build_object('order_number', r.order_number), '/admin/orders/' || r.id);
    if r.payment_status = 'paid' then
      select id, amount_xaf into v_paid from public.payments where order_id = r.id and status = 'successful' order by confirmed_at limit 1;
      insert into public.refunds (order_id, payment_id, user_id, amount_xaf, reason)
      values (r.id, v_paid.id, r.user_id, coalesce(v_paid.amount_xaf, r.amount_xaf), 'deadline_exceeded');
      update public.orders set payment_status = 'refund_pending' where id = r.id;
      perform public.log_order_event(r.id, 'refund_requested', null, null, 'Remboursement automatique (délai dépassé)', null);
    end if;
    v_count := v_count + 1;
  end loop;

  select notify_near_deadline_hours into v_hours from public.admin_settings where id = 1;
  for r in select * from public.orders where status in ('in_queue','processing') and not near_deadline_notified
      and deadline_at > now() and deadline_at <= now() + make_interval(hours => coalesce(v_hours, 6)) for update skip locked loop
    update public.orders set near_deadline_notified = true where id = r.id;
    perform public.notify('admin', null, 'order_near_deadline', jsonb_build_object('order_number', r.order_number, 'deadline', r.deadline_at), '/admin/orders/' || r.id);
  end loop;
  return v_count;
end; $$;
revoke all on function public.process_order_deadlines() from public, anon;
grant execute on function public.process_order_deadlines() to authenticated, service_role;

-- ============ ADMIN RPCs ============
create or replace function public.admin_start_processing(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  select * into v_order from public.orders where id = _order_id for update;
  if not found or v_order.status <> 'in_queue' then raise exception 'invalid_status'; end if;
  update public.orders set status = 'processing', processing_started_at = now() where id = _order_id;
  perform public.log_order_event(_order_id, 'processing_started', 'in_queue', 'processing', null, auth.uid());
  perform public.notify('user', v_order.user_id, 'order_processing', jsonb_build_object('order_number', v_order.order_number), '/dashboard/orders/' || _order_id);
end; $$;
revoke all on function public.admin_start_processing(uuid) from public, anon;
grant execute on function public.admin_start_processing(uuid) to authenticated;

create or replace function public.admin_deliver_order(_order_id uuid, _message text, _info text, _instructions text, _links jsonb, _attachments jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders; v_conv uuid; v_body text;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  if char_length(coalesce(_message,'')) < 2 or char_length(_message) > 5000 then raise exception 'invalid_message'; end if;
  select * into v_order from public.orders where id = _order_id for update;
  if not found or v_order.status not in ('in_queue','processing','expired_free') then raise exception 'invalid_status'; end if;

  insert into public.deliveries (order_id, user_id, message, info, instructions, links, attachments, delivered_by)
  values (_order_id, v_order.user_id, _message, coalesce(_info,''), coalesce(_instructions,''), coalesce(_links,'[]'::jsonb), coalesce(_attachments,'[]'::jsonb), auth.uid());

  update public.orders set status = 'delivered', delivered_at = now() where id = _order_id;
  perform public.log_order_event(_order_id, 'delivered', v_order.status::text, 'delivered', null, auth.uid());

  select id into v_conv from public.conversations where order_id = _order_id order by created_at limit 1;
  if v_conv is null then
    insert into public.conversations (user_id, order_id, subject) values (v_order.user_id, _order_id, v_order.order_number) returning id into v_conv;
  end if;
  v_body := _message;
  insert into public.messages (conversation_id, sender_id, is_admin, kind, body) values (v_conv, auth.uid(), true, 'delivery', v_body);
  update public.conversations set last_message_at = now() where id = v_conv;
  perform public.notify('user', v_order.user_id, 'order_delivered', jsonb_build_object('order_number', v_order.order_number), '/dashboard/orders/' || _order_id);
end; $$;
revoke all on function public.admin_deliver_order(uuid, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.admin_deliver_order(uuid, text, text, text, jsonb, jsonb) to authenticated;

create or replace function public.admin_set_suspended(_user_id uuid, _suspended boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  if public.has_role(_user_id, 'admin') then raise exception 'cannot_suspend_admin'; end if;
  update public.profiles set suspended = _suspended where id = _user_id;
end; $$;
revoke all on function public.admin_set_suspended(uuid, boolean) from public, anon;
grant execute on function public.admin_set_suspended(uuid, boolean) to authenticated;

create or replace function public.admin_update_refund(_refund_id uuid, _status public.refund_status, _reference text, _notes text)
returns void language plpgsql security definer set search_path = public as $$
declare v_ref public.refunds; v_order public.orders;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  select * into v_ref from public.refunds where id = _refund_id for update;
  if not found then raise exception 'not_found'; end if;
  if v_ref.status = 'completed' then raise exception 'already_completed'; end if;
  update public.refunds set status = _status, provider_reference = coalesce(nullif(_reference,''), provider_reference),
    notes = coalesce(nullif(_notes,''), notes), processed_at = case when _status in ('completed','failed') then now() else processed_at end
  where id = _refund_id;
  select * into v_order from public.orders where id = v_ref.order_id;
  perform public.log_order_event(v_ref.order_id, 'refund_' || _status::text, null, null, coalesce(_reference, ''), auth.uid());
  if _status = 'completed' then
    if v_ref.reason <> 'duplicate_payment' then
      update public.orders set payment_status = 'refunded' where id = v_ref.order_id;
    end if;
    perform public.notify('user', v_ref.user_id, 'refund_completed', jsonb_build_object('order_number', v_order.order_number, 'amount', v_ref.amount_xaf), '/dashboard/payments');
  end if;
end; $$;
revoke all on function public.admin_update_refund(uuid, public.refund_status, text, text) from public, anon;
grant execute on function public.admin_update_refund(uuid, public.refund_status, text, text) to authenticated;

create or replace function public.admin_create_refund(_order_id uuid, _amount int, _notes text)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders; v_pay uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  select * into v_order from public.orders where id = _order_id;
  if not found then raise exception 'not_found'; end if;
  select id into v_pay from public.payments where order_id = _order_id and status = 'successful' order by confirmed_at limit 1;
  if v_pay is null then raise exception 'no_payment'; end if;
  if _amount <= 0 or _amount > v_order.amount_xaf then raise exception 'invalid_amount'; end if;
  insert into public.refunds (order_id, payment_id, user_id, amount_xaf, reason, notes) values (_order_id, v_pay, v_order.user_id, _amount, 'manual', _notes);
  update public.orders set payment_status = 'refund_pending' where id = _order_id;
  perform public.log_order_event(_order_id, 'refund_requested', null, null, _notes, auth.uid());
end; $$;
revoke all on function public.admin_create_refund(uuid, int, text) from public, anon;
grant execute on function public.admin_create_refund(uuid, int, text) to authenticated;

-- ============ MESSAGE TRIGGER (is_admin + notifications) ============
create or replace function public.on_message_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_conv public.conversations; v_notify boolean;
begin
  select * into v_conv from public.conversations where id = new.conversation_id;
  if new.kind = 'text' then
    new.is_admin := public.has_role(new.sender_id, 'admin');
    update public.conversations set last_message_at = now() where id = new.conversation_id;
    if new.is_admin then
      perform public.notify('user', v_conv.user_id, 'new_message', jsonb_build_object('subject', v_conv.subject), '/dashboard/messages?c=' || v_conv.id);
    else
      select notify_admin_new_message into v_notify from public.admin_settings where id = 1;
      if coalesce(v_notify, true) then
        perform public.notify('admin', null, 'new_message', jsonb_build_object('subject', v_conv.subject), '/admin/messages?c=' || v_conv.id);
      end if;
    end if;
  end if;
  return new;
end; $$;
create trigger messages_before_insert before insert on public.messages for each row execute function public.on_message_insert();

-- ============ REALTIME ============
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.payments;
