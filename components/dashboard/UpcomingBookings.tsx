import React, { useState } from 'react';
import { format, parseISO, startOfToday, isValid, addDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, Client, Activity, Monitor } from '../../lib/supabase';

interface UpcomingBookingsProps {
  bookings: Booking[];
  clients: Client[];
  activities: Activity[];
  monitors: Monitor[];
}

export default function UpcomingBookings({ bookings, clients, activities, monitors }: UpcomingBookingsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Helper functions
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  };

  const getActivityName = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : 'Actividad no encontrada';
  };

  const getMonitorName = (monitorId: number) => {
    const monitor = monitors.find(m => m.id === monitorId);
    return monitor ? monitor.name : 'Monitor no encontrado';
  };

  // Filter and sort upcoming bookings (from tomorrow to 7 days from now, excluding today)
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const sevenDaysLater = addDays(today, 7);
  const upcomingBookings = bookings
    .filter(booking => {
      try {
        if (!booking.date || !booking.time) {
          console.error('Invalid booking date or time:', booking);
          return false;
        }
        const bookingDateTime = parseISO(`${booking.date}T${booking.time}`);
        if (!isValid(bookingDateTime)) {
          console.error('Invalid booking dateTime:', `${booking.date}T${booking.time}`);
          return false;
        }
        // Only bookings between tomorrow and 7 days from now (inclusive), excluding today
        return isWithinInterval(bookingDateTime, { start: tomorrow, end: sevenDaysLater });
      } catch (error) {
        console.error('Error parsing booking dateTime:', error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        const dateTimeA = parseISO(`${a.date}T${a.time}`);
        const dateTimeB = parseISO(`${b.date}T${b.time}`);
        if (!isValid(dateTimeA) || !isValid(dateTimeB)) {
          console.error('Invalid booking dateTime:', { a: `${a.date}T${a.time}`, b: `${b.date}T${b.time}` });
          return 0;
        }
        return dateTimeA.getTime() - dateTimeB.getTime();
      } catch (error) {
        console.error('Error sorting bookings:', error);
        return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(upcomingBookings.length / itemsPerPage);
  const paginatedBookings = upcomingBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (upcomingBookings.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay reservas para los próximos 7 días
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedBookings.map((booking) => {
              try {
                if (!booking.date || !booking.time) {
                  console.error('Invalid booking date or time:', booking);
                  return null;
                }
                const bookingDateTime = parseISO(`${booking.date}T${booking.time}`);
                if (!isValid(bookingDateTime)) {
                  console.error('Invalid booking dateTime:', { date: booking.date, time: booking.time });
                  return null;
                }
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(bookingDateTime, 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(bookingDateTime, 'HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getClientName(booking.client_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getActivityName(booking.activity_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMonitorName(booking.monitor_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                );
              } catch (error) {
                console.error('Error rendering booking:', error);
                return null;
              }
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