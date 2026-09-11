"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input, Select } from "antd";
import { CheckCircle2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export interface ResourceField {
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
}

export interface ResourceRecord {
  id: string;
  [key: string]: string;
}

interface HmsResourceConsoleProps {
  title: string;
  subtitle: string;
  storageKey: string;
  fields: ResourceField[];
  seedRecords: ResourceRecord[];
  addLabel?: string;
}

export function HmsResourceConsole({
  title,
  subtitle,
  storageKey,
  fields,
  seedRecords,
  addLabel = "Add record",
}: HmsResourceConsoleProps) {
  const [records, setRecords] = useState<ResourceRecord[]>(seedRecords);
  const [query, setQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecords(parsed);
      }
    } catch {
      // Demo data is a safe fallback if storage is unavailable or malformed.
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch {
      // Keep the UI usable even if a browser blocks local storage.
    }
  }, [records, storageKey]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return records;
    return records.filter((record) =>
      fields.some((field) => String(record[field.key] || "").toLowerCase().includes(normalizedQuery)),
    );
  }, [fields, query, records]);

  const openNew = () => {
    setEditingId(null);
    setDraft(Object.fromEntries(fields.map((field) => [field.key, ""])));
    setIsEditorOpen(true);
  };

  const openEdit = (record: ResourceRecord) => {
    setEditingId(record.id);
    setDraft(Object.fromEntries(fields.map((field) => [field.key, record[field.key] || ""])));
    setIsEditorOpen(true);
  };

  const saveRecord = () => {
    if (fields.some((field) => !draft[field.key]?.trim())) return;
    if (editingId) {
      setRecords((current) => current.map((record) => record.id === editingId ? { ...record, ...draft } : record));
    } else {
      setRecords((current) => [{ id: `${storageKey}-${Date.now()}`, ...draft }, ...current]);
    }
    setIsEditorOpen(false);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm("Remove this record? This only changes demo data in this browser.")) {
      setRecords((current) => current.filter((record) => record.id !== id));
    }
  };

  return (
    <HmsAppShell title={title} subtitle={subtitle}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-teal">Architecture resource</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>
            </div>
            <HmsButton variant="primary" onClick={openNew} icon={<Plus className="h-4 w-4" />}>{addLabel}</HmsButton>
          </div>
        </section>

        {isEditorOpen && (
          <section className="rounded-2xl border border-primary-teal/30 bg-primary-light-teal/40 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">{editingId ? `Edit ${title}` : addLabel}</h2>
              <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <label key={field.key} className="min-w-0 text-xs font-semibold text-slate-700">
                  {field.label}
                  {field.options ? (
                    <Select value={draft[field.key] || undefined} onChange={(value) => setDraft((current) => ({ ...current, [field.key]: value }))} options={field.options.map((option) => ({ label: option, value: option }))} placeholder={`Select ${field.label}`} className="mt-1 w-full" />
                  ) : (
                    <Input value={draft[field.key] || ""} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder || field.label} className="mt-1" />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <HmsButton variant="emerald" onClick={saveRecord} icon={<CheckCircle2 className="h-4 w-4" />}>Save</HmsButton>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-700">{filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}</p>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} prefix={<Search className="h-4 w-4 text-slate-400" />} placeholder={`Search ${title.toLowerCase()}`} className="w-full sm:max-w-xs" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
              <thead><tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">{fields.map((field) => <th key={field.key} className="border-y border-slate-200 px-3 py-3 font-semibold first:rounded-l-lg first:border-l last:border-r">{field.label}</th>)}<th className="rounded-r-lg border-y border-r border-slate-200 px-3 py-3">Actions</th></tr></thead>
              <tbody>{filteredRecords.map((record) => <tr key={record.id} className="hover:bg-slate-50/80">{fields.map((field) => <td key={field.key} className="border-b border-slate-100 px-3 py-3 text-slate-700">{record[field.key]}</td>)}<td className="border-b border-slate-100 px-3 py-2"><div className="flex gap-1"><button type="button" onClick={() => openEdit(record)} className="rounded-md p-2 text-primary-teal hover:bg-primary-light-teal" aria-label="Edit record"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteRecord(record.id)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50" aria-label="Remove record"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No matching records found.</p>}
        </section>
      </div>
    </HmsAppShell>
  );
}
