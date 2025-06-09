import React, { useState, useEffect } from 'react';
import { supabase, Booking, Client, Activity, Monitor } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BookingModal from './BookingModal';
import ClientModal from './ClientModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import BookingTable from './BookingTable';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { useSearch } from '../hooks/useSearch';
import { useGlobalLimit } from '../hooks/useGlobalLimit';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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
  const { limit, setLimit } = useGlobalLimit();
  
  const {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    page,
    setPage
  } = useSearch();

  const {
    data: bookingsData,
    total,
    loading,
    error,
    refresh: refreshTable
  } = usePaginatedData('Bookings', {
    page,
    limit,
    filters: {
      search: appliedSearch
    },
    sort: { field: 'date', direction: 'desc' }
  });

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
      await updateBooking(bookingId, { client_id: clientId });
      refreshTable();
    } catch (error) {
      alert('Error al actualizar el cliente');
    } finally {
      setEditingClientId(null);
    }
  };

  const handleActivityChange = async (bookingId: number, activityId: number) => {
    try {
      await updateBooking(bookingId, { activity_id: activityId });
      refreshTable();
    } catch (error) {
      alert('Error al actualizar la actividad');
    }
  };

  const handleMonitorChange = async (bookingId: number, monitorId: number) => {
    try {
      await updateBooking(bookingId, { monitor_id: monitorId });
      refreshTable();
    } catch (error) {
      alert('Error al actualizar el monitor');
    }
  };

  const handleDateTimeChange = async (bookingId: number, date: string, time: string) => {
    try {
      await updateBooking(bookingId, { date, time });
      refreshTable();
    } catch (error) {
      alert('Error al actualizar la fecha/hora');
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

  // Filtrar bookings según búsqueda y estado
  const filteredBookings = bookings.filter(booking => {
    const client = clients.find(c => c.id === booking.client_id);
    const activity = activities.find(a => a.id === booking.activity_id);
    const monitor = monitors.find(m => m.id === booking.monitor_id);

    const matchesSearch = searchTerm === '' || 
      (client?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (monitor?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(total / limit);
  const paginatedBookings = filteredBookings.slice((page - 1) * limit, page * limit);

  const updateBooking = async (id: number, data: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, ...data } : booking
      ));
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error al actualizar la reserva');
    }
  };

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
                onChange={e => setSearchTerm(e.target.value)}
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
            <BookingTable
              bookings={paginatedBookings}
              clients={clients}
              activities={activities}
              monitors={monitors}
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
              onStatusChange={handleStatusChange}
              loading={loading}
              error={error}
              onLimitChange={newLimit => { setLimit(newLimit); setPage(1); }}
              setEditingClientId={setEditingClientId}
              editingClientId={editingClientId}
              setShowNewClientModal={setShowNewClientModal}
              onClientChange={handleClientChange}
              onActivityChange={handleActivityChange}
              onMonitorChange={handleMonitorChange}
              onDateTimeChange={handleDateTimeChange}
            />
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