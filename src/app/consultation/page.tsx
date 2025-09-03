'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  CheckCircle, 
  Star,
  Users,
  Award,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Zap,
  Globe,
  Camera,
  Settings,
  Brain,
  Target,
  X
} from 'lucide-react'

// Cal.com integration hook
const useCalComBooking = () => {
  const [isLoading, setIsLoading] = useState(false)

  const openBooking = (eventType: string) => {
    setIsLoading(true)
    
    // Cal.com embed configuration
    const calComUrl = process.env.NEXT_PUBLIC_CALCOM_BASE_URL || 'https://cal.com'
    const bookingUrl = `${calComUrl}/${eventType}`
    
    // Open in a modal or new window
    window.open(bookingUrl, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes')
    
    setIsLoading(false)
  }

  return { openBooking, isLoading }
}

// Quiz popup component
const QuizPopup = ({ isOpen, onClose, onStartQuiz }: {
  isOpen: boolean
  onClose: () => void
  onStartQuiz: () => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.9, 
              y: 20,
              x: 0 // Mobile: center
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              y: 20,
              x: 0
            }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed z-50 inset-4
              /* Mobile: centered with safe margins */
              flex items-center justify-center pointer-events-none
              /* Desktop: bottom-right corner */
              md:inset-auto md:bottom-6 md:right-6 md:flex-none 
              md:items-start md:justify-start"
          >
            <Card className="pointer-events-auto relative border-2 border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl w-full max-w-md md:max-w-sm">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Not Sure What You Need?</CardTitle>
                <CardDescription>
                  Take our quick quiz to discover the perfect solution for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Takes just 2-3 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Get personalized recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Discover services you might not know you need</span>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Maybe Later
                    </Button>
                    <Button onClick={onStartQuiz} className="flex-1">
                      <Zap className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Floating Quiz Icon component
const FloatingQuizIcon = ({ isVisible, onClick }: {
  isVisible: boolean
  onClick: () => void
}) => {
  const [showTooltip, setShowTooltip] = useState(true)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowTooltip(false)
      }, 7000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={onClick}
            size="icon"
            className="group relative h-12 w-12 rounded-full border border-white/15 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 transition-colors"
          >
            {/* subtle inner ring */}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
            {/* theme-aware subtle gradient */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 dark:from-white/10 dark:via-white/5 dark:to-white/10" />
            {/* center icon */}
            <HelpCircle className="h-5 w-5 text-black dark:text-white pastel:text-pink-600 transition-transform group-hover:scale-110" />
            {/* soft highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent opacity-70" />
          </Button>
          
          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm font-medium shadow-lg whitespace-nowrap"
            >
              Need help choosing? Take our quiz!
              <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-4 border-l-background/95 border-y-4 border-y-transparent"></div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const consultationTypes = [
  // Free consultation - always first
  {
    id: 'discovery-call',
    title: 'Discovery Call',
    duration: '30 minutes',
    price: 'FREE',
    originalPrice: null,
    description: 'Perfect starting point - understand your needs and explore possibilities',
    features: [
      'Project assessment and feasibility',
      'Technology recommendations',
      'Custom solution planning',
      'Timeline and budget discussion',
      'Next steps roadmap'
    ],
    calEventType: 'discovery-call',
    popular: true,
    gradient: 'from-green-500 to-emerald-600',
    icon: 'Calendar'
  },
  
  // Web Development & Design Package
  {
    id: 'web-development-package',
    title: 'Web Development & Design',
    duration: 'Project-based',
    price: 'From $2,500',
    originalPrice: null,
    description: 'Modern, fast, and conversion-optimized websites that represent your brand professionally',
    features: [
      'Custom website development',
      'Mobile-responsive design',
      'SEO optimization',
      'Performance optimization',
      'E-commerce solutions',
      'Content management system',
      '30-day post-launch support'
    ],
    calEventType: 'web-development-package',
    popular: false,
    gradient: 'from-blue-500 to-indigo-600',
    icon: 'Globe'
  },

  // Professional Photography Package
  {
    id: 'photography-package',
    title: 'Professional Photography',
    duration: 'Project-based',
    price: 'From $800',
    originalPrice: null,
    description: 'Stunning photography that tells your brand story and attracts ideal customers',
    features: [
      'Business headshots',
      'Product photography',
      'Brand photography',
      'Event photography',
      'Image editing & enhancement',
      'Social media ready formats',
      'High-resolution deliverables'
    ],
    calEventType: 'photography-package',
    popular: false,
    gradient: 'from-purple-500 to-pink-600',
    icon: 'Camera'
  },

  // Video Production Package
  {
    id: 'video-production-package',
    title: 'Video Production',
    duration: 'Project-based',
    price: 'From $1,500',
    originalPrice: null,
    description: 'Compelling video content that engages your audience and drives results',
    features: [
      'Brand story videos',
      'Product demonstrations',
      'Corporate videos',
      'Social media video content',
      'Event videography',
      'Professional editing',
      'Multiple format delivery'
    ],
    calEventType: 'video-production-package',
    popular: false,
    gradient: 'from-red-500 to-orange-600',
    icon: 'Video'
  },

  // Business Automation Package
  {
    id: 'automation-package',
    title: 'Business Automation',
    duration: 'Project-based',
    price: 'From $1,200',
    originalPrice: null,
    description: 'Automate repetitive tasks so you can focus on growing your business',
    features: [
      'Workflow automation',
      'Customer service automation',
      'Lead nurturing systems',
      'Data entry automation',
      'Social media automation',
      'Integration solutions',
      'Training and documentation'
    ],
    calEventType: 'automation-package',
    popular: false,
    gradient: 'from-cyan-500 to-blue-600',
    icon: 'Zap'
  },

  // AI Solutions Package
  {
    id: 'ai-solutions-package',
    title: 'AI Solutions & Consulting',
    duration: 'Project-based',
    price: 'From $2,000',
    originalPrice: null,
    description: 'Harness AI to save time, reduce costs, and gain competitive advantage',
    features: [
      'AI chatbots and assistants',
      'Content generation systems',
      'Predictive analytics',
      'AI-powered automation',
      'Custom AI solutions',
      'AI strategy consulting',
      'Implementation support'
    ],
    calEventType: 'ai-solutions-package',
    popular: false,
    gradient: 'from-violet-500 to-purple-600',
    icon: 'Brain'
  },

  // Technology Consulting Package
  {
    id: 'tech-consulting-package',
    title: 'Technology Consulting',
    duration: 'Project-based',
    price: 'From $150/hr',
    originalPrice: null,
    description: 'Navigate technology decisions with confidence and expert guidance',
    features: [
      'Technology strategy',
      'System integration',
      'Tool selection and setup',
      'Digital transformation',
      'Tech stack optimization',
      'Training and support',
      'Ongoing consultation'
    ],
    calEventType: 'tech-consulting-package',
    popular: false,
    gradient: 'from-gray-500 to-slate-600',
    icon: 'Settings'
  },

  // Custom Package
  {
    id: 'custom-package',
    title: 'Custom Solution',
    duration: 'Tailored to your needs',
    price: 'Contact for quote',
    originalPrice: null,
    description: 'Unique challenges require unique solutions. Let\'s create something perfect for you',
    features: [
      'Completely customized approach',
      'Multi-service combinations',
      'Flexible timeline and budget',
      'Dedicated project management',
      'Priority support',
      'Scalable solutions',
      'Long-term partnership'
    ],
    calEventType: 'custom-package',
    popular: false,
    gradient: 'from-amber-500 to-yellow-600',
    icon: 'Sparkles'
  }
]

const socialProof = [
  { metric: '500+', label: 'Projects Completed' },
  { metric: '98%', label: 'Client Satisfaction' },
  { metric: '12h', label: 'Average Response Time' },
  { metric: '5★', label: 'Average Rating' }
]

export default function ConsultationPage() {
  const { openBooking, isLoading } = useCalComBooking()
  const [showQuizPopup, setShowQuizPopup] = useState(false)
  const [showQuizIcon, setShowQuizIcon] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [popupHasBeenShown, setPopupHasBeenShown] = useState(false)
  const [timeTriggered, setTimeTriggered] = useState(false)



  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200 && !hasScrolled) {
        setHasScrolled(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Show quiz popup/icon after 3 seconds of scrolling OR 7 seconds without scrolling
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (hasScrolled && !popupHasBeenShown) {
      // User scrolled - show popup after 3 seconds
      timer = setTimeout(() => {
        setShowQuizPopup(true)
        setPopupHasBeenShown(true)
      }, 3000)
    } else if (!hasScrolled && !timeTriggered && !popupHasBeenShown) {
      // User hasn't scrolled - show icon after 7 seconds
      timer = setTimeout(() => {
        setShowQuizIcon(true)
        setTimeTriggered(true)
      }, 7000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [hasScrolled, popupHasBeenShown, timeTriggered])

  // Show icon when popup is closed or when time trigger activates
  useEffect(() => {
    if (popupHasBeenShown && !showQuizPopup) {
      setShowQuizIcon(true)
    }
  }, [popupHasBeenShown, showQuizPopup])

  const handleStartQuiz = () => {
    setShowQuizPopup(false)
    window.location.href = '/quiz'
  }

  const handleClosePopup = () => {
    setShowQuizPopup(false)
    setPopupHasBeenShown(true)
    setShowQuizIcon(true)
  }

  const handleOpenPopup = () => {
    setShowQuizPopup(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-8 sm:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Success Starts Here</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Let's Build Something
            <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Extraordinary
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed px-4">
            Turn your vision into reality with expert guidance. Get personalized solutions that drive real results for your business.
          </p>

          {/* Quiz CTA Button */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/quiz">
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-2 border-primary/30 hover:border-primary bg-background/50 backdrop-blur-sm max-w-[90vw] mx-auto"
              >
                <HelpCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="text-center">Not Sure What You Need? Take Our Quiz</span>
                <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Get personalized service recommendations in 2 minutes
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {socialProof.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{item.metric}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Service Packages */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {consultationTypes.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative"

            >
              {consultation.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${
                consultation.popular 
                  ? 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20' 
                  : 'border-border hover:border-primary/30'
              }`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${consultation.gradient}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${consultation.gradient}`}>
                      {consultation.icon === 'Calendar' && <Calendar className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Globe' && <Globe className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Camera' && <Camera className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Video' && <Video className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Zap' && <Zap className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Brain' && <Brain className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Settings' && <Settings className="h-5 w-5 text-white" />}
                      {consultation.icon === 'Sparkles' && <Sparkles className="h-5 w-5 text-white" />}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">{consultation.duration}</span>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{consultation.title}</CardTitle>
                  <CardDescription className="text-base">{consultation.description}</CardDescription>
                  
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl font-bold text-primary">{consultation.price}</span>
                    {consultation.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">{consultation.originalPrice}</span>
                    )}
                    {consultation.price === 'FREE' && (
                      <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        Limited Time
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {consultation.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground leading-tight">{feature}</span>
                      </li>
                    ))}
                    {consultation.features.length > 5 && (
                      <li className="text-xs text-muted-foreground/70 italic pl-5">
                        +{consultation.features.length - 5} more features included
                      </li>
                    )}
                  </ul>
                  
                  <Button 
                    className={`w-full text-sm py-4 font-semibold ${
                      consultation.popular 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                        : ''
                    }`}
                    onClick={() => openBooking(consultation.calEventType)}
                    disabled={isLoading}
                  >
                    {consultation.price === 'FREE' || consultation.price === 'Contact for quote' ? (
                      <Calendar className="mr-2 h-4 w-4" />
                    ) : (
                      <MessageSquare className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Opening...' : consultation.price === 'Contact for quote' ? 'Get Quote' : 'Book Now'}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Value Proposition */}
        <motion.section
          className="mb-8 sm:mb-12 lg:mb-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Why Choose Our Services?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Award,
                title: 'Expert Guidance',
                description: 'Years of experience across multiple industries and technologies'
              },
              {
                icon: Zap,
                title: 'Actionable Insights',
                description: 'Walk away with concrete next steps and implementation strategies'
              },
              {
                icon: Users,
                title: 'Personalized Approach',
                description: 'Tailored solutions that fit your specific business needs and goals'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="text-center py-16 px-8 rounded-2xl bg-gradient-to-r from-primary/10 via-blue-600/10 to-purple-600/10 border border-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with a free discovery call to explore your needs, or dive straight into one of our specialized service packages.
          </p>
          <Button
            size="lg"
            className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 max-w-[90vw] mx-auto"
            onClick={() => openBooking('discovery-call')}
          >
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-center">Book Your FREE Discovery Call</span>
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No commitment required • 30 minutes • Completely free
          </p>
        </motion.section>
      </div>
      
      {/* Quiz Popup */}
      <QuizPopup
        isOpen={showQuizPopup}
        onClose={handleClosePopup}
        onStartQuiz={handleStartQuiz}
      />
      
      {/* Floating Quiz Icon */}
      <FloatingQuizIcon
        isVisible={showQuizIcon && !showQuizPopup}
        onClick={handleOpenPopup}
      />
    </div>
  )
}