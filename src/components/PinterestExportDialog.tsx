import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MONTHS } from "@/data/products";
import type { DbProduct } from "@/hooks/useProducts";

const CSV_HEADER = [
  "Title",
  "Media URL",
  "Pinterest board",
  "Thumbnail",
  "Description",
  "Link",
  "Publish date",
  "Keywords",
];

const MAX_PER_FILE = 200;

/* ---------- helpers (puros, somente leitura) ---------- */

const stripHtml = (s: string) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();

const limitWords = (s: string, max: number) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const i = cut.lastIndexOf(" ");
  return (i > max * 0.5 ? cut.slice(0, i) : cut).trim();
};

const csvSafe = (v: string) => {
  const t = v ?? "";
  return /^[=+\-@]/.test(t) ? `'${t}` : t;
};

const csvField = (v: string) => `"${csvSafe(oneLine(v)).replace(/"/g, '""')}"`;

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isPublicHttpUrl = (u: string) => {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
};

const isImageUrl = (u: string) => {
  if (!u) return false;
  if (/^(data:|blob:)/i.test(u)) return false;
  if (!isPublicHttpUrl(u)) return false;
  try {
    const path = new URL(u).pathname.toLowerCase();
    return /\.(jpg|jpeg|png)$/.test(path);
  } catch {
    return false;
  }
};

/* ---------- tipos ---------- */

type CheckState = "idle" | "ok" | "fail" | "unknown";

interface Row {
  product: DbProduct;
  title: string;
  mediaUrl: string;
  board: string;
  description: string;
  link: string;
  keywords: string;
  errors: string[];
  valid: boolean;
}

const buildRow = (p: DbProduct): Row => {
  const errors: string[] = [];

  const title = limitWords(oneLine(p.titulo ?? ""), 100);
  if (!title) errors.push("Sem nome");

  const mediaUrl = (p.imagem_url ?? "").trim();
  if (!mediaUrl) errors.push("Sem imagem principal");
  else if (/^(data:|blob:)/i.test(mediaUrl)) errors.push("Imagem em base64/blob");
  else if (!isPublicHttpUrl(mediaUrl)) errors.push("URL de imagem não é pública");
  else if (!isImageUrl(mediaUrl)) errors.push("Imagem não é .jpg/.jpeg/.png");

  const board = oneLine(p.categoria ?? "");
  if (!board) errors.push("Sem categoria (Pinterest board)");

  const link = (p.link_hotmart ?? "").trim();
  if (!link || link === "#") errors.push("Sem link público de destino");
  else if (!isPublicHttpUrl(link)) errors.push("Link de destino não é público");

  const descParts = [p.tema, p.publico].filter((x): x is string => !!x && !!x.trim());
  const description = limitWords(oneLine(stripHtml(descParts.join(" • "))), 500);

  const kw = [
    p.tema ?? "",
    p.publico ?? "",
    p.categoria ?? "",
    p.mes ? MONTHS[p.mes - 1] : "",
  ]
    .flatMap((k) => oneLine(stripHtml(k)).split(/[,;]/))
    .map((k) => k.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const keywords = kw
    .filter((k) => {
      const key = k.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(", ");

  return { product: p, title, mediaUrl, board, description, link, keywords, errors, valid: errors.length === 0 };
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: DbProduct[];
}

export const PinterestExportDialog = ({ open, onOpenChange, products }: Props) => {
  const [month, setMonth] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [checking, setChecking] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.categoria).filter(Boolean))).sort(),
    [products],
  );

  const hasMonthField = useMemo(() => products.some((p) => p.mes != null), [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => (month === "all" ? true : p.mes === Number(month)))
      .filter((p) => (category === "all" ? true : p.categoria === category))
      .filter((p) => (q ? (p.titulo ?? "").toLowerCase().includes(q) : true));
  }, [products, month, category, search]);

  const rows = useMemo(() => filtered.map(buildRow), [filtered]);
  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);
  const selectedRows = validRows.filter((r) => selected.has(r.product.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllValid = () => setSelected(new Set(validRows.map((r) => r.product.id)));
  const clearAll = () => setSelected(new Set());

  const verifyImages = async () => {
    setChecking(true);
    const next: Record<string, CheckState> = {};
    await Promise.all(
      rows.map(async (r) => {
        if (!r.mediaUrl) {
          next[r.product.id] = "fail";
          return;
        }
        try {
          const head = await fetch(r.mediaUrl, { method: "HEAD", mode: "cors" });
          const ct = head.headers.get("content-type") ?? "";
          if (head.ok && /image\/(jpeg|jpg|png)/i.test(ct)) {
            next[r.product.id] = "ok";
            return;
          }
          const get = await fetch(r.mediaUrl, { method: "GET", mode: "cors" });
          const ct2 = get.headers.get("content-type") ?? "";
          next[r.product.id] = get.ok && /image\/(jpeg|jpg|png)/i.test(ct2) ? "ok" : "fail";
        } catch {
          // CORS bloqueado: não é possível confirmar pelo navegador
          next[r.product.id] = "unknown";
        }
      }),
    );
    setChecks(next);
    setChecking(false);
    toast.success("Verificação de imagens concluída");
  };

  const fileBase = useMemo(() => {
    const parts: string[] = [];
    if (month !== "all") parts.push(slug(MONTHS[Number(month) - 1]));
    if (category !== "all") parts.push(slug(category));
    if (search.trim()) parts.push(slug(search.trim()));
    return parts.length ? `pinterest-${parts.join("-")}` : "pinterest-todos-os-produtos";
  }, [month, category, search]);

  const fileCount = Math.max(1, Math.ceil(selectedRows.length / MAX_PER_FILE));

  const buildCsv = (chunk: Row[]) => {
    const lines = [CSV_HEADER.map((h) => `"${h}"`).join(",")];
    for (const r of chunk) {
      lines.push(
        [
          csvField(r.title),
          csvField(r.mediaUrl),
          csvField(r.board),
          csvField(""),
          csvField(r.description),
          csvField(r.link),
          csvField(""),
          csvField(r.keywords),
        ].join(","),
      );
    }
    return "\uFEFF" + lines.join("\r\n") + "\r\n";
  };

  const previewLines = useMemo(() => {
    const csv = buildCsv(selectedRows.slice(0, 5));
    return csv.replace(/^\uFEFF/, "").split("\r\n").filter(Boolean).slice(0, 6);
  }, [selectedRows]);

  const download = () => {
    if (selectedRows.length === 0) {
      toast.error("Selecione ao menos um produto válido");
      return;
    }
    const chunks: Row[][] = [];
    for (let i = 0; i < selectedRows.length; i += MAX_PER_FILE) {
      chunks.push(selectedRows.slice(i, i + MAX_PER_FILE));
    }
    chunks.forEach((chunk, i) => {
      const name =
        chunks.length === 1
          ? `${fileBase}.csv`
          : `${fileBase}-parte-${String(i + 1).padStart(2, "0")}.csv`;
      const blob = new Blob([buildCsv(chunk)], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
    toast.success(
      chunks.length === 1
        ? `Arquivo ${fileBase}.csv gerado`
        : `${chunks.length} arquivos gerados (máx. ${MAX_PER_FILE} por arquivo)`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar produtos para o Pinterest</DialogTitle>
        </DialogHeader>

        {!hasMonthField && (
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Nenhum produto possui o campo <strong>Mês</strong> preenchido, então o filtro por mês não
            trará resultados. Preencha o campo "Mês" no cadastro dos produtos para habilitá-lo.
          </div>
        )}

        {/* Filtros */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Mês / tema</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Buscar por nome</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        {/* Resumo + ações */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">Encontrados: {rows.length}</Badge>
          <Badge variant="secondary">Válidos: {validRows.length}</Badge>
          <Badge variant="secondary">Inválidos: {invalidRows.length}</Badge>
          <Badge>Selecionados: {selectedRows.length}</Badge>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={selectAllValid} className="rounded-full">
              Selecionar todos os válidos
            </Button>
            <Button size="sm" variant="ghost" onClick={clearAll} className="rounded-full">
              Desmarcar todos
            </Button>
            <Button size="sm" variant="outline" onClick={verifyImages} disabled={checking} className="rounded-full">
              {checking ? "Verificando..." : "Verificar imagens"}
            </Button>
          </div>
        </div>

        {/* Lista */}
        <div className="rounded-2xl border border-border/60 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-16">Imagem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Mês/Tema</TableHead>
                <TableHead>Media URL</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado com esses filtros.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.product.id} className={r.valid ? "" : "opacity-70"}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.product.id)}
                      disabled={!r.valid}
                      onCheckedChange={() => toggle(r.product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {r.mediaUrl ? (
                      <img src={r.mediaUrl} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">{r.title || "—"}</TableCell>
                  <TableCell>{r.board || "—"}</TableCell>
                  <TableCell>
                    {[r.product.mes ? MONTHS[r.product.mes - 1] : null, r.product.tema]
                      .filter(Boolean)
                      .join(" • ") || "—"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs">{r.mediaUrl || "—"}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs">{r.link || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {r.valid ? (
                      <span className="text-green-600">
                        Válido
                        {checks[r.product.id] === "fail" && " • imagem não respondeu"}
                        {checks[r.product.id] === "unknown" && " • imagem não verificável (CORS)"}
                        {checks[r.product.id] === "ok" && " • imagem OK"}
                      </span>
                    ) : (
                      <span className="text-destructive">{r.errors.join("; ")}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Prévia */}
        <div className="space-y-2">
          <h3 className="font-medium">Prévia do CSV (5 primeiras linhas)</h3>
          <pre className="max-h-48 overflow-auto rounded-xl bg-muted/50 p-3 text-xs whitespace-pre">
            {previewLines.length > 1 ? previewLines.join("\n") : "Selecione produtos para ver a prévia."}
          </pre>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Arquivo: <strong>{fileCount === 1 ? `${fileBase}.csv` : `${fileBase}-parte-01.csv … -parte-${String(fileCount).padStart(2, "0")}.csv`}</strong></li>
            <li>Selecionados: {selectedRows.length} • no arquivo: {selectedRows.length} • ignorados: {invalidRows.length}</li>
            <li>Arquivos gerados: {fileCount} (máx. {MAX_PER_FILE} por arquivo)</li>
            {invalidRows.length > 0 && (
              <li>
                Motivos de exclusão:{" "}
                {Array.from(new Set(invalidRows.flatMap((r) => r.errors))).join("; ")}
              </li>
            )}
            <li>Imagens: URLs públicas https, terminando em .jpg/.jpeg/.png (sem base64/blob/local).</li>
            <li>Links: URLs públicas de venda cadastradas no produto (sem área administrativa/login).</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={download} disabled={selectedRows.length === 0} className="rounded-full">
            Baixar CSV para Pinterest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
