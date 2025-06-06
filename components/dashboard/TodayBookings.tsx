import React from 'react';
import { format, parseISO, isToday, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, Client, Activity, Monitor } from '../../lib/supabase';

interface TodayBookingsProps {
  bookings: Booking[];
  clients: Client[];
  activities: Activity[];
  monitors: Monitor[];
}

export default function TodayBookings({ bookings, clients, activities, monitors }: TodayBookingsProps) {
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

  // Filter today's bookings and handle date parsing errors
  const todayBookings = bookings
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
        const now = new Date();
        return bookingDateTime.getFullYear() === now.getFullYear() &&
               bookingDateTime.getMonth() === now.getMonth() &&
               bookingDateTime.getDate() === now.getDate();
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
        console.error('Error sorting bookings by time:', error);
        return 0;
      }
    });

  if (todayBookings.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay reservas para hoy
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {todayBookings.map((booking) => {
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
  );
} 