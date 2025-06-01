import { useState, useEffect } from 'react';
import { supabase, Invoice, Client, Activity, Settings, InvoiceItem } from '../lib/supabase';
import InvoiceModal from './InvoiceModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: invoicesData } = await supabase.from('invoices').select('*, items:invoice_items(*)').order('date', { ascending: false });
    const { data: clientsData } = await supabase.from('clients').select('*');
    const { data: activitiesData } = await supabase.from('activities').select('*');
    const { data: settingsData } = await supabase.from('settings').select('*').single();
    setInvoices(invoicesData || []);
    setClients(clientsData || []);
    setActivities(activitiesData || []);
    setSettings(settingsData || null);
    setIsLoading(false);
  };

  const handleAdd = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) setInvoices(invoices.filter(i => i.id !== id));
  };

  const handleSave = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => {
    if (selectedInvoice) {
      // Editar
      const { error, data } = await supabase.from('invoices').update(invoiceData).eq('id', selectedInvoice.id).select();
      if (!error && data) setInvoices(invoices.map(i => i.id === selectedInvoice.id ? { ...data[0], items } : i));
    } else {
      // Crear
      const { error, data } = await supabase.from('invoices').insert([invoiceData]).select();
      if (!error && data) setInvoices([...invoices, { ...data[0], items }]);
    }
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const filtered = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.client_id);
    const term = searchTerm.toLowerCase();
    return (
      inv.number.toLowerCase().includes(term) ||
      (client?.name.toLowerCase().includes(term) ?? false)
    );
  });

  const getClientName = (id: number) => clients.find(c => c.id === id)?.name || '';
  const getTotal = (invoice: Invoice) => {
    if (!invoice.items) return '0.00';
    const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return total.toFixed(2);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" />
            </svg>
            Facturación
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Factura
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar facturas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nº Factura</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cliente</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Importe</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.number}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{getClientName(invoice.client_id)}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.date ? new Date(invoice.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{getTotal(invoice)} €</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.status}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(invoice)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                      <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isModalOpen && settings && (
          <InvoiceModal
            invoice={selectedInvoice}
            clients={clients}
            settings={settings}
            onClose={() => { setIsModalOpen(false); setSelectedInvoice(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 