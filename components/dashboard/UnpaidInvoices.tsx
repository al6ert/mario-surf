import React, { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import type { Invoice, Client } from '../../lib/supabase';

interface UnpaidInvoicesProps {
  invoices: Invoice[];
  clients: Client[];
}

export default function UnpaidInvoices({ invoices, clients }: UnpaidInvoicesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  };

  // Only unpaid invoices (status === 'pending')
  const unpaidInvoices = invoices
    .filter(invoice => invoice.status === 'pending')
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      if (!isValid(dateA) || !isValid(dateB)) return 0;
      return dateA.getTime() - dateB.getTime(); // Más antigua primero
    });

  // Pagination
  const totalPages = Math.ceil(unpaidInvoices.length / itemsPerPage);
  const paginatedInvoices = unpaidInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (unpaidInvoices.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay facturas pendientes
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedInvoices.map((invoice) => {
              const invoiceDate = parseISO(invoice.date);
              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isValid(invoiceDate) ? format(invoiceDate, 'dd/MM/yyyy') : 'Fecha inválida'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getClientName(invoice.client_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.items && Array.isArray(invoice.items)
                      ? (invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 + (invoice.iva_percentage || 0) / 100)).toFixed(2) + ' €'
                      : '0.00 €'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
} 