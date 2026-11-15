/**
 * Private journal: create, edit, search and delete personal entries (requires sign-in).
 */

import { useState, useTransition } from 'react'
import { useBackend } from '../../services/backend/BackendContext'
import type { JournalEntryView } from '../../services/backend/contract'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'

/**
 * Private journal page.
 *
 * @param onAuthRequired Called when a signed-out user tries to use the journal.
 */
export function JournalPage({
  entries,
  signedIn,
  onAuthRequired,
  onEntrySaved,
  onEntryDeleted,
}: {
  entries: JournalEntryView[]
  signedIn: boolean
  onAuthRequired: () => void
  onEntrySaved: (entry: JournalEntryView) => void
  onEntryDeleted: (id: string) => void
}) {
  const backend = useBackend()
  const today = new Date().toISOString().slice(0, 10)
  const [keyword, setKeyword] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [entryDate, setEntryDate] = useState(today)
  const [mood, setMood] = useState('')
  const [sharedWithMedical, setSharedWithMedical] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const visibleEntries = entries.filter((entry) => {
    const matchesKeyword =
      !keyword ||
      `${entry.title} ${entry.body}`.toLowerCase().includes(keyword.trim().toLowerCase())
    const matchesDate = !dateFilter || entry.entryDate.slice(0, 10) === dateFilter
    return matchesKeyword && matchesDate
  })

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setBody('')
    setEntryDate(today)
    setMood('')
    setSharedWithMedical(false)
    setError('')
  }

  const editEntry = (entry: JournalEntryView) => {
    setEditingId(entry.id)
    setTitle(entry.title)
    setBody(entry.body)
    setEntryDate(entry.entryDate.slice(0, 10))
    setMood(entry.mood ?? '')
    setSharedWithMedical(entry.sharedWithMedical)
    setError('')
  }

  const save = () => {
    if (!signedIn) {
      onAuthRequired()
      return
    }
    startTransition(async () => {
      const result = await backend.saveJournalEntry({
        id: editingId ?? undefined,
        title,
        body,
        entryDate,
        mood: mood || null,
        sharedWithMedical,
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      onEntrySaved(result.data)
      resetForm()
    })
  }

  const remove = (entry: JournalEntryView) => {
    if (!window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await backend.deleteJournalEntry(entry.id)
      if (!result.success) {
        setError(result.message)
        return
      }
      onEntryDeleted(entry.id)
      if (editingId === entry.id) resetForm()
    })
  }

  return (
    <>
      <PageTitle
        kicker="PRIVATE CREW RECORD · MC-01"
        title="My Journal"
        description="Personal reflections remain private unless you explicitly share an entry with crew medical."
        action={
          <span className="journal-privacy-badge">
            <Icon name="lock" size={13} /> Owner-only access
          </span>
        }
      />
      {!signedIn ? (
        <section className="journal-locked">
          <span>
            <Icon name="lock" size={24} />
          </span>
          <h3>Sign in to open your private journal</h3>
          <p>
            Entries are stored in owner-scoped Payload records and are not visible to other
            astronauts.
          </p>
          <button className="primary-button" onClick={onAuthRequired}>
            Sign in
          </button>
        </section>
      ) : (
        <div className="journal-layout">
          <section className="journal-editor">
            <div className="journal-section-head">
              <div>
                <span className="eyebrow">{editingId ? 'EDIT ENTRY' : 'NEW ENTRY'}</span>
                <h3>{editingId ? 'Update reflection' : 'Write a reflection'}</h3>
              </div>
              {editingId && <button onClick={resetForm}>Cancel edit</button>}
            </div>
            <div className="journal-form">
              <label>
                <span>Title</span>
                <input
                  value={title}
                  maxLength={140}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Give this entry a title"
                />
              </label>
              <div className="journal-form-row">
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(event) => setEntryDate(event.target.value)}
                  />
                </label>
                <label>
                  <span>Mood (optional)</span>
                  <select value={mood} onChange={(event) => setMood(event.target.value)}>
                    <option value="">Not recorded</option>
                    <option value="calm">Calm</option>
                    <option value="focused">Focused</option>
                    <option value="tired">Tired</option>
                    <option value="stressed">Stressed</option>
                    <option value="positive">Positive</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Journal entry</span>
                <textarea
                  value={body}
                  maxLength={10000}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="What would you like to record?"
                />
              </label>
              <label className="journal-share">
                <input
                  type="checkbox"
                  checked={sharedWithMedical}
                  onChange={(event) => setSharedWithMedical(event.target.checked)}
                />
                <span>
                  <b>Share this entry with crew medical</b>
                  <small>Off by default. This is the only explicit sharing control.</small>
                </span>
              </label>
              {error && <p className="checkin-error">{error}</p>}
              <button className="primary-button journal-save" disabled={isPending} onClick={save}>
                {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Save journal entry'}
              </button>
            </div>
          </section>
          <section className="journal-history">
            <div className="journal-section-head">
              <div>
                <span className="eyebrow">PREVIOUS ENTRIES</span>
                <h3>{visibleEntries.length} entries</h3>
              </div>
            </div>
            <div className="journal-filters">
              <label>
                <span>Search</span>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Keyword"
                />
              </label>
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                />
              </label>
            </div>
            <div className="journal-entry-list">
              {visibleEntries.length === 0 ? (
                <div className="journal-empty">
                  <Icon name="journal" size={22} />
                  <p>No journal entries match this search.</p>
                </div>
              ) : (
                visibleEntries.map((entry) => (
                  <article key={entry.id}>
                    <button className="journal-entry-open" onClick={() => editEntry(entry)}>
                      <span>
                        {new Date(entry.entryDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <strong>{entry.title}</strong>
                      <p>{entry.body}</p>
                      <small>
                        {entry.mood ? `Mood: ${entry.mood}` : 'Mood not recorded'}
                        {entry.sharedWithMedical ? ' · Shared with crew medical' : ' · Private'}
                      </small>
                    </button>
                    <button
                      className="journal-delete"
                      onClick={() => remove(entry)}
                      disabled={isPending}
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
