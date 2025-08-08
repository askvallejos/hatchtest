import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Edit, Trash2, Database, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { variablesDB, Variable } from '@/lib/variablesDB';

const Variables = () => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [addRows, setAddRows] = useState<Array<{ name: string; value: string }>>([
    { name: '', value: '' },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [exportJsonText, setExportJsonText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const { toast } = useToast();

  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    try {
      setLoading(true);
      const vars = await variablesDB.getAllVariables();
      setVariables(vars);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load variables.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariable = async () => {
    try {
      const trimmedRows = addRows.map((row) => ({
        name: row.name.trim(),
        value: row.value.trim(),
      }));

      const allFilled = trimmedRows.every((r) => r.name && r.value);
      if (!allFilled) {
        toast({
          title: "Validation Error",
          description: "Please provide both name and value for all fields.",
          variant: "destructive",
        });
        return;
      }

      const nameCounts = new Map<string, number>();
      for (const r of trimmedRows) {
        nameCounts.set(r.name, (nameCounts.get(r.name) ?? 0) + 1);
      }
      const duplicateNames = Array.from(nameCounts.entries())
        .filter(([, count]) => count > 1)
        .map(([name]) => name);

      if (duplicateNames.length > 0) {
        toast({
          title: "Duplicate Names",
          description: `These names are duplicated in your entries: ${duplicateNames.join(', ')}.`,
          variant: "destructive",
        });
        return;
      }

      const existing = await variablesDB.getAllVariables();
      const existingNames = new Set(existing.map((v) => v.name));
      const alreadyExists = trimmedRows
        .filter((r) => existingNames.has(r.name))
        .map((r) => r.name);

      if (alreadyExists.length > 0) {
        toast({
          title: "Already Exists",
          description: `Variables with these names already exist: ${alreadyExists.join(', ')}.`,
          variant: "destructive",
        });
        return;
      }

      await Promise.all(
        trimmedRows.map((r) =>
          variablesDB.addVariable({
            name: r.name,
            value: r.value,
          })
        )
      );

      const count = trimmedRows.length;
      toast({
        title: "Success",
        description: `${count} ${count === 1 ? 'variable' : 'variables'} added successfully.`,
        variant: "success",
      });

      setAddRows([{ name: '', value: '' }]);
      setIsAddDialogOpen(false);
      loadVariables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add variables.",
        variant: "destructive",
      });
    }
  };

  const handleEditVariable = async () => {
    if (!selectedVariable) return;

    try {
      if (!formData.name.trim() || !formData.value.trim()) {
        toast({
          title: "Validation Error",
          description: "Both name and value are required.",
          variant: "destructive",
        });
        return;
      }

      const existingVariable = await variablesDB.getVariableByName(formData.name);
      if (existingVariable && existingVariable.id !== selectedVariable.id) {
        toast({
          title: "Error",
          description: "A variable with this name already exists.",
          variant: "destructive",
        });
        return;
      }

      await variablesDB.updateVariable(selectedVariable.id, {
        name: formData.name.trim(),
        value: formData.value.trim(),
      });

      toast({
        title: "Success",
        description: "Variable updated successfully.",
        variant: "success",
      });

      setFormData({ name: '', value: '' });
      setSelectedVariable(null);
      setIsEditDialogOpen(false);
      loadVariables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update variable.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVariable = async () => {
    if (!selectedVariable) return;

    try {
      await variablesDB.deleteVariable(selectedVariable.id);

      toast({
        title: "Success",
        description: "Variable deleted successfully.",
        variant: "success",
      });

      setSelectedVariable(null);
      setIsDeleteDialogOpen(false);
      loadVariables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete variable.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (variable: Variable) => {
    setSelectedVariable(variable);
    setFormData({ name: variable.name, value: variable.value });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (variable: Variable) => {
    setSelectedVariable(variable);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  const addCount = addRows.length;
  const addButtonLabel = `Add ${addCount} ${addCount === 1 ? 'Variable' : 'Variables'}`;
  const addDisabled = addRows.some((r) => !r.name.trim() || !r.value.trim());
  const lastRow = addRows[addRows.length - 1];
  const canAddAnother = Boolean(lastRow?.name?.trim()) && Boolean(lastRow?.value?.trim());

  const handleExportJson = () => {
    try {
      const payload = variables.map((v) => ({
        variable_name: v.name,
        variable_value: v.value,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `variables-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exported',
        description: `Exported ${payload.length} ${payload.length === 1 ? 'variable' : 'variables'}.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to export variables.',
        variant: 'destructive',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON: expected an array of objects.');
      }

      const normalized = data.map((item: any) => {
        const name = typeof item?.variable_name === 'string' ? item.variable_name.trim() : '';
        const value = typeof item?.variable_value === 'string' ? item.variable_value.trim() : '';
        return { name, value };
      });

      if (normalized.some((n) => !n.name || !n.value)) {
        throw new Error('Each item must have non-empty "variable_name" and "variable_value".');
      }

      const nameCounts = new Map<string, number>();
      normalized.forEach((n) => nameCounts.set(n.name, (nameCounts.get(n.name) ?? 0) + 1));
      const dupInFile = Array.from(nameCounts.entries())
        .filter(([, c]) => c > 1)
        .map(([n]) => n);
      if (dupInFile.length > 0) {
        throw new Error(`Duplicate names in file: ${dupInFile.join(', ')}`);
      }

      const existing = await variablesDB.getAllVariables();
      const existingByName = new Map(existing.map((v) => [v.name, v] as const));

      let added = 0;
      let updated = 0;

      for (const n of normalized) {
        const existingVar = existingByName.get(n.name);
        if (existingVar) {
          await variablesDB.updateVariable(existingVar.id, { value: n.value });
          updated += 1;
        } else {
          await variablesDB.addVariable({ name: n.name, value: n.value });
          added += 1;
        }
      }

      toast({
        title: 'Import complete',
        description: `${added} added, ${updated} updated.`,
        variant: 'success',
      });

      loadVariables();
      setIsImportDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Import failed',
        description: err?.message ?? 'Could not import JSON.',
        variant: 'destructive',
      });
    }
  };

  const handleImportFromText = async () => {
    if (!importJsonText.trim()) {
      toast({
        title: 'No JSON provided',
        description: 'Paste JSON into the input box or upload a file.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const data = JSON.parse(importJsonText);
      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON: expected an array of objects.');
      }

      const normalized = data.map((item: any) => {
        const name = typeof item?.variable_name === 'string' ? item.variable_name.trim() : '';
        const value = typeof item?.variable_value === 'string' ? item.variable_value.trim() : '';
        return { name, value };
      });

      if (normalized.some((n) => !n.name || !n.value)) {
        throw new Error('Each item must have non-empty "variable_name" and "variable_value".');
      }

      const nameCounts = new Map<string, number>();
      normalized.forEach((n) => nameCounts.set(n.name, (nameCounts.get(n.name) ?? 0) + 1));
      const dupInFile = Array.from(nameCounts.entries())
        .filter(([, c]) => c > 1)
        .map(([n]) => n);
      if (dupInFile.length > 0) {
        throw new Error(`Duplicate names in input: ${dupInFile.join(', ')}`);
      }

      const existing = await variablesDB.getAllVariables();
      const existingByName = new Map(existing.map((v) => [v.name, v] as const));

      let added = 0;
      let updated = 0;

      for (const n of normalized) {
        const existingVar = existingByName.get(n.name);
        if (existingVar) {
          await variablesDB.updateVariable(existingVar.id, { value: n.value });
          updated += 1;
        } else {
          await variablesDB.addVariable({ name: n.name, value: n.value });
          added += 1;
        }
      }

      toast({
        title: 'Import complete',
        description: `${added} added, ${updated} updated.`,
        variant: 'success',
      });

      setIsImportDialogOpen(false);
      setImportJsonText('');
      loadVariables();
    } catch (err: any) {
      toast({
        title: 'Import failed',
        description: err?.message ?? 'Could not import JSON.',
        variant: 'destructive',
      });
    }
  };

  const openExportDialog = () => {
    const payload = variables.map((v) => ({
      variable_name: v.name,
      variable_value: v.value,
    }));
    setExportJsonText(JSON.stringify(payload, null, 2));
    setIsExportDialogOpen(true);
  };

  // Derived data for search + pagination
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredVariables = variables.filter((v) => {
    if (!normalizedQuery) return true;
    return (
      v.name.toLowerCase().includes(normalizedQuery) ||
      v.value.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredVariables.length / pageSize));
  const clampedCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedVariables = filteredVariables.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="p-4 space-y-6 min-h-screen flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variables</h1>
          <p className="text-muted-foreground">
            Manage your test variables for automatic replacement in Cypress converters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
            onClick={() => { setImportJsonText(''); setIsImportDialogOpen(true); }}
            title="Import variables from JSON"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
            onClick={openExportDialog}
            title="Export variables to JSON"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => { setAddRows([{ name: '', value: '' }]); setIsAddDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variable(s)
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add New Variable(s)"
      >
        <div className="space-y-4">
          <p className="text-md text-muted-foreground">
            Create one or more variables. Use the plus icon to add another field.
          </p>

          <div className="space-y-3">
            {addRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${idx}`}>Variable Name</Label>
                  <Input
                    className="bg-gray-200/90 dark:bg-gray-950/60"
                    id={`name-${idx}`}
                    placeholder="e.g., login-input"
                    value={row.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...addRows];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setAddRows(next);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor={`value-${idx}`}>Variable Value</Label>
                  <Input
                    className="bg-gray-200/90 dark:bg-gray-950/60"
                    id={`value-${idx}`}
                    placeholder="e.g., input[data-testid=login-input]"
                    value={row.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...addRows];
                      next[idx] = { ...next[idx], value: e.target.value };
                      setAddRows(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
              onClick={() => setAddRows((rows) => [...rows, { name: '', value: '' }])}
              disabled={!canAddAnother}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add another field
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="default" className="h-10 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="default" className="h-10" onClick={handleAddVariable} disabled={addDisabled}>
              {addButtonLabel}
            </Button>
          </div>
        </div>
      </Dialog>

      <Card className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-none rounded-xs shadow-2xl flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Stored Variables</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search by name or value..."
                className="w-72 bg-gray-200/90 dark:bg-gray-950/60"
              />
            </div>
          </div>
          <CardDescription>
            Variables are automatically replaced in Cypress converters. Use the variable name in your tests and it will be replaced with the corresponding value.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto mt-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading variables...</div>
            </div>
          ) : variables.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No variables found</h3>
              <p className="text-muted-foreground">
                Create your first variable to get started with automatic replacements.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedVariables.map((variable) => (
                  <div
                    key={variable.id}
                    className="p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300/50 dark:border-gray-700/30 rounded-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-xs">
                            {variable.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            →
                          </span>
                          <code className="text-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300/50 dark:border-gray-600/50 px-2 py-1 rounded-xs">
                            {variable.value}
                          </code>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Created: {formatDate(variable.createdAt)} • Updated: {formatDate(variable.updatedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(variable)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(variable)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredVariables.length === 0 ? 0 : startIndex + 1}
                  -{Math.min(endIndex, filteredVariables.length)} of {filteredVariables.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
                    disabled={clampedCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {clampedCurrentPage} of {totalPages}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
                    disabled={clampedCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        title="Import Variables"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-md text-muted-foreground">Upload a JSON file in the required structure.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
              onClick={handleImportClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload JSON file
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-json" className='text-muted-foreground'>Or paste JSON manually</Label>
            <Textarea
              id="manual-json"
              placeholder='[
  { "variable_name": "login-input", "variable_value": "input[data-testid=login-input]" }
]'
              className="bg-gray-200/90 dark:bg-gray-950/60 min-h-[200px]"
              value={importJsonText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportJsonText(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="default" className="h-10 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="default" className="h-10" onClick={handleImportFromText}>Import</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        title="Export Variables"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-md text-muted-foreground">Download the variables as a JSON file.</p>
            <Button
              type="button"
              variant="outline"
              className="bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none"
              onClick={handleExportJson}
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON file
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-json" className='text-muted-foreground'>Or copy JSON below</Label>
            <Textarea
              id="export-json"
              className="bg-gray-200/90 dark:bg-gray-950/60 min-h-[200px]"
              value={exportJsonText}
              readOnly
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="default" className="h-10 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Variable"
      >
        <div className="space-y-4">
          <p className="text-md text-muted-foreground">Update the variable name and value.</p>
          <div>
            <Label htmlFor="edit-name">Variable Name</Label>
            <Input
              className="bg-gray-200/90 dark:bg-gray-950/60"
              id="edit-name"
              placeholder="e.g., login-input"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-value">Variable Value</Label>
            <Input
              className="bg-gray-200/90 dark:bg-gray-950/60"
              id="edit-value"
              placeholder="e.g., input[data-testid=login-input]"
              value={formData.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="default" className="h-10 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="default" className="h-10" onClick={handleEditVariable}>Update Variable</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Variable"
      >
        <div className="space-y-4">
          <p className="text-md text-muted-foreground">
            Are you sure you want to delete the variable "{selectedVariable?.name}"? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="default" className="h-10 bg-gray-200/90 dark:bg-gray-950/60 hover:bg-gray-300/70 dark:hover:opacity-80 border-none" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="default" className="h-10" variant="destructive" onClick={handleDeleteVariable}>
              Delete Variable
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Variables;
