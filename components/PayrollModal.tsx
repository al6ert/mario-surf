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
    paid: false,
    notes: ''
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
        paid: false,
        notes: ''
      });
    }
  }, [payroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getBaseSalary = () => {
    return (formData.hours_worked || 0) * (formData.hourly_rate || 0);
  };

  const getTotal = () => {
    return getBaseSalary() + (formData.bonus || 0) - (formData.deductions || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.15)] transition-opacity" aria-hidden="true" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6" onClick={e => e.stopPropagation()}>
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full sm:mt-0">
              <h3 className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                {payroll ? 'Editar Nómina' : 'Nueva Nómina'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="monitor" className="block text-sm font-medium leading-6 text-gray-900">Monitor</label>
                    <div className="mt-2">
                      <select
                        id="monitor"
                        value={formData.monitor_id || ''}
                        onChange={e => setFormData({ ...formData, monitor_id: Number(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
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
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Estado</label>
                    <div className="mt-2">
                      <select
                        id="status"
                        value={formData.paid ? 'paid' : 'pending'}
                        onChange={e => setFormData({ ...formData, paid: e.target.value === 'paid' })}
                        className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${
                          formData.paid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        <option value="paid">Pagado</option>
                        <option value="pending">Pendiente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium leading-6 text-gray-900">Año</label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="year"
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="month" className="block text-sm font-medium leading-6 text-gray-900">Mes</label>
                    <div className="mt-2">
                      <select
                        id="month"
                        value={formData.month}
                        onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        {MONTHS.map((month, index) => (
                          <option key={index + 1} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="hours_worked" className="block text-sm font-medium leading-6 text-gray-900">Horas Trabajadas</label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="hours_worked"
                        value={formData.hours_worked}
                        onChange={e => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="hourly_rate" className="block text-sm font-medium leading-6 text-gray-900">Tarifa por Hora</label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bonus" className="block text-sm font-medium leading-6 text-gray-900">Bonus</label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="bonus"
                        value={formData.bonus}
                        onChange={e => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="deductions" className="block text-sm font-medium leading-6 text-gray-900">Deducciones</label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="deductions"
                        value={formData.deductions}
                        onChange={e => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">Notas</label>
                  <div className="mt-2">
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Salario Base: {getBaseSalary().toFixed(2)} €</div>
                    {formData.bonus > 0 && <div className="text-sm text-gray-600">Bonus: {formData.bonus.toFixed(2)} €</div>}
                    {formData.deductions > 0 && <div className="text-sm text-gray-600">Deducciones: {formData.deductions.toFixed(2)} €</div>}
                    <div className="text-lg font-semibold text-gray-900">Total: {getTotal().toFixed(2)} €</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 