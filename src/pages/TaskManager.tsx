import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, ListTodo, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  name: string;
  description: string;
  scheduledDate: Date;
  status: "new" | "completed";
  createdAt: Date;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const handleAddTask = () => {
    if (!taskName.trim() || !scheduledDate) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName.trim(),
      description: taskDescription.trim(),
      scheduledDate,
      status: "new",
      createdAt: new Date(),
    };

    setTasks([newTask, ...tasks]);
    setTaskName("");
    setTaskDescription("");
    setScheduledDate(undefined);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "new" ? "completed" : "new" }
        : task
    ));
  };

  const newTasksCount = tasks.filter(t => t.status === "new").length;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <ListTodo className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Tasks</p>
                <p className="text-2xl font-bold">{newTasksCount}</p>
              </div>
              <Circle className="h-8 w-8 text-blue-500/50" />
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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
                      "w-full justify-start text-left font-normal",
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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              placeholder="Enter task description or notes..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleAddTask}
            disabled={!taskName.trim() || !scheduledDate}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks yet. Create your first task above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-all",
                    task.status === "completed" 
                      ? "bg-muted/50 border-muted" 
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                    className="mt-1"
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
                    {task.description && (
                      <p className={cn(
                        "text-sm mt-1",
                        task.status === "completed" 
                          ? "text-muted-foreground/70" 
                          : "text-muted-foreground"
                      )}>
                        {task.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      <CalendarIcon className="h-3 w-3 inline mr-1" />
                      Scheduled: {format(task.scheduledDate, "PPP")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManager;
