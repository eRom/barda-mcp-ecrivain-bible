import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '../search/SearchBar'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  it('renders the search input', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText('Rechercher dans la bible...')).toBeInTheDocument()
  })

  it('does not navigate immediately on typing (debounce)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('Rechercher dans la bible...')
    await user.type(input, 'dragon')

    // Should not have navigated yet (debounce 300ms not elapsed)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates after debounce delay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('Rechercher dans la bible...')
    await user.type(input, 'dragon')

    // Advance past the 300ms debounce
    vi.advanceTimersByTime(350)

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=dragon')
  })

  it('navigates immediately on form submit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('Rechercher dans la bible...')
    await user.type(input, 'magie{enter}')

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=magie')
  })

  it('does not navigate for empty query', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('Rechercher dans la bible...')
    await user.type(input, '   ')

    vi.advanceTimersByTime(350)

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
