CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  texto_curto TEXT,
  imagem_url TEXT,
  video_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active atividades"
ON public.atividades FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can view all atividades"
ON public.atividades FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert atividades"
ON public.atividades FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update atividades"
ON public.atividades FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete atividades"
ON public.atividades FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));