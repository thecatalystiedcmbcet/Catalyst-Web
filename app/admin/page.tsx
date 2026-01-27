export default function AdminDashboardPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 ">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value="128" />
                <StatCard title="Total Events" value="45" />
                <StatCard title="Active Members" value="89" />
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 ">Recent Activity</h3>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">No recent activity to display.</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
