# Merge Coordination Guide

This guide establishes strict protocols for merging changes to the `clean-main` branch to avoid half-merges and ensure code quality.

---

## Golden Rule

**Never merge incomplete work to `clean-main`.**

The `clean-main` branch must always be deployable. Every merge should:
1. Pass all linting checks (`npm run lint`)
2. Pass TypeScript compilation (`npm run typecheck`)
3. Build successfully (`npm run build`)
4. Have been tested by the agent making the changes

---

## Pre-Merge Checklist

Before submitting any changes for merge, complete this checklist:

### For Agent A (Stripe Integration)

- [ ] All Stripe components render without errors
- [ ] PaymentIntent creation succeeds in test mode
- [ ] No console errors related to Stripe
- [ ] Environment variables documented for any new requirements
- [ ] No secret keys in client-side code
- [ ] Error handling covers all failure scenarios

### For Agent B (Shopping Cart & Products)

- [ ] Cart persists correctly in localStorage
- [ ] All products load from database
- [ ] Images display correctly (no broken placeholders)
- [ ] Migrations have been tested locally
- [ ] Product filtering works as expected
- [ ] Cart operations (add, remove, update) work correctly

### For Both Agents

- [ ] `npm run lint` passes with no new errors
- [ ] `npm run typecheck` passes
- [ ] `npm run build` completes successfully
- [ ] Changes are focused and minimal
- [ ] Commit messages are descriptive
- [ ] No unrelated changes included

---

## Merge Process

### Step 1: Prepare Your Branch

```bash
# Ensure you're on your feature branch
git checkout agent-a/your-feature  # or agent-b/your-feature

# Pull latest changes from clean-main
git fetch origin
git rebase origin/clean-main

# Resolve any conflicts if they occur
# Test after rebasing
npm run lint
npm run build
```

### Step 2: Create Pull Request

1. Push your branch to origin
2. Create a Pull Request targeting `clean-main`
3. Fill out the PR template completely
4. Request review from the other agent if changes affect shared areas

### Step 3: Review Requirements

**Self-Review:**
- Read through all changed files
- Verify no debug code remains
- Check for any hardcoded values
- Ensure tests pass

**Peer Review (for shared areas):**
- Other agent reviews changes that might affect their work
- Approve only after verifying no conflicts

### Step 4: Merge

1. Squash and merge to keep history clean
2. Delete the feature branch after merge
3. Notify the other agent that changes have been merged

---

## Conflict Resolution Protocol

### When Conflicts Occur

1. **Stop immediately** - Don't force merge
2. **Identify the conflict** - Which files are affected?
3. **Determine ownership** - Which agent owns the conflicting file?
4. **Communicate** - Contact the file owner before resolving

### Resolution Steps

```bash
# Update your branch with latest changes
git fetch origin
git rebase origin/clean-main

# If conflicts occur:
# 1. Open conflicting files
# 2. Look for conflict markers: <<<<<<< ======= >>>>>>>
# 3. Understand both changes
# 4. Choose the correct resolution (may need both)
# 5. Remove conflict markers
# 6. Test thoroughly

git add .
git rebase --continue
npm run build
npm run lint
```

### If You Can't Resolve

1. Abort the rebase: `git rebase --abort`
2. Contact the other agent
3. Schedule a sync meeting to resolve together

---

## Avoiding Half-Merges

### What is a Half-Merge?

A half-merge occurs when:
- Only part of a feature is merged
- Dependencies are merged but not the code using them
- Code is merged but migrations aren't applied
- Frontend changes merge but backend changes don't

### Prevention Strategies

1. **Atomic Commits**: Each commit should be complete and functional
2. **Feature Flags**: Use flags for incomplete features in production
3. **Migration First**: Always run migrations before merging code that depends on them
4. **Test End-to-End**: Verify the complete flow works, not just individual parts

### Rollback Plan

If a half-merge occurs:

```bash
# Identify the last good commit
git log --oneline -20

# Revert to the last good state
git revert <bad-commit-hash>

# Or, in emergencies:
git reset --hard <good-commit-hash>
git push --force-with-lease origin clean-main
```

---

## Continuous Work Protocol

### Ensuring Non-Stop Work

To ensure neither agent blocks the other:

1. **Independent Task Queues**: Each agent has their own task list
2. **No Cross-Dependencies**: Tasks are designed to be independent
3. **Clear Interfaces**: Shared interfaces are defined upfront
4. **Async Communication**: Document decisions, don't wait for sync meetings

### When Blocked

If Agent A is blocked by Agent B (or vice versa):

1. **Document the blocker** in a GitHub issue
2. **Tag the blocking agent** for visibility
3. **Work on an unblocked task** while waiting
4. **Follow up** if no response within 4 hours

### Task Priority

| Priority | Description | Example |
|----------|-------------|---------|
| P0 | Blocks deployment | Build failure, security issue |
| P1 | Blocks other work | Missing shared interface |
| P2 | Important feature | Core functionality |
| P3 | Enhancement | UI polish, optimization |

Handle P0 and P1 blockers immediately. P2 and P3 can be queued.

---

## Branch Naming Convention

Use consistent branch names to identify ownership:

```
agent-a/<feature-name>   # Agent A's branches
agent-b/<feature-name>   # Agent B's branches
shared/<feature-name>    # Requires both agents
hotfix/<issue-name>      # Emergency fixes (either agent)
```

Examples:
- `agent-a/stripe-3d-secure`
- `agent-b/cart-persistence-fix`
- `shared/checkout-integration`
- `hotfix/broken-build`

---

## Communication Channels

### Sync Points

1. **PR Comments**: For code-specific discussions
2. **GitHub Issues**: For tracking bugs and features
3. **Documentation**: For decisions that affect the codebase

### Status Updates

Each agent should update their status:

```markdown
## Agent A Status - [Date]
### Completed
- Implemented PaymentIntent creation

### In Progress
- Testing 3D Secure flows

### Blocked
- None

### Next
- Error handling improvements
```

---

## Emergency Procedures

### Production Break

If production breaks after a merge:

1. **Identify the breaking commit** using `git bisect`
2. **Revert immediately** - Don't debug in production
3. **Fix in a feature branch** - Take time to fix properly
4. **Post-mortem** - Document what went wrong

### Both Agents Editing Same File

If you discover both agents are editing the same file:

1. **Stop immediately**
2. **Communicate** which changes are more urgent
3. **One agent backs off** and waits for the other to merge
4. **Rebase after merge** and continue work

---

## Summary

| Do | Don't |
|----|-------|
| Rebase before merging | Force push to clean-main |
| Run all checks before PR | Merge with failing tests |
| Communicate blockers | Wait silently when stuck |
| Keep commits atomic | Mix unrelated changes |
| Review shared area changes | Assume your changes are safe |
| Document decisions | Make undocumented changes |

Following these guidelines ensures smooth collaboration between agents with minimal conflicts and no half-merges.
