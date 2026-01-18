---
title: 'Daily Sync Failed: Rebase Conflicts Detected'
labels:
  - automated-sync
  - needs-attention
---

The daily sync and rebase workflow failed.

**Details:**
- Workflow: {{ payload.workflow }}
- Run: [#{{ env.GITHUB_RUN_NUMBER }}]({{ payload.repository.html_url }}/actions/runs/{{ env.GITHUB_RUN_ID }})

Manual intervention is required to resolve rebase conflicts between `Trackarr` and `plugin` branches.

**Steps to resolve:**
1. `git fetch --all`
2. `git checkout Trackarr`
3. `git rebase plugin`
4. Resolve conflicts manually
5. `git rebase --continue`
6. `git push origin Trackarr --force-with-lease`
