import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarChart, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import type { Invoice, Expense } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Array<{
    month: number;
    income: number;
    expenses: number;
  }>>([]);

  useEffect(() => {
    generateFinancialReport();
  }, [year]);

  const generateFinancialReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener facturas del año seleccionado
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('status', 'paid')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

      if (invoicesError) throw new Error(`Error al obtener facturas: ${invoicesError.message}`);

      // Obtener gastos del año seleccionado
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

      if (expensesError) throw new Error(`Error al obtener gastos: ${expensesError.message}`);

      // Inicializar datos mensuales
      const monthlyData = Array(12).fill(0).map((_, i) => ({
        month: i + 1,
        income: 0,
        expenses: 0
      }));

      // Procesar facturas
      invoices?.forEach(invoice => {
        if (!invoice.invoice_items) return;
        const month = new Date(invoice.date).getMonth();
        const total = invoice.invoice_items.reduce((sum: number, item: any) => 
          sum + (item.quantity * item.price), 0);
        monthlyData[month].income += total;
      });

      // Procesar gastos
      expenses?.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        monthlyData[month].expenses += expense.amount;
      });

      setMonthlyData(monthlyData);
    } catch (err: any) {
      console.error('Error in generateFinancialReport:', err);
      setError(`Error al generar el informe: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const chartData = {
    labels: monthlyData.map(data => getMonthName(data.month)),
    datasets: [
      {
        label: 'Ingresos',
        data: monthlyData.map(data => data.income),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Gastos',
        data: monthlyData.map(data => data.expenses),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Informe Financiero ${year}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value.toFixed(2)} €`
        }
      }
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faBarChart} className="w-7 h-7 text-gray-700" />
            Informes Financieros
          </h1>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-1 bg-white shadow-sm">
            <button
              aria-label="Año anterior"
              onClick={() => setYear((prev) => prev - 1)}
              className="text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
              style={{ padding: 0, background: 'none' }}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
            </button>
            <span className="mx-4 text-base font-semibold text-gray-800 select-none" style={{ minWidth: 48 }}>
              {year}
            </span>
            <button
              aria-label="Año siguiente"
              onClick={() => setYear((prev) => prev + 1)}
              className="text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
              style={{ padding: 0, background: 'none' }}
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <Line options={chartOptions} data={chartData} />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gastos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyData.map((data) => (
                      <tr key={data.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getMonthName(data.month)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {data.income.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {data.expenses.toFixed(2)} €
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          data.income - data.expenses >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(data.income - data.expenses).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 