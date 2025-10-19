# Remaining Tasks

## 9. Add Summary Blurb to Plan Page
- Add AI-generated summary before the timeline
- Should provide general feedback and recommendations
- Requires API call to Gemini

## 10. Fix Assistant Timeline Date Matching
- Assistant can read dates and actions but doesn't match them correctly
- Need to update the context passed to ChatbotPanel
- Fix the plan item structure in the context

## 11. Sync CounselorBro Text with Speech
- Currently text appears before speech starts
- Need to delay text display until TTS begins
- Requires state management for speech status

## 12. Fix Dark Mode Colors
- Plan page assistant needs dark mode styling
- CounselorBro page needs dark mode styling
- Background gradient should be darker
- Keep green color instead of changing to yellow

## 13. Add Save Indicators
- Add "Saved" / "Saving..." indicators to:
  - Application page (already has it - verify)
  - Individual colleges page
  - Plan page
- Similar to AutosaveField component
