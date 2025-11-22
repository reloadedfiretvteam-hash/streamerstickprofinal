import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import HeroSection from '../components/HeroSection'
import Carousel from '../components/Carousel'
import PricingSection from '../components/PricingSection'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'
import './HomePage.css'

function HomePage() {
  const [pricingPlans, setPricingPlans] = useState([])
  const [carouselSlides, setCarouselSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: plans } = await supabase
          .from('pricing_plans')
          .select('*')
          .eq('active', true)
          .order('display_order')

        const { data: slides } = await supabase
          .from('carousel_slides')
          .select('*')
          .eq('active', true)
          .order('display_order')

        setPricingPlans(plans || [])
        setCarouselSlides(slides || [])

        await supabase.from('visitors').insert({
          page_url: window.location.href,
          referrer: document.referrer
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="homepage">
      <HeroSection />
      <Carousel slides={carouselSlides} />
      <FeaturesSection />
      <PricingSection plans={pricingPlans} />
      <Footer />
    </div>
  )
}

export default HomePage
