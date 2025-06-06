import React, { useState, useEffect, useRef } from 'react';
import { Invoice, InvoiceItem, Client, Settings } from '../lib/supabase';
import { useAppContext } from '../contexts/AppContext';
import { TrashIcon, PrinterIcon } from '@heroicons/react/24/solid';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ApiClient } from '../lib/api';
import { generateNextInvoiceNumber } from '../lib/data';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => Promise<void>;
}

export default function InvoiceModal({ invoice, onClose, onSave }: InvoiceModalProps) {
  const { state } = useAppContext();
  const { clients, settings } = state;
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>({
    number: '',
    client_id: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    iva_percentage: settings?.iva_percentage || 21,
    notes: ''
  });

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'created_at'>[]>([]);
  const [clientQuery, setClientQuery] = useState('');
  const filteredClients = clientQuery === ''
    ? clients
    : clients.filter(client =>
        client.name.toLowerCase().includes(clientQuery.toLowerCase())
      );

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
      // Generar número de factura automáticamente
      const fetchNextNumber = async () => {
        const lastNumber = await ApiClient.getLastInvoiceNumber();
        const currentYear = new Date().getFullYear();
        const nextNumber = generateNextInvoiceNumber(lastNumber, 'INV', currentYear);
        setFormData(prev => ({
          ...prev,
          number: nextNumber,
          iva_percentage: settings?.iva_percentage || 21
        }));
      };
      fetchNextNumber();
      setItems([{ description: '', quantity: 1, price: 0, invoice_id: 0 }]);
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

  const getSubtotal = () => {
    const total = getTotal();
    return total / (1 + (formData.iva_percentage / 100));
  };

  const getIVA = () => {
    const total = getTotal();
    const subtotal = getSubtotal();
    return total - subtotal;
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    const selectedClient = clients.find(c => c.id === formData.client_id);
    
    // Add company info
    doc.setFontSize(20);
    doc.text(settings.company_name || 'Company Name', 20, 20);
    doc.setFontSize(10);
    doc.text(settings.company_address || '', 20, 30);
    doc.text(`Tel: ${settings.company_phone || ''}`, 20, 35);
    doc.text(`Email: ${settings.company_email || ''}`, 20, 40);

    // Add invoice info
    doc.setFontSize(16);
    doc.text('FACTURA', 150, 20);
    doc.setFontSize(10);
    doc.text(`Número: ${formData.number}`, 150, 30);
    doc.text(`Fecha: ${new Date(formData.date).toLocaleDateString()}`, 150, 35);
    doc.text(`Estado: ${formData.status === 'paid' ? 'Pagada' : 'Pendiente'}`, 150, 40);

    // Add client info
    doc.setFontSize(12);
    doc.text('Cliente:', 20, 60);
    doc.setFontSize(10);
    doc.text(selectedClient?.name || '', 20, 70);
    doc.text(selectedClient?.address || '', 20, 75);
    doc.text(`DNI: ${selectedClient?.dni || ''}`, 20, 80);

    // Add items table
    const tableColumn = ['Descripción', 'Cantidad', 'Precio', 'Total'];
    const tableRows = items.map(item => [
      item.description,
      item.quantity.toString(),
      `${item.price.toFixed(2)} €`,
      `${(item.quantity * item.price).toFixed(2)} €`
    ]);

    // Add totals
    const subtotal = getSubtotal();
    const iva = getIVA();
    const total = getTotal();

    tableRows.push(['', '', 'Subtotal:', `${subtotal.toFixed(2)} €`]);
    tableRows.push(['', '', `IVA (${formData.iva_percentage}%):`, `${iva.toFixed(2)} €`]);
    tableRows.push(['', '', 'Total:', `${total.toFixed(2)} €`]);

    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
      footStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });

    // Add notes if any
    if (formData.notes) {
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      doc.setFontSize(10);
      doc.text('Notas:', 20, finalY + 10);
      doc.text(formData.notes, 20, finalY + 20);
    }

    // Open PDF in new window for printing
    doc.output('dataurlnewwindow');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.15)] transition-opacity" aria-hidden="true" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6" onClick={e => e.stopPropagation()} ref={modalRef}>
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
                {invoice ? 'Editar Factura' : 'Nueva Factura'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium leading-6 text-gray-900">Número</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="number"
                        value={formData.number}
                        onChange={e => setFormData({ ...formData, number: e.target.value })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="client" className="block text-sm font-medium leading-6 text-gray-900">Cliente</label>
                    <div className="mt-2">
                      <Combobox value={clients.find(c => c.id === formData.client_id) || null} onChange={client => setFormData({ ...formData, client_id: client?.id || 0 })}>
                        <div className="relative">
                          <Combobox.Input
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            displayValue={(client: Client | null) => client ? client.name : ''}
                            onChange={e => setClientQuery(e.target.value)}
                            placeholder="Seleccionar cliente"
                            id="client"
                            required
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </Combobox.Button>
                          {filteredClients.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {filteredClients.map(client => (
                                <Combobox.Option
                                  key={client.id}
                                  value={client}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`
                                  }
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{client.name}</span>
                                      {selected ? (
                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))}
                            </Combobox.Options>
                          )}
                        </div>
                      </Combobox>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">Fecha</label>
                    <div className="mt-2">
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Estado</label>
                    <div className="mt-2">
                      <select
                        id="status"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as 'pending' | 'paid' | 'cancelled' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium leading-6 text-gray-900">Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Añadir Item
                    </button>
                  </div>
                  <div className="flex gap-4 mb-2 text-sm text-gray-500 font-medium">
                    <div className="flex-1">Descripción</div>
                    <div className="w-24 text-center">Unidades</div>
                    <div className="w-32 text-center">Precio</div>
                    <div className="w-28"></div>
                  </div>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => updateItem(index, 'description', e.target.value)}
                            placeholder="Descripción"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                            placeholder="Cantidad"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                            min="1"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            value={item.price}
                            onChange={e => updateItem(index, 'price', Number(e.target.value))}
                            placeholder="Precio"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    ))}
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

                <div className="mt-6 flex items-center justify-between border-t border-gray-200 gap-4">
                  {/* Mostrar info del cliente seleccionado */}
                  {formData.client_id !== 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200 flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
                      <div>                        
                        <div className="text-base text-gray-900 font-bold">{clients.find(c => c.id === formData.client_id)?.name || ''}</div>
                        <div className="text-sm text-gray-600">{clients.find(c => c.id === formData.client_id)?.address || ''}</div>
                      </div>
                      <div className="text-right md:min-w-[180px]">
                        <div className="text-sm text-gray-600">Subtotal: {getSubtotal().toFixed(2)} €</div>
                        <div className="text-sm text-gray-600">IVA ({formData.iva_percentage}%): {getIVA().toFixed(2)} €</div>
                        <div className="text-lg font-semibold text-gray-900">Total: {getTotal().toFixed(2)} €</div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 w-full">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                    >
                      <PrinterIcon className="h-5 w-5 inline-block mr-1" />
                      Imprimir
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
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