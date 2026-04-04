"use client";

import { useState } from "react";
import { notification } from "~~/utils/scaffold-eth";

type WalletModalProps = {
  isOpen: boolean;
  amount: string;
  fromAddress: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export const WalletModal = ({ isOpen, amount, fromAddress, onClose, onConfirm }: WalletModalProps) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirm();
      setProcessing(false);
      onClose();
      notification.success(`Escrow funded! $${amount} USDC locked in smart contract.`);
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card bg-base-100 border border-base-300 w-full max-w-sm shadow-2xl">
        <div className="card-body">
          {processing ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-base-content/60 m-0">Processing transaction...</p>
            </div>
          ) : (
            <>
              <h3 className="card-title">Confirm Transaction</h3>
              <p className="text-sm text-base-content/60 m-0">You&apos;re about to fund an escrow contract.</p>
              <div className="bg-base-200 rounded-lg p-4 my-2 space-y-3">
                {[
                  { label: "From", value: fromAddress, mono: true },
                  { label: "To", value: "AdFlow Escrow Contract", mono: true },
                  { label: "Amount", value: `${amount} USDC`, accent: true },
                  { label: "Network Fee", value: "~$0.02" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-base-content/60">{row.label}</span>
                    <span
                      className={`font-semibold ${row.mono ? "font-mono text-xs" : ""} ${row.accent ? "text-primary" : "text-base-content"}`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card-actions mt-2">
                <button className="btn btn-ghost flex-1" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn btn-primary flex-[2]" onClick={() => void handleConfirm()}>
                  Confirm & Sign
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
