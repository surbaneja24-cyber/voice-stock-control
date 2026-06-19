import { useEffect } from "react";
import { useHistoryStore } from "../store/historyStore";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

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
  const movimientos = useHistoryStore(
    (state) => state.movimientos
  );

  const setMovimientos = useHistoryStore(
    (state) => state.setMovimientos
  );
  const totalMovimientos = movimientos.length;

  const totalEntradas = movimientos.filter(
    (m) => m.action === "suma"
  ).length;

  const totalSalidas = movimientos.filter(
    (m) => m.action === "resta"
  ).length;

  const cantidadMovida = movimientos.reduce(
    (acc, mov) => acc + Number(mov.quantity || 0),
    0
  );
  const trendData = movimientos.map((mov, index) => ({
    movimiento: index + 1,
    cantidad: Number(mov.quantity || 0),
  }));
  const categoryData = [
    {
      name: "Entradas",
      value: totalEntradas,
    },
    {
      name: "Salidas",
      value: totalSalidas,
    },
  ];


  useEffect(() => {
    fetch(
      "https://animated-goldfish-pj5jx57j5vjg35wp-5001.app.github.dev/api/history"
    )
      .then((res) => res.json())
      .then((data) => setMovimientos(data))
      .catch((err) => console.error(err));
  }, [setMovimientos]);


  const COLORS = [
    "#000000",
    "#404040",
    "#737373",
    "#a3a3a3",
  ];

  return (
    <div className="min-h-screen bg-white text-black p-8">

      <h1 className="text-4xl font-bold mb-8">
        Descripción ejecutiva
      </h1>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-600">Movimientos totales</p>
          <h2 className="text-3xl font-bold">
            {totalMovimientos}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-600">Entradas</p>
          <h2 className="text-3xl font-bold">
            {totalEntradas}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-600">Salidas</p>
          <h2 className="text-3xl font-bold">
            {totalSalidas}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-600">Unidades movidas</p>
          <h2 className="text-3xl font-bold">
            {cantidadMovida}
          </h2>
        </div>

      </div>

      {/* Charts */}

      <div className="grid md:grid-cols-2 gap-8 mb-8">

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Tendencias del movimiento de acciones
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <XAxis dataKey="movimiento" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke="#000000"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Distribución de movimientos
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
                nameKey="name"
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Activity */}

      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">

        <h2 className="text-xl font-semibold mb-6">
          Actividad reciente
        </h2>

        <div className="space-y-4">

          {movimientos.length === 0 ? (
            <p className="text-zinc-600">
              Aún no hay actividad reciente.
            </p>
          ) : (
            movimientos
              .slice(-5)
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-zinc-200 pb-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.product}
                    </p>

                    <p className="text-zinc-600 text-sm">
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