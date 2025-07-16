import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Page from '../app/(auth)/signin/page';

// Use vi.hoisted to declare mock variables that will be referenced in vi.mock
const mocks = vi.hoisted(() => {
  return {
    signInWithPasswordMock: vi.fn(),
    useActionResult: {
      execute: vi.fn(),
      result: {},
      isExecuting: false,
    },
  };
});

// Mock the server actions module
vi.mock('~/lib/actions/auth', () => ({
  signInWithPassword: mocks.signInWithPasswordMock,
}));

// Mock next/navigation - simplified version
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the useAction hook
vi.mock('next-safe-action/hooks', () => ({
  useAction: () => mocks.useActionResult,
}));

// Define regex patterns at the top level to avoid linter errors
const EMAIL_ADDRESS_REGEX = /email address/i;
const PASSWORD_REGEX = /password/i;
const CONTINUE_WITH_EMAIL_REGEX = /continue with email/i;

describe('SignIn Page Scenarios', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mocks.useActionResult.result = {};
    mocks.useActionResult.isExecuting = false;
    mocks.useActionResult.execute = mocks.signInWithPasswordMock;
  });

  afterEach(() => {
    // Clean up DOM between tests
    cleanup();
  });

  test('User logs in with no password entered, displays validation error', async () => {
    render(<Page />);
    const user = userEvent.setup();

    const emailInput = screen.getByRole('textbox', {
      name: EMAIL_ADDRESS_REGEX,
    });
    const submitButton = screen.getByRole('button', {
      name: CONTINUE_WITH_EMAIL_REGEX,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeDefined();
    });

    // Ensure the server action was NOT called
    expect(mocks.signInWithPasswordMock).not.toHaveBeenCalled();
  });

  test('User logs in with wrong password, displays server error', async () => {
    // Mock the useAction hook to return a server error
    mocks.useActionResult.result = {
      serverError: 'Something went wrong while executing the operation.',
    };

    render(<Page />);
    const user = userEvent.setup();

    const emailInput = screen.getByRole('textbox', {
      name: EMAIL_ADDRESS_REGEX,
    });
    const passwordInput = screen.getByLabelText(PASSWORD_REGEX);
    const submitButton = screen.getByRole('button', {
      name: CONTINUE_WITH_EMAIL_REGEX,
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Check for server error message
    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong while executing the operation.')
      ).toBeDefined();
    });
  });
});
