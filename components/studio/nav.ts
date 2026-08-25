export type StudioNavItem = {
  label: string;
  href: string;
  description: string;
};

export const studioNav: StudioNavItem[] = [
  { label: 'Dashboard', href: '/studio', description: 'Overview of the house' },
  { label: 'Products', href: '/studio/products', description: 'Manage catalogue' },
  { label: 'Categories', href: '/studio/categories', description: 'Manage categories' },
  { label: 'Divisions', href: '/studio/divisions', description: 'Manage divisions' },
  { label: 'Collections', href: '/studio/collections', description: 'Manage collections' },
  { label: 'Orders', href: '/studio/orders', description: 'View and manage orders' },
  { label: 'Customers', href: '/studio/customers', description: 'View customer info' },
  { label: 'Homepage', href: '/studio/homepage', description: 'Manage featured content' },
  { label: 'Discounts', href: '/studio/discounts', description: 'Manage discounts' },
  { label: 'Settings', href: '/studio/settings', description: 'Site settings' },
];
