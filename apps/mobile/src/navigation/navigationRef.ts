import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params: RootStackParamList[RouteName],
): void {
  if (navigationRef.isReady()) {
    (
      navigationRef.navigate as (
        screen: RouteName,
        screenParams: RootStackParamList[RouteName],
      ) => void
    )(name, params);
  }
}
