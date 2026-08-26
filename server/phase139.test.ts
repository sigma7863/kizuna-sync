import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("phase 139 operation feedback", () => {
  it("closes the family creation dialog only after a successful mutation", () => {
    expect(homeSource).toContain("const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);");
    expect(homeSource).toContain("setIsCreateDialogOpen(false);");
    expect(homeSource).toContain("<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>");
    expect(homeSource).toContain("await refetchFamilyGroups();");
  });

  it("blocks dismissal and clearly reports progress while a family is being deleted", () => {
    expect(homeSource).toContain("deleteFamilyMutation.isPending && (");
    expect(homeSource).toContain("家族データを削除しています…このままお待ちください。");
    expect(homeSource).toContain("onEscapeKeyDown");
    expect(homeSource).toContain("onPointerDownOutside");
    expect(homeSource).toContain("animate-spin");
  });
});
