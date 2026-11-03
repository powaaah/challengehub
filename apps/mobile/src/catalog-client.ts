import { Platform } from 'react-native';
import { createPublicChallengeApiClient } from '../../../clients/public-challenge-api-client';
export type { PublicChallengeApiItem as CatalogChallenge } from '../../../domain/challenges/public-challenge-api-types';

export function createCatalogClient() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Platform.OS === 'web' ? window.location.origin : 'https://theovina.de');
  const url = new URL(baseUrl);
  if (url.protocol !== 'https:' && !(Platform.OS === 'web' && url.origin === window.location.origin)) {
    throw new Error('Die Katalog-API benötigt HTTPS.');
  }
  return createPublicChallengeApiClient({
    baseUrl,
    fetchImpl: (input, init) => fetch(String(input), { ...init, credentials: 'omit' }),
  });
}
