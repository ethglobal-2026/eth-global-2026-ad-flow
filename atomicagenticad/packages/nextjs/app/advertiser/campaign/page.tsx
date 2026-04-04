"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LegacyCampaignRoute = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/advertiser/dashboard");
  }, [router]);

  return null;
};

export default LegacyCampaignRoute;
