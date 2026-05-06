import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CATEGORIES, MONTHS } from "@/data/products";
import type { DbProduct } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";

interface FormState {
  id?: string;
  titulo: string;
  preco: string;
  categoria: string;
  mes: number;
  tema: string;
  publico: string;
  imagem_url: string;
  link_hotmart: string;
  ativo: boolean;
}

const empty: FormState = {
  titulo: "",
  preco: "",
  categoria: CATEGORIES[0],
  mes: 1,
  tema: "",
  publico: "",
  imagem_url: "",
  link_hotmart: "",
  ativo: true,
};

const Admin = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as DbProduct[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: DbProduct) => {
    setForm({
      id: p.id,
      titulo: p.titulo,
      preco: String(p.preco),
      categoria: p.categoria,
      mes: p.mes,
      tema: p.tema ?? "",
      publico: p.publico ?? "",
      imagem_url: p.imagem_url ?? "",
      link_hotmart: p.link_hotmart ?? "",
      ativo: p.ativo,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      preco: Number(form.preco.replace(",", ".")) || 0,
      categoria: form.categoria,
      mes: Number(form.mes),
      tema: form.tema || null,
      publico: form.publico || null,
      imagem_url: form.imagem_url || null,
      link_hotmart: form.link_hotmart || null,
      ativo: form.ativo,
    };
    const { error } = form.id
      ? await supabase.from("produtos").update(payload).eq("id", form.id)
      : await supabase.from("produtos").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Produto atualizado" : "Produto criado");
    setOpen(false);
    load();
  };

  const toggleActive = async (p: DbProduct) => {
    const { error } = await supabase
      .from("produtos")
      .update({ ativo: !p.ativo })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      setItems((prev) => prev.map((i) => (i.id === p.id ? { ...i, ativo: !p.ativo } : i)));
    }
  };

  const remove = async (p: DbProduct) => {
    if (!confirm(`Excluir "${p.titulo}"?`)) return;
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Excluído");
      setItems((prev) => prev.filter((i) => i.id !== p.id));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl">Painel • Raffafe.arte</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>Ver loja</Button>
            <Button variant="outline" onClick={logout}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl">Produtos</h2>
            <p className="text-sm text-muted-foreground">{items.length} cadastrados</p>
          </div>
          <Button onClick={openNew} className="rounded-full">+ Novo produto</Button>
        </div>

        <Card className="rounded-2xl">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              Nenhum produto ainda. Clique em "Novo produto".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.titulo}</TableCell>
                    <TableCell className="text-muted-foreground">{p.categoria}</TableCell>
                    <TableCell>{MONTHS[p.mes - 1]}</TableCell>
                    <TableCell>R$ {Number(p.preco).toFixed(2)}</TableCell>
                    <TableCell>
                      <Switch checked={p.ativo} onCheckedChange={() => toggleActive(p)} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(p)} className="text-destructive">Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="19.90" />
              </div>
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={String(form.mes)} onValueChange={(v) => setForm({ ...form, mes: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Input value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Público</Label>
                <Input value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL da imagem</Label>
              <Input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Link Hotmart</Label>
              <Input value={form.link_hotmart} onChange={(e) => setForm({ ...form, link_hotmart: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              <Label>Produto ativo (aparece na loja)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
