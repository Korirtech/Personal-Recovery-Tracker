# RecoveryLog Accessibility QA Runbook

RecoveryLog’s source-level accessibility review is complete: interactive controls use semantic elements, labels are attached to inputs, custom check-in choices use radio semantics, visible focus utilities are present, charts have accessible names, and reduced-motion handling is defined. Responsive reviews were completed at 375px, 768px, 1024px, and 1440px.

## Post-publish live keyboard pass

Perform this quick manual pass in a production browser after publishing. It is intentionally kept as a live-browser QA step because the managed preview capture does not provide keyboard-event automation.

| Flow | Keyboard action | Expected outcome |
| --- | --- | --- |
| Landing page | Press `Tab` from the address bar through the header and hero. | Every link and button receives a visible focus indicator; `Enter` activates the focused destination. |
| Sign-in and dashboard | Use `Tab` and `Shift+Tab` to move through navigation and the dashboard CTA. | Focus order follows the visual reading order and does not become trapped. |
| Daily check-in | Use `Tab` to reach each response, `Space` or `Enter` to select it, then continue. | The selected response is visibly announced through its selected state; back and continue remain reachable. |
| Profile | Tab through name, timezone, reminder controls, save, and deletion action. | Labels are understandable, switch and time inputs are operable, and destructive deletion requires confirmation. |
| History and analytics | Tab through date selection, entry actions, and empty-state links or buttons. | No invisible focus, horizontal trap, or inaccessible control appears. |
| AI insights | Tab through generate or refresh controls when Pro access and sufficient data exist. | The safety disclaimer remains readable and the control communicates pending/disabled state. |

Record the browser, viewport, date, outcome, and any defects in `VALIDATION.md` after the pass. A failed focus-order, contrast, or control-operability check should block a production rollout until corrected.
