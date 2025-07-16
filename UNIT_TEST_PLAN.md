# Unit Test Plan

## Introduction

### Purpose
The purpose of the unit test plan is to ensure code quality through reliability and correctness. The primary testing method employed is a systematic testing methodology, where component-level unit testing was performed to verify the functionality of core components. This approach allows for the testing of user interface components in an isolated environment that closely mimics their real-world usage. The results from these tests provide immediate feedback on the correctness of a component's behavior and its response to user interactions, allowing for the quick identification and resolution of bugs and stability issues when making changes.

### Overview
The testing strategy is integral to the project’s development lifecycle. Unit tests are well-suited for individual components, especially those with significant business logic or user interaction. The primary focus of unit testing in this project was related to user authentication, particularly user sign-in. This is the entry point of the application, and reliability here is table stakes for any production application. For the sign-in page, tests were created to verify that input validation works as expected when a user does not include a password, and that when an incorrect password is input, the proper UI feedback is presented to the user. Tests were only created for these two scenarios, but the implemented approach could easily be expanded to further sign-in scenarios, sign-up scenarios, and other critical business logic inside the dashboard of the application.

To elucidate how the testing works under the hood, functions and components are tested by rendering them in a simulated DOM environment provided by `jsdom`. User interactions, such as typing text into an input field or clicking a button, are programmatically simulated using the `@testing-library/user-event` package. To keep tests focused and independent, external dependencies like server-side actions, API calls, or routing hooks (`next/navigation`) are replaced with mock implementations using Vitest's `vi.mock` function. Errors, manifested as failed assertions, are captured in the test runner's output. Tests can be set up in the CI/CD pipeline of the application so that a failed test prevents the associated code from being merged, forcing a resolution and maintaining a high standard of quality for the application.

## Test Plan

### Items
*   **Application Source Code**: Git clone the source code from the GitLab repository, which includes the test scripts.
*   **Development Environment**: A development environment with Node.js installed.
*   **Project Dependencies**: All project dependencies are installed via `pnpm install`. `pnpm` is used because of its superior monorepo support compared to other package managers.
*   **Testing Libraries**:
    *   **Vitest**: The core testing framework. It provides a fast, modern, and Jest-compatible API for writing and running unit and integration tests. It is responsible for test discovery, execution, and assertion.
    *   **React Testing Library (`@testing-library/react`)**: A library designed to facilitate testing React components. It encourages writing tests that reflect how a user interacts with the software, focusing on behavior rather than internal implementation details. It provides utilities to render components into a virtual DOM and query them in an accessible way.
    *   **User Event (`@testing-library/user-event`)**: A companion to the Testing Library that simulates user interactions like typing and clicking.
    *   **JSDOM**: A pure-JavaScript implementation of web standards, which creates a simulated DOM environment within Node.js. This allows tests that rely on a browser environment (like React component tests) to run on the command line without needing to launch an actual browser.

### Features
The tests for the sign-in page cover the following features:
*   Correct rendering of all form elements, including input fields and the submission button.
*   Client-side validation logic, such as ensuring that required fields like the password are not empty.
*   Handling and display of server-side validation errors (e.g., "Invalid credentials").
*   Handling and display of generic server exceptions (e.g., "Something went wrong").

### Deliverables
*   **Test Scripts**: A suite of `.test.tsx` files containing the test code, co-located with the application code. They are written using Vitest and React Testing Library.
*   **Test Results**: A report in the terminal output from the Vitest runner, detailing the pass/fail status of each test.
*   **CI/CD Checks (not currently implemented)**: Automated checks within the CI/CD pipeline that gatekeep pull requests based on test results. This helps to ensure that functionality is not broken with changes.

### Tasks
*   **Requirement Analysis**: Identify the specific components to be tested. The outcome is a clear scope for the test suite.
*   **Test Case Design**: Write down the scenarios to test (e.g., valid input, invalid input). The outcome is a list of test cases that cover the component’s logic.
*   **Test Implementation**: Write the test code using Vitest and React Testing Library, including setting up mocks for dependencies. The outcome is a functional test suite.
*   **Test Execution**: Run the tests locally and in the CI environment. The outcome is a report of passing and failing tests.
*   **Debugging and Refactoring**: Address tests that fail by fixing the component code or the test itself. The outcome is a fully passing test suite and robust application code.

### Needs
In order to run the test suite, there are a few tools and configurations that are necessary, which are as follows:
*   **Runtime**: The Node.js runtime (v20.x or later) is used to run the web application and the test suite.
*   **Package Manager**: A package manager that is capable of running the test suite, and in the monorepo, is required. `pnpm` (v8.x or later) is used for this because of its compatibility with `npm` and its superior monorepo support.
*   **Testing Framework**: Vitest is used as the core testing framework in the application to run the tests. It is very fast.
*   **Testing Utilities**:
    *   `@testing-library/react` is used for rendering and interacting with React components.
    *   `@testing-library/user-event` is used for simulating realistic user interactions (e.g., typing, clicking).
    *   `jsdom` is used to provide a virtual DOM environment for tests to run in a Node.js environment.
*   **Configuration**: This project uses a shared testing configuration located in the `@repo/testing` package, which is extended in each application's `vitest.config.ts` file. Currently, this is only used in the Next.js application, but it is designed to be easily used in other applications that may be added to the monorepo.

### Pass/Fail Criteria
The criteria for determining the success or failure of a test are straightforward. A test passes if it completes execution without any of its assertions throwing an error. A test fails if any assertion is not met or if an unhandled error occurs during the component’s execution.

**Scenario 1: User does not input a password on the sign-in page and submits the form.**
*   **Pass**: The client-side validation logic prevents the form submission. A validation message, "Password is required," is displayed to the user. The test asserts that the underlying server action for authentication was not called.
*   **Fail**: The validation message is not displayed, an incorrect message appears, or the form submission proceeds and calls the server action, indicating a failure in the client-side validation.

**Scenario 2: User inputs an incorrect password and submits the form.**
*   **Pass**: The form submission calls the mocked server action. The test, configured to simulate a server error response, asserts that the UI correctly displays the corresponding error message (e.g., "Something went wrong while executing the operation.").
*   **Fail**: The UI does not display the expected server error message, crashes, or shows a misleading success message. This indicates the component is not correctly handling error states from the server.

If a test failed during the testing process, the following remediation strategies and documentation requirements were applied to address the issue:
*   **Identify the Root Cause**: Investigate the failed test to determine the underlying cause of the issue. Examine the error messages and stack traces from the Vitest output to understand the nature of the problem. Check that all external dependencies are correctly mocked and that UI selectors in the test match the component's current implementation.
*   **Document the Issue**: Create a bug report or issue ticket to document the problem. The report must include details such as the specific test that failed, the error message, clear step-by-step instructions to reproduce the failure, the expected behavior, and the actual failing behavior.
*   **Implement a Fix**: Based on the root cause, either correct the application code to fix the bug or update the test code if the component's behavior has changed intentionally and the test is now outdated.
*   **Verify the Fix**: Run the specific failing test to confirm the fix works, then run the entire test suite to ensure the change has not introduced any new bugs (regressions) in other parts of the application.
*   **Commit and Document**: Commit the fix with a clear, descriptive message that references the issue ticket. This ensures a traceable history of changes and bug fixes.

### Specifications
Here are the screenshots of the code for the sign-in page tests taken from the source code.
