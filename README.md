# Project Name
User Management Dashboard

## Overview
This is a Vue 3 application built with a modular architecture, using Pinia for state management and a mock API to simulate backend interactions. The project includes role-based authentication with three demo accounts for different access levels:

- **Admin**: [admin@example.com](mailto:admin@example.com) / password
- **Manager**: [manager@example.com](mailto:manager@example.com) / password
- **Viewer**: [viewer@example.com](mailto:viewer@example.com) / password

## Project Status
This project is currently **unfinished**. I reached out to the recruiter to request an extension due to personal circumstances but didn’t receive a response. Because of this, some features and optimizations are still a work in progress.

## Architecture

### Component Structure
The application is structured in a way that keeps everything modular and easy to maintain:

- **Views**: Page-level components
- **Components**: Reusable UI elements
- **Stores**: Pinia stores for managing global state
- **Composables**: Reusable logic using Vue Composition API
- **Directives**: Custom Vue directives for handling DOM behavior
- **Services**: API calls and data handling logic

### State Management
Pinia is used for state management, with dedicated stores for different parts of the application:

- **Auth Store**: Manages authentication and user info
- **Users Store**: Handles user data, filtering, pagination, and sorting

### API Integration
A mock API is used to simulate backend interactions, including handling delays and error scenarios to make the app behave as realistically as possible.

## Optimization Strategies

### Improving API Performance
To keep API calls efficient, the application implements:

- **Debounced search**: Prevents excessive API requests while typing
- **Pagination**: Loads data in chunks for better performance
- **Client-side caching**: Stores frequently used data in state to reduce redundant requests
- **Optimistic UI updates**: Updates the UI immediately before waiting for API confirmation
- **Request cancellation**: Cancels ongoing API requests when a new search query is entered

In a real-world scenario, further improvements like server-side filtering, HTTP/2, and GraphQL for fetching only necessary data would be beneficial.

### Managing Shared Logic
Shared logic is organized through:

1. **Composables**: Reusable logic functions like `useDebounce` and `useConfirmation`
2. **Custom Directives**: For role-based access (e.g., `v-permission`)
3. **Pinia Stores**: Centralized state management across components
4. **Utility Functions**: Common helper functions for formatting, validation, etc.

### Client-Side Caching
To speed up data retrieval and improve performance, caching is handled through:

- **Pinia store caching**: Frequently accessed data is cached with expiration logic
- **Local storage**: Persists important user preferences and session data
- **Service workers**: Enables offline caching and background syncing
- **Cache invalidation strategies**: Uses a combination of time-based expiry, manual invalidation, and ETag-based revalidation

## Scaling for Complex Permissions
If the application needed to support hundreds of different user permissions, these strategies would be implemented:

1. **Switching to a permission-based model (PBAC)** rather than role-based access
2. **Grouping permissions logically** to reduce complexity
3. **Dynamically generating UI elements** based on user access rights
4. **Implementing a centralized permission management system** with both frontend and backend validation

## Testing Strategy

The application follows a balanced testing approach:

1. **Unit Tests** – Covers individual functions, composables, and store actions
2. **Component Tests** – Ensures UI components render and behave correctly
3. **Integration Tests** – Verifies data flow between components and stores
4. **E2E Tests** – Tests complete user journeys like authentication and role-based access

To run tests:
```sh
# Run unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

**Current Test Coverage: ~85%**

## Handling Offline Capabilities
For offline functionality, these features were planned:

1. **Service Worker Integration**
   - Caching static assets (HTML, CSS, JS)
   - Background sync for API requests
2. **Offline-First Data Handling**
   - Storing key data in IndexedDB for offline access
   - Sync queue for pending updates when back online
3. **User Experience Enhancements**
   - Displaying offline status indicators
   - Preventing actions that require internet access
4. **Conflict Resolution Strategies**
   - Using timestamps and versioning to detect conflicts

## Final Thoughts
This project lays the groundwork for a scalable and well-structured Vue 3 application with a strong focus on performance, reusability, and a smooth user experience. Unfortunately, due to unforeseen circumstances, it remains incomplete. 

That said, the current implementation provides a solid foundation, and the outlined plans give a clear roadmap for further development. If given more time, I would focus on refining the caching strategies, enhancing role-based permissions, and completing any remaining features.

