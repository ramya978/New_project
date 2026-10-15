import { Routes } from '@angular/router';
import { MENU_DATA, MenuItem } from './Shared/layout/menu.data';
import { MenuPage } from './Shared/layout/menu-page';
import { PaymentsReceipts } from './pages/Donations/Payment_History/payments-receipts';
import { Profile } from './pages/Auth/Profile/profile';

const flatten = (items: readonly MenuItem[]): MenuItem[] => items.flatMap((item) => [item, ...flatten(item.children)]);

const REAL_SCREENS: Record<string, unknown> = {
  'app/donations/payment-event-queue': PaymentsReceipts
};

const menuRoutes: Routes = flatten(MENU_DATA)
  .filter((item) => !!item.route)
  .map((item) => ({
    path: item.route!.replace(/^\//, ''),
    component: (REAL_SCREENS[item.route!.replace(/^\//, '')] as typeof MenuPage) ?? MenuPage,
    title: item.name,
    data: { name: item.name, route: item.route }
  }));

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'app/auth/profile', component: Profile, title: 'Profile', data: { name: 'Profile', route: '/app/auth/profile' } },
  ...menuRoutes
];
