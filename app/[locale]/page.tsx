import { redirect } from 'next/navigation'

interface HomePageProps {
  params: { locale: string }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  redirect(`/${locale}/dashboard`)
}
