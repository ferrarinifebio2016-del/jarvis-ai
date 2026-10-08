import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {title:'JARVIS · Personal AI assistant',description:'Your personal intelligence workspace. English and Romanian AI conversations.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
