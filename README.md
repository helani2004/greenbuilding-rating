# Green Building Rating — v0.2

React + TypeScript interface with a Node.js local backend. Includes clickable document guidance, per-item and category saves, all eight category forms for New Buildings and Existing Buildings, and an admin standards editor with immutable published versions.

## Upgrade your working installation (Windows)

1. Stop both old terminals using Ctrl+C.
2. Make a backup copy of your current `greenbuilding-rating` folder.
3. Extract this ZIP into a separate temporary folder.
4. Copy its contents into your existing working `greenbuilding-rating` folder. Replace matching source files. **Keep your existing `data`, `node_modules`, and `.git` folders. Do not delete or replace them.** This source ZIP intentionally excludes private submissions and installed dependencies.
5. Open Command Prompt in your working folder (the one containing package.json).
6. Run `npm start`. This now starts BOTH the backend and frontend. Leave that window open. Do not also run the old two-terminal commands.
7. Open the Local URL printed by Vite, normally http://127.0.0.1:5173.
8. Refresh the browser. Select **Create a project** and the **workflow demonstration** version to use all eight categories.

Dependencies are unchanged from v0.1, so an existing working installation should not need another npm install. For a fresh installation, install Node.js LTS, open the project folder and run `npm install` once, then `npm start`. `START-WINDOWS.cmd` is an optional double-click launcher after dependencies are installed.

## Existing projects

Your saved answers and evidence stay in `data/`. The backend registers the original Management-only standard for those projects. Their original version and scores remain intact; they do not silently become a different assessment. To use the expanded eight-category forms, create a new project and select the new workflow demonstration version. Evidence is not automatically copied to the new project.

## User workflow

- Choose New Buildings, Existing Buildings, or another building type published by the admin.
- Choose the published standard version. This version is pinned to the project.
- Click the circled **?** next to any prerequisite or credit to read document guidance. Click again to close; keyboard Enter also works.
- Enter answers and attach a file (maximum 5 MB per file).
- Use **Save item** or the **Save category** button at the bottom. Category save stores all pending answers and uploads in that category in one transaction, with a last-saved time. You may save incomplete progress.
- Credits unlock only after the saved prerequisites pass. Categories without prerequisites unlock immediately.
- The displayed points use saved data. Unsaved edits are marked and leaving the category triggers a warning.
- If a saved prerequisite becomes unmet, dependent credits immediately contribute zero. Their saved answers remain available if the prerequisite is later achieved again.
- Click a saved evidence link to download the original file.

Files are evidence attachments only. Their contents are not automatically checked. Bundle related documents into one PDF/ZIP if an item needs multiple documents. A category save supports up to 30 MB of combined uploads; save individual items if larger.

## Admin side

1. Start the app with `npm start`.
2. The terminal prints `Local admin password: ...`. Copy that password.
3. Click **Admin · standards & versions** in the left sidebar and sign in.
4. Under **Create a new version**, choose a source version, enter a new version name and building type (`new`, `existing`, or a new type), and click **Create draft**.
5. Choose a category (MN, SS, WE, EA, MR, EQ, ID, SC).
6. Expand a prerequisite/credit to edit its title, document-help text, evidence requirement, input fields and rule. Add/delete items or fields as required.
7. Set each credit's maximum and the category maximum. Their totals must agree, and all eight categories must total exactly **100**.
8. Click **Save draft**. Resolve the displayed validation errors. Then click **Publish version**.
9. New projects can select that version. Existing projects keep their own version. Published versions cannot be changed or deleted; clone them into a new draft instead.

The admin can edit labels, document help, fields (Yes/No, number, text, selection), units, evidence requirements, credit points, category allocations, building types and version names. Rule options: all conditions, any condition, numeric thresholds, and sum of matching-condition points capped at the credit maximum. A new type of calculation may require a developer to extend the engine. PDF upload alone does not configure a new standard.

Draft import/export is available as JSON for developer handover. Reuse an exported structure. Drafts can be saved with incomplete/balancing issues, but cannot be published until validation passes. Stable IDs connect fields to rules; update the rule if you change a field ID. Uploaded files are still retained under each project, not moved between versions.

The admin password is generated at startup and expires on restart unless you set `ADMIN_PASSWORD` in your environment. Sessions last eight hours and are kept only in browser session storage. This is **local development authentication**, not a production user/role system. Admin sign-out ends the browser session; restart the server to invalidate all active admin sessions.

## Scoring status and source notes

Both eight-category versions are **workflow demonstrations**. Yes plus an evidence file currently awards the item's maximum. Exact technical calculations, multi-condition compliance checks, rating eligibility requirements and document verification are not fully implemented. Admin can replace the demonstration rules with verified ones using the rule editor.

- New Buildings: supplied GREENSL v3.0 Beta. Category maximums: 4,25,14,22,13,14,4,4.
- Existing Buildings: supplied GREENSL v1.0 checklist. Category maximums: 4,21,16,26,10,13,6,4.
- v3 Beta inconsistency: the main checklist's EQ labels/points differ from the detailed EQ chapter. These forms follow detailed chapter pp. 113–114 (including Low-Emitting Materials at 2 points). The SC first prerequisite follows detailed chapter p. 152, Cultural Heritage & Archaeological Protection, rather than the duplicated innovation wording in the main checklist. Seek domain confirmation before a production standard is approved.
- Document-help text is suggested guidance, not a complete authoritative evidence schedule.
- The eight shared category labels are kept for both building types; Existing Buildings uses its own credits and point allocations.
- Final PDF output matching the workbook DASHBOARD is **not yet implemented**.

## GitHub — beginner steps

1. Install GitHub Desktop from https://desktop.github.com and sign in.
2. In GitHub Desktop choose **File → Add local repository** and select your working project folder.
3. If it says the folder is not a Git repository, choose **create a repository here**. Use the existing project folder; avoid creating an extra nested project folder.
4. Check the Changes list. It should include source files, not `node_modules`, `data`, `.env`, or `dist`. The supplied `.gitignore` excludes those.
5. In Summary enter `Add document help, category saves and admin versions`, then click **Commit to main**.
6. Click **Publish repository**, name it `greenbuilding-rating`, choose private/public according to your team's requirements, and publish.
7. Later, after making changes, use **Commit to main**, then **Push origin**. Before starting work on another computer, use **Fetch origin / Pull origin**.
8. Invite B-SAT developers through repository Settings → Collaborators when you are ready to hand it over.

GitHub stores the code and its history. You still run this local app using `npm start`. No GitHub remote was created or modified by this update. Do not upload the entire old ZIP: it contains evidence files and node_modules. Publish the extracted source using GitHub Desktop, which applies .gitignore.

## Developer handover

- `src/main.tsx`: dynamic assessment forms, help popovers, save states.
- `src/Admin.tsx`: admin login and version/form/rule editor.
- `src/api.ts`: API client with actionable connection errors.
- `shared/seeds.json`: original version plus two eight-category demonstrations.
- `shared/engine.mjs`: evaluation and publication validation.
- `server/index.mjs`: version registry, local admin sessions, projects and evidence API.
- `server/start.mjs`: one-command startup.
- `docs/API.md`: endpoints and deployment limits.

Run `npm test` and `npm run build`. Automated tests cover legacy migration, both 100-point schemes, category-save rollback, evidence retrieval, prerequisite gating/revocation, thresholds, capped sums, admin access, revision conflict protection, immutable versions and persistence after restart.

Before shared deployment: migrate JSON records to a transactional database, evidence to object storage, add user/project authorization, production identity/roles, upload quotas and file checks, audit history and backup/recovery, and verify all compliance rules with a domain expert. The current backend listens on 127.0.0.1 and is intended for one local process.
