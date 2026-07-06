import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { N8nTemplateIndexData, N8nTemplateIndexItem } from '@/types'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Cog,
  Download,
  HardDrive,
  Rocket,
  ShieldCheck,
  Wrench,
} from 'lucide-react'

async function getTemplateById(id: string): Promise<N8nTemplateIndexItem | null> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'n8n-templates-index.json')
  const raw = await fs.readFile(filePath, 'utf8')
  const index = JSON.parse(raw) as N8nTemplateIndexData
  return index.templates.find((template) => template.id === id) ?? null
}

export default async function TemplateLearnPage({
  params,
}: {
  params: { id: string }
}) {
  const template = await getTemplateById(params.id)
  if (!template) notFound()

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to templates
          </Link>
        </Button>

        <Badge variant="outline" className="w-fit">
          Free setup guide
        </Badge>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Learn how to use "{template.name}" in n8n
        </h1>
        <p className="text-muted-foreground">
          This is a step-by-step, beginner-friendly guide for people who are new to n8n. You will learn what n8n is,
          how to install it, how to import this workflow, and how to safely run it in your own system.
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{template.category.replace(/_/g, ' ')}</Badge>
          <Badge variant="secondary">{template.nodeCount} nodes</Badge>
          {template.hasAI && <Badge variant="secondary">Includes AI nodes</Badge>}
          {template.hasEmail && <Badge variant="secondary">Includes email nodes</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            What is n8n?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            n8n is a workflow automation platform. A workflow is a set of connected nodes. Each node does one job:
            receive data, transform it, call an API, send a message, write to a database, and more.
          </p>
          <p>
            You can think of it like visual programming for automations. Instead of writing one large script, you
            connect modular steps in a flow. This makes it easier to understand, debug, and improve later.
          </p>
          <p>
            Official site:{" "}
            <a
              href="https://n8n.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              n8n.io
            </a>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="h-5 w-5 text-primary" />
              Option 1: n8n Cloud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Best if you want the fastest start with minimal setup.</p>
            <ul className="space-y-1">
              <li>- Create an account on n8n Cloud</li>
              <li>- Open your workspace</li>
              <li>- Import the workflow JSON</li>
              <li>- Configure credentials and run tests</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5 text-primary" />
              Option 2: Self-host n8n
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Best if you want full control over data, infra, and costs.</p>
            <ul className="space-y-1">
              <li>- Run n8n with Docker or a VM</li>
              <li>- Configure domain + HTTPS</li>
              <li>- Secure admin access and backups</li>
              <li>- Import workflow JSON and connect credentials</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-5 w-5 text-primary" />
            Step-by-step setup for this workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              <span className="font-medium text-foreground">1) Download template JSON:</span> from the template modal,
              click Download JSON after choosing your provider preferences.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              <span className="font-medium text-foreground">2) Import into n8n:</span> in n8n, use Import from file and
              select the downloaded JSON.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              <span className="font-medium text-foreground">3) Configure credentials:</span> open nodes that require
              auth (email, AI provider, Slack, databases) and connect your own credentials.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              <span className="font-medium text-foreground">4) Configure environment values:</span> update endpoint URLs,
              IDs, sheet names, channels, prompts, and any placeholder values.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              <span className="font-medium text-foreground">5) Test run manually:</span> execute node-by-node, verify data
              shape, and confirm each integration succeeds.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              <span className="font-medium text-foreground">6) Activate workflow:</span> once tests pass, enable the
              workflow and monitor first production runs.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Reliability and security checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- Use separate dev/test and production credentials.</p>
          <p>- Add error paths and alerting (Slack/email) for failed runs.</p>
          <p>- Keep API keys in credential manager, not hardcoded fields.</p>
          <p>- Add retries/timeouts where external APIs can fail.</p>
          <p>- Add logging nodes for auditability and troubleshooting.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wrench className="h-5 w-5 text-primary" />
            Need help setting this up?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            If you want this workflow customized for your exact stack, I can set it up for you end-to-end or build a
            custom automation from scratch.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/consultation">
                Hire me for setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/templates`}>
                <Download className="mr-2 h-4 w-4" />
                Back to template library
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
