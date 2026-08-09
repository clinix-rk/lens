import { TypeNode } from '../../shared/components/hierarchical-type-picker/hierarchical-type.model';

export const COMPLAIN_TYPES: TypeNode[] = [
  {
    label: 'Ear Symptoms',
    children: [
      { label: 'Ear Pain' },
      { label: 'Tinnitus' },
      { label: 'Ear Congestion' },
      { label: 'Hearing Loss', children: [
        { label: 'Conductive Hearing Loss' },
        { label: 'Sensorineural Hearing Loss' }
      ]},
      { label: 'Ear Discharge' }
    ]
  },
  {
    label: 'Nasal Symptoms',
    children: [
      { label: 'Nasal Congestion' },
      { label: 'Rhinorrhea' },
      { label: 'Sneezing' },
      { label: 'Nasal Polyps' }
    ]
  },
  {
    label: 'Throat Symptoms',
    children: [
      { label: 'Sore Throat' },
      { label: 'Difficulty Swallowing' },
      { label: 'Hoarseness' }
    ]
  },
  {
    label: 'Systemic Symptoms',
    children: [
      { label: 'Fatigue' },
      { label: 'Dizziness', children: [
        { label: 'Vertigo' },
        { label: 'Lightheadedness' }
      ]},
      { label: 'Fever' },
      { label: 'Dry Skin' }
    ]
  },
  { label: 'Healing Follow-up' },
  { label: 'Other Complaint' }
];

export const SUGGESTION_TYPES: TypeNode[] = [
  {
    label: 'Lifestyle Adjustments',
    children: [
      { label: 'Dietary Adjustments' },
      { label: 'Avoid Water Exposure' },
      { label: 'Rest and Sleep' },
      { label: 'Physical Activity' }
    ]
  },
  {
    label: 'Home Remedies',
    children: [
      { label: 'Warm Compress Application' },
      { label: 'Steam Inhalation' },
      { label: 'Saline Rinse' }
    ]
  },
  {
    label: 'Medical Referrals',
    children: [
      { label: 'Specialist ENT Referral' },
      { label: 'Thyroid Panel Lab Test' },
      { label: 'Audiologist Referral' },
      { label: 'Allergy Panel Test' }
    ]
  },
  {
    label: 'Procedures Recommended',
    children: [
      { label: 'Cerumen Irrigation' },
      { label: 'Nasal Endoscopy' }
    ]
  },
  { label: 'Follow-up Visit' },
  { label: 'Other Suggestion' }
];

export const TREATMENT_TYPES: TypeNode[] = [
  {
    label: 'Ear Procedures',
    children: [
      { label: 'Cerumen Irrigation' },
      { label: 'Micro-suction' },
      { label: 'Tympanometry' }
    ]
  },
  {
    label: 'Diagnostic Examinations',
    children: [
      { label: 'Digital Otoscopy Exam' },
      { label: 'Physical Examination' },
      { label: 'Audiology Screening', children: [
        { label: 'Pure-Tone Audiometry' },
        { label: 'Speech Audiometry' },
        { label: 'Tympanometry' }
      ]}
    ]
  },
  {
    label: 'Non-Invasive Therapies',
    children: [
      { label: 'Nasal Irrigation' },
      { label: 'Nebulization' }
    ]
  },
  { label: 'Surgical Intervention' },
  { label: 'Other Treatment' }
];
