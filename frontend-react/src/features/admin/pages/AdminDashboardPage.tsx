import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';

// Demo data for the dashboard overview
const STATS = [
  { name: 'Total Revenue', value: formatPrice(125000000), change: '+12.5%', isIncrease: true },
  { name: 'Total Orders', value: '840', change: '+5.4%', isIncrease: true },
  { name: 'Total Customers', value: '3,210', change: '+18.2%', isIncrease: true },
  { name: 'Active Products', value: '45', change: '-2.1%', isIncrease: false },
];

const RECENT_ORDERS = [
  { id: 1024, customer: 'John Doe', date: '2023-10-24', status: 'delivered', total: 450000 },
  { id: 1025, customer: 'Jane Smith', date: '2023-10-25', status: 'processing', total: 1250000 },
  { id: 1026, customer: 'Robert Johnson', date: '2023-10-25', status: 'cancelled', total: 85000 },
  { id: 1027, customer: 'Emily Chen', date: '2023-10-26', status: 'pending', total: 620000 },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="truncate text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className={`ml-4 flex items-baseline text-sm font-semibold ${stat.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isIncrease ? (
                    <svg className="mr-0.5 h-4 w-4 shrink-0 self-center text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="mr-0.5 h-4 w-4 shrink-0 self-center text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                    </svg>
                  )}
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Orders</h3>
          </div>
          <div className="px-5 py-4 sm:px-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {RECENT_ORDERS.map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">Order #{order.id} - {order.customer}</p>
                        <p className="truncate text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 sm:px-6">
            <div className="text-sm">
              <Link to={ROUTES.ADMIN_ORDERS ?? '/admin/orders'} className="font-medium text-indigo-600 hover:text-indigo-500">
                View all orders <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* System Health / Alerts */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">System Activity</h3>
          </div>
          <div className="px-5 py-5 sm:p-6">
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-900">New user registered <span className="font-medium">john@example.com</span></p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-900">System backup completed successfully</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Low stock alert for 5 products</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
