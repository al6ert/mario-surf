import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PayrollModal from '../components/PayrollModal';
import { Payroll, Monitor } from '../lib/supabase';

// Mock data
const mockMonitors: Monitor[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    specialty: 'Surf',
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987654321',
    specialty: 'Yoga',
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

const mockPayroll: Payroll = {
  id: 1,
  monitor_id: 1,
  hours_worked: 40,
  hourly_rate: 15,
  bonus: 100,
  deductions: 50,
  date: '2024-03-01',
  year: 2024,
  month: 3,
  paid: false,
  notes: 'Test notes',
  created_at: '2024-03-01',
  updated_at: '2024-03-01'
};

describe('PayrollModal', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with initial state', () => {
    render(
      <PayrollModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        monitors={mockMonitors}
      />
    );

    expect(screen.getByText('Nueva Nómina')).toBeInTheDocument();
    expect(screen.getByLabelText('Monitor')).toBeInTheDocument();
    expect(screen.getByLabelText('Horas Trabajadas')).toBeInTheDocument();
    expect(screen.getByLabelText('Tarifa por Hora')).toBeInTheDocument();
  });

  it('should display monitor names in the select dropdown', () => {
    render(
      <PayrollModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        monitors={mockMonitors}
      />
    );

    const monitorSelect = screen.getByLabelText('Monitor');
    fireEvent.click(monitorSelect);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should populate form with payroll data when editing', () => {
    render(
      <PayrollModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        payroll={mockPayroll}
        monitors={mockMonitors}
      />
    );

    expect(screen.getByText('Editar Nómina')).toBeInTheDocument();
    expect(screen.getByLabelText('Horas Trabajadas')).toHaveValue(40);
    expect(screen.getByLabelText('Tarifa por Hora')).toHaveValue(15);
    expect(screen.getByLabelText('Bonus')).toHaveValue(100);
    expect(screen.getByLabelText('Deducciones')).toHaveValue(50);
  });

  it('should call onSave with correct data when submitting', async () => {
    render(
      <PayrollModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        monitors={mockMonitors}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Monitor'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Horas Trabajadas'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Tarifa por Hora'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Bonus'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Deducciones'), { target: { value: '50' } });

    // Submit the form
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        monitor_id: 1,
        hours_worked: 40,
        hourly_rate: 15,
        bonus: 100,
        deductions: 50
      }));
    });
  });

  it('should calculate and display total correctly', () => {
    render(
      <PayrollModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        payroll={mockPayroll}
        monitors={mockMonitors}
      />
    );

    // Base salary: 40 * 15 = 600
    // Bonus: 100
    // Deductions: 50
    // Total: 600 + 100 - 50 = 650
    expect(screen.getByText('Total: 650.00 €')).toBeInTheDocument();
  });

  it('should handle monitor selection correctly', () => {
    render(
      <PayrollModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        monitors={mockMonitors}
      />
    );

    const monitorSelect = screen.getByLabelText('Monitor');
    fireEvent.change(monitorSelect, { target: { value: '2' } });

    expect(monitorSelect).toHaveValue('2');
  });
}); 