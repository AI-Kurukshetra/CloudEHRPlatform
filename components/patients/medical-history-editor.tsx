"use client";

import { useEffect, useState } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND
} from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import {
  $createParagraphNode,
  $getRoot,
  FORMAT_TEXT_COMMAND,
  LexicalEditor
} from "lexical";

function HistoryToolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap gap-2 border-b border-[color:var(--border)] bg-white/80 px-3 py-2">
      <button className="secondary" type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>Bold</button>
      <button className="secondary" type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>Italic</button>
      <button className="secondary" type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>Underline</button>
      <button className="secondary" type="button" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>Bullets</button>
      <button className="secondary" type="button" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>Numbers</button>
      <button className="secondary" type="button" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}>Plain text</button>
    </div>
  );
}

function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (!html.trim()) {
        root.append($createParagraphNode());
        return;
      }

      const parser = new DOMParser();
      const document = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, document);
      root.append(...nodes);
    });
  }, [editor, html]);

  return null;
}

export function MedicalHistoryEditor({
  patientId,
  initialHtml,
  canEdit
}: {
  patientId: string;
  initialHtml: string;
  canEdit: boolean;
}) {
  const [draftHtml, setDraftHtml] = useState(initialHtml);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!canEdit) {
    return initialHtml.trim() ? (
      <div className="medical-history-content" dangerouslySetInnerHTML={{ __html: initialHtml }} />
    ) : (
      <p className="text-sm text-ink/65">No past medical history has been documented yet.</p>
    );
  }

  const initialConfig = {
    namespace: `medical-history-${patientId}`,
    editable: true,
    onError(error: Error) {
      throw error;
    },
    nodes: [ListNode, ListItemNode],
    theme: {
      paragraph: "mb-3",
      text: {
        bold: "font-semibold",
        italic: "italic",
        underline: "underline"
      },
      list: {
        ul: "list-disc pl-5",
        ol: "list-decimal pl-5",
        listitem: "mb-1"
      }
    }
  };

  async function saveHistory() {
    setSaving(true);
    setStatus(null);

    const response = await fetch(`/api/patients/${patientId}/medical-history`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({ pastMedicalHistory: draftHtml })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setStatus(payload.error ?? "Unable to save medical history.");
      setSaving(false);
      return;
    }

    setStatus("Saved medical history.");
    setSaving(false);
  }

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-[color:var(--border)] bg-white/65">
      <LexicalComposer initialConfig={initialConfig}>
        <HistoryToolbar />
        <div className="p-4">
          <RichTextPlugin
            contentEditable={<ContentEditable className="medical-history-editor min-h-[220px] rounded-[1rem] border border-[color:var(--border)] bg-white px-4 py-3 outline-none" />}
            placeholder={<div className="pointer-events-none px-4 py-3 text-sm text-ink/40">Document surgeries, chronic conditions, fractures, allergies, and long-term medications.</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <InitialHtmlPlugin html={initialHtml} />
          <OnChangePlugin onChange={(editorState: { read: (callback: () => void) => void }, editor: LexicalEditor) => {
            editorState.read(() => {
              setDraftHtml($generateHtmlFromNodes(editor, null));
            });
          }} />
        </div>
      </LexicalComposer>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] px-4 py-3 text-sm text-ink/65">
        <span>{status ?? "Changes are saved explicitly to keep chart edits intentional."}</span>
        <button type="button" onClick={saveHistory} disabled={saving}>{saving ? "Saving..." : "Save history"}</button>
      </div>
    </div>
  );
}


