import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Characters from './pages/Characters'
import CharacterDetail from './pages/CharacterDetail'
import Locations from './pages/Locations'
import LocationDetail from './pages/LocationDetail'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Interactions from './pages/Interactions'
import InteractionDetail from './pages/InteractionDetail'
import WorldRules from './pages/WorldRules'
import WorldRuleDetail from './pages/WorldRuleDetail'
import ResearchPage from './pages/Research'
import ResearchDetail from './pages/ResearchDetail'
import Notes from './pages/Notes'
import NoteDetail from './pages/NoteDetail'
import Search from './pages/Search'
import Graph from './pages/Graph'
import Timeline from './pages/Timeline'
import Backups from './pages/Backups'
import ImportExport from './pages/ImportExport'
import Toaster from './components/common/Toaster'

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/characters/new" element={<CharacterDetail />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/new" element={<LocationDetail />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/new" element={<EventDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/interactions" element={<Interactions />} />
          <Route path="/interactions/new" element={<InteractionDetail />} />
          <Route path="/interactions/:id" element={<InteractionDetail />} />
          <Route path="/world-rules" element={<WorldRules />} />
          <Route path="/world-rules/new" element={<WorldRuleDetail />} />
          <Route path="/world-rules/:id" element={<WorldRuleDetail />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/research/new" element={<ResearchDetail />} />
          <Route path="/research/:id" element={<ResearchDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<NoteDetail />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/search" element={<Search />} />
          <Route path="/backups" element={<Backups />} />
          <Route path="/import-export" element={<ImportExport />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
