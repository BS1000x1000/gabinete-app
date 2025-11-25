/* models/nav-item.ts */
export interface NavItem {
  label: string;
  icon: string;      // Bootstrap Icons
  route: string;
  children?: NavItem[];
}