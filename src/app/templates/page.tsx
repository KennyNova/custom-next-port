'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, Workflow, Clock, Users } from 'lucide-react'

const n8nTemplates = [
  {
    id: '1',
    name: 'Email Marketing Automation',
    description: 'Complete email marketing workflow with segmentation, scheduling, and analytics tracking.',
    tags: ['Email', 'Marketing', 'Analytics'],
    useCase: 'Automate email campaigns based on user behavior and preferences',
    downloadCount: 234,
    lastUpdated: new Date('2024-01-15'),
    complexity: 'Intermediate'
  },
  {
    id: '2',
    name: 'Social Media Cross-Posting',
    description: 'Automatically post content across multiple social media platforms with custom formatting.',
    tags: ['Social Media', 'Content', 'Automation'],
    useCase: 'Share content simultaneously on Twitter, LinkedIn, and Facebook',
    downloadCount: 156,
    lastUpdated: new Date('2024-01-12'),
    complexity: 'Beginner'
  },
  {
    id: '3',
    name: 'Slack-GitHub Integration',
    description: 'Advanced workflow for GitHub notifications, PR management, and team collaboration.',
    tags: ['GitHub', 'Slack', 'DevOps'],
    useCase: 'Keep your team updated on code changes and repository activity',
    downloadCount: 89,
    lastUpdated: new Date('2024-01-10'),
    complexity: 'Advanced'
  },
  {
    id: '4',
    name: 'Invoice Processing System',
    description: 'Automated invoice generation, approval workflow, and payment tracking.',
    tags: ['Finance', 'Invoicing', 'Approval'],
    useCase: 'Streamline invoice creation and approval processes',
    downloadCount: 67,
    lastUpdated: new Date('2024-01-08'),
    complexity: 'Intermediate'
  },
  {
    id: '5',
    name: 'Customer Support Ticketing',
    description: 'Intelligent ticket routing, auto-responses, and escalation management.',
    tags: ['Support', 'Ticketing', 'Customer Service'],
    useCase: 'Improve customer support efficiency and response times',
    downloadCount: 123,
    lastUpdated: new Date('2024-01-05'),
    complexity: 'Advanced'
  },
  {
    id: '6',
    name: 'Data Backup & Sync',
    description: 'Automated data backup across multiple cloud services with conflict resolution.',
    tags: ['Backup', 'Cloud', 'Data Management'],
    useCase: 'Keep your data synchronized and backed up across platforms',
    downloadCount: 198,
    lastUpdated: new Date('2024-01-03'),
    complexity: 'Intermediate'
  }
]

const complexityColors = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export default function TemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">n8n Automation Templates</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ready-to-use n8n workflows for common business processes. Download, customize, and deploy in minutes.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <Workflow className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{n8nTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Templates</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Download className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">
              {n8nTemplates.reduce((sum, t) => sum + t.downloadCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Downloads</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">850+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-muted-foreground">Automation</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {n8nTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={complexityColors[template.complexity as keyof typeof complexityColors]}
                  >
                    {template.complexity}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-3">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Use Case:</p>
                    <p className="text-sm text-muted-foreground">{template.useCase}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.downloadCount} downloads</span>
                    <span>Updated {template.lastUpdated.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="text-center mt-16 p-8 bg-muted rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-4">Need a Custom Workflow?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? I create custom n8n workflows tailored to your specific business needs.
        </p>
        <Button asChild size="lg">
          <a href="/consultation">Get Custom Workflow</a>
        </Button>
      </motion.div>
    </div>
  )
}