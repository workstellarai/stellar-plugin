---
name: permit-expiry-sweep
description: Sweep a Stellar workspace's Compliance register for permits and inspections that are expired, expiring, needed or stuck in renewal, and make sure each one has an owner and a next step - or record the renewal when the new certificate is in hand. Use when asked about permits that are expiring, a "permit check", or "what's due for renewal".
---

# Permit expiry sweep

Permits live in the Compliance register, not on work orders. Each one has its own thread, its tagged people, and a status the register keeps up to date on its own.

## 1. Set up

1. `whoami`, then `operating_guide` once.
2. Pull each group with `list_compliance` (add `workspace_id` or `location_code` if the user narrowed it; raise `limit` to 50 and page by location if a group is large):
   - `status: "EXPIRED"`: past expiry. Worst first.
   - `status: "EXPIRING"`: inside the renewal window.
   - `status: "RENEWING"`: filed, waiting on the new permit.
   - `status: "NEEDED"`: required, nobody has started.

Leave `ACTIVE`, `IN_PROGRESS` and `WAIVED` alone unless the user asks.

## 2. For each permit

1. `get_compliance` by its number (CMP-...) or id: dates, number, location, whether a document is on file, who is tagged, and the recent thread.
2. **Already handled?** If the thread shows someone is working it in the last week (a filing, an inspection booked, a fee paid), skip it and note that in the report.
3. **New certificate in hand?** If the thread or an attached document gives the new issue and expiry dates:
   - `renew_compliance` with `issued_at` and `expires_at` exactly as the certificate prints them (`YYYY-MM-DD`), and `reference_no` if the permit number changed. The register writes its own history line, so do not post a confirmation.
   - If the new certificate file needs to be put on the permit: `prepare_compliance_document`, upload the file with an HTTPS PUT to the returned `upload_url` (`curl -T certificate.pdf -H "Content-Type: <content_type>" "<upload_url>"`), then `attach_compliance_document` with the returned path. Never upload the same certificate twice.
   - If it is filed but the new permit has not arrived: `renew_compliance` with `status: "RENEWING"`.
   - If you act as a person, confirm the dates with them before saving.
4. **Otherwise, ask.** `post_compliance_comment` tagging the one person who owns the renewal (from the permit's tagged list), with the permit, the location, the expiry date, and one question: "Has the renewal been filed? If so, what is the new expiry date?" For an EXPIRED permit, say it plainly and ask what is blocking it.
5. **Nobody tagged?** Do not pick someone at random. List it in the report for a person to assign.

## 3. Report back

Group by status, worst first:
- renewed or marked Renewing (with the new dates)
- asked (who, and what)
- already in hand (skipped)
- needs a person: no one tagged, dates you could not read, anything that looks wrong

## Don'ts

- Never record a renewal on a work order.
- Never invent or estimate a date. An issue or expiry date earlier than the one on file is refused as a renewal. When the dates on file are genuinely wrong, or the certificate is already past, `renew_compliance` with `correction: true` records the right dates as a logged correction - only when the certificate or the person confirms them.
- `renew_compliance` is for renewals only. Waiving, fixing details and archiving duplicates go through `update_compliance` and `archive_compliance`, and need a person's yes if you act for one.
