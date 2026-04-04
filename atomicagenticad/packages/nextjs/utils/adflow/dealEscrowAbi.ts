export const DEAL_ESCROW_WRITE_ABI = [
  {
    type: "function",
    name: "releasePayment",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "amountReleased", type: "uint256" }],
  },
  {
    type: "function",
    name: "recordConfirmedImpressions",
    stateMutability: "nonpayable",
    inputs: [{ name: "additionalImpressions", type: "uint256" }],
    outputs: [],
  },
] as const;

export const DEAL_ESCROW_READ_ABI = [
  {
    type: "function",
    name: "fundedAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "confirmedImpressions",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalPaid",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "MAX_IMPRESSIONS",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "PRICE_PER_IMPRESSION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "closed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
