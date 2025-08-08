import { useState, useEffect } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from '@/components/ui/scrollArea';
import { Plus, Edit, Trash2, Database } from 'lucide-react';
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
        description: "Failed to load variables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariable = async () => {
    try {
      if (!formData.name.trim() || !formData.value.trim()) {
        toast({
          title: "Validation Error",
          description: "Both name and value are required",
          variant: "destructive",
        });
        return;
      }

      const existingVariable = await variablesDB.getVariableByName(formData.name);
      if (existingVariable) {
        toast({
          title: "Error",
          description: "A variable with this name already exists",
          variant: "destructive",
        });
        return;
      }

      await variablesDB.addVariable({
        name: formData.name.trim(),
        value: formData.value.trim(),
      });

      toast({
        title: "Success",
        description: "Variable added successfully",
        variant: "success",
      });

      setFormData({ name: '', value: '' });
      setIsAddDialogOpen(false);
      loadVariables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add variable",
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
          description: "Both name and value are required",
          variant: "destructive",
        });
        return;
      }

      const existingVariable = await variablesDB.getVariableByName(formData.name);
      if (existingVariable && existingVariable.id !== selectedVariable.id) {
        toast({
          title: "Error",
          description: "A variable with this name already exists",
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
        description: "Variable updated successfully",
        variant: "success",
      });

      setFormData({ name: '', value: '' });
      setSelectedVariable(null);
      setIsEditDialogOpen(false);
      loadVariables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update variable",
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
        description: "Variable deleted successfully",
        variant: "success",
      });

      setSelectedVariable(null);
      setIsDeleteDialogOpen(false);
      loadVariables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete variable",
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variables</h1>
          <p className="text-muted-foreground">
            Manage your test variables for automatic replacement in Cypress converters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add New Variable"
      >
        <div className="space-y-4">
          <p className="text-md text-muted-foreground">
            Create a new variable that will be automatically replaced in your Cypress converters.
          </p>
          <div>
            <Label htmlFor="name">Variable Name</Label>
            <Input
              className="bg-gray-200/90 dark:bg-gray-950/60"
              id="name"
              placeholder="e.g., login-input"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="value">Variable Value</Label>
            <Input
              className="bg-gray-200/90 dark:bg-gray-950/60"
              id="value"
              placeholder="e.g., input[data-testid=login-input]"
              value={formData.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="default" className="h-10 border-none" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="default" className="h-10" onClick={handleAddVariable}>Add Variable</Button>
          </div>
        </div>
      </Dialog>

      <Card className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-gray-300/50 dark:border-gray-700/30 rounded-xs shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Stored Variables
          </CardTitle>
          <CardDescription>
            Variables are automatically replaced in Cypress converters. Use the variable name in your tests and it will be replaced with the corresponding value.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {variables.map((variable) => (
                  <Card
                    key={variable.id}
                    className="p-4 bg-gray-100 dark:bg-gray-700 border-gray-300/50 dark:border-gray-700/30 rounded-xs"
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
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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
            <Button size="default" className="h-10 border-none" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
            <Button size="default" className="h-10 border-none" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
