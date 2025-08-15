'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, CheckCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

// Animated counter component
const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startValue = 0
    const endValue = value
    const startTime = Date.now()

    const updateCounter = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (endValue - startValue) * easedProgress
      
      setDisplayValue(Math.round(currentValue))
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }

    updateCounter()
  }, [value, duration])

  return <span>{displayValue}</span>
}

type QuestionOption = {
  value: string
  text: string
  weight: {
    web?: number
    photo?: number
    cinema?: number
    automation?: number
    ai?: number
    tech?: number
  }
}

type Question = {
  id: string
  text: string
  type: 'single' | 'multiple'
  options: QuestionOption[]
  condition?: (answers: Record<string, string | string[]>) => boolean
}

const quizQuestions: Question[] = [
  // Question 1: Primary Challenge (Always shown)
  {
    id: '1',
    text: "What's your primary business challenge right now?",
    type: 'single' as const,
    options: [
      { value: "online_presence", text: "Need a better online presence/website", weight: { web: 4, photo: 1 } },
      { value: "content_creation", text: "Need high-quality visual content", weight: { photo: 4, cinema: 4 } },
      { value: "manual_tasks", text: "Too many repetitive manual tasks", weight: { automation: 4, ai: 2 } },
      { value: "tech_overwhelm", text: "Overwhelmed by technology decisions", weight: { tech: 4, ai: 1 } },
      { value: "efficiency", text: "Want to work smarter, not harder", weight: { ai: 4, automation: 4, tech: 2 } },
      { value: "growth", text: "Ready to scale but don't know how", weight: { tech: 3, ai: 3, automation: 3, web: 2 } }
    ]
  },

  // Question 2: Business Type (Always shown)
  {
    id: '2',
    text: "What type of business are you in?",
    type: 'single' as const,
    options: [
      { value: "ecommerce", text: "E-commerce/Online retail", weight: { web: 4, automation: 3, ai: 2 } },
      { value: "service", text: "Service-based business", weight: { web: 3, photo: 2, automation: 2 } },
      { value: "restaurant", text: "Restaurant/Food service", weight: { photo: 4, cinema: 3, web: 2 } },
      { value: "real_estate", text: "Real estate", weight: { photo: 4, cinema: 4, web: 2 } },
      { value: "healthcare", text: "Healthcare/Medical", weight: { web: 3, automation: 4, ai: 3 } },
      { value: "creative", text: "Creative/Agency", weight: { photo: 3, cinema: 3, web: 4 } },
      { value: "tech", text: "Tech/SaaS", weight: { web: 4, ai: 4, automation: 3 } },
      { value: "other", text: "Other", weight: { tech: 2, web: 2, ai: 1 } }
    ]
  },

  // Question 3: Website situation (Only if they need online presence OR run ecommerce/service/creative/tech)
  {
    id: '3',
    text: "What's your current website situation?",
    type: 'single' as const,
    condition: (answers) => {
      const challenge = answers['1'] as string
      const business = answers['2'] as string
      return challenge === 'online_presence' || 
             ['ecommerce', 'service', 'creative', 'tech'].includes(business)
    },
    options: [
      { value: "no_website", text: "Don't have a website yet", weight: { web: 5 } },
      { value: "outdated", text: "Have one but it's outdated/slow", weight: { web: 4, tech: 2 } },
      { value: "diy", text: "Built it myself but not happy with it", weight: { web: 4 } },
      { value: "not_converting", text: "Looks good but doesn't generate leads", weight: { web: 3, automation: 3 } },
      { value: "happy", text: "Pretty happy with my current site", weight: { automation: 2, ai: 2 } }
    ]
  },

  // Question 4: Visual content (Only if they specifically need content creation OR are in visual businesses AND didn't select automation-focused challenges)
  {
    id: '4',
    text: "How do you currently handle visual content for your business?",
    type: 'single' as const,
    condition: (answers) => {
      const challenge = answers['1'] as string
      const business = answers['2'] as string
      
      // Show if they specifically mentioned content creation
      if (challenge === 'content_creation') return true
      
      // Show for visual businesses, but not if they're focused on automation/efficiency
      if (['restaurant', 'real_estate', 'creative', 'ecommerce'].includes(business)) {
        // Don't show if they're primarily focused on automation/efficiency challenges
        return !['manual_tasks', 'efficiency'].includes(challenge)
      }
      
      return false
    },
    options: [
      { value: "phone_photos", text: "Take photos with my phone", weight: { photo: 4, cinema: 2 } },
      { value: "stock_photos", text: "Use stock photos from the internet", weight: { photo: 4, cinema: 2 } },
      { value: "hire_occasionally", text: "Hire photographers occasionally", weight: { photo: 3, cinema: 3 } },
      { value: "team_member", text: "Have a team member do it", weight: { photo: 2, cinema: 2 } },
      { value: "professional_regular", text: "Work with professionals regularly", weight: { photo: 1, cinema: 1 } },
      { value: "no_visual", text: "Don't really use visual content", weight: { photo: 5, cinema: 4 } }
    ]
  },

  // Question 5: Time-consuming tasks (Only if they mentioned manual tasks, efficiency, or growth)
  {
    id: '5',
    text: "Which of these tasks take up too much of your time? (Select all that apply)",
    type: 'multiple' as const,
    condition: (answers) => {
      const challenge = answers['1'] as string
      return ['manual_tasks', 'efficiency', 'growth'].includes(challenge)
    },
    options: [
      { value: "data_entry", text: "Data entry and admin work", weight: { automation: 4, ai: 3 } },
      { value: "customer_service", text: "Answering the same customer questions", weight: { ai: 4, automation: 3 } },
      { value: "content_creation", text: "Creating social media content", weight: { photo: 3, cinema: 3, ai: 2 } },
      { value: "website_updates", text: "Updating website content", weight: { web: 3, automation: 2 } },
      { value: "scheduling", text: "Scheduling and calendar management", weight: { automation: 4, ai: 2 } },
      { value: "reporting", text: "Creating reports and analytics", weight: { automation: 3, ai: 3, tech: 2 } },
      { value: "lead_followup", text: "Following up with leads", weight: { automation: 4, ai: 3 } }
    ]
  },

  // Question 6: Technology frustrations (Only if they're overwhelmed, mentioned tech challenges, or have tech issues)
  {
    id: '6',
    text: "What's your biggest frustration with technology?",
    type: 'single' as const,
    condition: (answers) => {
      const challenge = answers['1'] as string
      const business = answers['2'] as string
      
      // Always show for tech overwhelm or tech business
      if (challenge === 'tech_overwhelm' || business === 'tech') return true
      
      // Show if they have website tech issues
      if (!!answers['3'] && ['outdated', 'diy'].includes(answers['3'] as string)) return true
      
      // Show for growth challenge (scaling typically involves tech decisions)
      if (challenge === 'growth') return true
      
      // Show if they selected automation-heavy tasks in question 5
      if (Array.isArray(answers['5'])) {
        const automationTasks = ['data_entry', 'customer_service', 'scheduling', 'reporting', 'lead_followup']
        const selectedTasks = answers['5'] as string[]
        if (selectedTasks.some(task => automationTasks.includes(task))) return true
      }
      
      return false
    },
    options: [
      { value: "too_complex", text: "Everything seems too complex", weight: { tech: 5, ai: 2 } },
      { value: "integration", text: "My tools don't work well together", weight: { tech: 4, automation: 4 } },
      { value: "time_consuming", text: "Takes too much time to learn new tools", weight: { automation: 4, ai: 3 } },
      { value: "expensive", text: "Good solutions are too expensive", weight: { tech: 3, automation: 3 } },
      { value: "maintenance", text: "Constant updates and maintenance", weight: { tech: 4, automation: 2 } },
      { value: "no_frustration", text: "I'm pretty comfortable with tech", weight: { ai: 3, automation: 3 } }
    ]
  },

  // Question 7: Budget (Always shown, but tailored based on identified needs)
  {
    id: '7',
    text: "What's your investment range for solving these challenges?",
    type: 'single' as const,
    options: [
      { value: "under_1k", text: "Under $1,000", weight: { web: 2, automation: 3, tech: 1 } },
      { value: "1k_5k", text: "$1,000 - $5,000", weight: { web: 3, photo: 3, automation: 3, tech: 2 } },
      { value: "5k_15k", text: "$5,000 - $15,000", weight: { web: 4, photo: 4, cinema: 3, ai: 3, tech: 3 } },
      { value: "15k_plus", text: "$15,000+", weight: { cinema: 5, ai: 5, tech: 5, automation: 4, web: 3 } },
      { value: "monthly_retainer", text: "Prefer monthly retainer", weight: { ai: 4, automation: 4, tech: 4 } },
      { value: "project_based", text: "Project-based pricing", weight: { web: 3, photo: 4, cinema: 4 } }
    ]
  },

  // Question 8: Timeline (Show for most people, but skip if they need immediate consultation)
  {
    id: '8',
    text: "What's your timeline for getting started?",
    type: 'single' as const,
    condition: (answers) => {
      const challenge = answers['1'] as string
      const business = answers['2'] as string
      
      // Don't show if they're overwhelmed (they need consultation first)
      if (challenge === 'tech_overwhelm') return false
      
      // Don't show if they indicated major tech frustrations (need assessment first)
      if (answers['6'] && ['too_complex', 'integration'].includes(answers['6'] as string)) return false
      
      // Show for most other scenarios
      return true
    },
    options: [
      { value: "asap", text: "As soon as possible", weight: { web: 2, photo: 3, cinema: 3 } },
      { value: "1_2_weeks", text: "Within 1-2 weeks", weight: { web: 3, photo: 3, automation: 2 } },
      { value: "1_month", text: "Within a month", weight: { web: 3, photo: 2, cinema: 2, automation: 3 } },
      { value: "2_3_months", text: "2-3 months", weight: { ai: 3, tech: 3, automation: 3 } },
      { value: "flexible", text: "I'm flexible", weight: { ai: 2, tech: 2, automation: 2 } }
    ]
  }
]

const quizResults = {
  web: {
    title: "Web Development & Design",
    subtitle: "Transform your online presence",
    description: "Based on your answers, you need a powerful web presence that converts visitors into customers. I can help you build a modern, fast, and conversion-optimized website that represents your brand professionally.",
    services: [
      "Custom website development",
      "E-commerce solutions", 
      "Website redesign & optimization",
      "Mobile-responsive design",
      "SEO optimization",
      "Performance optimization"
    ],
    cta: "Let's discuss your website project",
    nextSteps: "Book a free consultation to discuss your website goals and get a custom proposal."
  },
  photo: {
    title: "Professional Photography",
    subtitle: "Elevate your visual brand",
    description: "Your business deserves professional visual content that stands out. I can help you create stunning photography that tells your brand story and attracts your ideal customers.",
    services: [
      "Business headshots",
      "Product photography",
      "Brand photography",
      "Event photography",
      "Real estate photography",
      "Social media content creation"
    ],
    cta: "Let's plan your photo shoot",
    nextSteps: "Schedule a consultation to discuss your photography needs and creative vision."
  },
  cinema: {
    title: "Cinematography & Video Production",
    subtitle: "Bring your story to life",
    description: "Video content is essential for modern businesses. I can help you create compelling video content that engages your audience and drives results.",
    services: [
      "Brand story videos",
      "Product demonstrations",
      "Corporate videos",
      "Social media video content",
      "Event videography",
      "Commercial production"
    ],
    cta: "Let's create your video",
    nextSteps: "Book a consultation to discuss your video project and creative requirements."
  },
  automation: {
    title: "Business Automation Solutions",
    subtitle: "Work smarter, not harder",
    description: "Stop wasting time on repetitive tasks. I can help you automate your business processes so you can focus on what matters most - growing your business.",
    services: [
      "Workflow automation",
      "Customer service automation",
      "Lead nurturing systems",
      "Data entry automation",
      "Social media automation",
      "Integration solutions"
    ],
    cta: "Automate your business",
    nextSteps: "Schedule a process audit to identify automation opportunities in your business."
  },
  ai: {
    title: "AI Solutions & Consulting",
    subtitle: "Harness the power of AI",
    description: "AI can revolutionize how you work. I can help you implement AI solutions that save time, reduce costs, and give you a competitive advantage.",
    services: [
      "AI chatbots and assistants",
      "Content generation systems",
      "Predictive analytics",
      "AI-powered automation",
      "Custom AI solutions",
      "AI strategy consulting"
    ],
    cta: "Explore AI for your business",
    nextSteps: "Book an AI consultation to discover how artificial intelligence can transform your operations."
  },
  tech: {
    title: "Technology Consulting",
    subtitle: "Navigate technology with confidence",
    description: "Technology shouldn't be overwhelming. I can help you make smart technology decisions that align with your business goals and budget.",
    services: [
      "Technology strategy",
      "System integration",
      "Tool selection and setup",
      "Digital transformation",
      "Tech stack optimization",
      "Training and support"
    ],
    cta: "Get tech guidance",
    nextSteps: "Schedule a technology assessment to create a roadmap for your digital transformation."
  }
}

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<keyof typeof quizResults>('web')
  const [overallProgress, setOverallProgress] = useState(0)
  const [scores, setScores] = useState({
    web: 0,
    photo: 0,
    cinema: 0,
    automation: 0,
    ai: 0,
    tech: 0
  })
  const [servicePercentages, setServicePercentages] = useState<Array<{
    service: keyof typeof quizResults
    score: number
    percentage: number
  }>>([])
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Filter questions based on conditions
  const getAvailableQuestions = () => {
    return quizQuestions.filter(question => 
      !question.condition || question.condition(answers)
    )
  }

  const availableQuestions = getAvailableQuestions()
  const currentQuestion = availableQuestions[currentQuestionIndex]

  // Calculate progressive percentage based on available questions for this user
  const calculateProgressivePercentage = () => {
    const totalAvailableQuestions = availableQuestions.length
    if (totalAvailableQuestions === 0) return 0
    
    // Calculate progress based on current position in available questions
    const baseProgress = (currentQuestionIndex / totalAvailableQuestions) * 100
    
    // If this is the timeline question (usually last), boost to 90%+
    if (currentQuestion?.id === '8' && currentQuestionIndex === totalAvailableQuestions - 1) {
      return 92
    }
    
    // If this is the last question, show 95%
    if (currentQuestionIndex === totalAvailableQuestions - 1) {
      return 95
    }
    
    // Regular progress calculation
    return Math.min(90, baseProgress + (100 / totalAvailableQuestions))
  }

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleMultipleAnswer = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionId] as string[]) || []
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, value] }
      } else {
        return { ...prev, [questionId]: currentAnswers.filter(answer => answer !== value) }
      }
    })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < availableQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      
      // Calculate progress based on available questions
      const totalAvailableQuestions = availableQuestions.length
      const newProgress = Math.min(95, ((nextIndex + 1) / totalAvailableQuestions) * 100)
      
      // Special handling for timeline question (usually last)
      const nextQuestion = availableQuestions[nextIndex]
      if (nextQuestion?.id === '8' && nextIndex === totalAvailableQuestions - 1) {
        setOverallProgress(prev => Math.max(prev, 92))
      } else if (nextIndex === totalAvailableQuestions - 1) {
        setOverallProgress(prev => Math.max(prev, 95))
      } else {
        setOverallProgress(prev => Math.max(prev, newProgress))
      }
    } else {
      setOverallProgress(100)
      calculateResult()
    }
  }

  const prevQuestion = () => {
    if (showResults) {
      // If we're showing results, go back to the last question
      setShowResults(false)
      setServicePercentages([])
      setShowBreakdown(false)
      // Set to the last available question
      const availableQs = getAvailableQuestions()
      setCurrentQuestionIndex(availableQs.length - 1)
      // Restore progress to 95% (before completion)
      setOverallProgress(95)
    } else if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      // Keep progress monotonic; do not decrease when navigating backward
    }
  }

  const calculateResult = () => {
    const rawScores = {
      web: 0,
      photo: 0,
      cinema: 0,
      automation: 0,
      ai: 0,
      tech: 0
    }

    // Get all questions that should be included based on current answers
    const questionsToScore = quizQuestions.filter(question => 
      !question.condition || question.condition(answers)
    )

    const questionScores: Record<string, Record<string, number>> = {}

    // Calculate scores based on weighted answers from all applicable questions
    questionsToScore.forEach(question => {
      const answer = answers[question.id]
      if (!answer) return
      
      questionScores[question.id] = {
        web: 0,
        photo: 0,
        cinema: 0,
        automation: 0,
        ai: 0,
        tech: 0
      }

      if (question.type === 'single') {
        const selectedOption = question.options.find(opt => opt.value === answer)
        if (selectedOption && selectedOption.weight) {
          Object.entries(selectedOption.weight).forEach(([service, weight]) => {
            questionScores[question.id][service] = weight
            rawScores[service as keyof typeof rawScores] += weight
          })
        }
      } else if (question.type === 'multiple' && Array.isArray(answer)) {
        answer.forEach(selectedValue => {
          const selectedOption = question.options.find(opt => opt.value === selectedValue)
          if (selectedOption && selectedOption.weight) {
            Object.entries(selectedOption.weight).forEach(([service, weight]) => {
              questionScores[question.id][service] += weight
              rawScores[service as keyof typeof rawScores] += weight
            })
          }
        })
      }
    })

    // Apply weighting based on question importance and recency
    const finalScores = {
      web: 0,
      photo: 0,
      cinema: 0,
      automation: 0,
      ai: 0,
      tech: 0
    }

    // Weight adjustments: newer/more specific questions get higher weight
    const questionWeights: Record<string, number> = {
      '1': 1.0,  // Primary challenge - important but not overwhelming
      '2': 0.8,  // Business type - context setting
      '3': 1.2,  // Website situation - very specific to web needs
      '4': 1.3,  // Visual content - very specific to photo/cinema needs  
      '5': 1.4,  // Time-consuming tasks - specific automation/AI indicators
      '6': 1.1,  // Tech frustrations - specific tech needs
      '7': 1.0,  // Budget - balancing factor
      '8': 0.7   // Timeline - less important for service selection
    }

    // Apply weighted scoring
    Object.entries(questionScores).forEach(([questionId, scores]) => {
      const weight = questionWeights[questionId] || 1.0
      Object.entries(scores).forEach(([service, score]) => {
        finalScores[service as keyof typeof finalScores] += score * weight
      })
    })

    // Calculate total score for percentage calculation
    const totalScore = Object.values(finalScores).reduce((sum, score) => sum + score, 0)
    
    // Calculate percentages and filter out very low scores (less than 5%)
    const servicePercentages = Object.entries(finalScores)
      .map(([service, score]) => ({
        service: service as keyof typeof quizResults,
        score,
        percentage: totalScore > 0 ? (score / totalScore) * 100 : 0
      }))
      .filter(item => item.percentage >= 5) // Only include services with at least 5% relevance
      .sort((a, b) => b.percentage - a.percentage)

    setScores(finalScores)
    setServicePercentages(servicePercentages)

    // Create blended result based on top scoring services
    const primaryService = servicePercentages[0]?.service || 'web'
    setResult(primaryService)
    setShowResults(true)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowResults(false)
    setOverallProgress(0) // Start at 0%
    setScores({
      web: 0,
      photo: 0,
      cinema: 0,
      automation: 0,
      ai: 0,
      tech: 0
    })
    setServicePercentages([])
    setShowBreakdown(false)
  }

  if (showResults) {
    const serviceNames: Record<string, string> = {
      web: 'Web Development',
      photo: 'Photography',
      cinema: 'Video Production',
      automation: 'Automation',
      ai: 'AI Solutions',
      tech: 'Tech Consulting'
    }
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <CardTitle className="text-2xl">Your Personalized Service Recommendations</CardTitle>
              <CardDescription className="text-lg font-medium text-primary">
                Based on your specific needs and priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full p-4 text-left hover:bg-muted/70 transition-colors flex items-center justify-between"
                  >
                    <h4 className="font-semibold">Your Service Match Breakdown</h4>
                    <motion.div
                      animate={{ rotate: showBreakdown ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showBreakdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="px-4 pb-4"
                      >
                        <div className="space-y-3">
                          {servicePercentages.map((item, index) => (
                            <motion.div
                              key={item.service}
                              className="flex items-center justify-between p-3 bg-background rounded-lg border"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: 0.1 + index * 0.1 }}
                            >
                              <div className="flex-1">
                                <div className="font-medium">{serviceNames[item.service]}</div>
                                <div className="text-sm text-muted-foreground">
                                  <AnimatedCounter value={Math.round(item.percentage)} duration={800 + index * 200} />% match based on your answers
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">
                                  <AnimatedCounter value={Math.round(item.percentage)} duration={800 + index * 200} />%
                                </div>
                                <div className="w-20 bg-muted rounded-full h-2 ml-auto">
                                  <motion.div 
                                    className="bg-primary h-2 rounded-full" 
                                    initial={{ width: 0 }}
                                    animate={{ width: showBreakdown ? `${item.percentage}%` : 0 }}
                                    transition={{ 
                                      duration: 1.2, 
                                      delay: 0.2 + index * 0.15,
                                      ease: "easeOut"
                                    }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {servicePercentages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Recommended Services for You:</h3>
                    {servicePercentages.map((item, index) => {
                      const resultData = quizResults[item.service]
                      // Only show detailed breakdown for services with >15% match
                      if (item.percentage < 15) return null
                      
                      return (
                        <motion.div
                          key={item.service}
                          className="border rounded-lg p-4 bg-background"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.15 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{resultData.title}</h4>
                              <p className="text-sm text-primary font-medium">{Math.round(item.percentage)}% match</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{resultData.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {resultData.services.slice(0, 4).map((service, serviceIndex) => (
                              <div key={serviceIndex} className="flex items-center gap-2 text-xs">
                                <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />
                                <span>{service}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <p className="text-sm text-muted-foreground">
                    Book a consultation to discuss your {servicePercentages.length > 1 ? 'top service needs' : 'service requirements'} and get a custom proposal.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" onClick={prevQuestion}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetQuiz}>
                    Retake Quiz
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 group bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-blue-500 transition-all"
                  >
                    <a href="/consultation" className="inline-flex items-center justify-center gap-2">
                      Schedule Your Consultation
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const progressPercentage = overallProgress

  // If no current question available, show results
  if (!currentQuestion) {
    if (!showResults) {
      calculateResult()
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">Discover How I Can Transform Your Business</h1>
        <p className="text-xl text-muted-foreground">
          Answer a few questions to find the perfect solution for your needs
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Finding your perfect solution...</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        {availableQuestions.length < quizQuestions.length && (
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Personalized questions based on your answers
          </div>
        )}
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion?.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion?.text}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion?.type === 'single' ? (
            <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              className="space-y-3"
            >
                {currentQuestion.options?.map((option, index) => (
                <motion.div
                    key={option.value}
                  className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.text}
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <motion.div
                    key={option.value}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Checkbox
                      id={option.value}
                      checked={(answers[currentQuestion.id] as string[] || []).includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleMultipleAnswer(currentQuestion.id, option.value, !!checked)
                      }
                    />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <motion.div
        className="flex justify-between mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={nextQuestion}
          disabled={
            !answers[currentQuestion?.id] || 
            (currentQuestion?.type === 'multiple' && (!Array.isArray(answers[currentQuestion?.id]) || (answers[currentQuestion?.id] as string[]).length === 0))
          }
        >
          {currentQuestionIndex === availableQuestions.length - 1 ? 'Get Results' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}