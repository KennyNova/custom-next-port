'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, CheckCircle, ArrowRight, ChevronDown, Mail, Phone } from 'lucide-react'
import { captureEvent } from '@/lib/posthog/client'
import { useCtaCopy } from '@/lib/hooks/use-cta-copy'

type QuizStatus = 'in_progress' | 'completed'
type QuizContact = {
  email?: string
  phone?: string
  consultationRequested?: boolean
}

const QUIZ_SESSION_STORAGE_KEY = 'nm_quiz_session_id_v1'
const QUIZ_DRAFT_STORAGE_KEY = 'nm_quiz_draft_v1'

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

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const quizQuestions: Question[] = [
  // Question 1: Primary Challenge (Always shown)
  {
    id: '1',
    text: "What's the main problem you want solved?",
    type: 'single' as const,
    options: [
      { value: "online_presence", text: "My website is missing or not good enough", weight: { web: 4, photo: 1 } },
      { value: "content_creation", text: "I need better photos or video", weight: { photo: 4, cinema: 4 } },
      { value: "manual_tasks", text: "Too many repetitive manual tasks", weight: { automation: 4, ai: 2 } },
      { value: "tech_overwhelm", text: "I don't know which tools to pick", weight: { tech: 4, ai: 1 } },
      { value: "efficiency", text: "I want to save time across the business", weight: { ai: 4, automation: 4, tech: 2 } },
      { value: "growth", text: "I'm growing and my current setup won't keep up", weight: { tech: 3, ai: 3, automation: 3, web: 2 } }
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
    text: "How do you handle photos and video now?",
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
    text: "What's your budget?",
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
    subtitle: "A website that does its job",
    description: "Your answers point to your website. I build fast, mobile-friendly sites, redesign slow or outdated ones, and set up SEO so people can find you.",
    services: [
      "Custom website development",
      "E-commerce stores",
      "Website redesigns",
      "Mobile-responsive design",
      "SEO optimization",
      "Performance optimization"
    ],
    cta: "Plan your website roadmap",
    nextSteps: "Share your email or phone and I will send a tailored action plan for your website goals."
  },
  photo: {
    title: "Professional Photography",
    subtitle: "Photos of your people, products, and events",
    description: "Your answers point to photography. I shoot headshots, products, brand images, events, and real estate, and deliver edited files sized for web and social.",
    services: [
      "Business headshots",
      "Product photography",
      "Brand photography",
      "Event photography",
      "Real estate photography",
      "Photos for social media"
    ],
    cta: "Shape your visual strategy",
    nextSteps: "Share your email or phone and I will send a tailored visual strategy for your business."
  },
  cinema: {
    title: "Cinematography & Video Production",
    subtitle: "Video for your brand, products, and events",
    description: "Your answers point to video. I shoot and edit brand videos, product demos, corporate pieces, event coverage, and short clips for social.",
    services: [
      "Brand story videos",
      "Product demonstrations",
      "Corporate videos",
      "Social media video content",
      "Event videography",
      "Commercials"
    ],
    cta: "Map your video direction",
    nextSteps: "Share your email or phone and I will send a tailored production plan for your goals."
  },
  automation: {
    title: "Business Automation Solutions",
    subtitle: "Less repetitive work",
    description: "Your answers point to automation. I build workflows that handle data entry, lead follow-up, scheduling, and routine customer questions so nobody does them by hand.",
    services: [
      "Workflow automation",
      "Customer service automation",
      "Lead nurturing systems",
      "Data entry automation",
      "Social media automation",
      "Connecting your existing tools"
    ],
    cta: "Automate your business",
    nextSteps: "Share your email or phone and I will send automation opportunities tailored to your workflow."
  },
  ai: {
    title: "AI Solutions & Consulting",
    subtitle: "AI where it saves time",
    description: "Your answers point to AI tools. I set up chatbots and assistants, content generation, and AI steps inside your existing workflows, where they save time instead of adding work.",
    services: [
      "AI chatbots and assistants",
      "Content generation systems",
      "Predictive analytics",
      "AI steps in your automations",
      "Custom AI tools",
      "AI strategy consulting"
    ],
    cta: "Explore AI for your business",
    nextSteps: "Share your email or phone and I will send practical AI options that fit your business."
  },
  tech: {
    title: "Technology Consulting",
    subtitle: "Help choosing and connecting tools",
    description: "Your answers point to tech consulting. I help you pick tools that fit your budget, connect the ones you already have, and clean up what isn't working.",
    services: [
      "Technology strategy",
      "System integration",
      "Tool selection and setup",
      "Replacing manual processes",
      "Stack cleanup",
      "Training and support"
    ],
    cta: "Get tech guidance",
    nextSteps: "Share your email or phone and I will send a practical roadmap for your technology decisions."
  }
}

export default function QuizPage() {
  const { text: ctaText, id: ctaVariantId } = useCtaCopy()
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
  const [sessionId, setSessionId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [requestConsultation, setRequestConsultation] = useState(false)
  const [leadStatusMessage, setLeadStatusMessage] = useState<string | null>(null)
  const [leadSubmitInFlight, setLeadSubmitInFlight] = useState(false)
  const ctaAnchorRef = useRef<HTMLDivElement | null>(null)
  const [ctaStuck, setCtaStuck] = useState(false)
  const quizStartedRef = useRef(false)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasHydratedDraftRef = useRef(false)

  const getQuestionById = (questionId: string) =>
    quizQuestions.find((question) => question.id === questionId)

  const getOptionText = (question: Question, value: string) =>
    question.options.find((option) => option.value === value)?.text ?? value

  useEffect(() => {
    if (!showResults) return
    const anchorEl = ctaAnchorRef.current
    if (!anchorEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setCtaStuck(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(anchorEl)
    return () => observer.disconnect()
  }, [showResults])

  // Filter questions based on conditions
  const getAvailableQuestions = () => {
    return quizQuestions.filter(question => 
      !question.condition || question.condition(answers)
    )
  }

  const availableQuestions = getAvailableQuestions()
  const currentQuestion = availableQuestions[currentQuestionIndex]

  const getQuizProgressMeta = () => ({
    total_questions: availableQuestions.length,
    progress_percent: Math.round(overallProgress),
    questions_answered: Object.keys(answers).length,
  })

  const getNormalizedContact = (): QuizContact | undefined => {
    const email = leadEmail.trim()
    const phone = leadPhone.trim()

    if (!email && !phone && !requestConsultation) {
      return undefined
    }

    return {
      email: email || undefined,
      phone: phone || undefined,
      consultationRequested: requestConsultation || undefined,
    }
  }

  const buildSubmissionPayload = (status: QuizStatus, reason: string, contactOverride?: QuizContact) => ({
    sessionId,
    status,
    reason,
    ctaVariantId,
    answers,
    currentQuestionId: currentQuestion?.id ?? null,
    currentQuestionIndex,
    totalQuestions: availableQuestions.length,
    questionsAnswered: Object.keys(answers).length,
    progressPercent: Math.round(overallProgress),
    primaryService: showResults ? result : undefined,
    servicePercentages: showResults
      ? servicePercentages.map((item) => ({
          service: item.service,
          percentage: Math.round(item.percentage),
        }))
      : [],
    contact: contactOverride ?? getNormalizedContact(),
    submittedAt: new Date().toISOString(),
  })

  const saveSubmission = async (
    status: QuizStatus,
    reason: string,
    options?: { keepalive?: boolean; contactOverride?: QuizContact }
  ) => {
    if (!sessionId || Object.keys(answers).length === 0) return

    if (!options?.keepalive) {
      setIsSaving(true)
    }

    try {
      const response = await fetch('/api/quiz-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSubmissionPayload(status, reason, options?.contactOverride)),
        keepalive: options?.keepalive,
      })

      if (response.ok) {
        setLastSavedAt(new Date().toISOString())
      }
    } catch (error) {
      console.error('Quiz save failed:', error)
    } finally {
      if (!options?.keepalive) {
        setIsSaving(false)
      }
    }
  }

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem(QUIZ_SESSION_STORAGE_KEY)
    const resolvedSessionId = storedSessionId || createSessionId()
    if (!storedSessionId) {
      window.localStorage.setItem(QUIZ_SESSION_STORAGE_KEY, resolvedSessionId)
    }
    setSessionId(resolvedSessionId)

    const rawDraft = window.localStorage.getItem(QUIZ_DRAFT_STORAGE_KEY)
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft) as {
          answers?: Record<string, string | string[]>
          currentQuestionIndex?: number
          overallProgress?: number
          showResults?: boolean
          result?: keyof typeof quizResults
          servicePercentages?: Array<{ service: keyof typeof quizResults; score: number; percentage: number }>
          leadEmail?: string
          leadPhone?: string
          requestConsultation?: boolean
        }

        if (parsed.answers && typeof parsed.answers === 'object') {
          setAnswers(parsed.answers)
        }
        if (typeof parsed.currentQuestionIndex === 'number') {
          setCurrentQuestionIndex(parsed.currentQuestionIndex)
        }
        if (typeof parsed.overallProgress === 'number') {
          setOverallProgress(parsed.overallProgress)
        }
        if (typeof parsed.showResults === 'boolean') {
          setShowResults(parsed.showResults)
        }
        if (parsed.result) {
          setResult(parsed.result)
        }
        if (Array.isArray(parsed.servicePercentages)) {
          setServicePercentages(parsed.servicePercentages)
        }
        if (typeof parsed.leadEmail === 'string') {
          setLeadEmail(parsed.leadEmail)
        }
        if (typeof parsed.leadPhone === 'string') {
          setLeadPhone(parsed.leadPhone)
        }
        if (typeof parsed.requestConsultation === 'boolean') {
          setRequestConsultation(parsed.requestConsultation)
        }
      } catch (error) {
        console.warn('Unable to restore quiz draft:', error)
      }
    }

    hasHydratedDraftRef.current = true
  }, [])

  useEffect(() => {
    if (!hasHydratedDraftRef.current || !sessionId) return

    const draftPayload = {
      answers,
      currentQuestionIndex,
      overallProgress,
      showResults,
      result,
      servicePercentages,
      leadEmail,
      leadPhone,
      requestConsultation,
    }

    window.localStorage.setItem(QUIZ_DRAFT_STORAGE_KEY, JSON.stringify(draftPayload))
  }, [
    sessionId,
    answers,
    currentQuestionIndex,
    overallProgress,
    showResults,
    result,
    servicePercentages,
    leadEmail,
    leadPhone,
    requestConsultation,
  ])

  useEffect(() => {
    if (!hasHydratedDraftRef.current || !sessionId || Object.keys(answers).length === 0) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      void saveSubmission(showResults ? 'completed' : 'in_progress', 'autosave')
    }, 900)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, answers, currentQuestionIndex, overallProgress, showResults, result, ctaVariantId])

  useEffect(() => {
    if (availableQuestions.length === 0) return
    if (currentQuestionIndex > availableQuestions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, availableQuestions.length - 1))
    }
  }, [currentQuestionIndex, availableQuestions.length])

  useEffect(() => {
    if (showResults || !currentQuestion) return

    if (!quizStartedRef.current) {
      quizStartedRef.current = true
      captureEvent('quiz_started', {
        total_questions: availableQuestions.length,
      })
    }

    captureEvent('quiz_question_viewed', {
      question_id: currentQuestion.id,
      question_text: currentQuestion.text,
      question_index: currentQuestionIndex,
      question_number: currentQuestionIndex + 1,
      question_type: currentQuestion.type,
      ...getQuizProgressMeta(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, showResults])

  useEffect(() => {
    const handleLeave = () => {
      if (Object.keys(answers).length === 0) return

      if (!showResults) {
        captureEvent('quiz_abandoned', {
          last_question_id: currentQuestion?.id,
          last_question_index: currentQuestionIndex,
          last_question_number: currentQuestionIndex + 1,
          ...getQuizProgressMeta(),
        })
      }

      void saveSubmission(showResults ? 'completed' : 'in_progress', 'pagehide', { keepalive: true })
    }

    window.addEventListener('pagehide', handleLeave)
    return () => window.removeEventListener('pagehide', handleLeave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, currentQuestion?.id, currentQuestionIndex, answers, overallProgress, availableQuestions.length, sessionId])

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
    const question = getQuestionById(questionId)
    if (question && typeof answer === 'string') {
      captureEvent('quiz_answer_selected', {
        question_id: questionId,
        question_text: question.text,
        question_index: currentQuestionIndex,
        question_number: currentQuestionIndex + 1,
        question_type: question.type,
        answer_value: answer,
        answer_text: getOptionText(question, answer),
        selection_action: 'selected',
        ...getQuizProgressMeta(),
      })
    }

    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleMultipleAnswer = (questionId: string, value: string, checked: boolean) => {
    const question = getQuestionById(questionId)
    const currentAnswers = (answers[questionId] as string[]) || []

    if (question) {
      captureEvent('quiz_answer_selected', {
        question_id: questionId,
        question_text: question.text,
        question_index: currentQuestionIndex,
        question_number: currentQuestionIndex + 1,
        question_type: question.type,
        answer_value: value,
        answer_text: getOptionText(question, value),
        selection_action: checked ? 'selected' : 'deselected',
        selected_count: checked
          ? currentAnswers.length + 1
          : Math.max(0, currentAnswers.length - 1),
        ...getQuizProgressMeta(),
      })
    }

    setAnswers(prev => {
      const prevAnswers = (prev[questionId] as string[]) || []
      if (checked) {
        return { ...prev, [questionId]: [...prevAnswers, value] }
      } else {
        return { ...prev, [questionId]: prevAnswers.filter(answer => answer !== value) }
      }
    })
  }

  const nextQuestion = () => {
    if (!currentQuestion) return

    const currentAnswer = answers[currentQuestion.id]
    captureEvent('quiz_question_submitted', {
      question_id: currentQuestion.id,
      question_text: currentQuestion.text,
      question_index: currentQuestionIndex,
      question_number: currentQuestionIndex + 1,
      question_type: currentQuestion.type,
      is_final_question: currentQuestionIndex === availableQuestions.length - 1,
      answer_values: currentAnswer,
      answer_text:
        currentQuestion.type === 'single' && typeof currentAnswer === 'string'
          ? getOptionText(currentQuestion, currentAnswer)
          : Array.isArray(currentAnswer)
            ? currentAnswer.map((value) => getOptionText(currentQuestion, value))
            : undefined,
      ...getQuizProgressMeta(),
    })

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
      captureEvent('quiz_question_back', {
        from_question_id: 'results',
        from_question_index: availableQuestions.length,
        to_question_index: availableQuestions.length - 1,
        ...getQuizProgressMeta(),
      })
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
      captureEvent('quiz_question_back', {
        from_question_id: currentQuestion?.id,
        from_question_index: currentQuestionIndex,
        to_question_index: currentQuestionIndex - 1,
        ...getQuizProgressMeta(),
      })
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
    captureEvent('quiz_completed', {
      primary_service: primaryService,
      top_services: servicePercentages.slice(0, 3).map((item) => ({
        service: item.service,
        percentage: Math.round(item.percentage),
      })),
      questions_answered: Object.keys(answers).length,
      session_id: sessionId,
      cta_variant: ctaVariantId,
    })
    setShowResults(true)
    void saveSubmission('completed', 'quiz_completed')
  }

  const resetQuiz = () => {
    captureEvent('quiz_restarted', getQuizProgressMeta())
    const newSessionId = createSessionId()
    window.localStorage.setItem(QUIZ_SESSION_STORAGE_KEY, newSessionId)
    window.localStorage.removeItem(QUIZ_DRAFT_STORAGE_KEY)
    setSessionId(newSessionId)
    quizStartedRef.current = false
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
    setLeadEmail('')
    setLeadPhone('')
    setRequestConsultation(false)
    setLeadStatusMessage(null)
  }

  const handleLeadSubmit = async () => {
    const email = leadEmail.trim()
    const phone = leadPhone.trim()
    const hasContact = Boolean(email || phone)

    if (!hasContact) {
      setLeadStatusMessage('Please add an email or phone number first.')
      return
    }

    const contactOverride: QuizContact = {
      email: email || undefined,
      phone: phone || undefined,
      consultationRequested: requestConsultation || undefined,
    }

    setLeadSubmitInFlight(true)
    setLeadStatusMessage(null)

    captureEvent('quiz_lead_submitted', {
      session_id: sessionId,
      cta_variant: ctaVariantId,
      has_email: Boolean(email),
      has_phone: Boolean(phone),
      consultation_requested: requestConsultation,
      primary_service: result,
    })

    await saveSubmission('completed', 'lead_submit', { contactOverride })

    setLeadSubmitInFlight(false)
    setLeadStatusMessage('Thanks! I saved your results and will follow up soon.')
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
              <CardTitle className="text-2xl">Your results</CardTitle>
              <CardDescription className="text-lg font-medium text-primary">
                Services ranked by how well they match your answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full p-4 text-left hover:bg-muted/70 transition-colors flex items-center justify-between"
                  >
                    <h4 className="font-semibold">Match breakdown</h4>
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
                    <h3 className="font-semibold">Recommended services</h3>
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
                  <h4 className="font-semibold mb-2">Next step</h4>
                  <p className="text-sm text-muted-foreground">
                    {quizResults[result].nextSteps}
                  </p>
                  {(isSaving || lastSavedAt) && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {isSaving
                        ? 'Saving your progress...'
                        : `Last saved: ${new Date(lastSavedAt as string).toLocaleTimeString()}`}
                    </p>
                  )}
                </div>
                
                <div ref={ctaAnchorRef} className="h-0" />
                <motion.div
                  className="sticky bottom-4 z-40"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: ctaStuck ? 0 : 8, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`flex flex-col gap-4 rounded-xl border bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur p-4 ${ctaStuck ? 'shadow-lg ring-1 ring-border' : 'shadow-sm'}`}>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Get your tailored plan</h4>
                      <p className="text-xs text-muted-foreground">
                        Leave an email or phone and I will follow up with your quiz-based recommendations.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            value={leadEmail}
                            onChange={(event) => setLeadEmail(event.target.value)}
                            placeholder="Email address"
                            className="pl-9"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="tel"
                            value={leadPhone}
                            onChange={(event) => setLeadPhone(event.target.value)}
                            placeholder="Phone number"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Checkbox
                          id="request-consultation"
                          checked={requestConsultation}
                          onCheckedChange={(checked) => setRequestConsultation(Boolean(checked))}
                        />
                        <span>I would like to request a consultation call.</span>
                      </label>
                      <Button
                        onClick={handleLeadSubmit}
                        disabled={leadSubmitInFlight}
                        size="lg"
                        className="relative w-full overflow-hidden group bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 ring-1 ring-emerald-400/40 dark:ring-emerald-300/30 hover:ring-emerald-400/70 dark:hover:ring-emerald-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent group-hover:after:translate-x-full after:transition-transform after:duration-700"
                      >
                        {leadSubmitInFlight ? (
                          'Saving your request...'
                        ) : (
                          <>
                            {ctaText}
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </Button>
                      {leadStatusMessage && (
                        <p className="text-xs text-center text-muted-foreground">{leadStatusMessage}</p>
                      )}
                    </div>
                    {/* Secondary actions */}
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" size="sm" onClick={prevQuestion}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetQuiz}>
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                </motion.div>
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
        <h1 className="text-4xl font-bold mb-4">Find the Right Service</h1>
        <p className="text-xl text-muted-foreground">
          Answer up to eight questions. I&apos;ll suggest which services fit, and you can book a call with the results.
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
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        {availableQuestions.length < quizQuestions.length && (
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Some questions are skipped based on your earlier answers
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
                <motion.label
                    key={option.value}
                  htmlFor={option.value}
                  className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <span className="flex-1">{option.text}</span>
                </motion.label>
              ))}
            </RadioGroup>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <motion.label
                    key={option.value}
                    htmlFor={option.value}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer w-full"
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
                    <span className="flex-1">{option.text}</span>
                  </motion.label>
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