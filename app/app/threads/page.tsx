"use client";

import { ThreadsScreen } from "@/components/console/threads/ThreadsScreen";

// The Threads (history) route. A client screen: it consumes the shared relay store
// and renders the two pane history view. The app shell provides the surrounding chrome.
export default function ThreadsPage() {
  return <ThreadsScreen />;
}
