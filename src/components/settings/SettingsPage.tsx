import { RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNotebookStore } from "@/store/notebook";
import { useSettingsStore } from "@/store/settings";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "../ui/button";
import { useDbStore } from "@/store/db";

export function SettingsPage() {
	const resetting = useDbStore((state) => state.resetting);
	const reset = useDbStore((state) => state.reset);
	const status = useDbStore((state) => state.status);
	const markdownEnabled = useSettingsStore((state) => state.markdownEnabled);
	const setMarkdownEnabled = useSettingsStore(
		(state) => state.setMarkdownEnabled,
	);

	const handleMarkdownChange = (enabled: boolean) => {
		setMarkdownEnabled(enabled);

		if (!enabled) {
			const notebook = useNotebookStore.getState();
			const active = notebook.cells.find(
				(cell) => cell.id === notebook.activeCellId,
			);
			if (active?.type === "markdown") {
				const firstSql = notebook.cells.find((cell) => cell.type === "sql");
				if (firstSql) notebook.setActiveCell(firstSql.id);
			}
		}

		toast.success(enabled ? "Markdown cells enabled" : "Markdown cells disabled");
	};

	const handleReset = () => {
		void reset()
			.then(() => {
				useNotebookStore.getState().clearRuns();
				toast.success("Database reset successfully.");
			})
			.catch((resetError: unknown) => {
				toast.error(
					resetError instanceof Error ?
						resetError.message
					:	"Failed to reset database",
				);
			});
	};

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
			<div className="mb-6">
				<h1 className="font-heading text-[22px] font-semibold tracking-tight">
					Settings
				</h1>
				<p className="mt-1 text-[11px] text-muted-foreground/75">
					Preferences are saved in this browser.
				</p>
			</div>

			<section className="rounded-xl border border-border/60 bg-card/50">
				<div className="border-b border-border/50 px-4 py-2.5">
					<h2 className="font-heading text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
						Notebook
					</h2>
				</div>

				<div className="flex flex-col divide-y">
					<div className="flex items-start justify-between gap-4 p-4">
						<div className="flex min-w-0 gap-3">
							<div className="min-w-0">
								<label
									htmlFor="markdown-cells"
									className="cursor-pointer text-[12px] font-medium"
								>
									Enable markdown cells
								</label>
								<p className="mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
									Show markdown notes, the Markdown add button, and cell conversion.
									Existing notes are kept and hidden while this is off.
								</p>
							</div>
						</div>

						<Switch
							id="markdown-cells"
							checked={markdownEnabled}
							onCheckedChange={handleMarkdownChange}
							aria-label="Enable markdown cells"
							className="mt-0.5"
						/>
					</div>
					<div className="flex items-start justify-between gap-4 p-4">
            <div className="flex min-w-0 gap-3">
							<div className="min-w-0">
								<label
									htmlFor="reset-database"
									className="cursor-pointer text-[12px] font-medium"
								>
									Reset database
                </label>
                <p className="mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
                  Every table is dropped and recreated with the original data. Any
                  changes you made to the database will be lost. Your notebook queries are kept.
                </p>
              </div>
            </div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
                  id="reset-database"
									variant="outline"
									size="sm"
									className="justify-start gap-1.5 text-[10.5px] text-muted-foreground hover:text-destructive"
									disabled={resetting || status !== "ready"}
								>
									{resetting ?
										<Spinner className="size-3" />
									:	<RotateCcw className="size-3" />}
                  Reset database
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle className="text-destructive font-medium">Reset the database?</AlertDialogTitle>
									<AlertDialogDescription>
										Every table is dropped and recreated with the original seed data. Any
										changes you made to the database will be lost. Your notebook queries
										are kept.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction variant="destructive" onClick={handleReset}>
										Reset database
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</section>

		</div>
	);
}
