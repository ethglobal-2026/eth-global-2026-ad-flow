"use client";

import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const TRANSACTIONS = [
  {
    type: "Escrow",
    badgeClass: "badge-warning",
    amount: "-$200.00",
    amountClass: "text-error",
    details: "Campaign: BeanBox → arabicacoffee.blog",
    date: "Apr 3, 2026",
  },
  {
    type: "Deposit",
    badgeClass: "badge-success",
    amount: "+$500.00",
    amountClass: "text-primary",
    details: "USDC deposit from external wallet",
    date: "Apr 3, 2026",
  },
];

const AdvertiserWallet: NextPage = () => (
  <div className="min-h-screen bg-base-200">
    <Topbar variant="advertiser" activeTab="wallet" />
    <div className="max-w-lg mx-auto px-6 py-8">
      <div className="text-center py-10">
        <p className="text-base-content/50 text-sm m-0">Available Balance</p>
        <div className="text-5xl font-extrabold text-base-content mt-2">
          $300.00 <span className="text-xl text-base-content/40 font-normal">USDC</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-base-100 border border-base-300 px-4 py-2 rounded-full font-mono text-sm text-base-content/50 mt-4">
          0x4b2e8f91...da3a81f <button className="hover:text-base-content">📋</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card bg-base-100 border border-base-300 p-5 text-center">
          <div className="text-3xl font-bold text-warning">$200.00</div>
          <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">In Escrow</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-5 text-center">
          <div className="text-3xl font-bold text-base-content">$300.00</div>
          <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Available</div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((tx, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${tx.badgeClass}`}>{tx.type}</span>
                    </td>
                    <td className={`font-semibold ${tx.amountClass}`}>{tx.amount}</td>
                    <td className="text-sm text-base-content/50">{tx.details}</td>
                    <td className="text-sm text-base-content/50">{tx.date}</td>
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

export default AdvertiserWallet;
