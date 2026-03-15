'use client';

import type { Tier } from '@/lib/types';
import { getTierColor } from '@/lib/utils';

interface TierBadgeProps {
  tier: string;
  tiers: Tier[];
}

export default function TierBadge({ tier, tiers }: TierBadgeProps) {
  const c = getTierColor(tier, tiers);
  return <span className="badge" style={{ background: `${c}18`, color: c }}>{tier}</span>;
}
