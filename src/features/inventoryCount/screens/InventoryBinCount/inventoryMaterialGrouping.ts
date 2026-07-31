import type { ScannedMaterial } from "../../protocol";

export type InventoryOrganizationMode =
  | "labelId"
  | "lot"
  | "materialCode";

export type InventoryMaterialSection = {
  data: ScannedMaterial[];
  expanded: boolean;
  itemCount: number;
  key: string;
  kind: InventoryOrganizationMode;
  title: string;
  totalQuantity: number;
};

export function buildInventoryMaterialSections(
  materials: ScannedMaterial[],
  mode: InventoryOrganizationMode,
  expandedGroupKeys: ReadonlySet<string>,
): InventoryMaterialSection[] {
  if (mode === "labelId") {
    return materials.length === 0
      ? []
      : [
          {
            data: materials,
            expanded: true,
            itemCount: materials.length,
            key: "labelId",
            kind: mode,
            title: "",
            totalQuantity: sumQuantity(materials),
          },
        ];
  }

  const groupedMaterials = new Map<string, ScannedMaterial[]>();
  for (const material of materials) {
    const value = mode === "lot" ? material.lot : material.materialCode;
    const group = groupedMaterials.get(value);
    if (group) {
      group.push(material);
    } else {
      groupedMaterials.set(value, [material]);
    }
  }

  return Array.from(groupedMaterials, ([title, group]) => {
    const key = getInventoryMaterialGroupKey(mode, title);
    const expanded = expandedGroupKeys.has(key);

    return {
      data: expanded ? group : [],
      expanded,
      itemCount: group.length,
      key,
      kind: mode,
      title,
      totalQuantity: sumQuantity(group),
    };
  });
}

export function getInventoryMaterialGroupKey(
  mode: Exclude<InventoryOrganizationMode, "labelId">,
  value: string,
) {
  return `${mode}:${value}`;
}

function sumQuantity(materials: ScannedMaterial[]) {
  return materials.reduce((total, material) => total + material.quantity, 0);
}
