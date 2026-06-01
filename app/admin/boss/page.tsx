import { redirect } from 'next/navigation';

export default function BossRedirectPage() {
  redirect('/admin/dashboard');
}
