import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faFileText } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import type { Invoice, Expense, Booking, Activity } from '../lib/supabase';

type ReportType = 'monthly-income' | 'monthly-expenses' | 'activity-popularity';

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('monthly-income');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [openType, setOpenType] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const typeButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    generateReport();
  }, [reportType, year]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        typeButtonRef.current &&
        !typeButtonRef.current.contains(event.target as Node)
      ) {
        setOpenType(false);
      }
      if (
        yearButtonRef.current &&
        !yearButtonRef.current.contains(event.target as Node)
      ) {
        setOpenYear(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAvailableYears = async () => {
    try {
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('date')
        .order('date', { ascending: false });

      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('date')
        .order('date', { ascending: false });

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('date')
        .order('date', { ascending: false });

      if (invoicesError || expensesError || bookingsError) throw new Error('Error fetching dates');

      const years = new Set<number>();
      
      invoices?.forEach(invoice => years.add(new Date(invoice.date).getFullYear()));
      expenses?.forEach(expense => years.add(new Date(expense.date).getFullYear()));
      bookings?.forEach(booking => years.add(new Date(booking.date).getFullYear()));

      const sortedYears = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(sortedYears);
      
      if (sortedYears.length > 0) {
        setYear(sortedYears[0]);
      }
    } catch (err) {
      console.error('Error fetching available years:', err);
      setError('Error al cargar los años disponibles');
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (reportType) {
        case 'monthly-income':
          await generateMonthlyIncomeReport();
          break;
        case 'monthly-expenses':
          await generateMonthlyExpensesReport();
          break;
        case 'activity-popularity':
          await generateActivityPopularityReport();
          break;
      }
    } catch (err: any) {
      console.error('Error details:', err);
      setError(`Error al generar el informe: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyIncomeReport = async () => {
    try {
      console.log('Fetching invoices for year:', year);
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('status', 'paid')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error al obtener facturas: ${error.message}`);
      }

      console.log('Invoices found:', invoices);

      if (!invoices || invoices.length === 0) {
        console.log('No invoices found for the selected criteria');
        setReportData([]);
        return;
      }

      const monthlyData = Array(12).fill(0).map((_, i) => ({
        month: i + 1,
        income: 0
      }));

      invoices.forEach(invoice => {
        console.log('Processing invoice:', invoice);
        if (!invoice.invoice_items) {
          console.warn('Factura sin items:', invoice);
          return;
        }
        const month = new Date(invoice.date).getMonth();
        const total = invoice.invoice_items.reduce((sum: number, item: any) => 
          sum + (item.quantity * item.price), 0);
        console.log('Invoice total:', total, 'for month:', month + 1);
        monthlyData[month].income += total;
      });

      console.log('Monthly data:', monthlyData);

      setReportData(monthlyData.map(item => ({
        Mes: getMonthName(item.month),
        Ingresos: `${item.income.toFixed(2)} €`
      })));
    } catch (err: any) {
      console.error('Error in generateMonthlyIncomeReport:', err);
      throw new Error(`Error en informe de ingresos: ${err.message}`);
    }
  };

  const generateMonthlyExpensesReport = async () => {
    try {
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

      if (expensesError) {
        console.error('Supabase error:', expensesError);
        throw new Error(`Error al obtener gastos: ${expensesError.message}`);
      }

      if (!expenses) {
        throw new Error('No se encontraron gastos');
      }

      const monthlyData = Array(12).fill(0).map((_, i) => ({
        month: i + 1,
        expenses: 0
      }));

      expenses.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        monthlyData[month].expenses += expense.amount;
      });

      setReportData(monthlyData.map(item => ({
        Mes: getMonthName(item.month),
        Gastos: `${item.expenses.toFixed(2)} €`
      })));
    } catch (err: any) {
      console.error('Error in generateMonthlyExpensesReport:', err);
      throw new Error(`Error en informe de gastos: ${err.message}`);
    }
  };

  const generateActivityPopularityReport = async () => {
    try {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, activities(*)')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
        .neq('status', 'cancelled');

      if (bookingsError) {
        console.error('Supabase error:', bookingsError);
        throw new Error(`Error al obtener reservas: ${bookingsError.message}`);
      }

      if (!bookings) {
        throw new Error('No se encontraron reservas');
      }

      const activityData = new Map<string, { bookings: number; income: number }>();

      bookings.forEach(booking => {
        const activity = booking.activities;
        if (!activity) {
          console.warn('Reserva sin actividad:', booking);
          return;
        }

        const current = activityData.get(activity.name) || { bookings: 0, income: 0 };
        activityData.set(activity.name, {
          bookings: current.bookings + 1,
          income: current.income + activity.price
        });
      });

      setReportData(Array.from(activityData.entries()).map(([name, data]) => ({
        Actividad: name,
        Reservas: data.bookings,
        Ingresos: `${data.income.toFixed(2)} €`
      })));
    } catch (err: any) {
      console.error('Error in generateActivityPopularityReport:', err);
      throw new Error(`Error en informe de actividades: ${err.message}`);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold flex items-center gap-3 mb-4">
        <FontAwesomeIcon icon={faChartBar} /> Informes
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de informe
            </label>
            <div className="relative inline-block w-full text-left">
              <button
                ref={typeButtonRef}
                type="button"
                className="inline-flex w-full justify-between items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                id="type-menu-button"
                aria-expanded={openType}
                aria-haspopup="true"
                onClick={() => setOpenType((v) => !v)}
              >
                {reportType === 'monthly-income' && 'Ingresos mensuales'}
                {reportType === 'monthly-expenses' && 'Gastos mensuales'}
                {reportType === 'activity-popularity' && 'Popularidad de actividades'}
                <svg className="-mr-1 ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
              {openType && (
                <div className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="type-menu-button" tabIndex={-1}>
                  <div className="py-1" role="none">
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${reportType === 'monthly-income' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      role="menuitem"
                      tabIndex={-1}
                      onMouseDown={() => { setReportType('monthly-income'); setOpenType(false); }}
                    >
                      Ingresos mensuales
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${reportType === 'monthly-expenses' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      role="menuitem"
                      tabIndex={-1}
                      onMouseDown={() => { setReportType('monthly-expenses'); setOpenType(false); }}
                    >
                      Gastos mensuales
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${reportType === 'activity-popularity' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      role="menuitem"
                      tabIndex={-1}
                      onMouseDown={() => { setReportType('activity-popularity'); setOpenType(false); }}
                    >
                      Popularidad de actividades
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <div className="relative inline-block w-full text-left">
              <button
                ref={yearButtonRef}
                type="button"
                className="inline-flex w-full justify-between items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                id="year-menu-button"
                aria-expanded={openYear}
                aria-haspopup="true"
                onClick={() => setOpenYear((v) => !v)}
              >
                {year}
                <svg className="-mr-1 ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
              {openYear && (
                <div className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="year-menu-button" tabIndex={-1}>
                  <div className="py-1" role="none">
                    {availableYears.map((y) => (
                      <button
                        key={y}
                        className={`block w-full text-left px-4 py-2 text-sm ${year === y ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                        role="menuitem"
                        tabIndex={-1}
                        onMouseDown={() => { setYear(y); setOpenYear(false); }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(reportData[0]).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value: string | number, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && reportData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay datos para mostrar en este informe
        </div>
      )}
    </div>
  );
} 