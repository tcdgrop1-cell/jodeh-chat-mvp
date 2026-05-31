export interface Choice {
  code: string;
  labelAr: string;
  labelEn: string;
}

export interface Village extends Choice {}
export interface District extends Choice {
  villages: Village[];
}
export interface Governorate extends Choice {
  districts: District[];
}
export interface Country extends Choice {
  governorates: Governorate[];
}

export const EDUCATION_OPTIONS: Choice[] = [
  { code: '01', labelAr: 'ابتدائي', labelEn: 'Primary' },
  { code: '02', labelAr: 'إعدادي', labelEn: 'Middle school' },
  { code: '03', labelAr: 'ثانوي', labelEn: 'Secondary' },
  { code: '04', labelAr: 'دبلوم', labelEn: 'Diploma' },
  { code: '05', labelAr: 'جامعي', labelEn: 'University' },
];

export const GENDER_OPTIONS: Choice[] = [
  { code: 'M', labelAr: 'ذكر', labelEn: 'Male' },
  { code: 'F', labelAr: 'أنثى', labelEn: 'Female' },
  { code: 'O', labelAr: 'أفضل عدم التحديد', labelEn: 'Prefer not to say' },
];

export const COUNTRIES: Country[] = [
  {
    code: '967',
    labelAr: 'اليمن',
    labelEn: 'Yemen',
    governorates: [
      {
        code: '01',
        labelAr: 'أمانة العاصمة',
        labelEn: 'Sana’a City',
        districts: [
          {
            code: '01',
            labelAr: 'التحرير',
            labelEn: 'At Tahrir',
            villages: [
              { code: '01', labelAr: 'الروضة', labelEn: 'Al Rawda' },
              { code: '02', labelAr: 'السبعين', labelEn: 'As Sabain' },
            ],
          },
          {
            code: '02',
            labelAr: 'معين',
            labelEn: 'Muain',
            villages: [
              { code: '01', labelAr: 'حدة', labelEn: 'Hadda' },
              { code: '02', labelAr: 'الجامعة', labelEn: 'University District' },
            ],
          },
        ],
      },
      {
        code: '02',
        labelAr: 'عدن',
        labelEn: 'Aden',
        districts: [
          {
            code: '01',
            labelAr: 'خور مكسر',
            labelEn: 'Khormaksar',
            villages: [
              { code: '01', labelAr: 'المنصورة', labelEn: 'Al Mansoura' },
              { code: '02', labelAr: 'التواهي', labelEn: 'At Tawahi' },
            ],
          },
        ],
      },
    ],
  },
];
