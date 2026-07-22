import React from 'react';
import { Calendar, Bot, PlayCircle, StopCircle } from 'lucide-react';

const ShiftPanel = ({
  settings,
  activeShiftStart,
  onlyCurrentShift,
  setOnlyCurrentShift,
  filterDate,
  setFilterDate,
  onToggleShift,
}) => {
  const isAutoMode = settings.shift_transition_type === 'auto';

  const DateFilter = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-text)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Дата:</span>
      <input
        type="date"
        value={filterDate}
        onChange={e => { setFilterDate(e.target.value); if (e.target.value) setOnlyCurrentShift(false); }}
        style={{ padding: '8px 12px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}
      />
      {filterDate && (
        <button onClick={() => setFilterDate('')} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
          Сбросить
        </button>
      )}
    </div>
  );

  const ShiftOnlyCheckbox = () => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: 'white' }}>
      <input
        type="checkbox"
        checked={onlyCurrentShift}
        onChange={e => { setOnlyCurrentShift(e.target.checked); if (e.target.checked) setFilterDate(''); }}
        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
      />
      Только заказы текущей смены
    </label>
  );

  return (
    <div className="glass" style={{
      backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px 24px', borderRadius: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginBottom: '30px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: '16px', border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {isAutoMode ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(155, 81, 224, 0.15)', color: '#D29CFF', fontWeight: 800, fontSize: '14px', border: '1px solid rgba(155,81,224,0.3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bot size={16} /> Авто-смена активна</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--gray-text)', fontWeight: 600 }}>
              Рабочие сутки переходят в <strong style={{ color: 'white' }}>{settings.auto_shift_time || '08:00'}</strong>.{' '}
              Текущая смена началась с <strong style={{ color: '#D29CFF' }}>{activeShiftStart ? activeShiftStart.toLocaleString('ru-RU') : ''}</strong>.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <DateFilter />
            <ShiftOnlyCheckbox />
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px',
              backgroundColor: settings.shift_status === 'open' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(235, 87, 87, 0.15)',
              color: settings.shift_status === 'open' ? '#2ecc71' : '#ff6b6b',
              fontWeight: 800, fontSize: '14px',
              border: `1px solid ${settings.shift_status === 'open' ? 'rgba(39,174,96,0.3)' : 'rgba(235,87,87,0.3)'}`
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{settings.shift_status === 'open' ? <><PlayCircle size={14} /> Смена открыта</> : <><StopCircle size={14} /> Смена закрыта</>}</span>
            </div>
            {settings.shift_status === 'open' && (
              <span style={{ fontSize: '13px', color: 'var(--gray-text)', fontWeight: 600 }}>
                Открыл: <strong style={{ color: 'white' }}>{settings.shift_opened_by}</strong>{' '}
                с <strong style={{ color: 'white' }}>{new Date(settings.shift_start_time).toLocaleString('ru-RU')}</strong>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <DateFilter />
            {settings.shift_status === 'open' && <ShiftOnlyCheckbox />}
            <button
              onClick={onToggleShift}
              style={{
                padding: '10px 20px', borderRadius: '14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                border: 'none',
                backgroundColor: settings.shift_status === 'open' ? '#FF4D4D' : '#27AE60',
                color: 'white',
                boxShadow: `0 4px 12px ${settings.shift_status === 'open' ? 'rgba(255,77,77,0.2)' : 'rgba(39,174,96,0.2)'}`,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = settings.shift_status === 'open' ? '#D93838' : '#219653'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = settings.shift_status === 'open' ? '#FF4D4D' : '#27AE60'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {settings.shift_status === 'open' ? 'Закрыть смену' : 'Открыть смену'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShiftPanel;
