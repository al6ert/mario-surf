import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import type { Client, Activity, Monitor, Booking, Invoice, Expense, Payroll, Settings } from '../lib/supabase';
import DashboardMetrics from './dashboard/DashboardMetrics';
import TodayBookings from './dashboard/TodayBookings';
import UpcomingBookings from './dashboard/UpcomingBookings';
import UnpaidInvoices from './dashboard/UnpaidInvoices';
import MonitorHours from './dashboard/MonitorHours';
import ActivityHours from './dashboard/ActivityHours';

interface DashboardProps {
  bookings: Booking[];
  activities: Activity[];
  monitors: Monitor[];
  clients: Client[];
  invoices: Invoice[];
  expenses: Expense[];
  payrolls: Payroll[];
  settings: Settings;
}

export default function Dashboard({ 
  bookings, 
  activities, 
  monitors, 
  clients, 
  invoices,
  expenses,
  payrolls,
  settings 
}: DashboardProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faChartLine} className="w-7 h-7 text-gray-700" />
            Dashboard
          </h1>
        </div>

        {/* Financial Metrics Block */}
        <DashboardMetrics 
          invoices={invoices}
          expenses={expenses}
          payrolls={payrolls}
          settings={settings}
        />

        {/* Bookings Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Reservas de Hoy</h3>
            <TodayBookings
              bookings={bookings}
              clients={clients}
              activities={activities}
              monitors={monitors}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Próximas Reservas</h3>
            <UpcomingBookings
              bookings={bookings}
              clients={clients}
              activities={activities}
              monitors={monitors}
            />
          </div>
        </div>

        {/* Unpaid Invoices Block */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Facturas Pendientes</h3>
          <UnpaidInvoices
            invoices={invoices}
            clients={clients}
          />
        </div>

        {/* Monitor Hours Block + Activity Hours Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Horas de Monitores (últimos 30 días)</h3>
            <MonitorHours
              monitors={monitors}
              bookings={bookings}            
            />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Horas por Actividad (últimos 30 días)</h3>
            <ActivityHours
              activities={activities}
              bookings={bookings}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 