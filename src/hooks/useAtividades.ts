import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbAtividade {
  id: string;
  titulo: string;
  texto_curto: string | null;
  imagem_url: string | null;
  video_url: string | null;
  ativo: boolean;
  created_at: string;
}

const YT_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

export const getYouTubeId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const m = url.match(YT_REGEX);
  return m ? m[1] : null;
};

export const isExternalSocial = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return /(?:instagram\.com|pinterest\.com|pin\.it)/i.test(url);
};

export const useActiveAtividades = () => {
  const [atividades, setAtividades] = useState<DbAtividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("atividades")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (!error && data) setAtividades(data as DbAtividade[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { atividades, loading };
};
