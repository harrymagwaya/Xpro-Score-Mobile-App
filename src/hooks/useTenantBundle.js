import { useMemo } from 'react';

import useAuth from './useAuth';
import useUserProfile from './useUserProfile';
import { useEligibility } from './useEligibility';
import { useTenantFinancialHistory } from './useFinancial';
import { useUnitByTenant } from './usePropertyUnits';
import { useLatestScore } from './useScoring';
import { useRentalProfilesByTenant } from './useRentalProfile';
import { useTenantCapacity } from './useTenantCapacities';
import { extractList, firstDefined } from '../utils/format';

export function useTenantBundle() {
  const { userId } = useAuth();

  const profileResource = useUserProfile();
  const scoreResource = useLatestScore(userId);
  const eligibilityResource = useEligibility(userId);
  const historyResource = useTenantFinancialHistory(userId);
  const unitResource = useUnitByTenant(userId);
  const rentalProfileResource = useRentalProfilesByTenant(userId);
  const capacityResource = useTenantCapacity(userId);

  const loading = [
    profileResource.loading,
    scoreResource.loading,
    eligibilityResource.loading,
    historyResource.loading,
    unitResource.loading,
    rentalProfileResource.loading,
    capacityResource.loading
  ].some(Boolean);

  const error =
    profileResource.error ||
    scoreResource.error ||
    eligibilityResource.error ||
    historyResource.error ||
    unitResource.error ||
    rentalProfileResource.error ||
    capacityResource.error ||
    null;

  const reload = async () => {
    await Promise.all([
      profileResource.reload(),
      scoreResource.reload(),
      eligibilityResource.reload(),
      historyResource.reload(),
      unitResource.reload(),
      rentalProfileResource.reload(),
      capacityResource.reload()
    ]);
  };

  const data = useMemo(() => {
    const records = extractList(historyResource.data);
    const rentalProfiles = extractList(rentalProfileResource.data);
    const eligibility = eligibilityResource.data || {};

    return {
      profile: profileResource.data || {},
      score: scoreResource.data || {},
      eligibility,
      history: records,
      records,
      unit: unitResource.data || {},
      rentalProfile: rentalProfileResource.data,
      rentalProfiles,
      capacity: capacityResource.data || {},
      latestScore: firstDefined(scoreResource.data?.creditScore, scoreResource.data?.score, scoreResource.data?.finalScore, 0),
      minLimit: firstDefined(
        eligibility.minEligibleLimit,
        eligibility.minimumLimit,
        eligibility.minLimit,
        eligibility.minimumEligibleAmount,
        eligibility.minimumAmount,
        '-'
      ),
      maxLimit: firstDefined(
        eligibility.maxEligibleLimit,
        eligibility.maximumLimit,
        eligibility.maxLimit,
        eligibility.maximumEligibleAmount,
        eligibility.maximumAmount,
        '-'
      ),
      capacityValue: firstDefined(
        capacityResource.data?.capacityScore,
        capacityResource.data?.score,
        capacityResource.data?.tenantCapacity,
        capacityResource.data?.financialCapacity,
        capacityResource.data?.capacity,
        '-'
      )
    };
  }, [
    capacityResource.data,
    eligibilityResource.data,
    historyResource.data,
    profileResource.data,
    rentalProfileResource.data,
    scoreResource.data,
    unitResource.data
  ]);

  return {
    data,
    loading,
    error,
    reload,
    resources: {
      profile: profileResource,
      score: scoreResource,
      eligibility: eligibilityResource,
      history: historyResource,
      unit: unitResource,
      rentalProfile: rentalProfileResource,
      capacity: capacityResource
    }
  };
}
