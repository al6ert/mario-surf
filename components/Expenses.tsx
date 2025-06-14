import React, { useState, useEffect } from 'react';
import { supabase, Expense } from '../lib/supabase';
import ExpenseModal from './ExpenseModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { useDebounce } from '../hooks/useDebounce';
import ExpenseTable from './ExpenseTable';
import { useSearchAndFilters } from '../hooks/useSearchAndFilters';
import { useGlobalLimit } from '../hooks/useGlobalLimit';

const CATEGORY_LABELS: Record<string, string> = {
  supplies: 'Suministros',
  equipment: 'Equipamiento',
  salaries: 'Salarios',
  maintenance: 'Mantenimiento',
  other: 'Otros',
};

export default function Expenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const { limit, setLimit } = useGlobalLimit();

  const {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    filter: categoryFilter,
    setFilter: setCategoryFilter,
    appliedFilter: appliedCategory,
    page,
    setPage
  } = useSearchAndFilters<string>('');

  const {
    data: expenses,
    total,
    loading,
    error,
    refresh: refreshTable
  } = usePaginatedData('Expenses', {
    page,
    limit,
    filters: {
      search: appliedSearch,
      category: appliedCategory === '' ? undefined : appliedCategory
    },
    sort: { field: 'date', direction: 'desc' }
  });

  const handleAdd = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
      await supabase.from('expenses').delete().eq('id', id);
      refreshTable();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleSave = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', selectedExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setSelectedExpense(null);
      refreshTable();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faMoneyBill} className="w-7 h-7 text-gray-700" />
            Gastos
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            + Nuevo Gasto
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ExpenseTable
            expenses={expenses}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            error={error}
            onLimitChange={newLimit => { setLimit(newLimit); setPage(1); }}
          />
        </div>
        {isModalOpen && (
          <ExpenseModal
            expense={selectedExpense}
            onClose={() => { setIsModalOpen(false); setSelectedExpense(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 