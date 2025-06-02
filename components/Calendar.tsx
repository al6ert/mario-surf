import React, { useState, useEffect } from 'react';
import type { Booking, Client, Activity, Monitor } from '../lib/supabase';
import { ApiClient } from '../lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

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

export default function Calendar({ bookings: initialBookings, clients: initialClients, activities: initialActivities, monitors: initialMonitors }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [monitors, setMonitors] = useState<Monitor[]>(initialMonitors);
  const [loading, setLoading] = useState(false);

  // Cargar datos cuando el componente se monta o cambia el mes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [newBookings, newClients, newActivities, newMonitors] = await Promise.all([
          ApiClient.getBookings(),
          ApiClient.getClients(),
          ApiClient.getActivities(),
          ApiClient.getMonitors()
        ]);

        setBookings(newBookings || []);
        setClients(newClients || []);
        setActivities(newActivities || []);
        setMonitors(newMonitors || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentMonth, currentYear]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faCalendar} className="w-7 h-7 text-gray-700" />
            Calendario
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow">
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              <time dateTime={`${currentYear}-${currentMonth + 1}`}>
                {monthNames[currentMonth]} {currentYear}
              </time>
            </h1>
            <div className="flex items-center">
              <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
                >
                  <span className="sr-only">Mes anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={resetToToday}
                  className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
                >
                  <span className="sr-only">Mes siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          <div className="bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700">
            <div className="grid grid-cols-7 gap-px">
              <div className="bg-white py-2">Lun</div>
              <div className="bg-white py-2">Mar</div>
              <div className="bg-white py-2">Mié</div>
              <div className="bg-white py-2">Jue</div>
              <div className="bg-white py-2">Vie</div>
              <div className="bg-white py-2">Sáb</div>
              <div className="bg-white py-2">Dom</div>
            </div>
            <div className="grid grid-cols-7 gap-px">
              {weeks.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="bg-white px-3 py-2 text-gray-500"
                        />
                      );
                    }
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
                    const hasConfirmedBooking = dayBookings.some(b => b.status === 'confirmed');
                    const hasPendingBooking = dayBookings.some(b => b.status === 'pending');
                    const hasBooking = hasConfirmedBooking || hasPendingBooking;
                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear();
                    const isSelected = selectedDate === dateStr;

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`relative px-3 py-2 text-gray-900 hover:bg-gray-50 focus:z-10 cursor-pointer
                          ${hasConfirmedBooking ? 'bg-green-100 hover:bg-green-200' : 'bg-white'}
                          ${hasPendingBooking && !hasConfirmedBooking ? 'bg-yellow-100 hover:bg-yellow-200' : ''}
                          ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        `}
                        onClick={() => handleDayClick(dateStr, hasBooking)}
                      >
                        <time
                          dateTime={dateStr}
                          className="relative"
                        >
                          {day}
                        </time>
                        {isToday && (
                          <div className="absolute top-1 right-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Detalles del día seleccionado */}
          {selectedDate && (
            <div className="mt-4 bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Reservas para {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    onClick={() => setSelectedDate(null)}
                  >
                    Cerrar
                  </button>
                </div>
                <div className="mt-4 space-y-4">
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
                          statusClass = 'bg-green-100 text-green-800';
                          statusText = 'Confirmada';
                          break;
                        case 'pending':
                          statusClass = 'bg-yellow-100 text-yellow-800';
                          statusText = 'Pendiente';
                          break;
                      }
                      return (
                        <div key={booking.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-medium text-gray-900">{activity ? activity.name : 'Actividad no encontrada'}</h4>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                                {statusText}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{booking.time}</div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Cliente:</span> {client ? client.name : 'Cliente no encontrado'}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Monitor:</span> {monitor ? monitor.name : 'Monitor no encontrado'}
                            </div>
                            {booking.notes && (
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">Notas:</span> {booking.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled').length === 0 && (
                    <div className="text-sm text-gray-500">No hay reservas para este día</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 