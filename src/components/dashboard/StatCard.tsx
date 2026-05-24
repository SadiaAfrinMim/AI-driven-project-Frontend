import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

export function StatCard({
  title,
  value,
  icon,
  footer,
  className = '',
  valueClassName = '',
}: {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <Card
      className={
        'border-0 bg-sky-50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ' +
        className
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'text-2xl font-bold text-gray-900 ' + valueClassName}>{value}</div>
        {footer ? <div className="text-xs text-gray-600 mt-1">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

