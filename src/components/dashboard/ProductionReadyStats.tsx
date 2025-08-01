
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  description 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendBg = () => {
    switch (trend) {
      case 'up': return 'bg-green-50';
      case 'down': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${getTrendBg()}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className={`${getTrendColor()} ${getTrendBg()} border-0`}
            >
              {change}
            </Badge>
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
          </div>
          {description && (
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProductionReadyStats: React.FC = () => {
  // These would be fetched from your analytics API
  const stats = [
    {
      title: 'Total Opportunities',
      value: '2,847',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <Briefcase className="h-5 w-5 text-blue-600" />,
      description: 'Active opportunities available on the platform'
    },
    {
      title: 'Active Users',
      value: '15,294',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <Users className="h-5 w-5 text-green-600" />,
      description: 'Users who logged in within the last 30 days'
    },
    {
      title: 'Applications Today',
      value: '342',
      change: '+15.7%',
      trend: 'up' as const,
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
      description: 'Applications submitted in the last 24 hours'
    },
    {
      title: 'Pending Review',
      value: '89',
      change: '-5.4%',
      trend: 'down' as const,
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      description: 'Opportunities awaiting moderation approval'
    },
    {
      title: 'Success Rate',
      value: '73.2%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      description: 'Percentage of applications that receive responses'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Stable',
      trend: 'neutral' as const,
      icon: <Activity className="h-5 w-5 text-blue-600" />,
      description: 'Platform uptime over the last 30 days'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default ProductionReadyStats;
