import { Routes } from '@angular/router';
import { MENU_DATA, MenuItem } from './Shared/layout/menu.data';
import { MenuPage } from './Shared/layout/menu-page';
import { PaymentsReceipts } from './pages/Donations/Payment_History/payments-receipts';
import { Profile } from './pages/Auth/Profile/profile';
import { NewCampaign } from './pages/Campaign/Campaign_Wizard/new-campaign';
import { LeadProfile } from './pages/Donor & Leads/Lead_Work_Queue/Lead_Profile/lead-profile';

const flatten = (items: readonly MenuItem[]): MenuItem[] => items.flatMap((item) => [item, ...flatten(item.children)]);

/** Menu routes that have a real screen (key = route without the leading slash). */
const REAL_SCREENS: Record<string, unknown> = {
  'app/donations/payment-event-queue': PaymentsReceipts,
  'app/fundraising/campaigns/campaign-wizard': NewCampaign
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
   { path: 'app/fundraising/Lead/Lead-view', component: LeadProfile, title: 'Lead_Profile', data: { name: 'Lead_Profile', route: '/app/fundraising/Lead/Lead-view' } },
  ...menuRoutes
];