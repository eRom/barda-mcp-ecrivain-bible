import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EntityForm, { type FieldConfig } from '../entities/EntityForm'

const fields: FieldConfig[] = [
  { name: 'name', label: 'Nom', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
]

describe('EntityForm', () => {
  it('renders fields in read-only mode by default', () => {
    render(
      <EntityForm
        fields={fields}
        initialData={{ name: 'Alice', description: 'Heroine' }}
        onSave={vi.fn()}
      />,
    )

    const nameInput = screen.getByDisplayValue('Alice')
    expect(nameInput).toBeDisabled()

    const descInput = screen.getByDisplayValue('Heroine')
    expect(descInput).toBeDisabled()
  })

  it('enables fields after clicking Editer', async () => {
    const user = userEvent.setup()

    render(
      <EntityForm
        fields={fields}
        initialData={{ name: 'Alice', description: 'Heroine' }}
        onSave={vi.fn()}
      />,
    )

    await user.click(screen.getByText('Editer'))

    expect(screen.getByDisplayValue('Alice')).not.toBeDisabled()
    expect(screen.getByDisplayValue('Heroine')).not.toBeDisabled()
  })

  it('calls onSave with correct data on submit', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <EntityForm
        fields={fields}
        initialData={{ name: 'Alice', description: '' }}
        onSave={onSave}
      />,
    )

    await user.click(screen.getByText('Editer'))

    const nameInput = screen.getByDisplayValue('Alice')
    await user.clear(nameInput)
    await user.type(nameInput, 'Bob')

    const descInput = screen.getByRole('textbox', { name: /description/i })
    await user.type(descInput, 'Le rival')

    await user.click(screen.getByText('Sauvegarder'))

    expect(onSave).toHaveBeenCalledWith({ name: 'Bob', description: 'Le rival' })
  })

  it('renders in edit mode when isNew is true', () => {
    render(<EntityForm fields={fields} isNew onSave={vi.fn()} />)

    // All inputs should be enabled
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => {
      expect(input).not.toBeDisabled()
    })

    // Should show "Creer" button, not "Editer"
    expect(screen.getByText('Creer')).toBeInTheDocument()
    expect(screen.queryByText('Editer')).not.toBeInTheDocument()
  })

  it('calls onSave with only filled fields (empty fields omitted)', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<EntityForm fields={fields} isNew onSave={onSave} />)

    const nameInput = screen.getByRole('textbox', { name: /nom/i })
    await user.type(nameInput, 'Charlie')

    // Leave description empty
    await user.click(screen.getByText('Creer'))

    expect(onSave).toHaveBeenCalledWith({ name: 'Charlie' })
  })

  it('does not call onSave when required field is empty (browser validation)', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<EntityForm fields={fields} isNew onSave={onSave} />)

    // Submit without filling name (required)
    await user.click(screen.getByText('Creer'))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('resets fields on cancel', async () => {
    const user = userEvent.setup()

    render(
      <EntityForm
        fields={fields}
        initialData={{ name: 'Alice', description: 'Original' }}
        onSave={vi.fn()}
      />,
    )

    await user.click(screen.getByText('Editer'))

    const nameInput = screen.getByDisplayValue('Alice')
    await user.clear(nameInput)
    await user.type(nameInput, 'Modified')

    await user.click(screen.getByText('Annuler'))

    // Should be back to original value and disabled
    expect(screen.getByDisplayValue('Alice')).toBeDisabled()
  })
})
