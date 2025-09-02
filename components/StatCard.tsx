import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  subtitle,
}) => {
  const Component = icon;
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-md', iconBgColor)}>
            <Component className={cn('h-4 w-4', iconColor)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
