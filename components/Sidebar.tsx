import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDashboard, faCalendar, faBook, faBicycle, faUsers, faFileText, faMoneyBill, faUserSecret, faEuro, faBarChart, faCog } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col py-8 px-4">
      <div className="text-2xl font-bold mb-8 tracking-wide">SGTA</div>
      <nav className="flex-1 space-y-1">
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('dashboard')}
        >
          <FontAwesomeIcon icon={faDashboard} /> Dashboard
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'calendar' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('calendar')}
        >
          <FontAwesomeIcon icon={faCalendar} /> Calendario
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'bookings' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('bookings')}
        >
          <FontAwesomeIcon icon={faBook} /> Reservas
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'activities' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('activities')}
        >
          <FontAwesomeIcon icon={faBicycle} /> Actividades
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'clients' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('clients')}
        >
          <FontAwesomeIcon icon={faUsers} /> Clientes
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'invoices' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('invoices')}
        >
          <FontAwesomeIcon icon={faFileText} /> Facturación
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'expenses' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('expenses')}
        >
          <FontAwesomeIcon icon={faMoneyBill} /> Gastos
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'monitors' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('monitors')}
        >
          <FontAwesomeIcon icon={faUserSecret} /> Monitores
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'payroll' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('payroll')}
        >
          <FontAwesomeIcon icon={faEuro} /> Nóminas
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'reports' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('reports')}
        >
          <FontAwesomeIcon icon={faBarChart} /> Informes
        </button>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'setup' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} 
          onClick={() => onSectionChange('setup')}
        >
          <FontAwesomeIcon icon={faCog} /> Configuración
        </button>
      </nav>
    </aside>
  );
} 