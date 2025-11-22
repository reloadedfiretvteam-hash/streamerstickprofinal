import { useState, useEffect } from 'react'
import './Carousel.css'

function Carousel({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  if (!slides || slides.length === 0) {
    return null
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="carousel-section">
      <div className="carousel-container">
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div key={slide.id} className="carousel-slide">
              <div className="slide-content">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="slide-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400/1a1a1a/ff4500?text=' + encodeURIComponent(slide.title)
                  }}
                />
                <div className="slide-overlay">
                  <h2 className="slide-title">{slide.title}</h2>
                  <p className="slide-description">{slide.description}</p>
                  {slide.link_url && (
                    <a href={slide.link_url} className="slide-cta">Learn More</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous slide">
          ‹
        </button>
        <button className="carousel-btn next" onClick={nextSlide} aria-label="Next slide">
          ›
        </button>

        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Carousel
