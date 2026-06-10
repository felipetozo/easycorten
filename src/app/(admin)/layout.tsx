import AdminSidebar from '@/components/admin/AdminSidebar/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar/AdminTopbar';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.content}>
        <AdminTopbar />
        {children}
      </div>
    </div>
  );
}
