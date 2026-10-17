import { useEffect, useMemo, useState } from "react";
import { FileText, Download, Calendar } from "lucide-react";
import { useStore } from "../store/useStore";
import { isLowStock } from "../utils/alerts";
import { medicinesApi } from "../lib/api";
import type { MedicineWithDetails } from "../types";

export function InventoryReport() {
  const { medicines: pageMedicines, categories, suppliers } = useStore();
  const [allMedicines, setAllMedicines] = useState<MedicineWithDetails[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<MedicineWithDetails[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await medicinesApi.getAllUnpaginated();
        const list: MedicineWithDetails[] = (data || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          category_id: item.category?.id || null,
          supplier_id: item.supplier?.id || null,
        }));
        setAllMedicines(list);
      } catch (e) {
        setAllMedicines(pageMedicines);
        console.error("Error loading all medicines for report:", e);
      }
    };
    loadAll();
  }, [pageMedicines]);

  useEffect(() => {
    const loadExpiring = async () => {
      try {
        const data = await medicinesApi.getExpiringSoon();
        const list: MedicineWithDetails[] = (data || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          category_id: item.category?.id || null,
          supplier_id: item.supplier?.id || null,
        }));
        setExpiringSoon(list);
      } catch (e) {
        setExpiringSoon([]);
        console.error("Error loading expiring medicines for report:", e);
      }
    };
    loadExpiring();
  }, []);

  const reportData = useMemo(() => {
    const byCategory = categories.map((category) => {
      const categoryMedicines = allMedicines.filter(
        (m) => m.category_id === category.id,
      );
      const totalValue = categoryMedicines.reduce(
        (sum, m) => sum + m.current_stock * (Number(m.unit_price) || 0),
        0,
      );
      const totalItems = categoryMedicines.reduce(
        (sum, m) => sum + m.current_stock,
        0,
      );

      return {
        category: category.name,
        count: categoryMedicines.length,
        totalItems,
        totalValue,
      };
    });

    const bySupplier = suppliers.map((supplier) => {
      const supplierMedicines = allMedicines.filter(
        (m) => m.supplier_id === supplier.id,
      );
      const totalValue = supplierMedicines.reduce(
        (sum, m) => sum + m.current_stock * (Number(m.unit_price) || 0),
        0,
      );
      const totalItems = supplierMedicines.reduce(
        (sum, m) => sum + m.current_stock,
        0,
      );

      return {
        supplier: supplier.name,
        count: supplierMedicines.length,
        totalItems,
        totalValue,
      };
    });

    const criticalStock = allMedicines.filter((m) => isLowStock(m));
    return {
      byCategory,
      bySupplier,
      criticalStock,
    };
  }, [allMedicines, categories, suppliers]);

  // Export Inventaire Complet as Excel (.xlsx)
  const exportInventoryXLSX = async () => {
    try {
      const XLSX = await import("xlsx");

      const rows = allMedicines.map((medicine) => ({
        Nom: medicine.name,
        "Code-barres": medicine.barcode || "",
        Catégorie: medicine.category?.name || "",
        Fournisseur: medicine.supplier?.name || "",
        Stock: `${medicine.current_stock} ${medicine.unit}`,
        "Prix unitaire (DH)": (Number(medicine.unit_price) || 0).toFixed(2),
        "Valeur totale (DH)": (
          medicine.current_stock * (Number(medicine.unit_price) || 0)
        ).toFixed(2),
        Emplacement: medicine.location || "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventaire");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventaire_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(
        "Export Excel indisponible. Veuillez installer la dépendance avec: npm install xlsx",
      );
      console.error("Excel export error:", e);
    }
  };

  const exportInventoryPDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour cette fonctionnalité");
      return;
    }

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventaire Complet - ${currentDate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #374151;
          }
          td {
            font-size: 14px;
          }
          .text-right {
            text-align: right;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Inventaire Complet</h1>
          <p>Généré le ${currentDate}</p>
        </div>

        <div class="section">
          <h2>Liste Complète des Médicaments</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Code-barres</th>
                <th>Catégorie</th>
                <th>Fournisseur</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">Valeur totale</th>
                <th>Emplacement</th>
              </tr>
            </thead>
            <tbody>
              ${allMedicines
                .map(
                  (medicine) => `
                <tr>
                  <td>${medicine.name}</td>
                  <td>${medicine.barcode || ""}</td>
                  <td>${medicine.category?.name || ""}</td>
                  <td>${medicine.supplier?.name || ""}</td>
                  <td class="text-right">${medicine.current_stock} ${
                    medicine.unit
                  }</td>
                  <td class="text-right">${(Number(medicine.unit_price) || 0).toFixed(
                    2,
                  )} DH</td>
                  <td class="text-right">${(
                    medicine.current_stock * (Number(medicine.unit_price) || 0)
                  ).toFixed(2)} DH</td>
                  <td>${medicine.location || ""}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Résumé par Catégorie</h2>
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th class="text-right">Produits</th>
                <th class="text-right">Unités</th>
                <th class="text-right">Valeur</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.byCategory
                .map(
                  (item) => `
                <tr>
                  <td>${item.category}</td>
                  <td class="text-right">${item.count}</td>
                  <td class="text-right">${item.totalItems}</td>
                  <td class="text-right">${item.totalValue.toFixed(2)} DH</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Résumé par Fournisseur</h2>
          <table>
            <thead>
              <tr>
                <th>Fournisseur</th>
                <th class="text-right">Produits</th>
                <th class="text-right">Unités</th>
                <th class="text-right">Valeur</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.bySupplier
                .map(
                  (item) => `
                <tr>
                  <td>${item.supplier}</td>
                  <td class="text-right">${item.count}</td>
                  <td class="text-right">${item.totalItems}</td>
                  <td class="text-right">${item.totalValue.toFixed(2)} DH</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        ${
          reportData.criticalStock.length > 0
            ? `
          <div class="section">
            <div class="alert-box">
              <h3>Stocks Critiques (${reportData.criticalStock.length})</h3>
              ${reportData.criticalStock
                .map(
                  (medicine) => `
                <div class="alert-item">${medicine.name}: ${medicine.current_stock} ${medicine.unit}</div>
              `,
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        ${
          expiringSoon.length > 0
            ? `
          <div class="section">
            <div class="alert-box">
              <h3>Expiration Proche (${expiringSoon.length})</h3>
              ${expiringSoon
                .map(
                  (medicine) => `
                <div class="alert-item">${medicine.name}</div>
              `,
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>Rapport généré par MedStock - Système de Gestion de Pharmacie</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const exportCategoryPDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour cette fonctionnalité");
      return;
    }

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Calculate totals
    const totalItems = reportData.byCategory.reduce(
      (sum, item) => sum + item.totalItems,
      0,
    );
    const totalValue = reportData.byCategory.reduce(
      (sum, item) => sum + item.totalValue,
      0,
    );

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Résumé par Catégorie - ${currentDate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #374151;
          }
          td {
            font-size: 14px;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            background-color: #f0f9ff;
            font-weight: bold;
          }
          .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .summary-box h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 16px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .summary-value {
            font-weight: bold;
            color: #1e40af;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Résumé par Catégorie</h1>
          <p>Généré le ${currentDate}</p>
        </div>

        <div class="section">
          <div class="summary-box">
            <h3>Résumé Général</h3>
            <div class="summary-item">
              <span>Total des catégories:</span>
              <span class="summary-value">${reportData.byCategory.length}</span>
            </div>
            <div class="summary-item">
              <span>Total des produits:</span>
              <span class="summary-value">${reportData.byCategory.reduce(
                (sum, item) => sum + item.count,
                0,
              )}</span>
            </div>
            <div class="summary-item">
              <span>Total des unités en stock:</span>
              <span class="summary-value">${totalItems}</span>
            </div>
            <div class="summary-item">
              <span>Valeur totale du stock:</span>
              <span class="summary-value">${totalValue.toFixed(2)} DH</span>
            </div>
          </div>

          <h2>Détail par Catégorie</h2>
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th class="text-right">Produits</th>
                <th class="text-right">Unités</th>
                <th class="text-right">Valeur</th>
                <th class="text-right">% du total</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.byCategory
                .map((item) => {
                  const percentage =
                    totalValue > 0
                      ? ((item.totalValue / totalValue) * 100).toFixed(1)
                      : 0;
                  return `
                <tr>
                  <td>${item.category}</td>
                  <td class="text-right">${item.count}</td>
                  <td class="text-right">${item.totalItems}</td>
                  <td class="text-right">${item.totalValue.toFixed(2)} DH</td>
                  <td class="text-right">${percentage}%</td>
                </tr>
              `;
                })
                .join("")}
              <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${reportData.byCategory.reduce(
                  (sum, item) => sum + item.count,
                  0,
                )}</strong></td>
                <td class="text-right"><strong>${totalItems}</strong></td>
                <td class="text-right"><strong>${totalValue.toFixed(
                  2,
                )} DH</strong></td>
                <td class="text-right"><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Rapport généré par MedStock - Système de Gestion de Pharmacie</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const exportSupplierPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour cette fonctionnalité");
      return;
    }

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const totalItems = reportData.bySupplier.reduce(
      (sum, item) => sum + item.totalItems,
      0,
    );
    const totalValue = reportData.bySupplier.reduce(
      (sum, item) => sum + item.totalValue,
      0,
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Résumé par Fournisseur - ${currentDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f9fafb; font-weight: bold; color: #374151; }
          td { font-size: 14px; }
          .text-right { text-align: right; }
          .total-row { background-color: #f0f9ff; font-weight: bold; }
          .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .summary-box h3 { margin: 0 0 15px 0; color: #1e40af; font-size: 16px; }
          .summary-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .summary-value { font-weight: bold; color: #1e40af; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
          @media print { body { margin: 15px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Résumé par Fournisseur</h1>
          <p>Généré le ${currentDate}</p>
        </div>

        <div class="section">
          <div class="summary-box">
            <h3>Résumé Général</h3>
            <div class="summary-item"><span>Total des fournisseurs:</span><span class="summary-value">${
              reportData.bySupplier.length
            }</span></div>
            <div class="summary-item"><span>Total des produits:</span><span class="summary-value">${reportData.bySupplier.reduce(
              (s, i) => s + i.count,
              0,
            )}</span></div>
            <div class="summary-item"><span>Total des unités en stock:</span><span class="summary-value">${totalItems}</span></div>
            <div class="summary-item"><span>Valeur totale du stock:</span><span class="summary-value">${totalValue.toFixed(
              2,
            )} DH</span></div>
          </div>

          <h2>Détail par Fournisseur</h2>
          <table>
            <thead>
              <tr>
                <th>Fournisseur</th>
                <th class="text-right">Produits</th>
                <th class="text-right">Unités</th>
                <th class="text-right">Valeur</th>
                <th class="text-right">% du total</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.bySupplier
                .map((item) => {
                  const percentage =
                    totalValue > 0
                      ? ((item.totalValue / totalValue) * 100).toFixed(1)
                      : 0;
                  return `
                <tr>
                  <td>${item.supplier}</td>
                  <td class="text-right">${item.count}</td>
                  <td class="text-right">${item.totalItems}</td>
                  <td class="text-right">${item.totalValue.toFixed(2)} DH</td>
                  <td class="text-right">${percentage}%</td>
                </tr>`;
                })
                .join("")}
              <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${reportData.bySupplier.reduce(
                  (s, i) => s + i.count,
                  0,
                )}</strong></td>
                <td class="text-right"><strong>${totalItems}</strong></td>
                <td class="text-right"><strong>${totalValue.toFixed(
                  2,
                )} DH</strong></td>
                <td class="text-right"><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Rapport généré par MedStock - Système de Gestion de Pharmacie</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Rapport d'inventaire
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportInventoryPDF}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Inventaire Complet (PDF)
          </button>

          <button
            onClick={exportInventoryXLSX}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Inventaire Complet (Excel)
          </button>

          <button
            onClick={exportCategoryPDF}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Résumé par Catégorie (PDF)
          </button>

          <button
            onClick={exportSupplierPDF}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Résumé par Fournisseur (PDF)
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Généré le{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Par catégorie</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Catégorie
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Produits
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Unités
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Valeur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.byCategory.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {item.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {item.totalItems}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {item.totalValue.toFixed(2)} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Par fournisseur</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Fournisseur
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Produits
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Unités
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Valeur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.bySupplier.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.supplier}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {item.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {item.totalItems}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {item.totalValue.toFixed(2)} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Stocks critiques ({reportData.criticalStock.length})
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {reportData.criticalStock.slice(0, 10).map((medicine) => (
                <div key={medicine.id} className="text-sm text-yellow-800">
                  {medicine.name}: {medicine.current_stock} {medicine.unit}
                </div>
              ))}
              {reportData.criticalStock.length > 10 && (
                <div className="text-xs text-yellow-700 pt-1">
                  ... et {reportData.criticalStock.length - 10} autres
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">
              Expiration proche ({expiringSoon.length})
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {expiringSoon.slice(0, 10).map((medicine) => (
                <div key={medicine.id} className="text-sm text-orange-800">
                  {medicine.name}
                </div>
              ))}
              {expiringSoon.length > 10 && (
                <div className="text-xs text-orange-700 pt-1">
                  ... et {expiringSoon.length - 10} autres
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
