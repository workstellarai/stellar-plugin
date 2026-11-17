---
name: log-equipment-on-work-order
description: Add a unit (an ice machine, walk-in, HVAC unit, fryer...) to a location's equipment list in Stellar from what a work order shows or what the person tells you - model, serial, install date, installer - and link it to that work order. Use when a thread or photo identifies equipment that is not on the equipment list yet, or when asked to "log", "add" or "register" equipment.
---

# Log equipment on a work order

The equipment list is only useful if it is right. Take every value from the ticket's own evidence (the nameplate photo, an invoice, what a technician wrote) or from what the person you act for tells you ("installed by the contractor on Mar 3, 2026"), never from a guess. A value the person gives you is as good as one on the ticket: record it.

## 1. Read the ticket

1. `whoami`, then `get_work_order` for the ticket. Note its location code and whether a unit is already linked.
2. `read_thread`: find what people said about the unit - install date, installer, warranty, invoice numbers. Add what the person asking you has said in the conversation.
3. `view_attachments` on the nameplate or tag photo (name the file if you know it). Read the make, model and serial exactly as printed. If a value is not legible, leave it out and say so.

## 2. Pick the kind

`list_equipment_kinds` for the workspace (if you belong to several workspaces, pass that workspace's `workspace_id` from `whoami`: each workspace keeps its own kinds and fields). Use an existing kind whose name matches the unit (for example "Ice Machine"). Look at that kind's fields: those are the specs you may fill in. Never file a unit under a near miss. When nothing genuinely fits (a router, a TV, a satellite kit), create the kind with `create_equipment_kind`, bringing its spec fields in the same call; if you act as a person, confirm the kind and its fields with them first. An answer with `created: false` means the kind already existed and the fields you sent were not applied: use its own fields.

## 3. Check it is not already there

`list_equipment` with the location code and the serial number as `q`. Also search by model if there is no serial. If the unit exists:
- and is not linked to this ticket: `link_equipment` with the ticket and the unit, then stop.
- and some details are missing or wrong: `update_equipment` with only the fields the ticket or the person supports. Do not overwrite the unit's notes if people already wrote some; say it on the thread instead. A unit never moves between locations.

## 4. Create and link it

`create_equipment` with:
- `ticket`: the work order. The unit is placed at the ticket's location and linked to it in the same call.
- `kind`: the kind from step 2.
- `label`: what people at the location call it, short and unique at that location ("Bag ice maker", "Walk-in #2").
- `make`, `model`, `serial_no`: exactly as printed.
- `install_date`: `YYYY-MM-DD`, when a document, the thread or the person states the day. Never a guess, never in the future.
- `warranty_expires_at`: `YYYY-MM-DD`, when a document or the person states a real end date. "It's under warranty" is not a date; leave it out.
- `notes`: facts with no field of their own, such as who installed it and their invoice number - whether the ticket says so or the person told you (unless the kind has a field for it, such as `installed_by`; then use the field).
- `specs`: only keys the kind defines, typed as the kind says.

Check the result says `linked: true` (and `linked_work_order` is your ticket). If it says `linked: false`, the unit was still created: report the `link_error` and try `link_equipment` once the cause is fixed. A not-found that names a location code or a label means that argument was wrong, not the ticket.

## 5. Don't announce it twice

Linking writes its own history line on the work order, so no comment is needed. Tell the user what you created (label, kind, model, serial, install date) and anything you left out and why.

If you act as a person, show them the values before you create the unit and get a yes.
