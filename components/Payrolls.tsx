import { useState, useEffect } from 'react';
import { supabase, Payroll, Monitor } from '../lib/supabase';
import PayrollModal from './PayrollModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEuro } from '@fortawesome/free-solid-svg-icons';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Payrolls() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: payrollsData } = await supabase.from('payrolls').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    const { data: monitorsData } = await supabase.from('monitors').select('*');
    setPayrolls(payrollsData || []);
    setMonitors(monitorsData || []);
    setLoading(false);
  };

  const handleSave = async (payrollData: Omit<Payroll, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedPayroll) {
      await supabase.from('payrolls').update(payrollData).eq('id', selectedPayroll.id);
    } else {
      await supabase.from('payrolls').insert([payrollData]);
    }
    await fetchData();
    setIsModalOpen(false);
    setSelectedPayroll(null);
  };

  const handleEdit = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta nómina?')) return;
    await supabase.from('payrolls').delete().eq('id', id);
    await fetchData();
  };

  const handleStatusChange = async (id: number, paid: boolean) => {
    await supabase.from('payrolls').update({ paid }).eq('id', id);
    await fetchData();
  };

  const updateStatus = async (payroll: Payroll, newStatus: string) => {
    const paid = newStatus === 'paid';
    const { error, data } = await supabase
      .from('payrolls')
      .update({ paid })
      .eq('id', payroll.id)
      .select();
    if (!error && data) {
      setPayrolls(payrolls.map(p => p.id === payroll.id ? { ...p, paid } : p));
    }
  };

  const filtered = payrolls.filter(p => {
    const monitor = monitors.find(m => m.id === p.employee_id);
    const term = searchTerm.toLowerCase();
    const matchesText =
      (monitor?.name.toLowerCase().includes(term) ?? false) ||
      String(p.year).includes(term) ||
      MONTHS[p.month - 1].toLowerCase().includes(term);
    return matchesText;
  });

  const getMonitorName = (id: number) => monitors.find(m => m.id === id)?.name || '';
  const getBase = (p: Payroll) => p.hours_worked * p.hourly_rate;
  const getTotal = (p: Payroll) => getBase(p) + p.bonus - p.deductions;

  if (loading) return <div className="p-4">Cargando nóminas...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faEuro} className="w-7 h-7 text-gray-700" />
            Nóminas
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            + Nueva Nómina
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar nóminas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Periodo</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Monitor</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Horas</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tarifa/h</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Base</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(payroll => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{MONTHS[payroll.month - 1]} {payroll.year}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{getMonitorName(payroll.employee_id)}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm">{payroll.hours_worked}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm">{payroll.hourly_rate.toFixed(2)} €/h</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm">{getBase(payroll).toFixed(2)} €</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm">{getTotal(payroll).toFixed(2)} €</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm">
                      <select
                        value={payroll.paid ? 'paid' : 'pending'}
                        onChange={e => updateStatus(payroll, e.target.value)}
                        className={
                          payroll.paid
                            ? 'bg-green-100 text-green-800 px-2 py-1 rounded font-semibold'
                            : 'bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold'
                        }
                        style={{ minWidth: 110 }}
                      >
                        <option value="paid">Pagado</option>
                        <option value="pending">Pendiente</option>
                      </select>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(payroll)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(payroll.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isModalOpen && (
          <PayrollModal
            payroll={selectedPayroll}
            monitors={monitors}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedPayroll(null);
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 