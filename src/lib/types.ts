export type Language = 'ar' | 'en';
export type ChatKind = 'dm' | 'group' | 'channel';

export interface RegistrationDraft {
  language: Language;
  firstNameAr: string;
  firstNameEn: string;
  lastNameAr: string;
  lastNameEn: string;
  countryCode: string;
  governorateCode: string;
  districtCode: string;
  villageCode: string;
  clanCode: string;
  titleCode: string;
  grandfatherCode: string;
  fatherCode: string;
  nameCode: string;
}
