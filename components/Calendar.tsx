import React, { useState } from 'react';
import type { Booking, Client, Activity, Monitor } from '../lib/supabase';

interface CalendarProps {
  bookings: Booking[];
  clients: Client[];
  activities: Activity[];
  monitors: Monitor[];
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Calendar({ bookings, clients, activities, monitors }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Genera la matriz de días para el mes actual
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  let startingDay = firstDay.getDay();
  if (startingDay === 0) startingDay = 7; // Domingo como día 7

  const weeks: (number | null)[][] = [];
  let date = 1;
  for (let i = 0; i < 6; i++) {
    const week: (number | null)[] = [];
    for (let j = 1; j <= 7; j++) {
      if ((i === 0 && j < startingDay) || date > lastDay.getDate()) {
        week.push(null);
      } else {
        week.push(date);
        date++;
      }
    }
    weeks.push(week);
    if (date > lastDay.getDate()) break;
  }

  // Navegación de mes
  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const resetToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Función para mostrar detalles del día
  const handleDayClick = (dateStr: string, hasBooking: boolean) => {
    if (hasBooking) setSelectedDate(dateStr);
    else setSelectedDate(null);
  };

  // Render
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span role="img" aria-label="calendar">📅</span> Calendario
        </h1>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition" onClick={() => changeMonth(-1)}>&lt;</button>
          <span className="font-semibold text-lg">{monthNames[currentMonth]} {currentYear}</span>
          <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition" onClick={() => changeMonth(1)}>&gt;</button>
          <button className="ml-2 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition" onClick={resetToToday}>Hoy</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 font-semibold">Lun</th>
              <th className="p-2 font-semibold">Mar</th>
              <th className="p-2 font-semibold">Mié</th>
              <th className="p-2 font-semibold">Jue</th>
              <th className="p-2 font-semibold">Vie</th>
              <th className="p-2 font-semibold">Sáb</th>
              <th className="p-2 font-semibold">Dom</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => {
                  if (!day) return <td key={j} className="p-2 bg-slate-50"></td>;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasBooking = bookings.some(b => b.date === dateStr && b.status !== 'cancelled');
                  const isToday =
                    day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear();
                  return (
                    <td
                      key={j}
                      className={`relative p-2 text-center border rounded-lg transition cursor-pointer select-none
                        ${isToday ? 'bg-blue-200 font-bold border-blue-400' : ''}
                        ${hasBooking ? 'bg-green-100 border-green-300 hover:bg-green-200' : 'hover:bg-slate-200'}
                        ${selectedDate === dateStr ? 'ring-2 ring-blue-400' : ''}
                      `}
                      onClick={() => handleDayClick(dateStr, hasBooking)}
                    >
                      <span className="inline-block w-6 h-6 leading-6 align-middle">{day}</span>
                      {hasBooking && <span className="absolute right-1 top-1 text-green-500 text-lg">•</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Detalles del día seleccionado */}
      {selectedDate && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-blue-200 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Reservas para {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <button className="text-blue-600 hover:underline text-sm" onClick={() => setSelectedDate(null)}>Cerrar</button>
          </div>
          <ul>
            {bookings
              .filter(b => b.date === selectedDate && b.status !== 'cancelled')
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(booking => {
                const client = clients.find(c => c.id === booking.client_id);
                const activity = activities.find(a => a.id === booking.activity_id);
                const monitor = monitors.find(m => m.id === booking.monitor_id);
                let statusClass = '';
                let statusText = '';
                switch (booking.status) {
                  case 'confirmed':
                    statusClass = 'bg-green-200 text-green-800';
                    statusText = 'Confirmada';
                    break;
                  case 'pending':
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    statusText = 'Pendiente';
                    break;
                }
                return (
                  <li key={booking.id} className="mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                      <div className="font-semibold text-lg">{activity ? activity.name : 'Actividad no encontrada'}</div>
                      <div className="text-sm text-gray-500">{booking.time}</div>
                      <div className="text-sm">Cliente: <span className="font-medium">{client ? client.name : 'Cliente no encontrado'}</span></div>
                      <div className="text-sm">Monitor: <span className="font-medium">{monitor ? monitor.name : 'Monitor no encontrado'}</span></div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ml-2 ${statusClass}`}>{statusText}</span>
                    </div>
                    {booking.notes && <div className="text-gray-500 text-sm mt-1">Notas: {booking.notes}</div>}
                  </li>
                );
              })}
            {bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled').length === 0 && (
              <li className="text-gray-500">No hay reservas para este día</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 