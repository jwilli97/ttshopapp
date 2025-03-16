import { Badge } from "@/components/ui/badge";

const membershipTierToBadgeVariant: { [key: string]: any } = {
  'Beta Tester': 'betaTester',
  'Dev': 'dev',
  'CEO': 'ceo',
  'Trap House HR': 'hr',
  'Designer': 'designer'
};

interface MembershipBadgeProps {
  tier: string;
  className?: string;
}

export function MembershipBadge({ tier, className }: MembershipBadgeProps) {
  if (!tier) return null;
  
  return (
    <Badge 
      variant={membershipTierToBadgeVariant[tier] || 'secondary'}
      className={className}
    >
      {tier}
    </Badge>
  );
}