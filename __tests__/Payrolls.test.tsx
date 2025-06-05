import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Payrolls from '../components/Payrolls';
import { AppProvider } from '../contexts/AppContext';
import { ApiClient } from '../lib/api';

// Mock the API client
jest.mock('../lib/api', () => ({
  ApiClient: {
    getPayrolls: jest.fn(),
    updatePayroll: jest.fn(),
    deletePayroll: jest.fn(),
    createPayroll: jest.fn()
  }
}));

// Mock data
const mockPayrolls = [
  {
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
    updated_at: '2024-03-01',
    monitors: {
      name: 'John Doe'
    }
  }
];

const mockMonitors = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    specialty: 'Surf',
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

describe('Payrolls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the API responses
    (ApiClient.getPayrolls as jest.Mock).mockResolvedValue({
      data: mockPayrolls,
      count: 1
    });
  });

  it('should render payrolls list correctly', async () => {
    render(
      <AppProvider>
        <Payrolls />
      </AppProvider>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check if the monitor name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should open modal when clicking edit button', async () => {
    render(
      <AppProvider>
        <Payrolls />
      </AppProvider>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the edit button
    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    // Check if modal is opened with correct data
    await waitFor(() => {
      expect(screen.getByText('Editar Nómina')).toBeInTheDocument();
      expect(screen.getByLabelText('Horas Trabajadas')).toHaveValue(40);
      expect(screen.getByLabelText('Tarifa por Hora')).toHaveValue(15);
    });
  });

  it('should update payroll when saving changes', async () => {
    const updatedPayroll = {
      ...mockPayrolls[0],
      hours_worked: 45,
      hourly_rate: 20
    };

    (ApiClient.updatePayroll as jest.Mock).mockResolvedValue(updatedPayroll);

    render(
      <AppProvider>
        <Payrolls />
      </AppProvider>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open edit modal
    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    // Update form values
    await waitFor(() => {
      const hoursInput = screen.getByLabelText('Horas Trabajadas');
      const rateInput = screen.getByLabelText('Tarifa por Hora');
      
      fireEvent.change(hoursInput, { target: { value: '45' } });
      fireEvent.change(rateInput, { target: { value: '20' } });
    });

    // Save changes
    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    // Verify API was called with correct data
    await waitFor(() => {
      expect(ApiClient.updatePayroll).toHaveBeenCalledWith(1, expect.objectContaining({
        hours_worked: 45,
        hourly_rate: 20
      }));
    });
  });

  it('should handle monitor selection in edit mode', async () => {
    render(
      <AppProvider>
        <Payrolls />
      </AppProvider>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open edit modal
    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    // Check if monitor is selected correctly
    await waitFor(() => {
      const monitorSelect = screen.getByLabelText('Monitor');
      expect(monitorSelect).toHaveValue('1');
    });
  });
}); 