import React from 'react';
import { Activity } from '../lib/supabase';
import ItemsPerPageSelect from './ItemsPerPageSelect';
import { usePagination } from '../hooks/usePagination';
import PaginationControls from './PaginationControls';

interface ActivityTableProps {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  error: string | null;
  onLimitChange?: (limit: number) => void;
}

export default function ActivityTable({
  activities,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  loading,
  error,
  onLimitChange
}: ActivityTableProps) {
  const { totalPages, start, end, pageNumbers } = usePagination({ total, page, limit });

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
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nombre</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Duración (min)</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Precio (€)</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Máx. participantes</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-2 py-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-center text-gray-500">
                  No hay actividades disponibles
                </td>
              </tr>
            ) : (
              activities.map(activity => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px] truncate">{activity.name}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{activity.duration || '-'}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{activity.price.toFixed(2)}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{activity.max_participants || '-'}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => onEdit(activity)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                    <button onClick={() => onDelete(activity.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación Tailwind v4 */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >Anterior</button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >Siguiente</button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{start}</span> a <span className="font-medium">{end}</span> de <span className="font-medium">{total}</span> resultados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ItemsPerPageSelect
              value={limit}
              onChange={onLimitChange || (() => {})}
              onPageChange={onPageChange}
            />
            <PaginationControls
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
} 