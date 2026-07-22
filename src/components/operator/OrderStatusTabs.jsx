import React from 'react';
import { Inbox, ChefHat, Truck, CheckCircle, XCircle } from 'lucide-react';

const STATUS_TABS = [
  { value: 'all',       label: 'Все заказы',    color: 'white',    bg: 'rgba(255,255,255,0.1)',    icon: null },
  { value: 'pending',   label: 'Новые',         color: '#FFA366', bg: 'rgba(255,102,0,0.15)', icon: <Inbox size={16} /> },
  { value: 'cooking',   label: 'Готовятся',     color: '#7DBBFF', bg: 'rgba(74,144,226,0.15)', icon: <ChefHat size={16} /> },
  { value: 'delivery',  label: 'В пути',        color: '#D29CFF', bg: 'rgba(155,81,224,0.15)', icon: <Truck size={16} /> },
  { value: 'done',      label: 'Выполненные',   color: '#2ecc71', bg: 'rgba(39,174,96,0.15)', icon: <CheckCircle size={16} /> },
  { value: 'cancelled', label: 'Отмененные',    color: '#ff6b6b', bg: 'rgba(235,87,87,0.15)', icon: <XCircle size={16} /> },
];

const OrderStatusTabs = ({ activeTab, onTabChange, orders }) => (
  <div style={{
    display: 'flex', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px',
    borderRadius: '20px', marginBottom: '30px', overflowX: 'auto',
    gap: '6px', border: '1px solid rgba(255,255,255,0.05)'
  }} className="no-scrollbar">
    {STATUS_TABS.map(tab => {
      const isActive = activeTab === tab.value;
      const count = orders.filter(o => tab.value === 'all' || o.status === tab.value).length;
      return (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          style={{
            flex: 1, padding: '12px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 700,
            backgroundColor: isActive ? tab.bg : 'transparent',
            color: isActive ? tab.color : 'var(--gray-text)',
            border: isActive ? `1px solid ${tab.bg.replace('0.15', '0.3').replace('0.1', '0.2')}` : '1px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {tab.icon && <span style={{ display: 'flex' }}>{tab.icon}</span>}
          <span>{tab.label}</span>
          <span style={{
            padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
            backgroundColor: isActive ? tab.color : 'rgba(255,255,255,0.1)',
            color: isActive ? '#000' : 'var(--gray-text)',
            fontWeight: 800, transition: 'all 0.2s ease'
          }}>
            {count}
          </span>
        </button>
      );
    })}
  </div>
);

export default OrderStatusTabs;
