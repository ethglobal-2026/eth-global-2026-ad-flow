"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const PAYMENTS = [
  { from: "BeanBox Coffee Co.", amount: "+$4.00", batch: "#22 (1K impr.)", time: "2 min ago" },
  { from: "BrewMaster App", amount: "+$4.00", batch: "#13 (1K impr.)", time: "8 min ago" },
  { from: "BeanBox Coffee Co.", amount: "+$4.00", batch: "#21 (1K impr.)", time: "29 min ago" },
  { from: "BeanBox Coffee Co.", amount: "+$4.00", batch: "#20 (1K impr.)", time: "54 min ago" },
];

const PublisherWallet: NextPage = () => {
  const [amount, setAmount] = useState(142.8);

  useEffect(() => {
    const interval = setInterval(() => setAmount(prev => prev + 0.004 * Math.random()), 3000);
    return () => clearInterval(interval);
  }, []);

  const whole = Math.floor(amount);
  const dec = Math.floor((amount - whole) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="publisher" activeTab="wallet" />
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="text-center py-10">
          <p className="text-base-content/50 text-sm m-0">Total Earned</p>
          <div className="flex items-baseline justify-center gap-1 tabular-nums mt-2">
            <span className="text-lg text-base-content/50 font-semibold">$</span>
            <span className="text-6xl font-extrabold text-primary">{whole}</span>
            <span className="text-3xl text-primary/70">.{dec}</span>
            <span className="text-lg text-base-content/50 font-semibold ml-1">USDC</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-base-100 border border-base-300 px-4 py-2 rounded-full font-mono text-sm text-base-content/50 mt-4">
            0x7a3f2b01...e4c92d <button className="hover:text-base-content">📋</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card bg-base-100 border border-base-300 p-5 text-center">
            <div className="text-3xl font-bold text-primary">${amount.toFixed(2)}</div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Received</div>
          </div>
          <div className="card bg-base-100 border border-base-300 p-5 text-center">
            <div className="text-3xl font-bold text-info">$57.20</div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Pending in Escrow</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h2 className="card-title">Recent Payments</h2>
              <span className="badge badge-success">Streaming</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Amount</th>
                    <th>Batch</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYMENTS.map((p, i) => (
                    <tr key={i}>
                      <td className="text-sm">{p.from}</td>
                      <td className="text-primary font-semibold">{p.amount}</td>
                      <td className="text-sm text-base-content/50">{p.batch}</td>
                      <td className="text-sm text-base-content/50">{p.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherWallet;
