'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, MessageSquare, CheckCircle } from 'lucide-react'

const consultationTypes = [
  {
    id: 'quick-chat',
    title: '15-Minute Quick Chat',
    duration: '15 minutes',
    price: 'Free',
    description: 'Perfect for quick questions or initial project discussions',
    features: [
      'Project feasibility discussion',
      'Technology recommendations',
      'General guidance',
      'Next steps planning'
    ],
    bookingUrl: '#'
  },
  {
    id: 'technical-consultation',
    title: 'Technical Consultation',
    duration: '60 minutes',
    price: '$150',
    description: 'In-depth technical discussion for complex projects',
    features: [
      'Architecture planning',
      'Technology stack selection',
      'Performance optimization',
      'Security considerations',
      'Development timeline',
      'Resource estimation'
    ],
    bookingUrl: '#'
  },
  {
    id: 'project-planning',
    title: 'Project Planning Session',
    duration: '90 minutes',
    price: '$200',
    description: 'Comprehensive project planning and strategy session',
    features: [
      'Complete project roadmap',
      'Risk assessment',
      'Team structure planning',
      'Technology decisions',
      'Budget planning',
      'Milestone definition',
      'Follow-up documentation'
    ],
    bookingUrl: '#'
  }
]

const availability = [
  { day: 'Monday', times: ['9:00 AM', '2:00 PM', '4:00 PM'] },
  { day: 'Tuesday', times: ['10:00 AM', '1:00 PM', '3:00 PM'] },
  { day: 'Wednesday', times: ['9:00 AM', '11:00 AM', '2:00 PM'] },
  { day: 'Thursday', times: ['10:00 AM', '1:00 PM', '4:00 PM'] },
  { day: 'Friday', times: ['9:00 AM', '2:00 PM'] }
]

export default function ConsultationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">Book a Consultation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Let's discuss your project needs and find the perfect solution. Choose from different consultation types based on your requirements.
        </p>
      </motion.div>

      {/* Consultation Types */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {consultationTypes.map((consultation, index) => (
          <motion.div
            key={consultation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{consultation.duration}</span>
                </div>
                <CardTitle>{consultation.title}</CardTitle>
                <CardDescription>{consultation.description}</CardDescription>
                <div className="text-2xl font-bold text-primary">{consultation.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {consultation.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" asChild>
                  <a href={consultation.bookingUrl}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* How it Works */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">How it Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Choose Session Type',
              description: 'Select the consultation type that best fits your needs',
              icon: Calendar
            },
            {
              step: '2',
              title: 'Pick Your Time',
              description: 'Choose from available time slots that work for you',
              icon: Clock
            },
            {
              step: '3',
              title: 'Join the Meeting',
              description: 'Connect via video call at the scheduled time',
              icon: Video
            },
            {
              step: '4',
              title: 'Get Solutions',
              description: 'Receive actionable insights and next steps',
              icon: MessageSquare
            }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Cal.com Embed Placeholder */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Schedule Your Consultation</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred time from the calendar below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Cal.com booking widget will be embedded here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure your self-hosted Cal.com instance and update the integration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              question: 'What if I need to reschedule?',
              answer: 'You can reschedule up to 24 hours before the meeting through the booking confirmation email.'
            },
            {
              question: 'Do you offer refunds?',
              answer: 'Full refunds are available if cancelled 48 hours in advance. The free consultation is always risk-free.'
            },
            {
              question: 'What platform do you use for video calls?',
              answer: 'We use Google Meet for all consultations. You\'ll receive a meeting link in your confirmation email.'
            },
            {
              question: 'Can I book multiple sessions?',
              answer: 'Absolutely! You can book multiple sessions or upgrade to longer sessions based on your project needs.'
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}