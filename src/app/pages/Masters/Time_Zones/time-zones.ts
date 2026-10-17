import { Component } from '@angular/core';
import { MasterListBase } from '../../../Shared/Masters/master-list.base';
import { MsSelect } from '../../../Shared/Masters/ms-select';
import { TIME_ZONE } from './time-zones.config';

/**
 * Time zones - list page (/app/masters/timezone).
 * Search, filters, sorting, paging, row actions, view drawer and CSV export come from
 * MasterListBase; the table columns and filters are written out in time-zones.html and
 * described in time-zones.config.ts.
 */
@Component({
  selector: 'app-time-zones',
  imports: [MsSelect],
  templateUrl: './time-zones.html',
  styleUrls: ['../../../Shared/Masters/masters-shared.css', '../../../Shared/Masters/master-list.css', './time-zones.css'],
  host: { '[style.--ml-metric-count]': 'metrics().length' }
})
export class TimeZones extends MasterListBase {
  protected override readonly cfg = TIME_ZONE;
}
