import type { RegistrationDraft } from './types';

export function buildHierarchyId(draft: RegistrationDraft) {
  return [
    draft.countryCode,
    draft.governorateCode,
    draft.districtCode,
    draft.villageCode,
    draft.clanCode,
    draft.titleCode,
    draft.grandfatherCode,
    draft.fatherCode,
    draft.nameCode,
  ]
    .map((part, index) => index === 0 ? part.padStart(3, '0') : part.padStart(2, '0'))
    .join('');
}

export function isValidHierarchyId(value: string) {
  return /^\d{19}$/.test(value);
}

export function formatHierarchyId(value: string) {
  if (!isValidHierarchyId(value)) return value;
  return `${value.slice(0, 3)} ${value.slice(3, 5)} ${value.slice(5, 7)} ${value.slice(7, 9)} ${value.slice(9, 11)} ${value.slice(11, 13)} ${value.slice(13, 15)} ${value.slice(15, 17)} ${value.slice(17, 19)}`;
}
