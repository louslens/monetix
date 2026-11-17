drop policy "Settings are public" on public.admin_settings;
revoke select on public.admin_settings from anon;
grant select (id, company_name, logo_url, contact_email, whatsapp_number, address, default_lang) on public.admin_settings to anon;
create policy "Public contact settings" on public.admin_settings for select to anon using (id = 1);
create policy "Authenticated read settings" on public.admin_settings for select to authenticated using (id = 1);
drop policy "Branding: public read" on storage.objects;
create policy "Branding: public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] in ('logo','services'));