import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import './App.css';

const categories = [
{
    icon: '💻',
    title: 'Web Development',
    description: 'Websites and applications',
    keywords: 'web design coding websites programming',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'
  },
  {
    icon: '🎨',
    title: 'Graphic Design',
    description: 'Creative visual designs',
    keywords: 'graphics logo posters branding',
    image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600'
  },
  {
    icon: '📸',
    title: 'Photography',
    description: 'Professional photography',
    keywords: 'photos pictures camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'
  },
  {
    icon: '📝',
    title: 'Writing',
    description: 'Content and copywriting',
    keywords: 'writing articles content editing',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600'
  },
  {
    icon: '🔧',
    title: 'Technical Support',
    description: 'Technology solutions',
    keywords: 'computer repair troubleshooting',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'
  },
  {
    icon: '📱',
    title: 'Digital Marketing',
    description: 'Grow your online presence',
    keywords: 'social media advertising marketing',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
  }
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [pendingService, setPendingService] = useState(null);

  const filteredCategories = categories.filter((category) => {
    const search = activeSearch.toLowerCase();

    return (
      category.title.toLowerCase().includes(search) ||
      category.description.toLowerCase().includes(search) ||
      category.keywords.toLowerCase().includes(search)
    );
  });

  const [showAuth, setShowAuth] = useState(false);

const [authMode, setAuthMode] = useState('register');

const [userType, setUserType] = useState('customer');

const [message, setMessage] = useState('');
const [fullName, setFullName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [authChecking, setAuthChecking] = useState(true);

useEffect(() => {
    const restoreSession = async () => {
        const token = localStorage.getItem('skilllinkToken');

        if (!token) {
            setAuthChecking(false);
            return;
        }

        try {
            const response = await fetch(
                'http://localhost:5000/api/profile',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('skilllinkToken');
                }

                return;
            }

            setCurrentUser(data);

        } catch (error) {
            console.error('Session restoration error:', error);
        } finally {
            setAuthChecking(false);
        }
    };

    restoreSession();
}, []);

useEffect(() => {
  const fetchFeaturedServices = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/services'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to load services');
      }

      setFeaturedServices(data);
    } catch (error) {
      console.error('Featured services error:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  fetchFeaturedServices();
  const interval = setInterval(fetchFeaturedServices, 10000);

return () => clearInterval(interval);
}, []);

  function handleSearch() {
    setActiveSearch(searchTerm.trim());
  }

  if (authChecking) {
    return <h2>Loading SkillLink...</h2>;
}

if (currentUser) {
  return <Dashboard
    user={currentUser}
    initialService={pendingService}
    onLogout={() => {
      localStorage.removeItem('skillLinkToken');
      setCurrentUser(null);
    }}
  />
}

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">
        <h2 className="logo">
          Skill<span>Link.</span>
        </h2>

        <button
  className="menu-toggle"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label="Toggle navigation menu"
>
  {menuOpen ? '✕' : '☰'}
</button>

<div className={`nav-links ${menuOpen ? 'active' : ''}`}>
  <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
  <a href="#services" onClick={() => setMenuOpen(false)}>Explore Services</a>
  <a href="#providers" onClick={() => setMenuOpen(false)}>Find Professionals</a>
</div>

        <div className="nav-buttons">
  <button
    className="login"
    onClick={() => {
      setAuthMode('login');
      setShowAuth(true);
      setMessage('');
    }}
  >
    Login
  </button>

  <button
    className="signup"
    onClick={() => {
      setAuthMode('register');
      setShowAuth(true);
      setMessage('');
    }}
  >
    Join SkillLink
  </button>
</div>
      </nav>
      {/* Registration and Login */}
{showAuth && (
  <section className="auth-section">
    <div className="auth-card">

      <button
        className="close-auth"
        onClick={() => setShowAuth(false)}
      >
        ×
      </button>

      <h2>
        {authMode === 'register'
          ? 'Join SkillLink'
          : 'Welcome Back'}
      </h2>

      <p>
        {authMode === 'register'
          ? 'Create your account and discover opportunities.'
          : 'Login to your SkillLink account.'}
      </p>

    <form onSubmit={async (e) => {
  e.preventDefault();

  setLoading(true);
  setMessage('');

  try {
    const endpoint = authMode === 'register'
      ? 'http://localhost:5000/api/auth/register'
      : 'http://localhost:5000/api/auth/login';

    const requestData = authMode === 'register'
      ? { fullName, email, password, role: userType }
      : { email, password };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

   if (authMode === 'login') {
  localStorage.setItem('skilllinkToken', data.token);
  setCurrentUser(data.user);
  setShowAuth(false);
}

    setMessage(data.message);

  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
}}>

        {authMode === 'register' && (
          <>
            <label>Full Name</label>
            <input
  type="text"
  placeholder="Enter your full name"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  required
/>

            <label>I want to join as:</label>

            <div className="role-options">
              <label>
                <input
                  type="radio"
                  name="role"
                  checked={userType === 'customer'}
                  onChange={() => setUserType('customer')}
                />
                Customer
              </label>

              <label>
                <input
                  type="radio"
                  name="role"
                  checked={userType === 'provider'}
                  onChange={() => setUserType('provider')}
                />
                Service Provider
              </label>
            </div>
          </>
        )}

        <label>Email Address</label>
        <input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

        <label>Password</label>
        <input
  type="password"
  placeholder="Enter your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  minLength="8"
  required
/>

       <button
  type="submit"
  className="auth-submit"
  disabled={loading}
>
  {loading
    ? 'Please wait...'
    : authMode === 'register'
      ? 'Create Account'
      : 'Login'}
</button>
      </form>

      {message && (
        <p className="auth-message">{message}</p>
      )}

      <p className="auth-switch">
        {authMode === 'register'
          ? 'Already have an account?'
          : "Don't have an account?"}

        <button
          onClick={() => {
            setAuthMode(
              authMode === 'register'
                ? 'login'
                : 'register'
            );
            setMessage('');
          }}
        >
          {authMode === 'register' ? 'Login' : 'Sign Up'}
        </button>
      </p>

    </div>
  </section>
)}

      {/* Hero section */}
      <section className="hero" id="home">
        <div className="hero-content">

          <p className="tagline">
            YOUR SKILLS. YOUR OPPORTUNITIES.
          </p>

          <h1>
            Find the right talent.
            <br />
            Get things done.
          </h1>

          <p className="hero-description">
            Connect with talented professionals and
            discover reliable services all in one place.
          </p>

          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="What service are you looking for?"
            />

            <button onClick={handleSearch}>
              Search
            </button>
          </div>

          <p className="popular">
            Popular: Web Design · Graphics · Photography
          </p>

        </div>
      </section>

      {/* Categories */}
      <section className="categories" id="services">

        <h2>Explore Popular Services</h2>

        <p>Find the right professional for your next project.</p>

        {activeSearch && (
          <p>
            Search results for: <strong>{activeSearch}</strong>
            <button onClick={() => {
              setSearchTerm('');
              setActiveSearch('');
            }}>
              Clear Search
            </button>
          </p>
        )}

        <div className="category-grid">

  {filteredCategories.map((category) => (
    <div className="category-card" key={category.title}>

      <div className="category-image">
        <img
          src={category.image}
          alt={category.title}
        />
        <span>{category.icon}</span>
      </div>

      <div className="category-info">
        <h3>{category.title}</h3>
        <p>{category.description}</p>
      </div>

    </div>
  ))}

</div>

        {filteredCategories.length === 0 && (
          <p>No matching services found. Try another search.</p>
        )}

      </section>

        {/* Featured Services */}
      <section className="featured-services">

        <p className="featured-tagline">DISCOVER GREAT TALENT</p>

        <h2>Featured Services</h2>

        <p className="featured-description">
          Explore services published by talented professionals
          on SkillLink.
        </p>

        {servicesLoading ? (
          <p>Loading services...</p>
        ) : featuredServices.length === 0 ? (
          <p>No services have been published yet. Check back soon!</p>
        ) : (

          <div className="featured-grid">

            {featuredServices.slice(0, 6).map((service) => (

              <div
  className="featured-card"
  key={service._id}
  onClick={() => setSelectedService(service)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') setSelectedService(service);
  }}
>

                <div className="featured-icon">
                  {service.category?.toLowerCase().includes('design')
                    ? '🎨'
                    : service.category?.toLowerCase().includes('web')
                    ? '💻'
                    : service.category?.toLowerCase().includes('photo')
                    ? '📸'
                    : service.category?.toLowerCase().includes('writing')
                    ? '📝'
                    : '⭐'}
                </div>

                <span className="featured-category">
                  {service.category}
                </span>

                <h3>{service.title}</h3>

                <p className="featured-service-description">
                  {service.description}
                </p>

                <div className="featured-provider">
                  Provider: {service.provider?.fullName || 'SkillLink Professional'}
                </div>

                <div className="featured-price">
                  GH₵ {Number(service.price).toFixed(2)}
                </div>

              </div>

            ))}

          </div>
        )}

      </section>


      {/* How SkillLink Works */}
      <section className="how-it-works">

        <p className="how-tagline">SIMPLE. FAST. RELIABLE.</p>

        <h2>How SkillLink Works</h2>

        <p className="how-description">
          Getting the help you need or finding new customers
          is just a few steps away.
        </p>

        <div className="steps-grid">

          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">🔍</div>
            <h3>Discover Services</h3>
            <p>
              Explore different service categories and
              find professionals with the skills you need.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🤝</div>
            <h3>Connect with Professionals</h3>
            <p>
              Choose a service and send a request
              directly to the right professional.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">⭐</div>
            <h3>Get the Job Done</h3>
            <p>
              Work with your chosen professional,
              complete the service and share your review.
            </p>
          </div>

        </div>

      </section>
      {/* Testimonials */}
      <section className="testimonials">

        <p className="testimonial-tagline">COMMUNITY LOVE</p>

        <h2>What People Say About SkillLink</h2>

        <p className="testimonial-description">
          A platform built to connect talent with opportunity.
        </p>

        <div className="testimonial-grid">

          <div className="testimonial-card">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p>
              "SkillLink makes it easier to discover talented
              professionals and find the services I need."
            </p>
            <h3>Sarah M.</h3>
            <span>Customer · Sample testimonial</span>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p>
              "It's a great way to showcase my skills and
              connect with people looking for my services."
            </p>
            <h3>Daniel K.</h3>
            <span>Service Provider · Sample testimonial</span>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p>
              "The platform brings customers and skilled
              professionals together in one convenient place."
            </p>
            <h3>Michael A.</h3>
            <span>Customer · Sample testimonial</span>
          </div>

        </div>

      </section>

      {/* Provider section */}
      <section className="providers" id="providers">

        <p className="providers-tagline">THE SKILLLINK ADVANTAGE</p>

        <h2>Why Choose SkillLink?</h2>

        <p className="providers-description">
          Discover talent, connect with professionals
          and turn your ideas into reality.
        </p>

        <div className="provider-grid">

          <div className="provider-card">
            <div className="provider-icon">🎯</div>
            <h3>Find Skilled People</h3>
            <p>
              Discover talented professionals with the
              expertise you need to bring your ideas to life.
            </p>
          </div>

          <div className="provider-card">
            <div className="provider-icon">⚡</div>
            <h3>Save Time</h3>
            <p>
              Find the right services quickly and easily
              without endless searching.
            </p>
          </div>

          <div className="provider-card">
            <div className="provider-icon">🚀</div>
            <h3>Grow Your Business</h3>
            <p>
              Showcase your skills, connect with customers
              and unlock new opportunities.
            </p>
          </div>

        </div>
      </section>


      {/* Service Details Popup */}
      {selectedService && (
        <div className="service-modal-overlay">
          <div className="service-modal">

            <button
              className="close-service-modal"
              onClick={() => setSelectedService(null)}
            >
              ×
            </button>

            <div className="service-modal-icon">🛠️</div>

            <span className="featured-category">
              {selectedService.category}
            </span>

            <h2>{selectedService.title}</h2>

            <p className="service-modal-description">
              {selectedService.description}
            </p>

            <div className="service-modal-details">
              <p>
                <strong>Service Provider:</strong>{' '}
                {selectedService.provider?.fullName || 'SkillLink Professional'}
              </p>

              <p>
                <strong>Price:</strong>{' '}
                GH₵ {Number(selectedService.price).toFixed(2)}
              </p>
            </div>

            <button
              className="request-service-button"
              onClick={() => {
  setPendingService(selectedService);
  setSelectedService(null);
  setAuthMode('login');
  setShowAuth(true);
  setMessage('');
}}
            >
              Login to Request Service
            </button>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">

        <div className="footer-content">

          <div className="footer-brand">
            <h2>Skill<span>Link.</span></h2>
            <p>
              Connecting skills with opportunities.
              Discover talent, share your expertise
              and grow together.
            </p>
          </div>

          <div className="footer-links">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#services">Explore Services</a>
            <a href="#providers">Why SkillLink</a>
          </div>

          <div className="footer-links">
            <h3>Get Started</h3>
            <a href="#home">Find Professionals</a>
            <a href="#services">Discover Services</a>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2026 SkillLink. All rights reserved.</p>
          <p>Built to connect skills with opportunities. ❤️</p>
        </div>

      </footer>
    </div>
  );
}

export default App;