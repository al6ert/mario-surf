import React, { useState, useEffect } from 'react';
import { Payroll, Monitor } from '../lib/supabase';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payroll: Partial<Payroll>) => void;
  payroll?: Payroll;
  monitors: Monitor[];
}

export default function PayrollModal({
  isOpen,
  onClose,
  onSave,
  payroll,
  monitors
}: PayrollModalProps) {
  const [formData, setFormData] = useState<Partial<Payroll>>({
    monitor_id: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    hours_worked: 0,
    hourly_rate: 0,
    bonus: 0,
    deductions: 0,
    paid: false
  });

  useEffect(() => {
    if (payroll) {
      setFormData(payroll);
    } else {
      setFormData({
        monitor_id: 0,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        hours_worked: 0,
        hourly_rate: 0,
        bonus: 0,
        deductions: 0,
        paid: false
      });
    }
  }, [payroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {payroll ? 'Editar Nómina' : 'Nueva Nómina'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Monitor</label>
              <select
                value={formData.monitor_id || ''}
                onChange={e => setFormData({ ...formData, monitor_id: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar monitor</option>
                {monitors.map(monitor => (
                  <option key={monitor.id} value={monitor.id}>
                    {monitor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Año</label>
              <input
                type="number"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Mes</label>
              <select
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value={1}>Enero</option>
                <option value={2}>Febrero</option>
                <option value={3}>Marzo</option>
                <option value={4}>Abril</option>
                <option value={5}>Mayo</option>
                <option value={6}>Junio</option>
                <option value={7}>Julio</option>
                <option value={8}>Agosto</option>
                <option value={9}>Septiembre</option>
                <option value={10}>Octubre</option>
                <option value={11}>Noviembre</option>
                <option value={12}>Diciembre</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Horas Trabajadas</label>
              <input
                type="number"
                value={formData.hours_worked}
                onChange={e => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Tarifa por Hora</label>
              <input
                type="number"
                value={formData.hourly_rate}
                onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Bonus</label>
              <input
                type="number"
                value={formData.bonus}
                onChange={e => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Deducciones</label>
              <input
                type="number"
                value={formData.deductions}
                onChange={e => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.paid}
                  onChange={e => setFormData({ ...formData, paid: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Pagado</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 