export type FamilySharingPreferences = {
  shareLocation: boolean;
  shareHealth: boolean;
  shareCheckIn: boolean;
};

export const defaultFamilySharingPreferences: FamilySharingPreferences = {
  shareLocation: true,
  shareHealth: true,
  shareCheckIn: true,
};

export function normalizeFamilySharingPreferences(input?: Partial<FamilySharingPreferences>): FamilySharingPreferences {
  return {
    shareLocation: input?.shareLocation ?? defaultFamilySharingPreferences.shareLocation,
    shareHealth: input?.shareHealth ?? defaultFamilySharingPreferences.shareHealth,
    shareCheckIn: input?.shareCheckIn ?? defaultFamilySharingPreferences.shareCheckIn,
  };
}

export function getActiveFamilySharingCount(preferences: FamilySharingPreferences): number {
  return [preferences.shareLocation, preferences.shareHealth, preferences.shareCheckIn].filter(Boolean).length;
}
