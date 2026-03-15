'use client';

interface ComplexityBadgeProps {
  complexity: string;
}

export default function ComplexityBadge({ complexity }: ComplexityBadgeProps) {
  const k = complexity || 'M';
  return <span className={`complexity-badge complexity-${k}`}>{k}</span>;
}
