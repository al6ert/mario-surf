import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import type { Invoice, Expense, Payroll, Settings } from '../../lib/supabase';
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface DashboardMetricsProps {
  invoices: Invoice[];
  expenses: Expense[];
  payrolls: Payroll[];
  settings: Settings;
}

export default function DashboardMetrics({ invoices, expenses, payrolls, settings }: DashboardMetricsProps) {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const sixtyDaysAgo = subDays(today, 60);

  // Calculate metrics for current period (last 30 days)
  const currentPeriodIncome = invoices
    .filter(invoice => 
      invoice.status === 'paid' && 
      isWithinInterval(new Date(invoice.date), { start: thirtyDaysAgo, end: today })
    )
    .reduce((sum, invoice) => {
      const subtotal = (invoice.items || []).reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
      const ivaPercentage = settings.iva_percentage || 21;
      const tax = subtotal * (ivaPercentage / 100);
      return sum + subtotal + tax;
    }, 0);

  const currentPeriodExpenses = expenses
    .filter(expense => 
      isWithinInterval(new Date(expense.date), { start: thirtyDaysAgo, end: today })
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const currentPeriodPayrollCosts = payrolls
    .filter(payroll => 
      isWithinInterval(new Date(payroll.date), { start: thirtyDaysAgo, end: today })
    )
    .reduce((sum, payroll) => sum + (payroll.hours_worked * payroll.hourly_rate + payroll.bonus - payroll.deductions), 0);

  const currentPeriodProfit = currentPeriodIncome - (currentPeriodExpenses + currentPeriodPayrollCosts);

  // Calculate metrics for previous period (30-60 days ago)
  const previousPeriodIncome = invoices
    .filter(invoice => 
      invoice.status === 'paid' && 
      isWithinInterval(new Date(invoice.date), { start: sixtyDaysAgo, end: thirtyDaysAgo })
    )
    .reduce((sum, invoice) => {
      const subtotal = (invoice.items || []).reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
      const ivaPercentage = settings.iva_percentage || 21;
      const tax = subtotal * (ivaPercentage / 100);
      return sum + subtotal + tax;
    }, 0);

  const previousPeriodExpenses = expenses
    .filter(expense => 
      isWithinInterval(new Date(expense.date), { start: sixtyDaysAgo, end: thirtyDaysAgo })
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const previousPeriodPayrollCosts = payrolls
    .filter(payroll => 
      isWithinInterval(new Date(payroll.date), { start: sixtyDaysAgo, end: thirtyDaysAgo })
    )
    .reduce((sum, payroll) => sum + (payroll.hours_worked * payroll.hourly_rate + payroll.bonus - payroll.deductions), 0);

  const previousPeriodProfit = previousPeriodIncome - (previousPeriodExpenses + previousPeriodPayrollCosts);

  // Calculate percentage changes
  const incomeChange = previousPeriodIncome ? ((currentPeriodIncome - previousPeriodIncome) / previousPeriodIncome) * 100 : 0;
  const expensesChange = previousPeriodExpenses ? ((currentPeriodExpenses - previousPeriodExpenses) / previousPeriodExpenses) * 100 : 0;
  const profitChange = previousPeriodProfit ? ((currentPeriodProfit - previousPeriodProfit) / previousPeriodProfit) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Income Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Ingresos Totales</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-gray-900">{currentPeriodIncome.toFixed(2)} €</span>
          <div className={`flex items-center ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <FontAwesomeIcon 
              icon={incomeChange >= 0 ? faArrowUp : faArrowDown} 
              className="mr-1"
            />
            <span>{Math.abs(incomeChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
      </div>

      {/* Expenses Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Gastos Totales</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-gray-900">{(currentPeriodExpenses + currentPeriodPayrollCosts).toFixed(2)} €</span>
          <div className={`flex items-center ${expensesChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <FontAwesomeIcon 
              icon={expensesChange <= 0 ? faArrowUp : faArrowDown} 
              className="mr-1"
            />
            <span>{Math.abs(expensesChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
      </div>

      {/* Profit Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Beneficio Neto</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-gray-900">{currentPeriodProfit.toFixed(2)} €</span>
          <div className={`flex items-center ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <FontAwesomeIcon 
              icon={profitChange >= 0 ? faArrowUp : faArrowDown} 
              className="mr-1"
            />
            <span>{Math.abs(profitChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
      </div>
    </div>
  );
} 