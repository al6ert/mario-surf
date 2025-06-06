import React, { useState } from 'react';
import type { Booking, Client, Activity, Monitor } from '../lib/supabase';
import BookingModal from './BookingModal';

interface CalendarBookingCardProps {
  bookings: Booking[];
  clients: Client[];
  activities: Activity[];
  monitors: Monitor[];
  selectedDate: string;
  onClose: () => void;
  onSave: (bookingData: Partial<Booking>) => void;
}

export default function CalendarBookingCard({
  bookings,
  clients,
  activities,
  monitors,
  selectedDate,
  onClose,
  onSave,
}: CalendarBookingCardProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!bookings || !Array.isArray(bookings)) {
    return (
      <div className="mt-4 bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-sm text-gray-500">Error: No hay datos de reservas disponibles</div>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings
    .filter(b => b.date === selectedDate && b.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Reservas para {new Date(selectedDate).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {filteredBookings.map(booking => {
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
              <div 
                key={booking.id} 
                className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50"
                onClick={() => handleBookingClick(booking)}
              >
                <div className="flex flex-col space-y-2">
                  {/* First row: Sport, Monitor and Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-medium text-gray-900">
                        {activity ? activity.name : 'Actividad no encontrada'}
                      </h4>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-700">
                        {monitor ? monitor.name : 'Monitor no encontrado'}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-700">{booking.time}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Second row: Client name */}
                  <div className="text-sm text-gray-700">
                    {client ? client.name : 'Cliente no encontrado'}
                  </div>

                  {/* Third row: Notes */}
                  {booking.notes && (
                    <div className="text-sm text-gray-500">
                      {booking.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredBookings.length === 0 && (
            <div className="text-sm text-gray-500">No hay reservas para este día</div>
          )}
        </div>
      </div>

      {isModalOpen && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          clients={clients}
          activities={activities}
          monitors={monitors}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          onSave={(bookingData) => {
            onSave({
              ...bookingData,
              id: selectedBooking.id // Ensure we keep the original booking ID
            });
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
} 