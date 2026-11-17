---
name: triage-new-work-orders
description: Triage the new work orders in Stellar - read each request, look at its photos, check what happened last time elsewhere, give it a clear title, seat the right person and ask the first question. Use when asked to "triage", "go through the new tickets", or "sort out what came in".
---

# Triage new work orders

A new work order is only a request. Triage turns it into something a technician can act on: a title that says what the job is, the right person on it, and the first question asked.

## 1. Set up

1. `whoami`, then `operating_guide` once.
2. `list_work_orders` with `status: "New"` (add `workspace_id` or `location_code` if the user narrowed it). Work oldest first, so nothing waits longest.

## 2. For each new work order

1. **Read it.** `get_work_order` (location, category, priority, cast), then `read_thread`.
2. **Look at the evidence.** If there are attachments, `view_attachments`. Read nameplates, error codes, model and serial numbers, and the damage itself. A photo is evidence for the question on the ticket, not something to describe at length.
3. **Check history.** `related_history`: the same equipment has often failed at another location. Note how it ended (part, vendor, cost) so the assignee does not start from zero.
4. **Fix the title if it is vague.** If "Freezer issue" is really "Walk-in freezer: condenser fan not spinning", call `rename_work_order`. The old title stays on the thread as history. If you act as a person, ask first.
5. **Get the right person on it.** If the cast has no one who can do the work, `add_participant` with the person the user or the workspace's usual practice names. Do not guess a technician: if you do not know who handles this kind of work at this location, say so in your report.
6. **Ask the first question.** One `post_comment` that tags the one person who owes the next step, with what you found: what the photos show, what happened last time elsewhere, and the one thing you need from them (a visit date, a quote, a part number).
7. **Move it when it is truly tagged.** Once someone who will do the work is seated and asked, `set_status` to `Tagged`. Moving a ticket to Scheduled does not set a date: only use `set_schedule` when a date was actually agreed.

## 3. Things triage cannot change here

Priority and category are set when a work order is opened; there is no tool to change them afterwards. If one is wrong (a leak marked LOW, a plumbing job filed as HVAC), say so in your report so a person can fix it in the app.

## 4. Duplicates

Before asking anything, `search_work_orders` with a few words from the title and the location. If an open work order already covers the same problem at the same location, do not work both: comment on the new one pointing to the existing ticket number and tag the person who opened it, and list both in your report for a person to cancel one (cancelling is done in the app).

## 5. Report back

For each ticket: the new title (if changed), who is on it, what you asked, and anything a person must fix (priority, category, duplicate, nobody to assign).

If you act as a person, show the renames, seats and comments you plan before making them, and get a yes.
