import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";

export interface DbProduct {
  id: string;
  titulo: string;
  preco: number;
  categoria: string;
  mes: number;
  tema: string | null;
  publico: string | null;
  imagem_url: string | null;
  link_hotmart: string | null;
  ativo: boolean;
  ordem: number;
  destaque_ordem: number | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  requested_role: "admin" | "user";
  approved_role: "admin" | "user" | null;
  created_at: string;
  updated_at: string;
}

export const dbToProduct = (p: DbProduct): Product => ({
  id: p.id,
  title: p.titulo,
  price: Number(p.preco) || 0,
  category: p.categoria as Product["category"],
  month: p.mes,
  theme: p.tema ?? "",
  audience: p.publico ?? "",
  image: p.imagem_url ?? "/placeholder.svg",
  hotmartUrl: p.link_hotmart ?? "#",
});

export const useActiveProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("destaque_ordem", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (!error && data) setProducts((data as DbProduct[]).map(dbToProduct));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading };
};
