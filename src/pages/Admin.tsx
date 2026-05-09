import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { AdminUser, DbProduct } from "@/hooks/useProducts";
import type { DbAtividade } from "@/hooks/useAtividades";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

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

interface AtividadeForm {
  id?: string;
  titulo: string;
  texto_curto: string;
  imagem_url: string;
  video_url: string;
  ativo: boolean;
}

const emptyAtividade: AtividadeForm = {
  titulo: "",
  texto_curto: "",
  imagem_url: "",
  video_url: "",
  ativo: true,
};

const Admin = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<DbProduct[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [atividades, setAtividades] = useState<DbAtividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [actingUserId, setActingUserId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [atvOpen, setAtvOpen] = useState(false);
  const [atvForm, setAtvForm] = useState<AtividadeForm>(emptyAtividade);
  const [atvSaving, setAtvSaving] = useState(false);

  const importFromHotmart = async () => {
    const url = form.link_hotmart.trim();
    if (!url || !/^https?:\/\//.test(url)) {
      toast.error("Cole um link válido da Hotmart primeiro");
      return;
    }
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-hotmart", {
        body: { url },
      });
      if (error) {
        console.error("import-hotmart invoke error:", error);
        toast.error(`Erro ao chamar a função: ${error.message ?? error}`);
        return;
      }
      console.log("import-hotmart response:", data);
      if (data?.blocked) {
        toast.error(data.error || "A Hotmart bloqueou a importação automática desta página. Preencha manualmente.");
        return;
      }
      if (data?.error && !data?.title && !data?.image && data?.price == null) {
        toast.error(`Falha técnica: ${data.error}`);
        return;
      }
      const next = { ...form };
      let imported = 0;
      const missing: string[] = [];
      if (data?.title) { next.titulo = data.title; imported++; } else missing.push("título");
      if (data?.image) { next.imagem_url = data.image; imported++; } else missing.push("imagem");
      if (data?.price != null) { next.preco = String(data.price); imported++; } else missing.push("preço");
      setForm(next);
      if (imported === 0) {
        toast.warning("Nenhum dado pôde ser importado. Preencha manualmente.");
      } else if (missing.length > 0) {
        toast.success(`Importado. Não encontrado: ${missing.join(", ")}.`);
      } else {
        toast.success("Dados importados com sucesso");
      }
    } catch (e: any) {
      console.error("import-hotmart exception:", e);
      toast.error(`Erro inesperado: ${e?.message ?? String(e)}`);
    } finally {
      setImporting(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const [productsResult, usersResult, atividadesResult] = await Promise.all([
      supabase.from("produtos").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_users").select("*").order("created_at", { ascending: false }),
      supabase.from("atividades").select("*").order("created_at", { ascending: false }),
    ]);

    if (productsResult.error) toast.error(productsResult.error.message);
    else setItems((productsResult.data ?? []) as DbProduct[]);

    if (usersResult.error) toast.error(usersResult.error.message);
    else setUsers((usersResult.data ?? []) as AdminUser[]);

    if (atividadesResult.error) toast.error(atividadesResult.error.message);
    else setAtividades((atividadesResult.data ?? []) as DbAtividade[]);
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

  const approveUser = async (user: AdminUser, role: "admin" | "user") => {
    setActingUserId(user.user_id);
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ status: "approved", approved_role: role })
      .eq("user_id", user.user_id);

    if (updateError) {
      toast.error(updateError.message);
      setActingUserId(null);
      return;
    }

    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", user.user_id);
    if (deleteError) {
      toast.error(deleteError.message);
      setActingUserId(null);
      return;
    }

    const { error: roleError } = await supabase.from("user_roles").insert({ user_id: user.user_id, role });
    setActingUserId(null);
    if (roleError) {
      toast.error(roleError.message);
      return;
    }
    toast.success(role === "admin" ? "Usuário aprovado como admin" : "Usuário aprovado como user");
    load();
  };

  const rejectUser = async (user: AdminUser) => {
    if (!confirm(`Recusar acesso de ${user.email}?`)) return;
    setActingUserId(user.user_id);
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ status: "rejected", approved_role: null })
      .eq("user_id", user.user_id);

    if (updateError) {
      toast.error(updateError.message);
      setActingUserId(null);
      return;
    }

    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", user.user_id);
    setActingUserId(null);
    if (deleteError) toast.error(deleteError.message);
    else {
      toast.success("Usuário recusado");
      load();
    }
  };

  const pendingUsers = users.filter((user) => user.status === "pending");

  const openNewAtividade = () => {
    setAtvForm(emptyAtividade);
    setAtvOpen(true);
  };

  const openEditAtividade = (a: DbAtividade) => {
    setAtvForm({
      id: a.id,
      titulo: a.titulo,
      texto_curto: a.texto_curto ?? "",
      imagem_url: a.imagem_url ?? "",
      video_url: a.video_url ?? "",
      ativo: a.ativo,
    });
    setAtvOpen(true);
  };

  const saveAtividade = async () => {
    if (!atvForm.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    setAtvSaving(true);
    const payload = {
      titulo: atvForm.titulo.trim(),
      texto_curto: atvForm.texto_curto || null,
      imagem_url: atvForm.imagem_url || null,
      video_url: atvForm.video_url || null,
      ativo: atvForm.ativo,
    };
    const { error } = atvForm.id
      ? await supabase.from("atividades").update(payload).eq("id", atvForm.id)
      : await supabase.from("atividades").insert(payload);
    setAtvSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(atvForm.id ? "Atividade atualizada" : "Atividade criada");
    setAtvOpen(false);
    load();
  };

  const toggleAtividadeActive = async (a: DbAtividade) => {
    const { error } = await supabase
      .from("atividades")
      .update({ ativo: !a.ativo })
      .eq("id", a.id);
    if (error) toast.error(error.message);
    else setAtividades((prev) => prev.map((i) => (i.id === a.id ? { ...i, ativo: !a.ativo } : i)));
  };

  const removeAtividade = async (a: DbAtividade) => {
    if (!confirm(`Excluir "${a.titulo}"?`)) return;
    const { error } = await supabase.from("atividades").delete().eq("id", a.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Excluído");
      setAtividades((prev) => prev.filter((i) => i.id !== a.id));
    }
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

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-3xl">Usuários</h2>
            <p className="text-sm text-muted-foreground">
              {pendingUsers.length} cadastro{pendingUsers.length === 1 ? "" : "s"} pendente
              {pendingUsers.length === 1 ? "" : "s"}
            </p>
          </div>

          <Card className="rounded-2xl">
            {loading ? (
              <div className="p-10 text-center text-muted-foreground">Carregando usuários...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                Nenhum usuário pendente no momento.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pendente</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actingUserId === user.user_id}
                          onClick={() => approveUser(user, "user")}
                        >
                          Aprovar user
                        </Button>
                        <Button
                          size="sm"
                          disabled={actingUserId === user.user_id}
                          onClick={() => approveUser(user, "admin")}
                        >
                          Aprovar admin
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actingUserId === user.user_id}
                          onClick={() => rejectUser(user)}
                          className="text-destructive"
                        >
                          Recusar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl">Atividades</h2>
              <p className="text-sm text-muted-foreground">{atividades.length} cadastrada{atividades.length === 1 ? "" : "s"}</p>
            </div>
            <Button onClick={openNewAtividade} className="rounded-full">+ Nova atividade</Button>
          </div>

          <Card className="rounded-2xl">
            {loading ? (
              <div className="p-10 text-center text-muted-foreground">Carregando...</div>
            ) : atividades.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                Nenhuma atividade ainda. Clique em "Nova atividade".
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Mídia</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atividades.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.titulo}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {a.video_url ? "Vídeo/Link" : a.imagem_url ? "Imagem" : "—"}
                      </TableCell>
                      <TableCell>
                        <Switch checked={a.ativo} onCheckedChange={() => toggleAtividadeActive(a)} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditAtividade(a)}>Editar</Button>
                        <Button variant="ghost" size="sm" onClick={() => removeAtividade(a)} className="text-destructive">Excluir</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </section>
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
              <div className="flex gap-2">
                <Input
                  value={form.link_hotmart}
                  onChange={(e) => setForm({ ...form, link_hotmart: e.target.value })}
                  placeholder="https://pay.hotmart.com/..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={importFromHotmart}
                  disabled={importing}
                >
                  {importing ? "Importando..." : "Importar dados"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cole o link e clique em "Importar dados" para preencher título, imagem e preço automaticamente. Tudo permanece editável.
              </p>
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

      <Dialog open={atvOpen} onOpenChange={setAtvOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{atvForm.id ? "Editar atividade" : "Nova atividade"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={atvForm.titulo} onChange={(e) => setAtvForm({ ...atvForm, titulo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Texto curto</Label>
              <Textarea
                value={atvForm.texto_curto}
                onChange={(e) => setAtvForm({ ...atvForm, texto_curto: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Imagem de capa (URL)</Label>
              <Input
                value={atvForm.imagem_url}
                onChange={(e) => setAtvForm({ ...atvForm, imagem_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Link do vídeo ou post</Label>
              <Input
                value={atvForm.video_url}
                onChange={(e) => setAtvForm({ ...atvForm, video_url: e.target.value })}
                placeholder="YouTube, Instagram ou Pinterest"
              />
              <p className="text-xs text-muted-foreground">
                YouTube é incorporado como vídeo. Instagram/Pinterest aparecem como link externo.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={atvForm.ativo} onCheckedChange={(v) => setAtvForm({ ...atvForm, ativo: v })} />
              <Label>Ativa (aparece na área pública)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAtvOpen(false)}>Cancelar</Button>
            <Button onClick={saveAtividade} disabled={atvSaving}>{atvSaving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
