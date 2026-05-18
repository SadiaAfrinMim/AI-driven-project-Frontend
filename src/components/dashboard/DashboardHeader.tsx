import { ReactNode } from 'react';

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function DashboardHeader({ title, subtitle, right }: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle ? <p className="text-gray-600 mt-2">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

