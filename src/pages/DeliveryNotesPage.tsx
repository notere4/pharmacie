import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle2,
  Eye,
  Printer,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  deliveryNotesApi,
  suppliersApi,
  medicinesApi,
  ApiError,
} from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function DeliveryNotesPage() {
  const { hasPermission } = useAuthStore();
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailNote, setDetailNote] = useState<any | null>(null);

  const [form, setForm] = useState({
    supplier_id: "",
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
    items: [
      {
        medicine_id: "",
        barcode: "",
        quantity: 1,
        unit_price: 0,
        lot: "",
        expiration_date: "",
      },
    ],
  });

  const total = useMemo(
    () =>
      form.items.reduce(
        (s, it) =>
          s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
        0,
      ),
    [form.items],
  );

  const loadAll = async () => {
    try {
      setLoading(true);
      const [notesRes, supRes, medsRes] = await Promise.all([
        deliveryNotesApi.list(),
        suppliersApi.getAll(),
        medicinesApi.getAllUnpaginated(),
      ]);
      setNotes(
        Array.isArray(notesRes) && (notesRes as any).results
          ? (notesRes as any).results
          : notesRes,
      );
      setSuppliers(supRes);
      setMedicines(medsRes);
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

  const addItemRow = () =>
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        {
          medicine_id: "",
          barcode: "",
          quantity: 1,
          unit_price: 0,
          lot: "",
          expiration_date: "",
        },
      ],
    }));
  const removeItemRow = (idx: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleCreate = async () => {
    try {
      setLoading(true);
      if (!form.supplier_id) throw new Error("Fournisseur requis");
      if (form.items.length === 0)
        throw new Error("Ajouter au moins une ligne");
      if (form.items.some((i) => !i.medicine_id || Number(i.quantity) <= 0))
        throw new Error("Vérifier les lignes (médicament/quantité)");

      await deliveryNotesApi.create({
        supplier_id: form.supplier_id,
        date: form.date,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
        items: form.items.map((i) => ({
          medicine_id: i.medicine_id,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          lot: i.lot || undefined,
          expiration_date: i.expiration_date || undefined,
        })),
      });

      setIsOpen(false);
      setForm({
        supplier_id: "",
        date: new Date().toISOString().slice(0, 10),
        reference: "",
        notes: "",
        items: [
          {
            medicine_id: "",
            barcode: "",
            quantity: 1,
            unit_price: 0,
            lot: "",
            expiration_date: "",
          },
        ],
      });
      await loadAll();
    } catch (e: any) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e?.message || "Erreur lors de la création";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      setLoading(true);
      await deliveryNotesApi.validate(id);
      await loadAll();
      addToast("Bon de livraison validé", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (note: any) => {
    try {
      setLoading(true);
      await deliveryNotesApi.delete(note.id);
      await loadAll();
      addToast("Bon de livraison supprimé", "success");
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
      const note = await deliveryNotesApi.getById(id);
      setDetailNote(note);
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

  const printNote = async (id: string) => {
    try {
      setLoading(true);
      const note = await deliveryNotesApi.getById(id);

      const rows = (note.items || [])
        .map((it: any) => {
          const qty = Number(it.quantity) || 0;
          const unitPrice = Number(it.unit_price) || 0;
          const lineTotal = Number(it.line_total ?? qty * unitPrice) || 0;
          return `
            <tr>
              <td>${escapeHtml(it.medicine?.name || it.medicine_id || "-")}</td>
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
            <title>Bon de livraison ${escapeHtml(note.number || "")}</title>
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
            <h1>Bon de livraison ${escapeHtml(note.number || "")}</h1>
            <div class="meta">
              <div><strong>Date:</strong> ${escapeHtml(note.date || "-")}</div>
              <div><strong>Fournisseur:</strong> ${escapeHtml(note.supplier?.name || "-")}</div>
              <div><strong>Référence:</strong> ${escapeHtml(note.reference || "-")}</div>
              <div><strong>Statut:</strong> ${escapeHtml(note.status === "validated" ? "Validé" : "Brouillon")}</div>
            </div>
            <table>
              <thead>
                <tr>
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
            <div class="total">Total: ${escapeHtml(Number(note.total_value || 0).toFixed(2))} DH</div>
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
          Bons de livraison
        </h1>
        {hasPermission('inventory.add_deliverynote') && (
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nouveau BL
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
          <div className="text-sm text-gray-600">
            Liste des bons de livraison
          </div>
          {loading && (
            <div className="text-xs text-gray-500">Chargement...</div>
          )}
        </div>
        {isOpen && hasPermission('inventory.add_deliverynote') && (
          <div className="border-b border-gray-200/50 bg-white/70 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Nouveau bon de livraison
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, supplier_id: e.target.value }))
                  }
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
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full border border-gray-300/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reference: e.target.value }))
                  }
                  className="w-full border border-gray-300/60 rounded-lg px-3 py-2"
                  placeholder="Numéro BL fournisseur (optionnel)"
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

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">Articles</div>
                <button
                  onClick={addItemRow}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  Ajouter une ligne
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        Code-barres
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
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {form.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={it.barcode || ""}
                            onChange={(e) =>
                              setForm((f) => {
                                const items = [...f.items];
                                const val = e.target.value;
                                items[idx].barcode = val;
                                const med = medicines.find(
                                  (m) => (m.barcode || "") === val,
                                );
                                if (med) {
                                  items[idx].medicine_id = med.id;
                                  if (
                                    !items[idx].unit_price ||
                                    Number(items[idx].unit_price) === 0
                                  ) {
                                    items[idx].unit_price =
                                      Number(med.unit_price) || 0;
                                  }
                                }
                                return { ...f, items };
                              })
                            }
                            className="w-full border border-gray-300/60 rounded-lg px-2 py-1.5"
                            placeholder="Scanner / saisir"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={it.medicine_id}
                            onChange={(e) =>
                              setForm((f) => {
                                const items = [...f.items];
                                const val = e.target.value;
                                items[idx].medicine_id = val;
                                const med = medicines.find((m) => m.id === val);
                                if (med) {
                                  items[idx].barcode =
                                    med.barcode || items[idx].barcode || "";
                                  if (
                                    !items[idx].unit_price ||
                                    Number(items[idx].unit_price) === 0
                                  ) {
                                    items[idx].unit_price =
                                      Number(med.unit_price) || 0;
                                  }
                                }
                                return { ...f, items };
                              })
                            }
                            className="w-full border border-gray-300/60 rounded-lg px-2 py-1.5"
                          >
                            <option value="">Sélectionner</option>
                            {medicines.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={it.lot}
                            onChange={(e) =>
                              setForm((f) => {
                                const items = [...f.items];
                                items[idx].lot = e.target.value;
                                return { ...f, items };
                              })
                            }
                            className="w-full border border-gray-300/60 rounded-lg px-2 py-1.5"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={it.expiration_date}
                            onChange={(e) =>
                              setForm((f) => {
                                const items = [...f.items];
                                items[idx].expiration_date = e.target.value;
                                return { ...f, items };
                              })
                            }
                            className="w-full border border-gray-300/60 rounded-lg px-2 py-1.5"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) =>
                              setForm((f) => {
                                const items = [...f.items];
                                items[idx].quantity = Number(e.target.value);
                                return { ...f, items };
                              })
                            }
                            className="w-24 text-right border border-gray-300/60 rounded-lg px-2 py-1.5"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={it.unit_price}
                            onChange={(e) =>
                              setForm((f) => {
                                const items = [...f.items];
                                items[idx].unit_price = Number(e.target.value);
                                return { ...f, items };
                              })
                            }
                            className="w-28 text-right border border-gray-300/60 rounded-lg px-2 py-1.5"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-gray-900">
                          {(
                            (Number(it.quantity) || 0) *
                            (Number(it.unit_price) || 0)
                          ).toFixed(2)}{" "}
                          DH
                        </td>
                        <td className="px-3 py-2 text-right">
                          {form.items.length > 1 && (
                            <button
                              onClick={() => removeItemRow(idx)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-right text-sm text-gray-700">
                Total:{" "}
                <span className="font-semibold">{total.toFixed(2)} DH</span>
              </div>
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
                Enregistrer le brouillon
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune donnée pour le moment. Créez un nouveau bon de livraison.
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
                {notes.map((n) => (
                  <tr key={n.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {n.number}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {n.date}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {n.supplier?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {Number(n.total_value).toFixed(2)} DH
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          n.status === "validated"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {n.status === "validated" ? "Validé" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(n.id)}
                          disabled={detailLoading}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                          title="Détail"
                        >
                          <Eye className="w-4 h-4" /> Détail
                        </button>
                        {n.status === "validated" && (
                          <button
                            onClick={() => printNote(n.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" /> Imprimer
                          </button>
                        )}
                        {n.status === "validated" &&
                          hasPermission("inventory.delete_validated_deliverynote") && (
                            <button
                              onClick={() => setDeleteTarget(n)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          )}
                        {n.status !== "validated" &&
                          hasPermission("inventory.delete_deliverynote") && (
                            <button
                              onClick={() => setDeleteTarget(n)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                              title="Refuser"
                            >
                              <Trash2 className="w-4 h-4" /> Refuser
                            </button>
                          )}
                        {n.status !== "validated" &&
                          hasPermission("inventory.change_deliverynote") && (
                            <button
                              onClick={() => handleValidate(n.id)}
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

      {detailOpen && detailNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setDetailOpen(false);
              setDetailNote(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Détail bon de livraison {detailNote.number}
              </div>
              <div className="flex items-center gap-2">
                {detailNote.status === "validated" && (
                  <button
                    onClick={() => printNote(detailNote.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Printer className="w-4 h-4" /> Imprimer
                  </button>
                )}
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    setDetailNote(null);
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
                {detailNote.date}
              </div>
              <div>
                <span className="font-medium text-gray-900">Fournisseur:</span>{" "}
                {detailNote.supplier?.name || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-900">Référence:</span>{" "}
                {detailNote.reference || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-900">Statut:</span>{" "}
                {detailNote.status === "validated" ? "Validé" : "Brouillon"}
              </div>
              {detailNote.notes && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-900">Notes:</span>{" "}
                  {detailNote.notes}
                </div>
              )}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
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
                  {(detailNote.items || []).map((it: any) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>{it.medicine?.name || "-"}</span>
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
                        {Number(it.line_total).toFixed(2)} DH
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-right text-sm text-gray-700">
              Total:{" "}
              <span className="font-semibold">
                {Number(detailNote.total_value).toFixed(2)} DH
              </span>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.status === "validated"
            ? "Supprimer le bon de livraison validé"
            : "Supprimer le bon de livraison"
        }
        message={
          deleteTarget?.status === "validated"
            ? `Cette action va annuler les stocks du BL ${deleteTarget?.number}. Voulez-vous continuer ?`
            : "Ce bon de livraison est en brouillon. Voulez-vous le supprimer ?"
        }
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
