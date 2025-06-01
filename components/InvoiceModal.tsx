import { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Client, Activity, Settings } from '../lib/supabase';
import { TrashIcon } from '@heroicons/react/24/solid';

interface InvoiceModalProps {
  invoice: Invoice | null;
  clients: Client[];
  settings: Settings;
  onClose: () => void;
  onSave: (
    invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<InvoiceItem, 'id' | 'created_at'>[]
  ) => void;
}

type InvoiceItemForm = Omit<InvoiceItem, 'id' | 'created_at'>;

export default function InvoiceModal({ invoice, clients, settings, onClose, onSave }: InvoiceModalProps) {
  const [formData, setFormData] = useState({
    number: '',
    client_id: '',
    date: '',
    status: 'pending',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItemForm[]>([
    { description: '', quantity: 1, price: 0, invoice_id: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        number: invoice.number,
        client_id: invoice.client_id.toString(),
        date: invoice.date,
        status: invoice.status,
        notes: invoice.notes || '',
      });
      setItems(
        invoice.items && invoice.items.length > 0
          ? invoice.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              invoice_id: item.invoice_id,
            }))
          : [{ description: '', quantity: 1, price: 0, invoice_id: 0 }]
      );
    } else if (!formData.number) {
      const year = new Date().getFullYear();
      const seq = String(settings.invoice_sequence).padStart(3, '0');
      const prefix = settings.invoice_prefix || 'FAC';
      setFormData(prev => ({
        ...prev,
        number: `${prefix}-${year}-${seq}`
      }));
    }
  }, [invoice, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemForm, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, invoice_id: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    const ivaFactor = 1 + (settings.iva_percentage || 21) / 100;
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return total / ivaFactor;
  };

  const calculateIVA = () => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return total - calculateSubtotal();
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSave(
      {
        number: formData.number,
        client_id: parseInt(formData.client_id),
        date: formData.date,
        status: formData.status as 'pending' | 'paid' | 'cancelled',
        notes: formData.notes,
        items: [],
      },
      items
    );
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.15)] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto my-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {invoice ? 'Editar Factura' : 'Nueva Factura'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente:</label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de factura:</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Líneas de factura</h3>
            {items.map((item, idx) => (
              <div key={idx} className="mb-4">
                <div className="hidden md:grid md:[grid-template-columns:3fr_1fr_1fr_42px] gap-2 mb-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad:</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">Precio unitario (€):</label>
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-1 md:[grid-template-columns:3fr_1fr_1fr_42px] gap-2 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 md:hidden">Descripción:</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 md:hidden">Cantidad:</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 md:hidden whitespace-nowrap">Precio unitario (€):</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.price}
                      onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-end h-full w-[42px] min-w-[42px]">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="flex items-center justify-center"
                      title="Eliminar línea"
                      style={{ width: 42, height: 42, minWidth: 42, minHeight: 42 }}
                    >
                      <TrashIcon className="w-7 h-7 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              + Añadir línea
            </button>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-8 bg-gray-50 rounded-lg p-4 flex flex-col gap-2 max-w-sm">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{calculateSubtotal().toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA ({settings.iva_percentage || 21}%):</span>
              <span>{calculateIVA().toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{calculateTotal().toFixed(2)} €</span>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Guardar Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 