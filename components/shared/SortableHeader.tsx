'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface Props {
  label: string;
  sortKey: string;
  currentSort: { key: string; dir: 'asc' | 'desc' };
  onSort: (key: string) => void;
  align?: 'left' | 'right';
  style?: React.CSSProperties;
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  align = 'left',
  style,
}: Props) {
  const isActive = currentSort.key === sortKey;
  const Icon = isActive
    ? currentSort.dir === 'asc'
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: '12px 16px',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: isActive ? '#94a3b8' : '#475569',
        cursor: 'pointer',
        userSelect: 'none',
        textAlign: align,
        whiteSpace: 'nowrap',
        transition: 'color 150ms ease-out',
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableCellElement).style.color = '#94a3b8';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableCellElement).style.color = isActive ? '#94a3b8' : '#475569';
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          flexDirection: align === 'right' ? 'row-reverse' : 'row',
        }}
      >
        {label}
        <Icon size={11} color={isActive ? '#0052ff' : '#475569'} />
      </span>
    </th>
  );
}
