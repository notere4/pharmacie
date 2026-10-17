import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Eye,
  Printer,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ApiError,
  deliveryNotesApi,
  invoicesApi,
  suppliersApi,
} from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function InvoicesPage() {
  const { hasPermission } = useAuthStore();
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [eligibleNotes, setEligibleNotes] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<any | null>(null);

  const [form, setForm] = useState({
    supplier_id: "",
    date_start: "",
    date_end: "",
    notes: "",
    items: [] as any[],
  });

  const total = useMemo(
    () =>
      form.items.reduce(
        (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
        0,
      ),
    [form.items],
  );

  const loadAll = async () => {
    try {
      setLoading(true);
      const [invoiceRes, supRes] = await Promise.all([
        invoicesApi.getAll(),
        suppliersApi.getAll(),
      ]);
      setInvoices(
        Array.isArray(invoiceRes) && (invoiceRes as any).results
          ? (invoiceRes as any).results
          : invoiceRes,
      );
      setSuppliers(supRes);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "Erreur de chargement";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadDeliveryNotes = async () => {
    try {
      setLoading(true);
      if (!form.supplier_id) throw new Error("Fournisseur requis");
      if (!form.date_start || !form.date_end) throw new Error("Dates requises");

      const notes = await deliveryNotesApi.list({
        supplier_id: form.supplier_id,
        status: "validated",
      });
      const filtered = (notes || []).filter((note: any) => {
        if (!note?.date) return false;
        return note.date >= form.date_start && note.date <= form.date_end;
      });

      setEligibleNotes(filtered);

      const details = await Promise.all(
        filtered.map((note: any) =>
          deliveryNotesApi.getById(note.id).catch(() => null),
        ),
      );
      const items = details
        .filter(Boolean)
        .flatMap((note: any) =>
          (note.items || []).map((it: any) => ({
            delivery_note_id: note.id,
            delivery_note_number: note.number || note.reference || "",
            medicine_id: it.medicine_id,
            medicine_name: it.medicine?.name || it.medicine_id || "-",
            quantity: Number(it.quantity) || 0,
            unit_price: Number(it.unit_price) || 0,
            line_total:
              Number(
                it.line_total ??
                  (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
              ) || 0,
            lot: it.lot || "",
            expiration_date: it.expiration_date || "",
          })),
        );

      setForm((f) => ({ ...f, items }));
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : e?.message;
      addToast(msg || "Erreur lors du chargement des BL", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      if (!form.supplier_id) throw new Error("Fournisseur requis");
      if (!form.date_start || !form.date_end) throw new Error("Dates requises");
      if (form.items.length === 0)
        throw new Error("Aucun article à facturer");

      await invoicesApi.create({
        supplier_id: form.supplier_id,
        date_start: form.date_start,
        date_end: form.date_end,
        notes: form.notes || undefined,
        delivery_note_ids: eligibleNotes.map((n) => n.id),
        items: form.items.map((it) => ({
          delivery_note_id: it.delivery_note_id,
          medicine_id: it.medicine_id,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          lot: it.lot || undefined,
          expiration_date: it.expiration_date || undefined,
        })),
      });

      setIsOpen(false);
      setEligibleNotes([]);
      setForm({
        supplier_id: "",
        date_start: "",
        date_end: "",
        notes: "",
        items: [],
      });
      await loadAll();
      addToast("Facture créée", "success");
    } catch (e: any) {
      const msg =
        e instanceof ApiError ? e.message : e?.message || "Erreur de création";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      setLoading(true);
      await invoicesApi.validate(id);
      await loadAll();
      addToast("Facture validée", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoice: any) => {
    try {
      setLoading(true);
      await invoicesApi.delete(invoice.id);
      await loadAll();
      addToast("Facture supprimée", "success");
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : e?.message;
      addToast(msg || "Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const invoice = await invoicesApi.getById(id);
      setDetailInvoice(invoice);
      setDetailOpen(true);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "Erreur de chargement";
      addToast(msg, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const escapeHtml = (value: any) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const printInvoice = async (id: string) => {
    try {
      setLoading(true);
      const invoice = await invoicesApi.getById(id);
      const items = invoice.items || [];

      const rows = items
        .map((it: any) => {
          const qty = Number(it.quantity) || 0;
          const unitPrice = Number(it.unit_price) || 0;
          const lineTotal = Number(it.line_total ?? qty * unitPrice) || 0;
          return `
            <tr>
              <td>${escapeHtml(
                it.delivery_note_number || it.delivery_note_id || "-",
              )}</td>
              <td>${escapeHtml(it.medicine?.name || it.medicine_name || "-")}</td>
              <td>${escapeHtml(it.lot || "-")}</td>
              <td>${escapeHtml(it.expiration_date || "-")}</td>
              <td style="text-align:right;">${escapeHtml(qty)}</td>
              <td style="text-align:right;">${escapeHtml(unitPrice.toFixed(2))}</td>
              <td style="text-align:right;">${escapeHtml(lineTotal.toFixed(2))}</td>
            </tr>
          `;
        })
        .join("");

      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Facture ${escapeHtml(invoice.number || "")}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
              h1 { font-size: 18px; margin: 0 0 12px; }
              .meta { margin-bottom: 16px; font-size: 12px; color: #333; }
              .meta div { margin: 2px 0; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background: #f5f5f5; text-align: left; }
              .total { margin-top: 12px; text-align: right; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Facture ${escapeHtml(invoice.number || "")}</h1>
            <div class="meta">
              <div><strong>Date:</strong> ${escapeHtml(invoice.date || "-")}</div>
              <div><strong>Fournisseur:</strong> ${escapeHtml(invoice.supplier?.name || "-")}</div>
              <div><strong>Période:</strong> ${escapeHtml(
                invoice.date_start || "-",
              )} - ${escapeHtml(invoice.date_end || "-")}</div>
              <div><strong>Statut:</strong> ${escapeHtml(
                invoice.status === "validated" ? "Validée" : "Brouillon",
              )}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>BL</th>
                  <th>Médicament</th>
                  <th>Lot</th>
                  <th>Expiration</th>
                  <th style="text-align:right;">Qté</th>
                  <th style="text-align:right;">Prix</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="total">Total: ${escapeHtml(
              Number(invoice.total_value || 0).toFixed(2),
            )} DH</div>
            <script>
              window.onload = () => { window.print(); };
            </script>
          </body>
        </html>
      `;

      const w = window.open("", "_blank");
      if (!w) {
        alert("Impossible d'ouvrir la fenêtre d'impression");
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "Erreur d'impression";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Factures
        </h1>
        {hasPermission("inventory.add_invoice") && (
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nouvelle facture
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
          <div className="text-sm text-gray-600">Liste des factures</div>
          {loading && <div className="text-xs text-gray-500">Chargement...</div>}
        </div>

        {isOpen && hasPermission("inventory.add_invoice") && (
          <div className="border-b border-gray-200/50 bg-white/70 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Nouvelle facture
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                Réduire
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Fournisseur
                </label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => {
                    const supplier_id = e.target.value;
                    setEligibleNotes([]);
                    setForm((f) => ({
                      ...f,
                      supplier_id,
                      items: [],
                    }));
                  }}
                  className="w-full border border-gray-300/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Sélectionner</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  value={form.date_start}
                  onChange={(e) => {
                    const date_start = e.target.value;
                    setEligibleNotes([]);
                    setForm((f) => ({
                      ...f,
                      date_start,
                      items: [],
                    }));
                  }}
                  className="w-full border border-gray-300/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  value={form.date_end}
                  onChange={(e) => {
                    const date_end = e.target.value;
                    setEligibleNotes([]);
                    setForm((f) => ({
                      ...f,
                      date_end,
                      items: [],
                    }));
                  }}
                  className="w-full border border-gray-300/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="w-full border border-gray-300/60 rounded-lg px-3 py-2"
                  placeholder="Notes (optionnel)"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {eligibleNotes.length > 0
                  ? `${eligibleNotes.length} BL sélectionnés`
                  : "Aucun BL chargé"}
              </div>
              <button
                onClick={loadDeliveryNotes}
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                Charger les BL
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      BL
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Médicament
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Lot
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Expiration
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                      Qté
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                      Prix
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {form.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-sm text-gray-500"
                      >
                        Aucun article pour le moment
                      </td>
                    </tr>
                  ) : (
                    form.items.map((it, idx) => (
                      <tr key={`${it.delivery_note_id || "note"}-${idx}`}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {it.delivery_note_number || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {it.medicine_name || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {it.lot || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {it.expiration_date || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          {Number(it.quantity || 0)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          {Number(it.unit_price || 0).toFixed(2)} DH
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          {(
                            (Number(it.quantity) || 0) *
                            (Number(it.unit_price) || 0)
                          ).toFixed(2)}{" "}
                          DH
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-right text-sm text-gray-700">
              Total: <span className="font-semibold">{total.toFixed(2)} DH</span>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                Fermer
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:opacity-60"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune facture pour le moment. Créez une nouvelle facture.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Numéro
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Fournisseur
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Période
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {inv.number || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {inv.date || inv.created_at || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {inv.supplier?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {(inv.date_start || "-") + " - " + (inv.date_end || "-")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {Number(inv.total_value || 0).toFixed(2)} DH
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === "validated"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {inv.status === "validated" ? "Validée" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(inv.id)}
                          disabled={detailLoading}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                          title="Détail"
                        >
                          <Eye className="w-4 h-4" /> Détail
                        </button>
                        {inv.status === "validated" && (
                          <button
                            onClick={() => printInvoice(inv.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" /> Imprimer
                          </button>
                        )}
                        {inv.status === "validated" &&
                          hasPermission("inventory.delete_validated_invoice") && (
                            <button
                              onClick={() => setDeleteTarget(inv)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          )}
                        {inv.status !== "validated" &&
                          hasPermission("inventory.delete_invoice") && (
                            <button
                              onClick={() => setDeleteTarget(inv)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          )}
                        {inv.status !== "validated" &&
                          hasPermission("inventory.change_invoice") && (
                            <button
                              onClick={() => handleValidate(inv.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Valider"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Valider
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailOpen && detailInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setDetailOpen(false);
              setDetailInvoice(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-5xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Détail facture {detailInvoice.number}
              </div>
              <div className="flex items-center gap-2">
                {detailInvoice.status === "validated" && (
                  <button
                    onClick={() => printInvoice(detailInvoice.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Printer className="w-4 h-4" /> Imprimer
                  </button>
                )}
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    setDetailInvoice(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <span className="font-medium text-gray-900">Date:</span>{" "}
                {detailInvoice.date || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-900">Fournisseur:</span>{" "}
                {detailInvoice.supplier?.name || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-900">Période:</span>{" "}
                {(detailInvoice.date_start || "-") + " - " + (detailInvoice.date_end || "-")}
              </div>
              <div>
                <span className="font-medium text-gray-900">Statut:</span>{" "}
                {detailInvoice.status === "validated" ? "Validée" : "Brouillon"}
              </div>
              {detailInvoice.notes && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-900">Notes:</span>{" "}
                  {detailInvoice.notes}
                </div>
              )}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      BL
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Médicament
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Lot
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Expiration
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                      Qté
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                      Prix
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(detailInvoice.items || []).map((it: any, idx: number) => (
                    <tr key={it.id || `${it.delivery_note_id}-${idx}`}>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {it.delivery_note_number || it.delivery_note_id || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>
                            {it.medicine?.name || it.medicine_name || "-"}
                          </span>
                          {it.medicine?.barcode && (
                            <span className="text-xs text-gray-500">
                              {it.medicine.barcode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {it.lot || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {it.expiration_date || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">
                        {it.quantity}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">
                        {Number(it.unit_price).toFixed(2)} DH
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">
                        {Number(it.line_total || 0).toFixed(2)} DH
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-right text-sm text-gray-700">
              Total:{" "}
              <span className="font-semibold">
                {Number(detailInvoice.total_value || 0).toFixed(2)} DH
              </span>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la facture"
        message={`Voulez-vous supprimer la facture ${deleteTarget?.number || ""} ?`}
        confirmText="Supprimer"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target) {
            await handleDelete(target);
          }
        }}
      />
    </div>
  );
}
