import React, { useEffect, useState } from 'react';
import { loadData, getState, subscribe, createClient, updateClient, deleteClient, createActivity, updateActivity, deleteActivity, createBooking, updateBooking, deleteBooking, createInvoice, updateInvoice, deleteInvoice, createMonitor, updateMonitor, deleteMonitor, updateSettings } from '../lib/data';
import type { Client, Activity, Monitor, Booking, Invoice, InvoiceItem, Settings } from '../lib/supabase';
import ClientForm from './ClientForm';
import ActivityForm from './ActivityForm';
import MonitorForm from './MonitorForm';
import BookingForm from './BookingForm';
import InvoiceForm from './InvoiceForm';

export default function App() {
  const [state, setState] = useState(getState());
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>();
  const [showMonitorForm, setShowMonitorForm] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | undefined>();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    // Load initial data
    loadData();

    // Subscribe to state changes
    const unsubscribe = subscribe(setState);
    return () => unsubscribe();
  }, []);

  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Handle client form
  const handleShowClientForm = (client?: Client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  const handleHideClientForm = () => {
    setSelectedClient(undefined);
    setShowClientForm(false);
  };

  const handleClientSubmit = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, clientData);
    } else {
      await createClient(clientData);
    }
  };

  // Handle activity form
  const handleShowActivityForm = (activity?: Activity) => {
    setSelectedActivity(activity);
    setShowActivityForm(true);
  };

  const handleHideActivityForm = () => {
    setSelectedActivity(undefined);
    setShowActivityForm(false);
  };

  const handleActivitySubmit = async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedActivity) {
      await updateActivity(selectedActivity.id, activityData);
    } else {
      await createActivity(activityData);
    }
  };

  // Handle monitor form
  const handleShowMonitorForm = (monitor?: Monitor) => {
    setSelectedMonitor(monitor);
    setShowMonitorForm(true);
  };

  const handleHideMonitorForm = () => {
    setSelectedMonitor(undefined);
    setShowMonitorForm(false);
  };

  const handleMonitorSubmit = async (monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedMonitor) {
      await updateMonitor(selectedMonitor.id, monitorData);
    } else {
      await createMonitor(monitorData);
    }
  };

  // Handle booking form
  const handleShowBookingForm = (booking?: Booking) => {
    setSelectedBooking(booking);
    setShowBookingForm(true);
  };

  const handleHideBookingForm = () => {
    setSelectedBooking(undefined);
    setShowBookingForm(false);
  };

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedBooking) {
      await updateBooking(selectedBooking.id, bookingData);
    } else {
      await createBooking(bookingData);
    }
  };

  const handleShowInvoiceForm = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setShowInvoiceForm(true);
  };

  const handleHideInvoiceForm = () => {
    setSelectedInvoice(null);
    setShowInvoiceForm(false);
  };

  const handleInvoiceSubmit = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => {
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, invoiceData, items);
    } else {
      await createInvoice(invoiceData, items);
    }
  };

  // Render loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{state.error}</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Ingresos Totales</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {state.invoices
                      .filter(invoice => invoice.status === 'paid')
                      .reduce((sum, invoice) => {
                        const subtotal = invoice.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
                        const ivaPercentage = state.settings.iva_percentage || 21;
                        const tax = subtotal * (ivaPercentage / 100);
                        return sum + subtotal + tax;
                      }, 0)
                      .toFixed(2)} €
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Facturas Pendientes</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {state.invoices
                      .filter(invoice => invoice.status === 'pending')
                      .reduce((sum, invoice) => {
                        const subtotal = invoice.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
                        const ivaPercentage = state.settings.iva_percentage || 21;
                        const tax = subtotal * (ivaPercentage / 100);
                        return sum + subtotal + tax;
                      }, 0)
                      .toFixed(2)} €
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Facturas</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {state.invoices.length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bookings':
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
              <button
                onClick={() => handleShowBookingForm()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nueva Reserva
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {state.bookings.map(booking => {
                  const client = state.clients.find(c => c.id === booking.client_id);
                  const activity = state.activities.find(a => a.id === booking.activity_id);
                  const monitor = state.monitors.find(m => m.id === booking.monitor_id);
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800'
                  };
                  const statusText = {
                    pending: 'Pendiente',
                    confirmed: 'Confirmada',
                    cancelled: 'Cancelada'
                  };

                  return (
                    <li key={booking.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {client?.name} - {activity?.name}
                            </p>
                            <p className={`ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                              {statusText[booking.status]}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <button
                              onClick={() => handleShowBookingForm(booking)}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className="ml-4 font-medium text-red-600 hover:text-red-500"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {booking.date} {booking.time}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              Monitor: {monitor?.name}
                            </p>
                          </div>
                        </div>
                        {booking.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      case 'clients':
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
              <button
                onClick={() => handleShowClientForm()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nuevo Cliente
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {state.clients.map(client => (
                  <li key={client.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">{client.name}</p>
                          <p className="ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {client.email}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleShowClientForm(client)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="ml-4 font-medium text-red-600 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {client.phone}
                          </p>
                          {client.address && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {client.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'activities':
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Actividades</h2>
              <button
                onClick={() => handleShowActivityForm()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nueva Actividad
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {state.activities.map(activity => (
                  <li key={activity.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">{activity.name}</p>
                          <p className="ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {activity.type}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleShowActivityForm(activity)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="ml-4 font-medium text-red-600 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {activity.price.toFixed(2)} €
                          </p>
                          {activity.duration && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {activity.duration} minutos
                            </p>
                          )}
                          {activity.max_participants && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              Máx. {activity.max_participants} participantes
                            </p>
                          )}
                        </div>
                      </div>
                      {activity.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'monitors':
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Monitores</h2>
              <button
                onClick={() => handleShowMonitorForm()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nuevo Monitor
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {state.monitors.map(monitor => (
                  <li key={monitor.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">{monitor.name}</p>
                          <p className="ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {monitor.specialty}
                          </p>
                          {!monitor.active && (
                            <p className="ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Inactivo
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleShowMonitorForm(monitor)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteMonitor(monitor.id)}
                            className="ml-4 font-medium text-red-600 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {monitor.email}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {monitor.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Facturas</h2>
              <button
                onClick={() => handleShowInvoiceForm()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nueva Factura
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {state.invoices.map((invoice) => (
                  <li key={invoice.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Factura #{invoice.number}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status === 'paid' ? 'Pagada' :
                               invoice.status === 'cancelled' ? 'Cancelada' :
                               'Pendiente'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleShowInvoiceForm(invoice)}
                            className="font-medium text-indigo-600 hover:text-indigo-500 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Cliente: {state.clients.find(c => c.id === invoice.client_id)?.name}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Fecha: {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {invoice.notes}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
            {/* TODO: Implement settings form */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Mario Surf</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => handleSectionChange('dashboard')}
                  className={`${
                    activeSection === 'dashboard'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleSectionChange('calendar')}
                  className={`${
                    activeSection === 'calendar'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Calendario
                </button>
                <button
                  onClick={() => handleSectionChange('bookings')}
                  className={`${
                    activeSection === 'bookings'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Reservas
                </button>
                <button
                  onClick={() => handleSectionChange('activities')}
                  className={`${
                    activeSection === 'activities'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Actividades
                </button>
                <button
                  onClick={() => handleSectionChange('clients')}
                  className={`${
                    activeSection === 'clients'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => handleSectionChange('invoices')}
                  className={`${
                    activeSection === 'invoices'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Facturas
                </button>
                <button
                  onClick={() => handleSectionChange('monitors')}
                  className={`${
                    activeSection === 'monitors'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Monitores
                </button>
                <button
                  onClick={() => handleSectionChange('reports')}
                  className={`${
                    activeSection === 'reports'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Informes
                </button>
                <button
                  onClick={() => handleSectionChange('settings')}
                  className={`${
                    activeSection === 'settings'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          client={selectedClient}
          onSubmit={handleClientSubmit}
          onCancel={handleHideClientForm}
        />
      )}

      {/* Activity Form Modal */}
      {showActivityForm && (
        <ActivityForm
          activity={selectedActivity}
          onSubmit={handleActivitySubmit}
          onCancel={handleHideActivityForm}
        />
      )}

      {/* Monitor Form Modal */}
      {showMonitorForm && (
        <MonitorForm
          monitor={selectedMonitor}
          onSubmit={handleMonitorSubmit}
          onCancel={handleHideMonitorForm}
        />
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          booking={selectedBooking}
          clients={state.clients}
          activities={state.activities}
          monitors={state.monitors}
          onSubmit={handleBookingSubmit}
          onCancel={handleHideBookingForm}
        />
      )}

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <InvoiceForm
          invoice={selectedInvoice || undefined}
          clients={state.clients}
          activities={state.activities}
          onSubmit={handleInvoiceSubmit}
          onCancel={handleHideInvoiceForm}
        />
      )}
    </div>
  );
} 