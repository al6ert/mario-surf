import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Client, Settings } from '../lib/supabase';
import { useAppContext } from '../contexts/AppContext';
import { TrashIcon } from '@heroicons/react/24/solid';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => Promise<void>;
}

export default function InvoiceModal({ invoice, onClose, onSave }: InvoiceModalProps) {
  const { state } = useAppContext();
  const { clients, settings } = state;

  const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>({
    number: '',
    client_id: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    iva_percentage: settings?.iva_percentage || 21,
    notes: ''
  });

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'created_at'>[]>([]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        number: invoice.number,
        client_id: invoice.client_id,
        date: invoice.date,
        status: invoice.status,
        iva_percentage: invoice.iva_percentage,
        notes: invoice.notes || ''
      });
      setItems(invoice.items || []);
    } else {
      // Generar número de factura
      const nextNumber = `${settings?.invoice_prefix || 'INV'}-${String(settings?.invoice_sequence || 1).padStart(4, '0')}`;
      setFormData(prev => ({
        ...prev,
        number: nextNumber
      }));
    }
  }, [invoice, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, items);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, invoice_id: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const getTotalWithIVA = () => {
    const total = getTotal();
    return total + (total * (formData.iva_percentage / 100));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {invoice ? 'Editar Factura' : 'Nueva Factura'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número</label>
              <input
                type="text"
                value={formData.number}
                onChange={e => setFormData({ ...formData, number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <select
                value={formData.client_id}
                onChange={e => setFormData({ ...formData, client_id: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'pending' | 'paid' | 'cancelled' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Añadir Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                    placeholder="Descripción"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                    placeholder="Cantidad"
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={e => updateItem(index, 'price', Number(e.target.value))}
                    placeholder="Precio"
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-right">
              <div className="text-sm text-gray-600">Subtotal: {getTotal().toFixed(2)} €</div>
              <div className="text-sm text-gray-600">IVA ({formData.iva_percentage}%): {(getTotal() * formData.iva_percentage / 100).toFixed(2)} €</div>
              <div className="text-lg font-bold">Total: {getTotalWithIVA().toFixed(2)} €</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 