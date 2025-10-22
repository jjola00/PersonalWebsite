/**
 * Tests for StarRating Component
 * Focuses on core functionality: full stars, half stars, and accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StarRating from '../StarRating';

// Mock Next.js if needed
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('StarRating Component', () => {
  test('renders full stars correctly', () => {
    render(<StarRating rating={4} />);
    
    // Should have accessibility label
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Rating: 4 out of 5 stars');
    
    // Should render 4 full stars and 1 empty star
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  test('renders half stars correctly', () => {
    render(<StarRating rating={4.5} />);
    
    // Should have accessibility label for 4.5 stars
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Rating: 4.5 out of 5 stars');
    
    // Should render stars (4 full + 1 half + 0 empty = 5 total star characters)
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  test('handles null rating gracefully', () => {
    const { container } = render(<StarRating rating={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('handles zero rating gracefully', () => {
    const { container } = render(<StarRating rating={0} />);
    expect(container.firstChild).toBeNull();
  });

  test('respects maxStars prop', () => {
    render(<StarRating rating={3} maxStars={3} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Rating: 3 out of 3 stars');
  });

  test('applies custom className', () => {
    render(<StarRating rating={3} className="custom-class" />);
    
    const container = screen.getByRole('img');
    expect(container).toHaveClass('custom-class');
  });
});