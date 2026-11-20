import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title:'Mindora — сенің AI қолдаушың',
  description:'Студенттерге арналған виртуалды AI психологиялық қолдау: дауыстық сөйлесу, тыныс алу жаттығулары және психолог табу.',
  manifest:'/manifest.webmanifest',
  appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'Mindora'},
  icons:{icon:'/icons/icon-192.png',apple:'/icons/icon-192.png'}
};
export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#160d2f'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="kk"><body>{children}</body></html>;
}
