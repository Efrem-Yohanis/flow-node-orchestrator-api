import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  CalendarIcon, 
  Plus, 
  ListTodo, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight,
  Pencil,
  Trash2
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  name: string;
  scheduledDate: Date;
  status: "new" | "completed";
}

interface DateGroup {
  date: Date;
  tasks: Task[];
  isOpen: boolean;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  
  // Edit state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>();
  
  // Delete confirmation state
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    if (!taskName.trim() || !scheduledDate) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName.trim(),
      scheduledDate,
      status: "new",
    };

    setTasks([newTask, ...tasks]);
    setTaskName("");
    setScheduledDate(undefined);
    
    // Auto-expand the date group for the new task
    const dateKey = format(scheduledDate, "yyyy-MM-dd");
    setExpandedDates(prev => new Set([...prev, dateKey]));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "new" ? "completed" : "new" }
        : task
    ));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditName(task.name);
    setEditDate(task.scheduledDate);
  };

  const saveEditTask = () => {
    if (!editingTask || !editName.trim() || !editDate) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? { ...task, name: editName.trim(), scheduledDate: editDate }
        : task
    ));
    setEditingTask(null);
    setEditName("");
    setEditDate(undefined);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = () => {
    if (!deletingTask) return;
    setTasks(tasks.filter(t => t.id !== deletingTask.id));
    setDeletingTask(null);
  };

  const toggleDateGroup = (dateKey: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  // Group tasks by date
  const groupedTasks = tasks.reduce<Map<string, Task[]>>((acc, task) => {
    const dateKey = format(task.scheduledDate, "yyyy-MM-dd");
    if (!acc.has(dateKey)) {
      acc.set(dateKey, []);
    }
    acc.get(dateKey)!.push(task);
    return acc;
  }, new Map());

  // Sort date groups by date (newest first)
  const sortedDateGroups = Array.from(groupedTasks.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ListTodo className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
          <p className="text-sm text-muted-foreground">Create and track your tasks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <ListTodo className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTasksCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Task Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">
                Task Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Schedule Date <span className="text-destructive">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[200px] justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddTask}
                disabled={!taskName.trim() || !scheduledDate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List with Date Grouping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Create your first task using the form above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDateGroups.map(([dateKey, dateTasks]) => {
                const isExpanded = expandedDates.has(dateKey);
                const newCount = dateTasks.filter(t => t.status === "new").length;
                const completedCount = dateTasks.filter(t => t.status === "completed").length;
                const displayDate = format(new Date(dateKey), "EEEE, MMMM d, yyyy");

                return (
                  <Collapsible key={dateKey} open={isExpanded} onOpenChange={() => toggleDateGroup(dateKey)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{displayDate}</p>
                            <p className="text-xs text-muted-foreground">
                              {dateTasks.length} task{dateTasks.length !== 1 ? "s" : ""} • 
                              <span className="text-blue-600 dark:text-blue-400 ml-1">{newCount} new</span> • 
                              <span className="text-green-600 dark:text-green-400 ml-1">{completedCount} completed</span>
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {dateTasks.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-2 pl-8">
                        {dateTasks.map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-4 p-3 rounded-lg border transition-all",
                              task.status === "completed" 
                                ? "bg-muted/30 border-muted" 
                                : "bg-card border-border hover:border-primary/30"
                            )}
                          >
                            <Checkbox
                              checked={task.status === "completed"}
                              onCheckedChange={() => toggleTaskStatus(task.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                  "font-medium",
                                  task.status === "completed" && "line-through text-muted-foreground"
                                )}>
                                  {task.name}
                                </span>
                                <Badge 
                                  variant={task.status === "completed" ? "secondary" : "default"}
                                  className={cn(
                                    "text-xs",
                                    task.status === "completed" 
                                      ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                                      : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                  )}
                                >
                                  {task.status === "completed" ? (
                                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</>
                                  ) : (
                                    <><Circle className="h-3 w-3 mr-1" /> New</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleEditTask(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteTask(task)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Task Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter task name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Schedule Date <span className="text-destructive">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={setEditDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button 
              onClick={saveEditTask}
              disabled={!editName.trim() || !editDate}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{deletingTask?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManager;
