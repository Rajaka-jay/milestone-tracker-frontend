import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../components/ProgressBar/ProgressBar';

describe('ProgressBar', () => {
  it('exposes its value to assistive technology', () => {
    render(<ProgressBar value={42} label="Design phase" />);
    const bar = screen.getByRole('progressbar', { name: 'Design phase' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('clamps values to 0-100', () => {
    render(<ProgressBar value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
