import { useState, useEffect } from 'react';
import { PackageInfo } from '@/types';
import { BottleData } from '@/context/types';

export const useBottlesData = (packageInfo: PackageInfo | null) => {
  const [bottlesData, setBottlesData] = useState<BottleData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Any initial loading logic can stay here
    // But we've moved the main bottle fetching to WineTastingFlow component
  }, [packageInfo]);

  return {
    bottlesData,
    loading,
    setLoading,
    setBottlesData
  };
};
