import type { N8nWorkflowTemplate } from '@/types'

export type N8nPreferenceKey = 'email' | 'ai' | 'vectorStore'

export interface N8nPreferenceOption {
  value: string
  label: string
}

export interface N8nPreferenceQuestion {
  key: N8nPreferenceKey
  question: string
  options: N8nPreferenceOption[]
}

interface ProviderRule {
  value: string
  label: string
  detect: RegExp[]
  toType: string
  toName: string
  credentialKey?: string
}

interface PreferenceRule {
  key: N8nPreferenceKey
  question: string
  options: ProviderRule[]
}

const preferenceRules: PreferenceRule[] = [
  {
    key: 'email',
    question: 'What is your email provider?',
    options: [
      {
        value: 'gmail',
        label: 'Gmail',
        detect: [/gmail/i],
        toType: 'n8n-nodes-base.gmail',
        toName: 'Gmail',
        credentialKey: 'gmailOAuth2',
      },
      {
        value: 'outlook',
        label: 'Outlook',
        detect: [/outlook/i, /microsoftoutlook/i],
        toType: 'n8n-nodes-base.microsoftOutlook',
        toName: 'Microsoft Outlook',
        credentialKey: 'microsoftOutlookOAuth2Api',
      },
    ],
  },
  {
    key: 'ai',
    question: 'What is your AI provider?',
    options: [
      {
        value: 'openai',
        label: 'OpenAI',
        detect: [/openai/i],
        toType: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        toName: 'OpenAI Chat Model',
        credentialKey: 'openAiApi',
      },
      {
        value: 'anthropic',
        label: 'Anthropic',
        detect: [/anthropic/i],
        toType: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
        toName: 'Anthropic Chat Model',
        credentialKey: 'anthropicApi',
      },
      {
        value: 'cohere',
        label: 'Cohere',
        detect: [/cohere/i],
        toType: '@n8n/n8n-nodes-langchain.lmChatCohere',
        toName: 'Cohere Chat Model',
        credentialKey: 'cohereApi',
      },
      {
        value: 'openrouter',
        label: 'OpenRouter',
        detect: [/openrouter/i],
        toType: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        toName: 'OpenRouter Chat Model',
        credentialKey: 'openAiApi',
      },
    ],
  },
  {
    key: 'vectorStore',
    question: 'What is your vector database?',
    options: [
      {
        value: 'pinecone',
        label: 'Pinecone',
        detect: [/pinecone/i],
        toType: '@n8n/n8n-nodes-langchain.vectorStorePinecone',
        toName: 'Pinecone Vector Store',
        credentialKey: 'pineconeApi',
      },
      {
        value: 'supabase',
        label: 'Supabase',
        detect: [/supabase/i],
        toType: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
        toName: 'Supabase Vector Store',
      },
      {
        value: 'qdrant',
        label: 'Qdrant',
        detect: [/qdrant/i],
        toType: '@n8n/n8n-nodes-langchain.vectorStoreQdrant',
        toName: 'Qdrant Vector Store',
      },
    ],
  },
]

function nodeMatchesRule(nodeType: string, rule: PreferenceRule): boolean {
  const normalizedType = nodeType.toLowerCase()

  if (rule.key === 'email') {
    return /gmail|outlook|mail|imap|smtp|sendgrid/i.test(normalizedType)
  }

  if (rule.key === 'ai') {
    return /lmchat|langchain\.lm|openai|anthropic|cohere|openrouter/i.test(normalizedType)
  }

  if (rule.key === 'vectorStore') {
    return /vectorstore|pinecone|supabase|qdrant|weaviate/i.test(normalizedType)
  }

  return false
}

function detectCurrentProvider(nodeType: string, rule: PreferenceRule): string | null {
  for (const option of rule.options) {
    const isMatch = option.detect.some((pattern) => pattern.test(nodeType))
    if (isMatch) {
      return option.value
    }
  }
  return null
}

export function getPreferenceQuestions(template: N8nWorkflowTemplate): N8nPreferenceQuestion[] {
  const nodes = Array.isArray(template?.nodes) ? template.nodes : []
  const nodeTypes = nodes.map((node) => String(node.type || ''))

  return preferenceRules
    .filter((rule) => nodeTypes.some((nodeType) => nodeMatchesRule(nodeType, rule)))
    .map((rule) => ({
      key: rule.key,
      question: rule.question,
      options: rule.options.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    }))
}

export function getDetectedPreferences(template: N8nWorkflowTemplate): Partial<Record<N8nPreferenceKey, string>> {
  const detected: Partial<Record<N8nPreferenceKey, string>> = {}
  const nodes = Array.isArray(template?.nodes) ? template.nodes : []

  for (const rule of preferenceRules) {
    for (const node of nodes) {
      const nodeType = String(node.type || '')
      if (!nodeMatchesRule(nodeType, rule)) continue
      const provider = detectCurrentProvider(nodeType, rule)
      if (provider) {
        detected[rule.key] = provider
        break
      }
    }
  }

  return detected
}

function findOption(rule: PreferenceRule, preferenceValue: string): ProviderRule | null {
  return rule.options.find((option) => option.value === preferenceValue) || null
}

export function applyTemplatePreferences(
  template: N8nWorkflowTemplate,
  preferences: Partial<Record<N8nPreferenceKey, string>>
): N8nWorkflowTemplate {
  const cloned = JSON.parse(JSON.stringify(template)) as N8nWorkflowTemplate
  const nodes = Array.isArray(cloned.nodes) ? cloned.nodes : []

  for (const rule of preferenceRules) {
    const selectedValue = preferences[rule.key]
    if (!selectedValue) continue

    const selectedOption = findOption(rule, selectedValue)
    if (!selectedOption) continue

    for (const node of nodes) {
      const nodeType = String(node.type || '')
      if (!nodeMatchesRule(nodeType, rule)) continue

      node.type = selectedOption.toType

      if (typeof node.name === 'string' && node.name.length > 0) {
        node.name = node.name.replace(/Gmail|Outlook|OpenAI|Anthropic|Cohere|OpenRouter|Pinecone|Supabase|Qdrant/gi, selectedOption.label)
      } else {
        node.name = selectedOption.toName
      }

      if (selectedOption.credentialKey) {
        const existingCredentials = (node.credentials || {}) as Record<string, unknown>
        const currentCredentialValue = Object.values(existingCredentials)[0]
        node.credentials = {
          [selectedOption.credentialKey]: currentCredentialValue || {
            id: `${selectedOption.value.toUpperCase()}_CREDENTIAL`,
            name: selectedOption.label,
          },
        }
      }

      if (rule.key === 'ai' && selectedOption.value === 'openrouter') {
        const existingParameters = (node.parameters || {}) as Record<string, unknown>
        const existingOptions =
          typeof existingParameters.options === 'object' && existingParameters.options !== null
            ? (existingParameters.options as Record<string, unknown>)
            : {}

        node.parameters = {
          ...existingParameters,
          model: typeof existingParameters.model === 'string' && existingParameters.model.length > 0
            ? existingParameters.model
            : 'openai/gpt-4o-mini',
          options: {
            ...existingOptions,
            baseURL: 'https://openrouter.ai/api/v1',
          },
        }
      }
    }
  }

  return cloned
}
