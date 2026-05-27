// A single conversation view. We delegate to MessagesPage so the inbox
// stays a 2-column split — the route param simply pre-selects which
// thread is active when a user lands here from a notification or
// deep-link. Routing-wise this is mounted at `/messages/:conversationId`.

import MessagesPage from './MessagesPage'

export default function ConversationPage() {
  return <MessagesPage />
}
