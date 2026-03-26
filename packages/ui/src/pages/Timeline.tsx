import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import type { Character, Location } from '../types'

interface EnrichedEvent {
  id: string
  title: string
  description: string | null
  chapter: string | null
  sortOrder: number | null
  locationId: string | null
  characters: string | null
  notes: string | null
  characterDetails?: Array<{ id: string; name: string }>
  locationName?: string
}

interface TimelineResponse {
  total: number
  timeline: EnrichedEvent[]
}

export default function Timeline() {
  const navigate = useNavigate()
  const toast = useToast()

  const [charFilter, setCharFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [chapterFrom, setChapterFrom] = useState('')
  const [chapterTo, setChapterTo] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)

  const hasFilters = charFilter || locFilter || chapterFrom || chapterTo

  const filterParams: Record<string, unknown> = {}
  if (charFilter) filterParams.character_id = charFilter
  if (locFilter) filterParams.location_id = locFilter
  if (chapterFrom) filterParams.chapter_from = chapterFrom
  if (chapterTo) filterParams.chapter_to = chapterTo

  const { data, isLoading } = useMcpQuery<TimelineResponse>(
    hasFilters ? 'get_timeline_filtered' : 'get_timeline',
    hasFilters ? filterParams : undefined,
  )

  const { data: charsData } = useMcpQuery<{ characters: Character[] }>('list_characters', { limit: 200 })
  const { data: locsData } = useMcpQuery<{ results: Location[] }>('list_locations', { limit: 200 })

  const updateMutation = useMcpMutation('update_event', ['get_timeline', 'get_timeline_filtered', 'list_events'])

  const events = data?.timeline ?? []
  const characters = charsData?.characters ?? []
  const locations = locsData?.results ?? []

  const moveEvent = useCallback((eventId: string, targetIdx: number) => {
    const current = events.findIndex((e) => e.id === eventId)
    if (current === -1 || current === targetIdx) return

    // Calculate new sort_order based on neighbors
    let newOrder: number
    if (targetIdx === 0) {
      newOrder = (events[0]?.sortOrder ?? 1) - 1
    } else if (targetIdx >= events.length - 1) {
      newOrder = (events[events.length - 1]?.sortOrder ?? events.length) + 1
    } else {
      const before = events[targetIdx - (targetIdx > current ? 0 : 1)]?.sortOrder ?? targetIdx
      const after = events[targetIdx + (targetIdx > current ? 1 : 0)]?.sortOrder ?? targetIdx + 2
      newOrder = Math.round((before + after) / 2)
      // If they collide, just use targetIdx + 1
      if (newOrder === before || newOrder === after) newOrder = targetIdx + 1
    }

    updateMutation.mutate(
      { id: eventId, sort_order: newOrder },
      {
        onSuccess: () => toast.success('Ordre mis a jour'),
        onError: (err) => toast.error(err.message),
      },
    )
  }, [events, updateMutation, toast])

  // Group events by chapter
  const chapters = new Map<string, EnrichedEvent[]>()
  for (const ev of events) {
    const ch = ev.chapter ?? '--'
    if (!chapters.has(ch)) chapters.set(ch, [])
    chapters.get(ch)!.push(ev)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Timeline</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Personnage</label>
          <select
            value={charFilter}
            onChange={(e) => setCharFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Lieu</label>
          <select
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[100px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Chapitre de</label>
          <input
            type="text"
            value={chapterFrom}
            onChange={(e) => setChapterFrom(e.target.value)}
            placeholder="ex: 1"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="min-w-[100px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">a</label>
          <input
            type="text"
            value={chapterTo}
            onChange={(e) => setChapterTo(e.target.value)}
            placeholder="ex: 5"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-500">Chargement...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Aucun evenement dans la timeline.</p>
          <button
            onClick={() => navigate('/events/new')}
            className="mt-3 text-blue-500 hover:underline text-sm"
          >
            Creer un evenement
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {Array.from(chapters.entries()).map(([chapter, chapterEvents]) => (
            <div key={chapter}>
              {/* Chapter separator */}
              <div className="relative flex items-center mb-3 mt-6 first:mt-0">
                <div className="absolute left-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center z-10">
                  <span className="text-[10px] font-bold text-white">C</span>
                </div>
                <span className="ml-11 text-xs font-semibold text-amber-700 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded">
                  {chapter === '--' ? 'Sans chapitre' : `Chapitre ${chapter}`}
                </span>
              </div>

              {/* Events */}
              {chapterEvents.map((ev, idx) => (
                <div
                  key={ev.id}
                  className={`relative flex items-start mb-3 group ${
                    dragId === ev.id ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={() => setDragId(ev.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId && dragId !== ev.id) {
                      const globalIdx = events.findIndex((e) => e.id === ev.id)
                      moveEvent(dragId, globalIdx)
                    }
                    setDragId(null)
                  }}
                >
                  {/* Dot */}
                  <div className="absolute left-2.5 mt-3 w-3 h-3 bg-blue-500 rounded-full border-2 border-white z-10" />

                  {/* Card */}
                  <button
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="ml-11 flex-1 text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{ev.title}</span>
                      {ev.chapter && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          Ch. {ev.chapter}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {ev.locationName && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-emerald-600">{ev.locationName}</span>
                      </div>
                    )}

                    {/* Characters badges */}
                    {ev.characterDetails && ev.characterDetails.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ev.characterDetails.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>

                  {/* Reorder buttons */}
                  <div className="flex flex-col ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 || Array.from(chapters.values()).indexOf(chapterEvents) > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const globalIdx = events.findIndex((e) => e.id === ev.id)
                          if (globalIdx > 0) moveEvent(ev.id, globalIdx - 1)
                        }}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                        title="Monter"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    ) : null}
                    {(() => {
                      const globalIdx = events.findIndex((e) => e.id === ev.id)
                      return globalIdx < events.length - 1 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveEvent(ev.id, globalIdx + 1)
                          }}
                          className="text-gray-400 hover:text-gray-600 p-0.5"
                          title="Descendre"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      ) : null
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
