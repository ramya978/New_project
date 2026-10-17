import { Component } from '@angular/core';
import { FormValues } from '../../../Shared/Masters/masters.types';
import { MasterFormBase } from '../../../Shared/Masters/master-form.base';
import { MsSelect } from '../../../Shared/Masters/ms-select';
import { COUNTRY } from './countries.config';

/**
 * New country / edit country - create page (/app/masters/country/new and /app/masters/country/:id/edit).
 * Values, rules, preview, dependent dropdowns and the action bar come from MasterFormBase;
 * every field is written out in country-form.html and its rules live in countries.config.ts.
 */
@Component({
  selector: 'app-country-form',
  imports: [MsSelect],
  templateUrl: './country-form.html',
  styleUrls: ['../../../Shared/Masters/masters-shared.css', '../../../Shared/Masters/master-form.css', './country-form.css']
})
export class CountryForm extends MasterFormBase {
  protected override readonly cfg = COUNTRY;

  /** "Load example" values (fictional, valid against every rule). */
  protected override readonly example: FormValues = { name: 'New Zealand', official: 'New Zealand', region: 'Oceania', alpha2: 'NZ', alpha3: 'NZL', numeric: '554', currency: 'AUD', phone: '+64', postal: '^[0-9]{4}$', subdivisions: 'yes', status: 'active', sort: '13' };
}
