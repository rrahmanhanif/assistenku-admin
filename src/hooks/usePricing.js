// src/hooks/usePricing.js
import { useCallback } from "react";
import { calculateOrder } from "../services/calcPricing";

export default function usePricing() {
  const calc = useCallback((opts) => {
    const coreFeePercent = Number(import.meta.env.VITE_CORE_FEE_PERCENT || 0.25);
    const gatewayFeePercent = Number(import.meta.env.VITE_GATEWAY_FEE_PERCENT || 0.015);
    const gatewayThreshold = Number(import.meta.env.VITE_GATEWAY_THRESHOLD || 0.02);
    return calculateOrder({ ...opts, coreFeePercent, gatewayFeePercent, gatewayThreshold });
  }, []);
  return { calc };
}
