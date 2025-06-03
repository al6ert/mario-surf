import React from 'react';
import { Invoice, InvoiceItem } from '../lib/supabase';

interface InvoiceWithClient extends Invoice {
  clients?: {
    name: string;
  };
}

interface InvoiceTableProps {
  invoices: InvoiceWithClient[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (invoice: InvoiceWithClient) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'pending' | 'paid' | 'cancelled') => void;
  loading: boolean;
  error: string | null;
}

export default function InvoiceTable({
  invoices,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  loading,
  error
}: InvoiceTableProps) {
  const getTotal = (invoice: Invoice) => {
    if (!invoice.items) return '0.00';
    const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <table className="w-full min-w-0 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nº Factura</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cliente</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Importe</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.number}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.clients?.name}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.date ? new Date(invoice.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{getTotal(invoice)} €</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm">
                  <select
                    value={invoice.status}
                    onChange={e => {
                      const newStatus = e.target.value as 'pending' | 'paid' | 'cancelled';
                      onStatusChange(invoice.id, newStatus);
                    }}
                    className={
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800 px-2 py-1 rounded font-semibold'
                        : invoice.status === 'pending'
                        ? 'bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold'
                        : 'bg-red-100 text-red-800 px-2 py-1 rounded font-semibold'
                    }
                    style={{ minWidth: 110 }}
                  >
                    <option value="paid">Pagada</option>
                    <option value="pending">Pendiente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onEdit(invoice)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button onClick={() => onDelete(invoice.id)} className="text-red-600 hover:text-red-900 mr-3">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} resultados
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page * limit >= total}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
} 