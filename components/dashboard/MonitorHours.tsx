import React from 'react';
import { parseISO, isValid, subDays, isWithinInterval } from 'date-fns';
import type { Monitor, Booking } from '../../lib/supabase';

interface MonitorHoursProps {
  monitors: Monitor[];
  bookings: Booking[];
}

export default function MonitorHours({ monitors, bookings }: MonitorHoursProps) {
  // Calcular el rango de los últimos 30 días
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  // Filtrar bookings confirmadas en los últimos 30 días
  const recentConfirmedBookings = bookings.filter(booking => {
    if (booking.status !== 'confirmed') return false;
    if (!booking.date || !booking.time) return false;
    const bookingDateTime = parseISO(`${booking.date}T${booking.time}`);
    if (!isValid(bookingDateTime)) return false;
    return isWithinInterval(bookingDateTime, { start: thirtyDaysAgo, end: today });
  });

  // Agrupar por monitor.id y sumar horas
  const monitorHoursMap = new Map<number, number>();
  recentConfirmedBookings.forEach(booking => {
    if (typeof booking.monitor_id !== 'number') return;
    monitorHoursMap.set(
      booking.monitor_id,
      (monitorHoursMap.get(booking.monitor_id) || 0) + 1
    );
  });

  // Solo monitores únicos con horas > 0, ordenados de mayor a menor
  const monitorStats = Array.from(monitorHoursMap.entries())
    .map(([monitorId, totalHours]) => {
      const monitor = monitors.find(m => m.id === monitorId);
      return monitor ? { monitor, totalHours } : null;
    })
    .filter((stat): stat is { monitor: Monitor; totalHours: number } => !!stat)
    .sort((a, b) => b.totalHours - a.totalHours);

  // Log temporal para depuración
  console.log('MonitorStats agrupados:', monitorStats);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {monitorStats.map(({ monitor, totalHours }) => (
            <tr key={monitor.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{monitor.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 