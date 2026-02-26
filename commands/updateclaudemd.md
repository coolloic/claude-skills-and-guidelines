Check the recent $ARGUMENTS merged Git branches (or more accurately, the **merge commits**).

For example, you can use `git log --merges -n 3 --oneline` (view the last three merge commits). Then, use `git show <commit-hash>` to inspect the changes introduced in each branch.

Next, compare those changes against the existing description in file `@CLAUDE.md`. Carefully review the content and think hard to determine if any important descriptions or summaries are missing. If anything is incomplete or absent, add or complement the summary, and do it carefully (refer to the existing summary).
