'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const quizQuestions = [
  {
    id: '1',
    text: 'What type of project are you looking to build?',
    type: 'multiple-choice' as const,
    options: [
      'Web Application (React, Next.js, etc.)',
      'Mobile Application (React Native, Flutter)',
      'Desktop Application (Electron, Tauri)',
      'API/Backend Service',
      'Automation/Workflow Solution',
      'Other/Not Sure'
    ]
  },
  {
    id: '2',
    text: 'What is your current timeline for this project?',
    type: 'multiple-choice' as const,
    options: [
      'ASAP (Rush job)',
      '1-2 weeks',
      '1-2 months',
      '3-6 months',
      '6+ months',
      'Flexible timeline'
    ]
  },
  {
    id: '3',
    text: 'What is your approximate budget range?',
    type: 'multiple-choice' as const,
    options: [
      'Under $1,000',
      '$1,000 - $5,000',
      '$5,000 - $15,000',
      '$15,000 - $50,000',
      '$50,000+',
      'Let\'s discuss'
    ]
  },
  {
    id: '4',
    text: 'Do you have existing technical resources?',
    type: 'multiple-choice' as const,
    options: [
      'No technical team - need full development',
      'Have designers but need developers',
      'Have backend team but need frontend',
      'Have developers but need architecture guidance',
      'Full team but need consultation',
      'Just need code review/audit'
    ]
  }
]

const quizResults = {
  'web-fullstack': {
    title: 'Full-Stack Web Development',
    description: 'Perfect for comprehensive web applications with modern frameworks',
    recommendations: [
      'Next.js with TypeScript for robust development',
      'Tailwind CSS for responsive design',
      'MongoDB or PostgreSQL for data storage',
      'Deployment on Vercel or AWS'
    ]
  },
  'consultation': {
    title: 'Technical Consultation',
    description: 'Ideal for teams needing guidance and architecture planning',
    recommendations: [
      'Architecture review and planning',
      'Technology stack recommendations',
      'Code review and best practices',
      'Performance optimization strategies'
    ]
  },
  'automation': {
    title: 'Automation & Workflow Solutions',
    description: 'Great for streamlining business processes and workflows',
    recommendations: [
      'n8n workflow automation',
      'API integrations and webhooks',
      'Custom automation tools',
      'Process optimization consulting'
    ]
  }
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<keyof typeof quizResults>('web-fullstack')

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateResult()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateResult = () => {
    // Simple logic to determine result based on answers
    const answer1 = answers['1']
    const answer4 = answers['4']

    if (answer1?.includes('Automation') || answer1?.includes('Workflow')) {
      setResult('automation')
    } else if (answer4?.includes('consultation') || answer4?.includes('guidance') || answer4?.includes('review')) {
      setResult('consultation')
    } else {
      setResult('web-fullstack')
    }

    setShowResults(true)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
  }

  if (showResults) {
    const resultData = quizResults[result]
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
              <CardTitle className="text-2xl">{resultData.title}</CardTitle>
              <CardDescription className="text-lg">
                {resultData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-semibold">Recommended approach:</h3>
                <ul className="space-y-2">
                  {resultData.recommendations.map((rec, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="flex gap-4 pt-6">
                  <Button asChild className="flex-1">
                    <a href="/consultation">Book Consultation</a>
                  </Button>
                  <Button variant="outline" onClick={resetQuiz} className="flex-1">
                    Retake Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const question = quizQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">Consultation Quiz</h1>
        <p className="text-xl text-muted-foreground">
          Help us understand your project needs to provide the best recommendations
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
          <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{question.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswer(question.id, value)}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <motion.div
                  key={option}
                  className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
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
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={nextQuestion}
          disabled={!answers[question.id]}
        >
          {currentQuestion === quizQuestions.length - 1 ? 'Get Results' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}