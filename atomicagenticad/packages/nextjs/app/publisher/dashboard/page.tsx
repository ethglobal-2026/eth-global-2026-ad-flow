"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const PublisherDashboard: NextPage = () => {
  const [amount, setAmount] = useState(142.8);

  useEffect(() => {
    const interval = setInterval(() => setAmount(prev => prev + 0.004 * Math.random()), 3000);
    return () => clearInterval(interval);
  }, []);

  const whole = Math.floor(amount);
  const dec = Math.floor((amount - whole) * 100)
    .toString()
    .padStart(2, "0");

  const campaigns = [
    {
      advertiser: "BeanBox Coffee Co.",
      category: "E-commerce — Coffee subscriptions",
      served: 22400,
      total: 50000,
      revenue: "$89.60",
    },
    {
      advertiser: "BrewMaster App",
      category: "SaaS — Coffee brewing assistant",
      served: 13300,
      total: 25000,
      revenue: "$53.20",
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="publisher" activeTab="dashboard" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Publisher Dashboard</h1>
            <p className="text-base-content/60 mt-1 m-0">arabicacoffee.blog</p>
          </div>
          <span className="badge badge-success badge-lg">Listing Active</span>
        </div>

        {/* Revenue Ticker */}
        <div className="card bg-base-100 border border-base-300 mb-6 text-center p-8">
          <p className="text-xs uppercase tracking-widest text-base-content/40 mb-2 m-0">Total Revenue Earned</p>
          <div className="flex items-baseline justify-center gap-1 tabular-nums">
            <span className="text-lg text-base-content/50 font-semibold">$</span>
            <span className="text-6xl font-extrabold text-primary">{whole}</span>
            <span className="text-3xl text-primary/70">.{dec}</span>
            <span className="text-lg text-base-content/50 font-semibold ml-1">USDC</span>
          </div>
          <p className="text-sm text-base-content/40 mt-2 m-0">Streaming in real-time as impressions are served</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { value: "35,700", label: "Impressions Served" },
            { value: "$4.00", label: "Price / 1K Impressions" },
            { value: "2", label: "Active Campaigns" },
            { value: "$57.20", label: "Remaining in Escrow" },
          ].map(s => (
            <div key={s.label} className="card bg-base-100 border border-base-300 p-5 text-center">
              <div className="text-3xl font-bold text-base-content">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Campaigns table */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Active Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Advertiser</th>
                    <th>Impressions</th>
                    <th>Progress</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.advertiser}>
                      <td>
                        <div className="font-semibold text-base-content">{c.advertiser}</div>
                        <div className="text-xs text-base-content/50">{c.category}</div>
                      </td>
                      <td className="text-sm">
                        {c.served.toLocaleString()} / {c.total.toLocaleString()}
                      </td>
                      <td>
                        <progress
                          className="progress progress-primary w-28"
                          value={(c.served / c.total) * 100}
                          max={100}
                        />
                      </td>
                      <td className="text-primary font-semibold">{c.revenue}</td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
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

export default PublisherDashboard;
