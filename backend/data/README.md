# Google Careers requirement storage

The Analytics API discovers jobs from Google's official Careers search page and saves each selected job separately under `google_jobs/<official-job-id>/google_requirements.json` and `google_requirements.txt`. These files are written only after a successful, validated fetch of that exact official job page. A failed refresh preserves that job's previous successful files.

The top-level `google_requirements.json` and `.txt` are the earlier single-job format. They remain available only as a read fallback for the job ID inside that record; new job selections do not overwrite them.

No sample requirements are supplied. Local files require a persistent backend filesystem in deployment.
