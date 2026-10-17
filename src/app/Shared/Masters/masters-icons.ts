import { IconName } from './masters.types';

/** Thin line icons (24 × 24, stroke) in the Workspace Kit drawing style. The eye and the bin are
    drawn in the templates with separate pupil / lid paths so their hover gestures can move them. */
export const MASTER_ICONS: Record<IconName, string> = {
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  pin: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  coins: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9.2A3 3 0 0 0 12.3 8h-.9a2.2 2.2 0 0 0 0 4.4h1.2a2.2 2.2 0 0 1 0 4.4h-1A3 3 0 0 1 9 15.6M12 6.5V8M12 16.8v1.7',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  plus: 'M12 5v14M5 12h14',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM16 16l5 5',
  sort: 'M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z',
  edit: 'M15 4l5 5M4 20l1-6L17 2l5 5L10 19zM13 21H3',
  power: 'M12 3v8M7.1 6.2a8 8 0 1 0 9.8 0',
  trash: 'M6 7l1 13h10l1-13M10 11v6M14 11v6',
  'chevron-left': 'm14 6-6 6 6 6',
  'chevron-right': 'm10 6 6 6-6 6',
  'chevron-down': 'm6 9 6 6 6-6',
  x: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  reset: 'M4 9a8 8 0 1 1 0 6M4 3v6h6',
  save: 'M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16v-5M12 8h.01',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  lock: 'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  back: 'M19 12H5M11 18l-6-6 6-6',
  filter: 'M3 5h18l-7 9v6l-4-2v-4z'
};

/** Bin lid (moves on hover) and pupil are separate shapes. */
export const TRASH_LID = 'M4 7h16M9 7V4h6v3';
