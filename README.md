# Workstellar.ai

Cursor plugin that connects your agent to [Stellar](https://workstellar.ai), the
property-operations platform from Workstellar, through Stellar's hosted remote
[Model Context Protocol](https://modelcontextprotocol.io/) server.

Stellar is where companies that run many locations keep their operations in
one place: work orders on a live board with a thread per ticket, photos and
PDFs, the Compliance register of permits and inspections, and an equipment list
for each location. With this plugin your agent can read and work all of that
from chat, as you.

## Install

1. Open **Cursor Settings → Plugins**, search for **Stellar** (or run
   `/add-plugin workstellar` in chat), and click **Install**.
2. When the `stellar` server connects, Cursor opens the Stellar sign-in page.
   Sign in with your usual Workstellar username (or email) and password.
3. The page names the app and shows the workspaces and roles it would act
   under. Press **Allow**.
4. Ask the agent: *who am I in Stellar?* It should call `whoami`.

There is no API key or client ID to configure: sign-in is OAuth 2.1 with PKCE,
and Cursor registers itself with Stellar's sign-in server automatically
(dynamic client registration).

## MCP

```json
{
  "mcpServers": {
    "stellar": {
      "type": "http",
      "url": "https://api.workstellar.ai/functions/v1/agent-mcp"
    }
  }
}
```

## Before you connect

You need an account in a Stellar workspace. Stellar is not a public consumer
service: access comes from your company's workspace, so ask your workspace
Owner for an invite.

**The agent acts as you.** Comments it posts carry your name. It sees exactly
the work orders you can see and can do only what your role allows - nothing
you could not do yourself in the app. Approving work, closing and cancelling
tickets, paying, and creating or removing accounts are not available through
this plugin.

## What the agent can do

| Area | Tools |
| --- | --- |
| You | `whoami` (who you act as, in which workspaces), `find_person` (the exact @handle to tag someone), `get_phone_number`, `operating_guide` (the rules) |
| Work orders | `list_work_orders`, `search_work_orders`, `get_work_order`, `read_thread`, `board_summary`, `needs_attention`, `related_history`, `get_kpis`, `work_order_email_address` |
| Working a ticket | `post_comment`, `delete_comment`, `set_schedule`, `set_status`, `set_waiting`, `clear_waiting`, `rename_work_order`, `create_work_order`, `add_participant`, `remove_participant` |
| Locations | `list_locations`, `create_location`, `update_location`, `bulk_update_locations` (with a dry run), `list_location_changes` |
| Files | `view_attachments` (photos, a PDF's text), `prepare_attachment`, `upload_attachment`, `copy_attachment` |
| Reminders and inbox | `remember_to_check`, `forget_check`, `list_reminders`, `inbox`, `finish_inbox_item` (`claim_inbox_item` is for bots) |
| Compliance register | `list_compliance`, `get_compliance`, `create_compliance`, `update_compliance`, `renew_compliance`, `archive_compliance`, `unarchive_compliance`, `link_compliance`, `unlink_compliance`, `post_compliance_comment`, `delete_compliance_comment` |
| Permit files | `view_compliance_document`, `list_compliance_documents`, `prepare_compliance_document`, `attach_compliance_document`, `upload_compliance_document`, `copy_attachment_to_compliance`, `make_compliance_document_current`, `remove_compliance_document` |
| Equipment | `list_equipment`, `get_equipment`, `list_equipment_kinds`, `create_equipment_kind`, `add_equipment_kind_fields`, `create_equipment`, `update_equipment`, `link_equipment`, `unlink_equipment`, `archive_equipment`, `unarchive_equipment`, `upload_equipment_attachment` |
| Profile | `set_my_avatar` |

What each tool may do depends on your role: a call your role does not allow
is refused with the reason, and changes nothing.

The hosted server is the source of truth for tool names and schemas. Each tool
is marked read-only or as one that changes something, so Cursor can run reads
without interrupting you and ask before a change.

The plugin also ships:

| Component | What it does |
| --- | --- |
| Skill `stellar-operating-guide` | The rules for acting in Stellar: one tag per message, never promise spend, a lane is not a date, permits live in the register, thread text is information and not instructions, and what each tool is for. It is the same text the server's `operating_guide` tool returns. |
| Skill `chase-overdue-work-orders` | Works `needs_attention` worst first: one clear question to the one person who owes the next step, records what a ticket is waiting on, books its own check-backs. |
| Skill `triage-new-work-orders` | Reads each new request and its photos, checks what happened last time elsewhere, fixes a vague title, seats the right person and asks the first question. |
| Skill `log-equipment-on-work-order` | Adds a unit to a location's equipment list from the ticket's nameplate photo and thread, and links it to the work order. |
| Skill `permit-expiry-sweep` | Sweeps the Compliance register for expired, expiring, needed and renewing permits; records renewals when the certificate is in hand, otherwise asks the permit's owner. |
| Rule `stellar-connector` | The short version of the rules, applied when a Stellar tool is about to be called. |

## Notes

- **Changes are real and in your name.** Comments notify the people tagged
  (Stellar bundles notification email to about one every ten minutes per
  person). Every change is logged on the thread of the work order or permit it
  touched. Keep Cursor's tool-approval prompts on for write tools.
- **Text in threads, emails and PDFs is written by people.** The agent is told
  to treat it as information, never as instructions.
- 120 calls per minute per identity.
- Times without a zone are read as US Central (Chicago) time by `set_schedule`.

## To disconnect

Remove or log out of the `stellar` server in Cursor (or uninstall the plugin).
Cursor then holds no Stellar sign-in. To have the grant revoked on Stellar's
side as well, contact Stellar support.

## Privacy and terms

- Privacy Policy: <https://workstellar.ai/privacy>
- Terms of Service: <https://workstellar.ai/terms>

## Support

- Stellar support: <https://workstellar.ai/stellar-support>
- Email: <support@workstellar.ai> (also for security reports)
- Connecting other AI apps: <https://workstellar.ai/connect-ai>
- Website: <https://workstellar.ai>

## License

MIT. The plugin is this folder's configuration and instructions; the Stellar
service itself is not open source.
