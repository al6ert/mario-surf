import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarChart, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import type { Invoice, Expense, Payroll } from '../lib/supabase';
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
  const [annualIncome, setAnnualIncome] = useState(0);
  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [annualPayroll, setAnnualPayroll] = useState(0);
  const [annualProfit, setAnnualProfit] = useState(0);
  const [payrollsByMonth, setPayrollsByMonth] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    generateFinancialReport();
    fetchAnnualPayrollsByMonth();
  }, [year]);

  const fetchAnnualPayrollsByMonth = async () => {
    try {
      const { data: payrolls, error: payrollsError } = await supabase
        .from('payrolls')
        .select('*')
        .eq('year', year);
      if (payrollsError) throw new Error(payrollsError.message);
      const byMonth = Array(12).fill(0);
      (payrolls || []).forEach((p: Payroll) => {
        const idx = (p.month || 1) - 1;
        byMonth[idx] += (p.hours_worked * p.hourly_rate + p.bonus - p.deductions);
      });
      setPayrollsByMonth(byMonth);
      // También actualiza el total anual de nóminas
      setAnnualPayroll(byMonth.reduce((a, b) => a + b, 0));
    } catch (err) {
      setPayrollsByMonth(Array(12).fill(0));
      setAnnualPayroll(0);
    }
  };

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
      const baseMonthlyData = Array(12).fill(0).map((_, i) => ({
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
        baseMonthlyData[month].income += total;
      });
      // Procesar gastos
      expenses?.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        baseMonthlyData[month].expenses += expense.amount;
      });
      setMonthlyData(baseMonthlyData); // Ahora solo gastos directos
    } catch (err: any) {
      console.error('Error in generateFinancialReport:', err);
      setError(`Error al generar el informe: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Combina monthlyData y payrollsByMonth en un useEffect
  const [finalMonthlyData, setFinalMonthlyData] = useState(monthlyData);
  useEffect(() => {
    // Suma payrollsByMonth a los gastos mensuales
    const combined = monthlyData.map((m, idx) => ({
      ...m,
      expenses: m.expenses + (payrollsByMonth[idx] || 0)
    }));
    setFinalMonthlyData(combined);
  }, [monthlyData, payrollsByMonth]);

  // Calcula los KPIs anuales a partir de finalMonthlyData
  useEffect(() => {
    const totalIncome = finalMonthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = finalMonthlyData.reduce((sum, m) => sum + m.expenses, 0);
    setAnnualIncome(totalIncome);
    setAnnualExpenses(totalExpenses);
    setAnnualProfit(totalIncome - totalExpenses);
  }, [finalMonthlyData, annualPayroll]);

  // TEST: Comprobar que la suma de la columna GASTOS cuadra con el KPI
  useEffect(() => {
    const sumTable = finalMonthlyData.reduce((sum, m) => sum + m.expenses, 0);
    if (Math.abs(sumTable - annualExpenses) > 0.01) {
      console.warn('¡La suma de la columna GASTOS no cuadra con el KPI!', sumTable, annualExpenses);
    }
  }, [finalMonthlyData, annualExpenses]);

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const chartData = {
    labels: finalMonthlyData.map(data => getMonthName(data.month)),
    datasets: [
      {
        label: 'Ingresos',
        data: finalMonthlyData.map(data => data.income),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Gastos',
        data: finalMonthlyData.map(data => data.expenses),
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

        {/* KPIs anuales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ingresos Anuales</h3>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{annualIncome.toFixed(2)} €</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Año {year}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Gastos Anuales</h3>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{(annualExpenses + annualPayroll).toFixed(2)} €</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Año {year}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Beneficio Neto</h3>
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-bold ${annualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{annualProfit.toFixed(2)} €</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Año {year}</p>
          </div>
        </div>

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
                    {finalMonthlyData.map((data) => (
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