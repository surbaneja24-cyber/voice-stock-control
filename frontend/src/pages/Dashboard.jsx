import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    fetch(
      "https://congenial-broccoli-4jpjxpqj5jpg3jwqv-5001.app.github.dev/api/history"
    )
      .then((res) => res.json())
      .then((data) => setMovimientos(data))
      .catch((err) => console.error(err));
  }, []);

  const trendData = [
    { month: "Jan", value: 120 },
    { month: "Feb", value: 180 },
    { month: "Mar", value: 150 },
    { month: "Apr", value: 220 },
    { month: "May", value: 310 },
    { month: "Jun", value: 280 },
  ];

  const categoryData = [
    { name: "Electronics", value: 40 },
    { name: "Hardware", value: 30 },
    { name: "Tools", value: 20 },
    { name: "Other", value: 10 },
  ];

  const COLORS = [
    "#ffffff",
    "#d4d4d8",
    "#71717a",
    "#3f3f46",
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Executive Overview
      </h1>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
          <p className="text-zinc-400">Total Value</p>
          <h2 className="text-3xl font-bold">$1.24M</h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
          <p className="text-zinc-400">Active Items</p>
          <h2 className="text-3xl font-bold">8,432</h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
          <p className="text-zinc-400">Low Stock Alerts</p>
          <h2 className="text-3xl font-bold">24</h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
          <p className="text-zinc-400">Voice Commands</p>
          <h2 className="text-3xl font-bold">
            {movimientos.length}
          </h2>
        </div>

      </div>

      {/* Charts */}

      <div className="grid md:grid-cols-2 gap-8 mb-8">

        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-6">
            Stock Movement Trends
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-6">
            Category Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Activity */}

      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">

        <h2 className="text-xl font-semibold mb-6">
          Recent Activity
        </h2>

        <div className="space-y-4">

          {movimientos.length === 0 ? (
            <p className="text-zinc-500">
              No recent activity yet.
            </p>
          ) : (
            movimientos
              .slice(-5)
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-white/10 pb-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.product}
                    </p>

                    <p className="text-zinc-500 text-sm">
                      {item.user}
                    </p>
                  </div>

                  <span className="font-bold">
                    {item.method}
                  </span>
                </div>
              ))
          )}

        </div>

      </div>

    </div>
  );
}