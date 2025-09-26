"use client";
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/comodels'
import Footer from '@/components/Footer'

export default function ModelsPage() {
  return (
    <main className="bg-gray-900 text-white">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  )
}