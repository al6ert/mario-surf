import React, { useState } from 'react';
import { Booking, Client, Activity, Monitor } from '../lib/supabase';
import ItemsPerPageSelect from './ItemsPerPageSelect';

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

  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

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
            {bookings.map((booking) => {
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
                      <div className="flex gap-1 items-center w-full">
                        <input
                          type="date"
                          className="w-[110px] h-full bg-transparent border-none text-sm truncate focus:outline-none"
                          value={tempDate}
                          onChange={e => setTempDate(e.target.value)}
                          onBlur={() => {
                            setEditingDateId(null);
                            onDateTimeChange(booking.id, tempDate, tempTime);
                          }}
                        />
                        <input
                          type="time"
                          step="900"
                          className="w-[70px] h-full bg-transparent border-none text-sm truncate focus:outline-none"
                          value={tempTime}
                          onChange={e => setTempTime(e.target.value)}
                          onBlur={() => {
                            setEditingDateId(null);
                            onDateTimeChange(booking.id, tempDate, tempTime);
                          }}
                        />
                      </div>
                    ) : (
                      booking.date && booking.time ? `${booking.date} ${booking.time}` : ''
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate cursor-pointer hover:bg-blue-50"
                    onClick={() => setEditingClientId(booking.id)}
                  >
                    {editingClientId === booking.id ? (
                      <select
                        className="w-full h-full bg-transparent border-none text-sm truncate focus:outline-none"
                        value={booking.client_id}
                        autoFocus
                        onBlur={() => setEditingClientId(null)}
                        onChange={e => {
                          if (e.target.value === 'new') {
                            setShowNewClientModal(true);
                          } else {
                            onClientChange(booking.id, Number(e.target.value));
                          }
                        }}
                      >
                        <option value="new">+ Nuevo cliente</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    ) : (
                      client?.name || 'N/A'
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate cursor-pointer hover:bg-blue-50"
                    onClick={() => setEditingActivityId(booking.id)}
                  >
                    {editingActivityId === booking.id ? (
                      <select
                        className="w-full h-full bg-transparent border-none text-sm truncate focus:outline-none"
                        value={booking.activity_id}
                        autoFocus
                        onBlur={() => setEditingActivityId(null)}
                        onChange={e => {
                          onActivityChange(booking.id, Number(e.target.value));
                        }}
                      >
                        {activities.map((activity) => (
                          <option key={activity.id} value={activity.id}>{activity.name}</option>
                        ))}
                      </select>
                    ) : (
                      activity?.name || 'N/A'
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate cursor-pointer hover:bg-blue-50"
                    onClick={() => setEditingMonitorId(booking.id)}
                  >
                    {editingMonitorId === booking.id ? (
                      <select
                        className="w-full h-full bg-transparent border-none text-sm truncate focus:outline-none"
                        value={booking.monitor_id}
                        autoFocus
                        onBlur={() => setEditingMonitorId(null)}
                        onChange={e => {
                          onMonitorChange(booking.id, Number(e.target.value));
                        }}
                      >
                        {monitors.map((monitor) => (
                          <option key={monitor.id} value={monitor.id}>{monitor.name}</option>
                        ))}
                      </select>
                    ) : (
                      monitor?.name || 'N/A'
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <select
                      value={booking.status}
                      onChange={e => onStatusChange(booking.id, e.target.value as 'confirmed' | 'pending' | 'cancelled')}
                      className={
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 px-2 py-1 rounded font-semibold text-xs'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold text-xs'
                          : 'bg-red-100 text-red-800 px-2 py-1 rounded font-semibold text-xs'
                      }
                      style={{ minWidth: 110 }}
                    >
                      <option value="confirmed">Confirmada</option>
                      <option value="pending">Pendiente</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEdit(booking)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="text-red-600 hover:text-red-900 mr-3"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
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
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Anterior</span>
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              {getPageNumbers().map((p, idx) =>
                p === '...'
                  ? <span key={idx} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0">...</span>
                  : <button
                      key={p}
                      onClick={() => onPageChange(Number(p))}
                      aria-current={p === page ? 'page' : undefined}
                      className={
                        p === page
                          ? 'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }
                    >{p}</button>
              )}
              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
} 