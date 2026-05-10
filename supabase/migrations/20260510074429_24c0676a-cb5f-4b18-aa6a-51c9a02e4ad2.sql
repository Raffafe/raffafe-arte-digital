insert into storage.buckets (id, name, public) values ('atividades', 'atividades', true) on conflict (id) do nothing;

create policy "Public can view atividades images"
on storage.objects for select
using (bucket_id = 'atividades');

create policy "Admins can upload atividades images"
on storage.objects for insert to authenticated
with check (bucket_id = 'atividades' and private.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update atividades images"
on storage.objects for update to authenticated
using (bucket_id = 'atividades' and private.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete atividades images"
on storage.objects for delete to authenticated
using (bucket_id = 'atividades' and private.has_role(auth.uid(), 'admin'::app_role));