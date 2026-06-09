import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  CheckCircle2,
  Circle,
  Plus,
  User,
  Clock,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Task } from '../../types';
import {
  formatDate,
  formatShortDate,
  getMonthDays,
  getToday,
  cn,
} from '../../utils/helpers';

type ViewMode = 'list' | 'calendar';

export const Schedule = () => {
  const navigate = useNavigate();
  const {
    getAllTasks,
    getCustomerById,
    users,
    currentUser,
    toggleTask,
    assignTask,
    addTask,
    deleteTask,
  } = useCRMStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState({
    customerId: '',
    title: '',
    date: getToday(),
    assignedTo: currentUser.id,
  });

  const allTasks = getAllTasks();
  const currentUserTasks = allTasks.filter(t => t.assignedTo === currentUser.id);

  const groupedTasks = useMemo(() => {
    const sorted = [...currentUserTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const groups: { [key: string]: Task[] } = {};
    sorted.forEach(task => {
      if (!groups[task.date]) groups[task.date] = [];
      groups[task.date].push(task);
    });
    return groups;
  }, [currentUserTasks]);

  const monthDays = useMemo(() => {
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map: { [key: string]: Task[] } = {};
    currentUserTasks.forEach(task => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [currentUserTasks]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.customerId && taskForm.title) {
      addTask({
        customerId: taskForm.customerId,
        title: taskForm.title,
        date: taskForm.date,
        completed: false,
        assignedTo: taskForm.assignedTo,
      });
      setShowAddModal(false);
      setTaskForm({
        customerId: '',
        title: '',
        date: getToday(),
        assignedTo: currentUser.id,
      });
    }
  };

  const customerOptions = useCRMStore.getState().customers.map(c => ({
    value: c.id,
    label: c.name,
  }));

  const userOptions = users.map(u => ({
    value: u.id,
    label: u.name,
  }));

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = getToday();

  const upcomingTasks = currentUserTasks.filter(t => !t.completed).slice(0, 5);
  const completedToday = currentUserTasks.filter(t => t.completed && t.date === today).length;
  const totalToday = currentUserTasks.filter(t => t.date === today).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            跟进日程
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            管理您的客户跟进计划和任务
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <List className="w-4 h-4" />
              列表
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                viewMode === 'calendar'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <CalendarDays className="w-4 h-4" />
              日历
            </button>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            新增任务
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">今日待办</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalToday - completedToday}/{totalToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">待跟进任务</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {currentUserTasks.filter(t => !t.completed).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <List className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">今日完成</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {completedToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总任务数</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {currentUserTasks.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(groupedTasks).length === 0 ? (
              <Card>
                <CardContent className="text-center py-16 text-slate-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>暂无跟进任务</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    添加第一个任务
                  </Button>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedTasks).map(([date, tasks]) => {
                const dateObj = new Date(date);
                const isToday = date === today;
                const isPast = date < today;
                const allCompleted = tasks.every(t => t.completed);

                return (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          isToday ? 'bg-blue-100 text-blue-700' :
                          isPast ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-600'
                        )}>
                          {isToday ? '今天' : formatShortDate(date)}
                        </span>
                        <span>{formatDate(date)}</span>
                        {allCompleted && (
                          <Badge variant="success" size="sm">已完成</Badge>
                        )}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {tasks.filter(t => t.completed).length}/{tasks.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task) => {
                        const customer = getCustomerById(task.customerId);
                        const assignedUser = users.find(u => u.id === task.assignedTo);
                        const isOverdue = !task.completed && date < today;

                        return (
                          <Card
                            key={task.id}
                            className={cn(
                              'transition-all',
                              task.completed && 'opacity-60',
                              isOverdue && 'border-red-200 bg-red-50/50'
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleTask(task.id)}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                    <Circle className={cn(
                                      'w-5 h-5',
                                      isOverdue ? 'text-red-400' : 'text-slate-300 hover:text-slate-400'
                                    )} />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className={cn(
                                        'font-medium text-slate-900',
                                        task.completed && 'line-through text-slate-500'
                                      )}>
                                        {task.title}
                                      </p>
                                      {customer && (
                                        <button
                                          onClick={() => navigate(`/customers/${customer.id}`)}
                                          className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
                                        >
                                          <User className="w-3.5 h-3.5" />
                                          {customer.name}
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {assignedUser && (
                                        <Avatar name={assignedUser.name} size="sm" />
                                      )}
                                      <button
                                        onClick={() => deleteTask(task.id)}
                                        className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-500"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {isOverdue && !task.completed && (
                                    <Badge variant="danger" size="sm" className="mt-2">
                                      已逾期
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-slate-900">即将到期</h3>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    暂无即将到期的任务
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map(task => {
                      const customer = getCustomerById(task.customerId);
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => navigate(`/customers/${task.customerId}`)}
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {customer?.name} · {formatShortDate(task.date)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {currentUser.role === 'manager' && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-slate-900">团队成员</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.filter(u => u.role === 'sales').map(user => {
                      const userTasks = allTasks.filter(t => t.assignedTo === user.id);
                      const pendingCount = userTasks.filter(t => !t.completed).length;
                      const completionRate = userTasks.length > 0
                        ? Math.round((userTasks.filter(t => t.completed).length / userTasks.length) * 100)
                        : 0;
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => {
                            setTaskForm({
                              customerId: '',
                              title: '',
                              date: getToday(),
                              assignedTo: user.id,
                            });
                            setShowAddModal(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size="md" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">
                                {pendingCount}个待办 · 完成率{completionRate}%
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isTodayDate = dateStr === today;
                const dayTasks = tasksByDate[dateStr] || [];
                const hasTasks = dayTasks.length > 0;
                const completedCount = dayTasks.filter(t => t.completed).length;

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      'min-h-24 p-2 border rounded-lg cursor-pointer transition-colors',
                      isCurrentMonth ? 'bg-white' : 'bg-slate-50',
                      isTodayDate && 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200',
                      selectedDate === dateStr && 'border-slate-300 bg-slate-50',
                      !isTodayDate && !isCurrentMonth && 'text-slate-400',
                      'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm font-medium',
                        isTodayDate && 'text-blue-600'
                      )}>
                        {date.getDate()}
                      </span>
                      {hasTasks && (
                        <Badge variant={completedCount === dayTasks.length ? 'success' : 'default'} size="sm">
                          {dayTasks.length}
                        </Badge>
                      )}
                    </div>
                    {hasTasks && (
                      <div className="mt-2 space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={cn(
                              'text-xs p-1 rounded truncate',
                              task.completed
                                ? 'bg-emerald-50 text-emerald-700 line-through'
                                : 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-slate-400 text-center">
                            +{dayTasks.length - 2}更多
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增跟进任务"
      >
        <form onSubmit={handleAddTask} className="p-6 space-y-4">
          <Select
            label="选择客户"
            value={taskForm.customerId}
            onChange={(e) => setTaskForm({ ...taskForm, customerId: e.target.value })}
            options={[{ value: '', label: '请选择客户' }, ...customerOptions]}
            required
          />
          <Input
            label="任务内容"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="请输入任务内容"
            required
          />
          <Input
            label="任务日期"
            type="date"
            value={taskForm.date}
            onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
            required
          />
          {currentUser.role === 'manager' && (
            <Select
              label="指派给"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              options={userOptions}
            />
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              取消
            </Button>
            <Button type="submit">
              创建任务
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
