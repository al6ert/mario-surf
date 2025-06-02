import { useState } from 'react';
import { Monitor } from '../lib/supabase';
import MonitorModal from './MonitorModal';
import { deleteMonitor } from '../lib/data';
import { supabase } from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';

interface MonitorsProps {
  monitors: Monitor[];
  onRefresh: () => void;
}

export default function Monitors({ monitors, onRefresh }: MonitorsProps) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);

  const handleEdit = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setShowModal(true);
  };

  const handleNew = () => {
    setSelectedMonitor(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedMonitor(null);
    setShowModal(false);
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este monitor?')) return;
    await deleteMonitor(id);
    onRefresh();
  };

  const handleSave = async (monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedMonitor) {
      await supabase.from('monitors').update(monitorData).eq('id', selectedMonitor.id);
    } else {
      await supabase.from('monitors').insert([monitorData]);
    }
    handleClose();
  };

  const filtered = monitors.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.toLowerCase().includes(search.toLowerCase()) ||
    m.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faUserSecret} className="w-7 h-7 text-gray-700" />
            Monitores
          </h1>
          <button
            onClick={handleNew}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            + Nuevo Monitor
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar monitores..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nombre</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Especialidad</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(monitor => (
                  <tr key={monitor.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{monitor.name}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{monitor.email}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{monitor.phone}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{monitor.specialty}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm">
                      {monitor.active ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Activo</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">Inactivo</span>
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(monitor)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(monitor.id)}
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
        {showModal && (
          <MonitorModal
            monitor={selectedMonitor}
            onClose={handleClose}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 