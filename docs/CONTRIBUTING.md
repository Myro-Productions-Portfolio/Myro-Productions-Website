# Contributing Guide

Thank you for considering contributing to the Myro Productions website!

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up development environment (see [Development Guide](./DEVELOPMENT.md))
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## Development Process

### 1. Create Feature Branch

```bash
# Create branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits atomic and focused

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(admin): add client export functionality

Add CSV export for client list with filtering options.

Closes #123
```

```
fix(payment): handle Stripe webhook timeout

Implement retry logic for failed webhook processing.

Fixes #456
```

### 4. Test Your Changes

```bash
# Run all tests
npm run test:all

# Check linting
npm run lint

# Build to verify no errors
npm run build
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request on GitHub with:
- Clear title and description
- Reference related issues
- Screenshots (if UI changes)
- Test results

## Code Style

### TypeScript

- Use explicit types
- Avoid `any` type
- Use interfaces for objects
- Prefer const over let
- Use optional chaining (`?.`)

### React Components

- Use functional components
- Server Components by default
- Client Components only when needed
- Props interface for all components
- Descriptive component names

### Tailwind CSS

- Use utility classes
- Extract repeated patterns to components
- Mobile-first responsive design
- Consistent spacing scale

## Testing Requirements

All contributions must include tests:

### Unit Tests Required For:
- Utility functions
- Business logic
- API routes
- Custom hooks

### E2E Tests Required For:
- New user flows
- Critical paths (auth, payments)
- Complex interactions

## Documentation

Update documentation for:
- New features
- API changes
- Configuration changes
- Deployment updates

Documentation files:
- `docs/ARCHITECTURE.md` - Architecture changes
- `docs/API.md` - API route changes
- `docs/DEPLOYMENT.md` - Deployment updates
- `docs/adr/` - Architectural decisions

## Pull Request Process

1. **Self-Review**: Review your own changes first
2. **Tests Pass**: Ensure all tests pass
3. **Description**: Provide clear PR description
4. **Small PRs**: Keep PRs focused and small
5. **Respond to Feedback**: Address review comments promptly

### PR Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] Commits follow convention
- [ ] No merge conflicts
- [ ] Branch is up to date with main

## Code Review Guidelines

### As Author

- Respond to feedback promptly
- Be open to suggestions
- Ask questions if unclear
- Update PR based on feedback

### As Reviewer

- Be respectful and constructive
- Focus on code, not person
- Provide specific suggestions
- Approve when ready

## Issue Guidelines

### Reporting Bugs

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots (if applicable)

### Feature Requests

Include:
- Problem statement
- Proposed solution
- Use cases
- Alternatives considered

## Security Issues

**Do not** open public issues for security vulnerabilities.

Instead:
1. Email security concerns to admin@myroproductions.com
2. Include detailed description
3. Wait for response before disclosure

## Questions?

- Check [Development Guide](./DEVELOPMENT.md)
- Check [Architecture Documentation](./ARCHITECTURE.md)
- Ask in GitHub Discussions
- Contact maintainers

Thank you for contributing!
