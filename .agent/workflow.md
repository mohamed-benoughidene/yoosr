Read AGENT.md first. In the extractGenerativeTags action in tags.ts, make this one change:

Before calling the LLM, fetch the predefined labels for the project from the labels table. Pass their names to the LLM prompt as a list, instructing it to ONLY return tags that match names from that list. After getting the response, validate each returned tag against the predefined list and silently discard any that don't match.

Do not touch anything else.