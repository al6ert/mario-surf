import React, { useState } from 'react';
import type { Invoice, InvoiceItem, Client, Activity } from '../lib/supabase';

interface InvoiceFormProps {
  invoice?: Invoice;
  clients: Client[];
  activities: Activity[];
  onSubmit: (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => Promise<void>;
  onCancel: () => void;
}

type InvoiceItemForm = Omit<InvoiceItem, 'id' | 'created_at'>;

export default function InvoiceForm({ invoice, clients, activities, onSubmit, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InvoiceItemForm[]>(
    invoice?.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      invoice_id: item.invoice_id
    })) || [{ description: '', quantity: 1, price: 0, invoice_id: 0 }]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const invoiceData = {
      number: formData.get('number') as string,
      client_id: parseInt(formData.get('client_id') as string),
      date: formData.get('date') as string,
      status: formData.get('status') as 'pending' | 'paid' | 'cancelled',
      notes: formData.get('notes') as string,
      items: [] // This will be populated by the API
    };

    try {
      await onSubmit(invoiceData, items);
      onCancel();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, invoice_id: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemForm, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {invoice ? 'Editar Factura' : 'Nueva Factura'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                Número de Factura *
              </label>
              <input
                type="text"
                name="number"
                id="number"
                required
                defaultValue={invoice?.number}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                Cliente *
              </label>
              <select
                name="client_id"
                id="client_id"
                required
                defaultValue={invoice?.client_id}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Fecha de Emisión *
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                defaultValue={invoice?.date}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado *
              </label>
              <select
                name="status"
                id="status"
                required
                defaultValue={invoice?.status}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Añadir Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Descripción del item"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">
                      {(item.quantity * item.price).toFixed(2)} €
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Subtotal:</p>
                  <p className="text-lg font-medium text-gray-900">{calculateSubtotal().toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              defaultValue={invoice?.notes}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 