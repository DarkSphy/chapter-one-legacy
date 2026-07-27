
CREATE POLICY "memorias read own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'memorias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "memorias insert own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'memorias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "memorias update own" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'memorias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "memorias delete own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'memorias' AND auth.uid()::text = (storage.foldername(name))[1]);
