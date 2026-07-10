# Hand-off: Resolve Dependabot Alerts

This issue serves as a hand-off point for the next agent. The user requested to update the entire Ruby stack to resolve several pending Dependabot alerts:
- activesupport from 8.0.1 to 8.0.4.1 (or latest)
- nokogiri from 1.18.3 to 1.19.1 (or latest)
- faraday from 2.12.2 to 2.14.1 (or latest)
- uri from 1.0.2 to 1.0.4 (or latest)
- rexml from 3.4.1 to 3.4.2 (or latest)
- json from 2.10.1 to 2.10.2 (or latest)

## Required Steps

1. Create a new, dedicated branch off of `master` (e.g., `update-all-dependencies`).
2. Run `bundle update` to bump all gems (while adhering to `github-pages` restrictions).
3. Update `.gitignore` to explicitly ignore `_site/`, `.bundle/`, and `vendor/bundle/`.
4. Submit the changes as a new PR.

**Note**: Do not commit any build artifacts or local `.bundle` configurations.
