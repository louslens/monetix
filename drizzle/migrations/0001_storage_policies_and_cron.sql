
create policy "Attachments: own folder read" on storage.objects for select to authenticated
  using (bucket_id = 'attachments' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')));
create policy "Attachments: own folder upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')));

create policy "Branding: public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'branding');
create policy "Branding: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));
create policy "Branding: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));
create policy "Branding: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));

create extension if not exists pg_cron;
