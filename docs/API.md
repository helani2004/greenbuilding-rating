# Local API — v0.2

Base: http://127.0.0.1:3001. Vite proxies /api. Run `npm start` to launch both processes. JSON errors are `{error:string}`. Project responses include the pinned `standard`, saved answers, categorySavedAt and computed result.

| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | Backend health |
| GET | /api/standards | Published version summaries |
| GET | /api/projects | Saved projects, definitions and recomputed results |
| POST | /api/projects | `{name,standardId}` creates a version-pinned project |
| POST | /api/projects/:id/answers | `{itemId,values,file?:{name,base64}}` saves one item |
| POST | /api/projects/:id/categories/:categoryId | `{answers:[{itemId,values,file?}]}` saves all submitted pending answers atomically and timestamps category progress |
| GET | /api/projects/:id/evidence/:fileId | Download matching project evidence |
| POST | /api/admin/login | `{password}` returns an 8-hour bearer session |
| GET | /api/admin/standards | All versions; bearer auth required |
| POST | /api/admin/drafts | `{sourceId,label,buildingType}` clones a version |
| POST | /api/admin/standards/:id | `{revision,standard}` updates a draft only |
| POST | /api/admin/standards/:id/publish | `{revision}` validates and publishes an immutable version |
| DELETE | /api/admin/standards/:id | Deletes a draft only |

Admin routes use `Authorization: Bearer <token>`. No token is stored in project data. Sessions are server memory only. Use ADMIN_PASSWORD to set the local development password; otherwise it is generated and printed on startup. DATA_DIR and PORT support isolated testing. Never commit credentials or data.

The standard registry is added to the existing data/store.json without deleting projects/files. The legacy standard ID is seeded so old answers still resolve. Legacy `{answer}` values remain supported. New submissions use `{values:{fieldId:value}}`.

All category prerequisites gate that category's credits. A save evaluates prerequisite changes before credit changes; newly edited credits cannot be saved if prerequisites fail. A later prerequisite failure excludes stored credit points without deleting answers. An atomic JSON write uses a temporary file then rename; incoming requests are serialized in one process. Files validated before committing answers can remain orphaned if a disk write fails; garbage collection/quotas are future work. Do not run multiple backend processes against the same directory.

Limits: 5 MB per uploaded file, 30 MB combined files per category, 45 MB JSON request, 200 answer entries per save. Evidence is stored with opaque IDs, not uploaded path names. Files are downloaded as attachments; bytes are not verified against the standard. Current project/file routes assume a trusted local user, not production tenant isolation.

Rule types: `all`, `any`, `thresholds`, `sum`. Operators: `eq`, `neq`, `gte`, `lte`, `gt`, `lt`, `notEmpty`. Thresholds require a numeric field and `{min,points}` bands; the highest qualifying award is used. Sum awards points per matching condition, capped at the item maximum. Required fields and required evidence gate the result. No dynamic code execution is used. Prerequisite rules evaluate against a cap of 1; credit rules use maxPoints.

Publication checks: fixed eight category IDs, valid labels and unique item/field IDs, valid conditions/references, non-negative awards, credit maxima matching category maxima, exactly 100 points overall. These checks establish structural validity, not domain accuracy. All supplied definitions remain marked demo. No final PDF/rating endpoint exists yet.
