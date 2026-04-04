"use client";

import { useState } from "react";

type WalletModalProps = {
  isOpen: boolean;
  amount: string;
  fromAddress: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const WalletModal = ({ isOpen, amount, fromAddress, onClose, onSuccess }: WalletModalProps) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onClose();
      onSuccess();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {processing ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div className="agent-spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--text-dim)" }}>Processing transaction...</p>
          </div>
        ) : (
          <>
            <h3>Confirm Transaction</h3>
            <p className="subtitle">You&apos;re about to fund an escrow contract.</p>
            <div className="order-summary" style={{ margin: "0 0 20px" }}>
              <div className="order-row">
                <span className="label">From</span>
                <span className="value" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {fromAddress}
                </span>
              </div>
              <div className="order-row">
                <span className="label">To</span>
                <span className="value" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  AdFlow Escrow Contract
                </span>
              </div>
              <div className="order-row">
                <span className="label">Amount</span>
                <span className="value" style={{ color: "var(--accent)" }}>
                  {amount} USDC
                </span>
              </div>
              <div className="order-row">
                <span className="label">Network Fee</span>
                <span className="value">~$0.02</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirm}>
                Confirm & Sign
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
