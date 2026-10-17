import { Search, X } from "lucide-react";
import { useStore } from "../store/useStore";

export function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSupplier,
    setSelectedSupplier,
    setPage,
  } = useStore();
  const categories = useStore((state) => state.categories);
  const suppliers = useStore((state) => state.suppliers);

  const hasActiveFilters = searchQuery || selectedCategory || selectedSupplier;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSupplier(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un médicament, code-barres, lot..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        <select
          value={selectedCategory || ""}
          onChange={(e) => {
            setSelectedCategory(e.target.value || null);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSupplier || ""}
          onChange={(e) => {
            setSelectedSupplier(e.target.value || null);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
        >
          <option value="">Tous les fournisseurs</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              clearAllFilters();
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>
    </div>
  );
}
