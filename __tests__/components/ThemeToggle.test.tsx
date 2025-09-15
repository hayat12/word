import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '@/components/ThemeToggle'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles theme when clicked', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('loads saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<ThemeToggle />)
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
  })
}) 