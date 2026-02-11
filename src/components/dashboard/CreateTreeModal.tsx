import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { amplifyTreesApi } from '@/services/amplifyDataClient'
import { useCreateTree } from '@/hooks/useTreesApi'
import { setPartitionKey } from '@/services/flaskService'
import type { Gender } from '@/types'

interface Props {
  readonly open: boolean
  readonly onClose: () => void
}

type Step = 'tree' | 'member'

const PLACEHOLDER_URL = 'https://placehold.co/400'

export default function CreateTreeModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const createTree = useCreateTree()

  // ─── step state ──────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('tree')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── step 1: tree metadata ──────────────────────────────────────────
  const [treeName, setTreeName] = useState('')
  const [treeDescription, setTreeDescription] = useState('')
  const [amplifyTreeId, setAmplifyTreeId] = useState<string | null>(null)

  // ─── step 2: first member ───────────────────────────────────────────
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [born, setBorn] = useState('')
  const [died, setDied] = useState('')
  const [description, setDescription] = useState('')

  // ─── handlers ───────────────────────────────────────────────────────

  function reset() {
    setStep('tree')
    setLoading(false)
    setError(null)
    setTreeName('')
    setTreeDescription('')
    setAmplifyTreeId(null)
    setName('')
    setSurname('')
    setGender('male')
    setBorn('')
    setDied('')
    setDescription('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleTreeSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const tree = await amplifyTreesApi.create({
        name: treeName.trim(),
        description: treeDescription.trim() || undefined,
      })
      setAmplifyTreeId(tree.id)
      setStep('member')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tree')
    } finally {
      setLoading(false)
    }
  }

  async function handleMemberSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!amplifyTreeId) return
    setError(null)
    setLoading(true)

    try {
      const result = await createTree.mutateAsync({
        tree_id: amplifyTreeId,
        name: name.trim(),
        surname: surname.trim(),
        gender,
        description: description.trim() || 'No description provided.',
        born: `${born}T00:00:00Z`,
        died: died ? `${died}T00:00:00Z` : undefined,
        pic: PLACEHOLDER_URL,
        photos: PLACEHOLDER_URL,
      })

      setPartitionKey(result.partition_key)
      handleClose()
      navigate({
        to: '/tree/$treeId',
        params: { treeId: amplifyTreeId },
        search: { memberId: undefined },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create first member')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 'tree' ? 'Create a New Tree' : 'Add First Member'}
            </h2>
            <p className="text-sm text-gray-500">
              {step === 'tree'
                ? 'Step 1 of 2 — Name your tree'
                : 'Step 2 of 2 — Who is the first person in this tree?'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 'tree' ? (
            <form onSubmit={handleTreeSubmit} className="space-y-4">
              <div>
                <label htmlFor="treeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tree Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="treeName"
                  type="text"
                  required
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  placeholder="e.g. The Smith Family"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="treeDesc" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="treeDesc"
                  rows={3}
                  value={treeDescription}
                  onChange={(e) => setTreeDescription(e.target.value)}
                  placeholder="A brief description of this family tree…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !treeName.trim()}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating…' : 'Next'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Smith"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="born" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="born"
                    type="date"
                    required
                    value={born}
                    onChange={(e) => setBorn(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="died" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Death <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="died"
                  type="date"
                  value={died}
                  onChange={(e) => setDied(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="memberDesc" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="memberDesc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this person…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('tree')}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim() || !surname.trim() || !born}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating…' : 'Create Tree'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

