import React from 'react';
import renderer from 'react-test-renderer';
import { View, Text } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';

const GoodChild: React.FC = () => (
  <View>
    <Text>Safe Content</Text>
  </View>
);

const CrashingChild: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error('Test component explosion');
  }
  return <GoodChild />;
};

describe('ErrorBoundary Component', () => {
  // Prevent jest from failing on console.error when catching deliberate error
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children normally when no exception is thrown', () => {
    let component!: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(
        <ErrorBoundary>
          <GoodChild />
        </ErrorBoundary>,
      );
    });

    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Safe Content');
  });

  it('catches render error, renders fallback recovery UI, and handles reset', () => {
    const onErrorMock = jest.fn();
    const onResetMock = jest.fn();
    let component!: renderer.ReactTestRenderer;

    renderer.act(() => {
      component = renderer.create(
        <ErrorBoundary onError={onErrorMock} onReset={onResetMock}>
          <CrashingChild shouldCrash={true} />
        </ErrorBoundary>,
      );
    });

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );

    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Something went wrong');
    expect(str).toContain('Test component explosion');
    expect(str).toContain('Try Again');

    // Trigger recovery reset
    const instance = component.getInstance() as unknown as { handleReset: () => void };
    renderer.act(() => {
      instance.handleReset();
    });

    expect(onResetMock).toHaveBeenCalled();
  });

  it('renders custom fallback when provided', () => {
    let component!: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(
        <ErrorBoundary fallback={<Text>Custom Fallback Screen</Text>}>
          <CrashingChild shouldCrash={true} />
        </ErrorBoundary>,
      );
    });

    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Custom Fallback Screen');
  });
});
