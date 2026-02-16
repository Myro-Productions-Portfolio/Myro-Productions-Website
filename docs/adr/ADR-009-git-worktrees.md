# ADR-009: Git Worktree-Based Development

## Status
Accepted

## Context
Development workflow required the ability to:
- Work on multiple features simultaneously without switching branches
- Test different implementations side-by-side
- Review pull requests locally without disrupting current work
- Run different versions of the application concurrently
- Maintain clean, isolated development environments
- Avoid stashing changes or committing work-in-progress

Traditional branch-switching workflow limitations:
- `git checkout` switches entire working directory
- Uncommitted changes must be stashed or committed
- Running servers and dev processes must be restarted
- Node modules may need reinstalling after branch switches
- Cannot compare running versions side-by-side
- IDE state and file watchers get confused

## Decision
Adopt Git worktrees for parallel feature development, allowing multiple branches to be checked out simultaneously in separate directories.

Implementation includes:
- Main worktree at project root for stable development
- Feature worktrees in `.worktrees/` directory
- Separate node_modules and build artifacts per worktree
- Development servers running on different ports
- Git configuration to share refs but isolate working directories

## Consequences

### Positive
- **Parallel Development**: Work on multiple features without context switching
- **No Stashing**: Each worktree maintains its own uncommitted changes
- **Side-by-Side Comparison**: Run different versions simultaneously for comparison
- **Clean Environment**: Each worktree has isolated dependencies and build artifacts
- **Fast Switching**: Switch between features by changing directories, not branches
- **Review Efficiency**: Review PRs in separate worktree without disrupting main work
- **Port Isolation**: Run multiple dev servers on different ports
- **Experiment Freely**: Try risky changes in separate worktree without affecting main work

### Negative
- **Disk Space**: Multiple worktrees require more disk space (node_modules per worktree)
- **Initial Setup**: Requires understanding worktree concept and commands
- **Complexity**: More complex than traditional single-worktree workflow
- **Resource Usage**: Multiple dev servers consume more RAM and CPU
- **Confusion**: Easy to forget which worktree you're working in
- **Cleanup Required**: Must manually remove worktrees when done

### Neutral
- **IDE Configuration**: Some IDEs require separate windows for each worktree
- **Git Commands**: Most git commands work the same in worktrees
- **Shared Git Directory**: All worktrees share .git directory and refs

## Alternatives Considered

### 1. Traditional Branch Switching (git checkout)
**Why Not Chosen**:
- Requires stashing or committing work-in-progress
- Cannot run multiple versions simultaneously
- Dev server must restart on each switch
- Slow for frequent context switching
- File watchers and IDE get confused

### 2. Multiple Repository Clones
**Why Not Chosen**:
- Duplicates entire .git directory (wasteful)
- Branches not shared between clones
- Must push/pull to share changes between clones
- More complex to keep synchronized
- Even more disk space usage

### 3. Git Stash Workflow
**Why Not Chosen**:
- Requires disciplined stash management
- Easy to lose stashed changes
- Cannot run multiple versions simultaneously
- Stash conflicts are confusing
- Does not solve port conflict issues

### 4. Docker Containers per Feature
**Why Not Chosen**:
- Overkill for local development
- Slower iteration cycle
- More complex setup
- Higher resource usage
- Doesn't address git workflow issues

## References
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Git Worktree Tutorial](https://morgan.cugerone.com/blog/how-to-use-git-worktree-and-in-a-clean-way/)
- [Git Worktree Workflow](https://stackoverflow.com/questions/31935776/what-would-i-use-git-worktree-for)

## Implementation Notes

### Directory Structure

```
myro-productions-website/              # Main worktree (main branch)
├── .git/                              # Shared git directory
├── .worktrees/                        # Feature worktrees directory
│   ├── feature-admin-dashboard/       # Feature branch worktree
│   │   ├── node_modules/              # Isolated dependencies
│   │   ├── .next/                     # Isolated build
│   │   └── package.json               # Same as main
│   ├── feature-stripe-integration/
│   └── bugfix-payment-validation/
├── node_modules/                      # Main worktree dependencies
├── src/
└── package.json
```

### Worktree Management Commands

#### Create a new worktree for a feature branch
```bash
# Create new branch and worktree simultaneously
git worktree add .worktrees/feature-new-component -b feature-new-component

# Create worktree from existing branch
git worktree add .worktrees/feature-existing feature-existing

# Create worktree with remote tracking
git worktree add .worktrees/feature-remote origin/feature-remote -b feature-remote
```

#### List all worktrees
```bash
git worktree list
# Output:
# /Volumes/DevDrive-M4Pro/Projects/myro-productions-website              abc123 [main]
# /Volumes/DevDrive-M4Pro/Projects/myro-productions-website/.worktrees/feature-admin  def456 [feature-admin]
```

#### Remove a worktree (when feature is complete)
```bash
# Remove worktree directory
rm -rf .worktrees/feature-completed

# Prune git's worktree metadata
git worktree prune

# Or use git worktree remove (Git 2.17+)
git worktree remove .worktrees/feature-completed
```

#### Move or repair a worktree
```bash
# If worktree path changes
git worktree repair

# Move worktree to new location
mv .worktrees/old-name .worktrees/new-name
git worktree repair
```

### Development Workflow

#### 1. Start new feature
```bash
# From main worktree
cd /Volumes/DevDrive-M4Pro/Projects/myro-productions-website

# Create feature branch and worktree
git worktree add .worktrees/feature-analytics -b feature-analytics

# Navigate to new worktree
cd .worktrees/feature-analytics

# Install dependencies (not shared with main worktree)
npm install

# Start dev server on different port
PORT=3001 npm run dev

# Work on feature normally
```

#### 2. Switch between features
```bash
# No need to commit or stash
# Just cd to different worktree
cd /Volumes/DevDrive-M4Pro/Projects/myro-productions-website/.worktrees/feature-admin
npm run dev  # Runs on port 3000

# In another terminal
cd /Volumes/DevDrive-M4Pro/Projects/myro-productions-website/.worktrees/feature-analytics
PORT=3001 npm run dev  # Runs on port 3001

# Now both features are running simultaneously for comparison
```

#### 3. Review pull request locally
```bash
# Fetch PR branch
git fetch origin pull/123/head:pr-123

# Create worktree for review
git worktree add .worktrees/pr-123 pr-123

# Navigate and test
cd .worktrees/pr-123
npm install
npm run dev

# Review, test, and comment
# When done, remove worktree
cd ../..
git worktree remove .worktrees/pr-123
```

#### 4. Cleanup completed features
```bash
# After feature is merged
git worktree remove .worktrees/feature-completed

# Delete remote branch
git push origin --delete feature-completed

# Delete local branch
git branch -d feature-completed

# Prune worktree metadata
git worktree prune
```

### Port Management Strategy

Each worktree should use a unique port:

```bash
# Main worktree: port 3000
npm run dev

# Feature 1: port 3001
PORT=3001 npm run dev

# Feature 2: port 3002
PORT=3002 npm run dev

# Feature 3: port 3003
PORT=3003 npm run dev
```

Or use a helper script:

```bash
# scripts/dev-worktree.sh
#!/bin/bash
WORKTREE_NAME=$(basename $(pwd))
PORT=$((3000 + $(echo $WORKTREE_NAME | md5sum | head -c 2 | xargs -I{} printf "%d" "0x{}")))
echo "Starting dev server on port $PORT"
PORT=$PORT npm run dev
```

### IDE Configuration

#### VSCode
Each worktree can have its own VSCode workspace:

```json
// .worktrees/feature-admin/.vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.workingDirectories": ["."],
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/.next/**": true
  }
}
```

Open each worktree in separate VSCode window:
```bash
code /Volumes/DevDrive-M4Pro/Projects/myro-productions-website
code /Volumes/DevDrive-M4Pro/Projects/myro-productions-website/.worktrees/feature-admin
```

### Best Practices

1. **Naming Convention**: Use descriptive worktree names matching branch names
   - `feature-admin-dashboard`
   - `bugfix-stripe-webhook`
   - `refactor-auth-flow`

2. **Regular Cleanup**: Remove worktrees when branches are merged
   ```bash
   git worktree prune  # Run periodically
   ```

3. **Gitignore Worktrees**: Already handled by `.gitignore`
   ```
   .worktrees/
   ```

4. **Shared Git Hooks**: Git hooks in `.git/hooks/` apply to all worktrees

5. **Branch Protection**: Don't create worktrees for protected branches (main, production)

6. **Dependency Management**: Each worktree has its own node_modules
   - Ensures isolated dependencies
   - Can test dependency upgrades safely
   - Adds disk space usage

### Troubleshooting

#### "fatal: 'branch' is already checked out"
You can't checkout same branch in multiple worktrees:
```bash
# This fails if feature-admin is already checked out
git worktree add .worktrees/feature-admin feature-admin

# Solution: Use different branch or remove existing worktree
git worktree remove .worktrees/feature-admin
```

#### Disk space issues
```bash
# Check worktree disk usage
du -sh .worktrees/*

# Remove unused worktrees
git worktree remove .worktrees/old-feature

# Clear node_modules in unused worktrees
rm -rf .worktrees/*/node_modules
```

#### Port conflicts
```bash
# If port is already in use
# Kill process using port
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Integration with CI/CD

Worktrees are local development feature. CI/CD still uses traditional checkout:

```yaml
# .github/workflows/ci.yml
- name: Checkout code
  uses: actions/checkout@v4
  # Standard checkout, not worktree
```

### Migration from Traditional Workflow

For existing developers:

1. **Gradual Adoption**: Can mix worktrees with traditional workflow
2. **Education**: Share documentation and examples
3. **Scripts**: Provide helper scripts for common operations
4. **Support**: Be available for questions during transition
5. **Best Practices**: Document team conventions for worktree usage
