import { Component } from '@angular/core';
import { FormValues } from '../../../Shared/Masters/masters.types';
import { MasterFormBase } from '../../../Shared/Masters/master-form.base';
import { MsSelect } from '../../../Shared/Masters/ms-select';
import { CITY } from './cities.config';

/**
 * New city / edit city - create page (/app/masters/city/new and /app/masters/city/:id/edit).
 * Values, rules, preview, dependent dropdowns and the action bar come from MasterFormBase;
 * every field is written out in city-form.html and its rules live in cities.config.ts.
 */
@Component({
  selector: 'app-city-form',
  imports: [MsSelect],
  templateUrl: './city-form.html',
  styleUrls: ['../../../Shared/Masters/masters-shared.css', '../../../Shared/Masters/master-form.css', './city-form.css']
})
export class CityForm extends MasterFormBase {
  protected override readonly cfg = CITY;

  /** "Load example" values (fictional, valid against every rule). */
  protected override readonly example: FormValues = { code: 'TRY', name: 'Tiruchirappalli', display: 'Tiruchirappalli (TRY)', country: 'IN', state: 'TN', metro: 'no', postal: '^62[0-9]{4}$', lat: '10.7905', lng: '78.7047', status: 'active', notes: '' };
}
