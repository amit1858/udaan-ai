import { useGetOpportunities, getGetOpportunitiesQueryKey } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';

export function useOpportunities() {
  const { lang } = useI18n();
  const params = { language: lang };
  return useGetOpportunities(params, { query: { queryKey: getGetOpportunitiesQueryKey(params), placeholderData: (p) => p } });
}
