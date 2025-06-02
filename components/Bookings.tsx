import { useState, useEffect } from 'react';
import { supabase, Booking, Client, Activity, Monitor } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BookingModal from './BookingModal';
import ClientModal from './ClientModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editingMonitorId, setEditingMonitorId] = useState<number | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

  // Fetch data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*');

      if (activitiesError) throw activitiesError;

      // Fetch monitors
      const { data: monitorsData, error: monitorsError } = await supabase
        .from('monitors')
        .select('*');

      if (monitorsError) throw monitorsError;

      setBookings(bookingsData || []);
      setClients(clientsData || []);
      setActivities(activitiesData || []);
      setMonitors(monitorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta reserva?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookings(bookings.filter(booking => booking.id !== id));
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error al eliminar la reserva');
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const handleClientChange = async (bookingId: number, clientId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ client_id: clientId })
        .eq('id', bookingId);
      if (error) throw error;
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, client_id: clientId } : b));
    } catch (error) {
      alert('Error al actualizar el cliente');
    } finally {
      setEditingClientId(null);
    }
  };

  const handleActivityChange = async (bookingId: number, activityId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ activity_id: activityId })
        .eq('id', bookingId);
      if (error) throw error;
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, activity_id: activityId } : b));
    } catch (error) {
      alert('Error al actualizar la actividad');
    } finally {
      setEditingActivityId(null);
    }
  };

  const handleMonitorChange = async (bookingId: number, monitorId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ monitor_id: monitorId })
        .eq('id', bookingId);
      if (error) throw error;
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, monitor_id: monitorId } : b));
    } catch (error) {
      alert('Error al actualizar el monitor');
    } finally {
      setEditingMonitorId(null);
    }
  };

  const handleNewClient = async (clientData: any) => {
    // clientData: { name, ... }
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();
      if (error) throw error;
      setClients([...clients, data[0]]);
      // Asignar el nuevo cliente a la reserva en edición
      if (editingClientId !== null) {
        await handleClientChange(editingClientId, data[0].id);
      }
    } catch (error) {
      alert('Error al crear el cliente');
    } finally {
      setShowNewClientModal(false);
    }
  };

  const handleDateTimeChange = async (bookingId: number, date: string, time: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ date, time })
        .eq('id', bookingId);
      if (error) throw error;
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, date, time } : b));
    } catch (error) {
      alert('Error al actualizar la fecha/hora');
    } finally {
      setEditingDateId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const client = clients.find(c => c.id === booking.client_id);
    const activity = activities.find(a => a.id === booking.activity_id);
    const monitor = monitors.find(m => m.id === booking.monitor_id);

    const matchesSearch = searchTerm === '' || 
      (client?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (monitor?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.date.includes(searchTerm) ||
      booking.time.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faBook} className="w-7 h-7 text-gray-700" />
            Reservas
          </h1>
          <button
            onClick={handleAddBooking}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Reserva
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar reservas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cliente</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actividad</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha/Hora</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Monitor</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const client = clients.find(c => c.id === booking.client_id);
                  const activity = activities.find(a => a.id === booking.activity_id);
                  const monitor = monitors.find(m => m.id === booking.monitor_id);

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{booking.id}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate cursor-pointer hover:bg-blue-50"
                        onClick={() => setEditingClientId(booking.id)}
                      >
                        {editingClientId === booking.id ? (
                          <select
                            className="w-full h-full bg-transparent border-none text-sm truncate focus:outline-none"
                            value={booking.client_id}
                            autoFocus
                            onBlur={() => setEditingClientId(null)}
                            onChange={async (e) => {
                              if (e.target.value === 'new') {
                                setShowNewClientModal(true);
                              } else {
                                await handleClientChange(booking.id, Number(e.target.value));
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
                            onChange={async (e) => {
                              await handleActivityChange(booking.id, Number(e.target.value));
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
                              onBlur={() => handleDateTimeChange(booking.id, tempDate, tempTime)}
                            />
                            <input
                              type="time"
                              step="900"
                              className="w-[70px] h-full bg-transparent border-none text-sm truncate focus:outline-none"
                              value={tempTime}
                              onChange={e => setTempTime(e.target.value)}
                              onBlur={() => handleDateTimeChange(booking.id, tempDate, tempTime)}
                            />
                          </div>
                        ) : (
                          format(new Date(`${booking.date}T${booking.time}`), 'dd/MM/yyyy HH:mm')
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
                            onChange={async (e) => {
                              await handleMonitorChange(booking.id, Number(e.target.value));
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
                          onChange={(e) => handleStatusChange(booking.id, e.target.value as 'confirmed' | 'pending' | 'cancelled')}
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
                          onClick={() => handleEditBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-900"
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
        </div>

        {isModalOpen && (
          <BookingModal
            booking={selectedBooking}
            clients={clients}
            activities={activities}
            monitors={monitors}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedBooking(null);
            }}
            onSave={async (bookingData) => {
              try {
                if (selectedBooking) {
                  // Update existing booking
                  const { error } = await supabase
                    .from('bookings')
                    .update(bookingData)
                    .eq('id', selectedBooking.id);

                  if (error) throw error;

                  setBookings(bookings.map(booking =>
                    booking.id === selectedBooking.id ? { ...booking, ...bookingData } : booking
                  ));
                } else {
                  // Create new booking
                  const { data, error } = await supabase
                    .from('bookings')
                    .insert([bookingData])
                    .select();

                  if (error) throw error;

                  setBookings([...bookings, data[0]]);
                }

                setIsModalOpen(false);
                setSelectedBooking(null);
              } catch (error) {
                console.error('Error saving booking:', error);
                alert('Error al guardar la reserva');
              }
            }}
          />
        )}

        {showNewClientModal && (
          <ClientModal
            client={null}
            onClose={() => setShowNewClientModal(false)}
            onSave={handleNewClient}
          />
        )}
      </div>
    </div>
  );
} 