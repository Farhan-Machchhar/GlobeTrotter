import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

export const BudgetDashboard: React.FC = () => {
  const { selectedTripId } = useTravelStore();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => api.getTrip(selectedTripId),
    enabled: !!selectedTripId
  });

  if (isLoading) return <div>Loading budget...</div>;
  if (!trip) return null;

  // Calculate mock budget data based on trip
  const totalBudget = trip.budget;
  
  // Calculate expenses from activities (mock data)
  let activitiesCost = 0;
  trip.stops.forEach(s => 
    s.days.forEach(d => 
        d.plannedActivities.forEach(pa => activitiesCost += pa.activity.cost)
    )
  );

  // Mock static expenses
  const expenses = [
    { name: 'Accommodation', value: 24000 },
    { name: 'Transport', value: 12000 },
    { name: 'Activities', value: activitiesCost || 6000 },
    { name: 'Meals', value: 8000 }
  ];

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Budget Summary</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Budget</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalBudget.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Spent</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalSpent.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Remaining</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: isOverBudget ? '#ef4444' : '#10b981' }}>
            ₹{remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {isOverBudget && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '24px' }}>
          Warning: You are over budget by ₹{Math.abs(remaining).toLocaleString()}!
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', height: '250px' }}>
        <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={expenses}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
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
        <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>Daily Average</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Average/Day', value: Math.round(totalSpent / 6) }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
