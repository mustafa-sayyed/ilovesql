import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, formatNumber, pluralize } from "@/lib/format";
import { useDbStore } from "@/store/db";
import { getNotebookCount, useNotebookStore } from "@/store/notebook";
import { useSettingsStore } from "@/store/settings";

const IS_MAC =
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad/.test(navigator.userAgent);

export function StatusBar({
	view = "notebook",
}: {
	view?: "notebook" | "notebooks" | "settings";
}) {
	const status = useDbStore((state) => state.status);
	const schema = useDbStore((state) => state.schema);
	const isLeader = useDbStore((state) => state.isLeader);
	const error = useDbStore((state) => state.error);
	const sqlCells = useNotebookStore(
		(state) => state.cells.filter((cell) => cell.type === "sql").length,
	);
	const notebookCount = useNotebookStore(getNotebookCount);
	const markdownEnabled = useSettingsStore((state) => state.markdownEnabled);

	const label =
		status === "ready" ? "Postgres ready"
		: status === "error" ? "Database error"
		: status === "booting" ? "Starting Postgres"
		: "Idle";

	return (
		<footer className="flex h-7 shrink-0 items-center gap-2.5 border-t border-border/60 bg-background/85 px-3 font-mono text-[9.5px] text-muted-foreground/80">
			<span className="flex items-center gap-1.5" title={error ?? undefined}>
				<span
					className={cn(
						"size-1.5 rounded-full",
						status === "ready" ? "bg-success"
						: status === "error" ? "bg-destructive"
						: "animate-pulse bg-warning",
					)}
				/>
				{label}
			</span>

			<span className="hidden text-muted-foreground/25 sm:inline">|</span>
			<span className="hidden items-center gap-1 sm:flex">
				<Database className="size-2.5" />
				{schema ? `${formatNumber(schema.tables.length)} relations` : "—"}
				<span className="text-muted-foreground/25">●</span>
				{schema ? formatBytes(schema.databaseSize) : "—"}
			</span>

			{status === "ready" && !isLeader ?
				<span
					className="rounded-sm bg-warning/10 px-1.5 py-0.5 text-[8.5px] text-warning"
					title="This tab is not the database leader; queries are proxied to the leader tab."
				>
					follower tab
				</span>
			:	null}

			<span className="ml-auto">
				{view === "notebooks" ?
					`${notebookCount} ${pluralize(notebookCount, "notebook")}`
				: view === "settings" ?
					`Markdown cells ${markdownEnabled ? "on" : "off"}`
				:	`${sqlCells} SQL cells`}
			</span>

			{view === "notebook" ?
				<span className="hidden items-center gap-2 text-muted-foreground/55 lg:flex">
					<span className="text-muted-foreground/25">|</span>
					<span>{IS_MAC ? "Cmd" : "Ctrl"} K commands</span>
					<span className="text-muted-foreground/25">|</span>
					<span>Shift Enter run</span>
				</span>
			:	null}
		</footer>
	);
}
