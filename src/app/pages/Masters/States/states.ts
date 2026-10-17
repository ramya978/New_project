import { Component } from '@angular/core';
import { MasterListBase } from '../../../Shared/Masters/master-list.base';
import { MsSelect } from '../../../Shared/Masters/ms-select';
import { STATE } from './states.config';

/**
 * States - list page (/app/masters/state).
 * Search, filters, sorting, paging, row actions, view drawer and CSV export come from
 * MasterListBase; the table columns and filters are written out in states.html and
 * described in states.config.ts.
 */
@Component({
  selector: 'app-states',
  imports: [MsSelect],
  templateUrl: './states.html',
  styleUrls: ['../../../Shared/Masters/masters-shared.css', '../../../Shared/Masters/master-list.css', './states.css'],
  host: { '[style.--ml-metric-count]': 'metrics().length' }
})
export class States extends MasterListBase {
  protected override readonly cfg = STATE;
}
