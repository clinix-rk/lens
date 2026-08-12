import { MatDateFormats } from '@angular/material/core';

/** Display and parse all Material date inputs as DD/MM/YYYY. */
export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
    timeInput: 'LT',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    timeInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
    timeOptionLabel: 'LT',
  },
};
