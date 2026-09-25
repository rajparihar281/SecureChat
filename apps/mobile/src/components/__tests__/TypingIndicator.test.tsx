import React from 'react';
import renderer from 'react-test-renderer';
import { TypingIndicator } from '../TypingIndicator';
import { ThemeProvider } from '../../theme';

describe('TypingIndicator Component', () => {
  it('renders typing indicator with username', () => {
    let component!: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(
        <ThemeProvider>
          <TypingIndicator username="Alice" />
        </ThemeProvider>,
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeDefined();
    const str = JSON.stringify(tree);
    expect(str).toContain('Alice is typing...');
  });

  it('renders fallback typing text when no username is provided', () => {
    let component!: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(
        <ThemeProvider>
          <TypingIndicator />
        </ThemeProvider>,
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeDefined();
    const str = JSON.stringify(tree);
    expect(str).toContain('typing...');
  });
});
