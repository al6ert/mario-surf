import React, { useState } from 'react';
import type { Booking, Client, Activity, Monitor } from '../lib/supabase';

interface BookingFormProps {
  booking?: Booking;
  clients: Client[];
  activities: Activity[];
  monitors: Monitor[];
  onSubmit: (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export default function BookingForm({ booking, clients, activities, monitors, onSubmit, onCancel }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const bookingData = {
      client_id: parseInt(formData.get('client_id') as string),
      activity_id: parseInt(formData.get('activity_id') as string),
      monitor_id: parseInt(formData.get('monitor_id') as string),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      status: formData.get('status') as 'pending' | 'confirmed' | 'cancelled',
      notes: formData.get('notes') as string
    };

    try {
      await onSubmit(bookingData);
      onCancel();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {booking ? 'Editar Reserva' : 'Nueva Reserva'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
              Cliente *
            </label>
            <select
              name="client_id"
              id="client_id"
              required
              defaultValue={booking?.client_id}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="activity_id" className="block text-sm font-medium text-gray-700">
              Actividad *
            </label>
            <select
              name="activity_id"
              id="activity_id"
              required
              defaultValue={booking?.activity_id}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar actividad</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} ({activity.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="monitor_id" className="block text-sm font-medium text-gray-700">
              Monitor *
            </label>
            <select
              name="monitor_id"
              id="monitor_id"
              required
              defaultValue={booking?.monitor_id}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar monitor</option>
              {monitors.filter(m => m.active).map(monitor => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.name} ({monitor.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Fecha *
            </label>
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={booking?.date}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Hora *
            </label>
            <input
              type="time"
              name="time"
              id="time"
              required
              defaultValue={booking?.time}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado *
            </label>
            <select
              name="status"
              id="status"
              required
              defaultValue={booking?.status}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              defaultValue={booking?.notes}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 