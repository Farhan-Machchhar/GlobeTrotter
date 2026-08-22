import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

export const BudgetDashboard: React.FC = () => {
  const { selectedTripId } = useTravelStore();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => apiService.getTripById(selectedTripId),
    enabled: !!selectedTripId
  });

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading budget...</div>;
  if (!trip) return null;

  const totalBudget = trip.budget || trip.total_budget || 0;
  
  let activitiesCost = 0;
  trip.stops?.forEach((s: any) => {
    s.activities?.forEach((a: any) => {
      activitiesCost += Number(a.cost || 0);
    });
    s.days?.forEach((d: any) => {
      d.plannedActivities?.forEach((pa: any) => {
        activitiesCost += Number(pa.activity?.cost || pa.cost || 0);
      });
    });
  });

  const expenses = [
    { name: 'Accommodation', value: Math.round(totalBudget * 0.4) },
    { name: 'Transport', value: Math.round(totalBudget * 0.25) },
    { name: 'Activities', value: activitiesCost || Math.round(totalBudget * 0.15) },
    { name: 'Meals', value: Math.round(totalBudget * 0.2) }
  ];

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold font-heading mb-4">Budget Summary</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs text-muted-foreground">Total Budget</div>
          <div className="text-xl font-bold font-heading">₹{totalBudget.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total Spent</div>
          <div className="text-xl font-bold font-heading">₹{totalSpent.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Remaining</div>
          <div className={`text-xl font-bold font-heading ${isOverBudget ? 'text-destructive' : 'text-emerald-500'}`}>
            ₹{remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {isOverBudget && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium mb-6">
          Warning: You are over budget by ₹{Math.abs(remaining).toLocaleString()}!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-[220px]">
        <div>
          <h3 className="text-xs font-semibold text-center mb-2">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenses}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
              >
                {expenses.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-center mb-2">Daily Average</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Average/Day', value: Math.round(totalSpent / (trip.duration_days || 5)) }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
