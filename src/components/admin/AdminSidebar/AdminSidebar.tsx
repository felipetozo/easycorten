'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { TbLayoutSidebarLeftCollapse, TbDoorExit } from 'react-icons/tb';
import { RiBarChartLine, RiFileTextLine } from 'react-icons/ri';
import styles from './AdminSidebar.module.css';

type User = { name?: string | null; email?: string | null; image?: string | null };

const STORAGE_COLLAPSED   = 'ec-admin-sidebar-collapsed';
const SIDEBAR_W_EXPANDED  = '18.48rem';
const SIDEBAR_W_COLLAPSED = '4.5rem';

export default function AdminSidebar({ user }: { user?: User }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_COLLAPSED);
    const isCollapsed = saved === 'true';
    setCollapsed(isCollapsed);
    document.documentElement.style.setProperty('--sidebar-w', isCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_COLLAPSED, String(next));
      document.documentElement.style.setProperty('--sidebar-w', next ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED);
      return next;
    });
  }

  const navItems = [
    { href: '/admin/analytics', label: 'Analytics', Icon: RiBarChartLine },
    { href: '/admin/conteudo',  label: 'Conteúdo',  Icon: RiFileTextLine },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>

      <div className={`${styles.header} ${collapsed ? styles.headerCollapsed : ''}`}>
        {collapsed ? (
          <span className={styles.brandMark}>EC</span>
        ) : (
          <img
            src="/easycorten-Ago2023-LogotipoHorizontal_Color.svg"
            alt="Easy Corten"
            className={styles.brandLogo}
          />
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`${styles.collapseBtn} ${collapsed ? styles.collapseBtnCollapsed : ''}`}
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          <TbLayoutSidebarLeftCollapse
            size={20}
            className={collapsed ? styles.collapseIconFlipped : undefined}
          />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Navegação admin">
        <ul className={styles.list}>
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className={styles.navIcon} />
                  {!collapsed && <span className={styles.navLabel}>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`${styles.footer} ${collapsed ? styles.footerCollapsed : ''}`}>
        {!collapsed && (
          <span className={styles.footerName}>{user?.name || user?.email || 'Admin'}</span>
        )}
        <Link href="/login" className={styles.signOutBtn} title="Sair" aria-label="Sair">
          <TbDoorExit size={18} />
        </Link>
      </div>

    </aside>
  );
}
