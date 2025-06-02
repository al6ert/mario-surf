import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBicycle, faUserSecret, faMoneyBill, faUsers, faCalendar } from '@fortawesome/free-solid-svg-icons';
import type { Client, Activity, Monitor, Booking, Invoice, Settings } from '../lib/supabase';

interface DashboardProps {
  bookings: Booking[];
  activities: Activity[];
  monitors: Monitor[];
  clients: Client[];
  invoices: Invoice[];
  settings: Settings;
}

export default function Dashboard({ bookings, activities, monitors, clients, invoices, settings }: DashboardProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><FontAwesomeIcon icon={faCalendar} /> Dashboard</h1>
        <span className="text-gray-500 text-base">Fecha: {new Date().toLocaleDateString()}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FontAwesomeIcon icon={faBook} /> Reservas Programadas</h3>
          <span className="text-3xl font-bold text-slate-800">{bookings.length}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FontAwesomeIcon icon={faBicycle} /> Actividades Disponibles</h3>
          <span className="text-3xl font-bold text-slate-800">{activities.length}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FontAwesomeIcon icon={faUserSecret} /> Monitores Disponibles</h3>
          <span className="text-3xl font-bold text-slate-800">{monitors.filter(m => m.active).length}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FontAwesomeIcon icon={faMoneyBill} /> Pendientes de Cobro</h3>
          <span className="text-3xl font-bold text-slate-800">
            {invoices.filter(invoice => invoice.status === 'pending').reduce((sum, invoice) => {
              const subtotal = invoice.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
              const ivaPercentage = settings.iva_percentage || 21;
              const tax = subtotal * (ivaPercentage / 100);
              return sum + subtotal + tax;
            }, 0).toFixed(2)} €
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FontAwesomeIcon icon={faUsers} /> Clientes Registrados</h3>
          <span className="text-3xl font-bold text-slate-800">{clients.length}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FontAwesomeIcon icon={faCalendar} /> Reservas de Hoy</h3>
          <span className="text-3xl font-bold text-slate-800">{bookings.filter(booking => new Date(booking.date).toDateString() === new Date().toDateString()).length}</span>
        </div>
      </div>
    </div>
  );
} 