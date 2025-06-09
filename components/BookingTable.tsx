import React, { useState } from 'react';
import { Booking, Client, Activity, Monitor } from '../lib/supabase';
import ItemsPerPageSelect from './ItemsPerPageSelect';
import { usePagination } from '../hooks/usePagination';
import PaginationControls from './PaginationControls';

interface BookingTableProps {
  bookings: Booking[];
  clients: Client[];
  activities: Activity[];
  monitors: Monitor[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'confirmed' | 'pending' | 'cancelled') => void;
  loading: boolean;
  error: string | null;
  onLimitChange?: (limit: number) => void;
  setEditingClientId: (id: number | null) => void;
  editingClientId: number | null;
  setShowNewClientModal: (show: boolean) => void;
  onClientChange: (bookingId: number, clientId: number) => void;
  onActivityChange: (bookingId: number, activityId: number) => void;
  onMonitorChange: (bookingId: number, monitorId: number) => void;
  onDateTimeChange: (bookingId: number, date: string, time: string) => void;
}

export default function BookingTable({
  bookings,
  clients,
  activities,
  monitors,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  loading,
  error,
  onLimitChange,
  setEditingClientId,
  editingClientId,
  setShowNewClientModal,
  onClientChange,
  onActivityChange,
  onMonitorChange,
  onDateTimeChange
}: BookingTableProps) {
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editingMonitorId, setEditingMonitorId] = useState<number | null>(null);
  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

  const safeLimit = typeof limit === 'number' && !isNaN(limit) && limit > 0 ? limit : 1;
  const { totalPages, start, end, pageNumbers } = usePagination({ total, page, limit: safeLimit });

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
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha/Hora</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cliente</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actividad</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Monitor</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-2 py-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-center text-gray-500">
                  No hay reservas disponibles
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const client = clients.find(c => c.id === booking.client_id);
                const activity = activities.find(a => a.id === booking.activity_id);
                const monitor = monitors.find(m => m.id === booking.monitor_id);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[140px] truncate cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setEditingDateId(booking.id);
                        setTempDate(booking.date);
                        setTempTime(booking.time);
                      }}
                    >
                      {editingDateId === booking.id ? (
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={tempDate}
                            onChange={e => setTempDate(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <input
                            type="time"
                            value={tempTime}
                            onChange={e => setTempTime(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDateTimeChange(booking.id, tempDate, tempTime);
                              setEditingDateId(null);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDateId(null);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        `${booking.date} ${booking.time}`
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px] truncate cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setEditingClientId(booking.id);
                        setShowNewClientModal(false);
                      }}
                    >
                      {editingClientId === booking.id ? (
                        <div className="flex gap-2">
                          <select
                            value={booking.client_id}
                            onChange={e => onClientChange(booking.id, Number(e.target.value))}
                            className="border rounded px-2 py-1"
                          >
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              setEditingClientId(null);
                              setShowNewClientModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            + Nuevo
                          </button>
                        </div>
                      ) : (
                        client?.name || 'Cliente no encontrado'
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px] truncate cursor-pointer hover:bg-blue-50"
                      onClick={() => setEditingActivityId(booking.id)}
                    >
                      {editingActivityId === booking.id ? (
                        <div className="flex gap-2">
                          <select
                            value={booking.activity_id}
                            onChange={e => onActivityChange(booking.id, Number(e.target.value))}
                            className="border rounded px-2 py-1"
                          >
                            {activities.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setEditingActivityId(null)}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        activity?.name || 'Actividad no encontrada'
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px] truncate cursor-pointer hover:bg-blue-50"
                      onClick={() => setEditingMonitorId(booking.id)}
                    >
                      {editingMonitorId === booking.id ? (
                        <div className="flex gap-2">
                          <select
                            value={booking.monitor_id}
                            onChange={e => onMonitorChange(booking.id, Number(e.target.value))}
                            className="border rounded px-2 py-1"
                          >
                            {monitors.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setEditingMonitorId(null)}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        monitor?.name || 'Monitor no encontrado'
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm">
                      <select
                        value={booking.status}
                        onChange={e => onStatusChange(booking.id, e.target.value as 'confirmed' | 'pending' | 'cancelled')}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="confirmed">Confirmada</option>
                        <option value="pending">Pendiente</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => onEdit(booking)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                      <button onClick={() => onDelete(booking.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
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