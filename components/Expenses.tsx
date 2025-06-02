import { useState, useEffect } from 'react';
import { supabase, Expense } from '../lib/supabase';
import ExpenseModal from './ExpenseModal';

const CATEGORY_LABELS: Record<string, string> = {
  supplies: 'Suministros',
  equipment: 'Equipamiento',
  salaries: 'Salarios',
  maintenance: 'Mantenimiento',
  other: 'Otros',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      await fetchExpenses();
      setIsModalOpen(false);
      setSelectedExpense(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) return;
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const term = searchTerm.toLowerCase();
    const matchesText =
      expense.description.toLowerCase().includes(term) ||
      CATEGORY_LABELS[expense.category].toLowerCase().includes(term) ||
      (expense.notes || '').toLowerCase().includes(term);
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    return matchesText && matchesCategory;
  });

  if (loading) return <div className="p-4">Cargando gastos...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Gastos
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="supplies">Suministros</option>
                <option value="equipment">Equipamiento</option>
                <option value="salaries">Salarios</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="other">Otros</option>
              </select>
            </div>
          </div>
          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Descripción</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Categoría</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Importe</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Notas</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{CATEGORY_LABELS[expense.category] || expense.category}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{expense.amount.toFixed(2)} €</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.notes && (
                        <div className="relative group">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-pre-line hidden group-hover:block">
                            {expense.notes}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isModalOpen && (
          <ExpenseModal
            expense={selectedExpense}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedExpense(null);
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 