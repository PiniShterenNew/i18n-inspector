export type StructureType =
    | "file-per-locale"
    | "locale-directories";

export interface LocaleRoot {
    path: string;
    structure: StructureType;
    locales: string[];
}