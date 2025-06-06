import React from 'react';
import { parseISO, isValid, subDays, isWithinInterval } from 'date-fns';
import type { Activity, Booking } from '../../lib/supabase';

interface ActivityHoursProps {
  activities: Activity[];
  bookings: Booking[];
}

export default function ActivityHours({ activities, bookings }: ActivityHoursProps) {
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

  // Agrupar por actividad y sumar horas
  const activityHoursMap = new Map<number, number>();
  recentConfirmedBookings.forEach(booking => {
    if (typeof booking.activity_id !== 'number') return;
    activityHoursMap.set(
      booking.activity_id,
      (activityHoursMap.get(booking.activity_id) || 0) + 1
    );
  });

  // Solo actividades con horas > 0, ordenadas de mayor a menor
  const activityStats = Array.from(activityHoursMap.entries())
    .map(([activityId, totalHours]) => {
      const activity = activities.find(a => a.id === activityId);
      return activity ? { activity, totalHours } : null;
    })
    .filter((stat): stat is { activity: Activity; totalHours: number } => !!stat)
    .sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activityStats.map(({ activity, totalHours }) => (
            <tr key={activity.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 