import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, User, Contact, FollowUp, Opportunity, Task, Quote, Attachment, FunnelData, TeamPerformance, TaskStats, TimelineEvent, WeeklyWorkload, TimelineEventType, CustomerSummary, OpportunityActivityLog, OpportunityActivityType, STAGE_LABELS } from '../types';
import { mockCustomers, mockUsers } from '../data/mockData';
import { generateId, calculateSalesFunnel, getToday } from '../utils/helpers';

interface CRMState {
  customers: Customer[];
  users: User[];
  currentUser: User;
  loading: boolean;
  searchKeyword: string;
  filters: {
    level?: string;
    source?: string;
    ownerId?: string;
  };

  initData: () => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'contacts' | 'followUps' | 'attachments' | 'opportunities' | 'tasks'>, contact?: Omit<Contact, 'id' | 'customerId'>) => string;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;

  addContact: (customerId: string, contact: Omit<Contact, 'id'>) => void;
  updateContact: (customerId: string, contactId: string, data: Partial<Contact>) => void;
  deleteContact: (customerId: string, contactId: string) => void;

  addFollowUp: (customerId: string, followUp: Omit<FollowUp, 'id'>) => void;

  addAttachment: (customerId: string, attachment: Omit<Attachment, 'id'>) => void;
  deleteAttachment: (customerId: string, attachmentId: string) => void;

  addOpportunity: (customerId: string, opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'quotes' | 'customerId' | 'activityLog'>) => void;
  updateOpportunityStage: (opportunityId: string, stage: Opportunity['stage']) => void;
  updateOpportunity: (opportunityId: string, data: Partial<Opportunity>) => void;
  addQuote: (opportunityId: string, quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  getQuotesByOpportunity: (opportunityId: string) => Quote[];
  getOpportunityById: (opportunityId: string) => Opportunity | undefined;

  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (taskId: string) => void;
  assignTask: (taskId: string, userId: string) => void;
  deleteTask: (taskId: string) => void;
  setCurrentUser: (userId: string) => void;
  getTaskStats: (userId: string) => TaskStats;

  setSearchKeyword: (keyword: string) => void;
  setFilters: (filters: { level?: string; source?: string; ownerId?: string }) => void;
  getFilteredCustomers: () => Customer[];

  getSalesFunnel: () => FunnelData[];
  getTeamPerformance: () => TeamPerformance[];
  getAllOpportunities: () => Opportunity[];
  getAllTasks: () => Task[];
  getTasksByDate: (date: string) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getTimelineEvents: (customerId: string) => TimelineEvent[];
  getWeeklyWorkload: () => WeeklyWorkload[];
  getCustomerSummary: (customerId: string) => CustomerSummary;
  addOpportunityActivity: (opportunityId: string, type: OpportunityActivityType, description: string, oldValue?: string, newValue?: string) => void;
  getOpportunityActivityLog: (opportunityId: string) => OpportunityActivityLog[];
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      customers: [],
      users: mockUsers,
      currentUser: mockUsers[1],
      loading: false,
      searchKeyword: '',
      filters: {},

      initData: () => {
        set({ customers: mockCustomers, loading: false });
      },

      addCustomer: (customer, contact) => {
        const newCustomerId = generateId();
        const contacts: Contact[] = [];
        
        if (contact && contact.name) {
          contacts.push({
            ...contact,
            id: generateId(),
            customerId: newCustomerId,
          });
        }

        const newCustomer: Customer = {
          ...customer,
          id: newCustomerId,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          contacts,
          followUps: [],
          attachments: [],
          opportunities: [],
          tasks: [],
        };
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
        return newCustomerId;
      },

      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString().split('T')[0] } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id);
      },

      addContact: (customerId, contact) => {
        const newContact: Contact = {
          ...contact,
          id: generateId(),
        };
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? { ...c, contacts: [...c.contacts, newContact], updatedAt: new Date().toISOString().split('T')[0] }
              : c
          ),
        }));
      },

      updateContact: (customerId, contactId, data) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  contacts: c.contacts.map((contact) =>
                    contact.id === contactId ? { ...contact, ...data } : contact
                  ),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
      },

      deleteContact: (customerId, contactId) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  contacts: c.contacts.filter((contact) => contact.id !== contactId),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
      },

      addFollowUp: (customerId, followUp) => {
        const newFollowUp: FollowUp = {
          ...followUp,
          id: generateId(),
        };
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  followUps: [...c.followUps, newFollowUp],
                  lastFollowUp: newFollowUp.date,
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));

        if (newFollowUp.nextContactDate) {
          get().addTask({
            customerId,
            followUpId: newFollowUp.id,
            title: '跟进客户',
            date: newFollowUp.nextContactDate,
            completed: false,
            assignedTo: get().currentUser.id,
          });
        }
      },

      addAttachment: (customerId, attachment) => {
        const newAttachment: Attachment = {
          ...attachment,
          id: generateId(),
        };
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? { ...c, attachments: [...c.attachments, newAttachment], updatedAt: new Date().toISOString().split('T')[0] }
              : c
          ),
        }));
      },

      deleteAttachment: (customerId, attachmentId) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  attachments: c.attachments.filter((a) => a.id !== attachmentId),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
      },

      addOpportunity: (customerId, opportunity) => {
        const newOpportunity: Opportunity = {
          ...opportunity,
          id: generateId(),
          customerId,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          quotes: [],
          activityLog: [],
        };
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? { ...c, opportunities: [...c.opportunities, newOpportunity], updatedAt: new Date().toISOString().split('T')[0] }
              : c
          ),
        }));
      },

      updateOpportunityStage: (opportunityId, stage) => {
        const { currentUser, getOpportunityById } = get();
        const opportunity = getOpportunityById(opportunityId);
        const oldStage = opportunity?.stage;
        const now = new Date();
        
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? { 
                ...o, 
                stage, 
                updatedAt: now.toISOString().split('T')[0],
                activityLog: [
                  {
                    id: generateId(),
                    type: 'stage_change',
                    description: `阶段从「${oldStage ? STAGE_LABELS[oldStage] : ''}」变更为「${STAGE_LABELS[stage]}」`,
                    userId: currentUser.id,
                    createdAt: now.toISOString(),
                    oldValue: oldStage,
                    newValue: stage,
                  },
                  ...o.activityLog,
                ],
              } : o
            ),
          })),
        }));
      },

      updateOpportunity: (opportunityId, data) => {
        const { currentUser, getOpportunityById, users } = get();
        const opportunity = getOpportunityById(opportunityId);
        const now = new Date();
        const activityLog: OpportunityActivityLog[] = [];

        if (data.ownerId && opportunity && data.ownerId !== opportunity.ownerId) {
          const oldOwner = users.find(u => u.id === opportunity.ownerId);
          const newOwner = users.find(u => u.id === data.ownerId);
          activityLog.push({
            id: generateId(),
            type: 'owner_change',
            description: `负责人从「${oldOwner?.name || opportunity.ownerId}」变更为「${newOwner?.name || data.ownerId}」`,
            userId: currentUser.id,
            createdAt: now.toISOString(),
            oldValue: opportunity.ownerId,
            newValue: data.ownerId,
          });
        }

        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? { 
                ...o, 
                ...data, 
                updatedAt: now.toISOString().split('T')[0],
                activityLog: [
                  ...activityLog,
                  ...o.activityLog,
                ],
              } : o
            ),
          })),
        }));
      },

      addQuote: (opportunityId, quote) => {
        const { currentUser } = get();
        const now = new Date();
        const newQuote: Quote = {
          ...quote,
          id: generateId(),
          createdAt: now.toISOString(),
        };
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? { 
                ...o, 
                quotes: [...o.quotes, newQuote], 
                updatedAt: now.toISOString().split('T')[0],
                activityLog: [
                  {
                    id: generateId(),
                    type: 'quote_add',
                    description: `新增报价：${quote.amount.toLocaleString('zh-CN')} 元`,
                    userId: currentUser.id,
                    createdAt: now.toISOString(),
                    newValue: quote.amount.toString(),
                  },
                  ...o.activityLog,
                ],
              } : o
            ),
          })),
        }));
      },

      getQuotesByOpportunity: (opportunityId) => {
        const opportunity = get().getOpportunityById(opportunityId);
        if (!opportunity) return [];
        return [...opportunity.quotes].sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },

      getOpportunityById: (opportunityId) => {
        return get().customers.flatMap((c) => c.opportunities).find((o) => o.id === opportunityId);
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
        };
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === task.customerId
              ? { ...c, tasks: [...c.tasks, newTask], updatedAt: new Date().toISOString().split('T')[0] }
              : c
          ),
        }));
      },

      toggleTask: (taskId) => {
        const now = new Date();
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            tasks: c.tasks.map((t) => 
              t.id === taskId 
                ? { 
                    ...t, 
                    completed: !t.completed,
                    completedAt: !t.completed ? now.toISOString() : undefined,
                  } 
                : t
            ),
          })),
        }));
      },

      assignTask: (taskId, userId) => {
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: userId } : t)),
          })),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            tasks: c.tasks.filter((t) => t.id !== taskId),
          })),
        }));
      },

      setCurrentUser: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (user) {
          set({ currentUser: user });
        }
      },

      getTaskStats: (userId) => {
        const tasks = get().getTasksByUser(userId);
        const today = getToday();
        const completedTasks = tasks.filter((t) => t.completed);
        const pendingTasks = tasks.filter((t) => !t.completed);
        const overdueTasks = pendingTasks.filter((t) => t.date < today);

        return {
          userId,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          overdueTasks: overdueTasks.length,
          completionRate: tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0,
        };
      },

      setSearchKeyword: (keyword) => {
        set({ searchKeyword: keyword });
      },

      setFilters: (filters) => {
        set({ filters });
      },

      getFilteredCustomers: () => {
        const { customers, searchKeyword, filters } = get();
        return customers.filter((customer) => {
          if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            const matchesSearch =
              customer.name.toLowerCase().includes(keyword) ||
              customer.industry.toLowerCase().includes(keyword) ||
              customer.contacts.some((c) => c.name.toLowerCase().includes(keyword) || c.email.toLowerCase().includes(keyword));
            if (!matchesSearch) return false;
          }

          if (filters.level && customer.level !== filters.level) return false;
          if (filters.source && customer.source !== filters.source) return false;
          if (filters.ownerId && customer.ownerId !== filters.ownerId) return false;

          return true;
        });
      },

      getSalesFunnel: () => {
        const allOpportunities = get().getAllOpportunities();
        return calculateSalesFunnel(allOpportunities);
      },

      getTeamPerformance: (): TeamPerformance[] => {
        const { users, customers } = get();
        return users.map((user) => {
          const userOpportunities = customers.flatMap((c) =>
            c.opportunities.filter((o) => o.ownerId === user.id)
          );
          const wonOpportunities = userOpportunities.filter((o) => o.stage === 'won');
          const wonAmount = wonOpportunities.reduce((sum, o) => sum + o.amount, 0);
          const conversionRate = userOpportunities.length > 0
            ? Math.round((wonOpportunities.length / userOpportunities.length) * 100)
            : 0;
          
          const taskStats = get().getTaskStats(user.id);

          return {
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
            totalOpportunities: userOpportunities.length,
            wonOpportunities: wonOpportunities.length,
            wonAmount,
            conversionRate,
            totalTasks: taskStats.totalTasks,
            completedTasks: taskStats.completedTasks,
            taskCompletionRate: taskStats.completionRate,
          };
        });
      },

      getAllOpportunities: () => {
        return get().customers.flatMap((c) => c.opportunities);
      },

      getAllTasks: () => {
        return get().customers.flatMap((c) => c.tasks);
      },

      getTasksByDate: (date) => {
        return get().getAllTasks().filter((t) => t.date === date);
      },

      getTasksByUser: (userId) => {
        return get().getAllTasks().filter((t) => t.assignedTo === userId);
      },

      getTimelineEvents: (customerId) => {
        const customer = get().getCustomerById(customerId);
        if (!customer) return [];

        const events: TimelineEvent[] = [];

        customer.followUps.forEach((followUp) => {
          const dateTime = new Date(followUp.date);
          events.push({
            id: `followup-${followUp.id}`,
            type: 'followup',
            date: followUp.date,
            time: dateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            title: followUp.type === 'call' ? '电话沟通' : followUp.type === 'meeting' ? '会议洽谈' : followUp.type === 'email' ? '邮件往来' : '其他跟进',
            description: followUp.content,
            userId: followUp.userId,
            metadata: {
              result: followUp.result,
              nextContactDate: followUp.nextContactDate,
              followUpType: followUp.type,
            },
          });
        });

        customer.attachments.forEach((attachment) => {
          const dateTime = new Date(attachment.uploadedAt);
          events.push({
            id: `attachment-${attachment.id}`,
            type: 'attachment',
            date: attachment.uploadedAt,
            time: dateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            title: '上传附件',
            description: attachment.name,
            userId: customer.ownerId,
            metadata: {
              size: attachment.size,
              type: attachment.type,
            },
          });
        });

        customer.opportunities.forEach((opportunity) => {
          const createDateTime = new Date(opportunity.createdAt);
          events.push({
            id: `opportunity-${opportunity.id}`,
            type: 'opportunity',
            date: opportunity.createdAt,
            time: createDateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            title: '创建商机',
            description: `${opportunity.name} - ${opportunity.amount.toLocaleString()}元`,
            userId: opportunity.ownerId,
            metadata: {
              stage: opportunity.stage,
              amount: opportunity.amount,
              probability: opportunity.probability,
            },
          });

          opportunity.quotes.forEach((quote) => {
            const quoteDateTime = new Date(quote.createdAt);
            events.push({
              id: `quote-${quote.id}`,
              type: 'quote',
              date: quote.date,
              time: quoteDateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              title: '提交报价',
              description: `${quote.amount.toLocaleString()}元${quote.notes ? ` - ${quote.notes}` : ''}`,
              userId: opportunity.ownerId,
              metadata: {
                amount: quote.amount,
                notes: quote.notes,
                opportunityId: opportunity.id,
              },
            });
          });
        });

        customer.tasks.forEach((task) => {
          const dateTime = new Date(task.date);
          events.push({
            id: `task-${task.id}`,
            type: 'task',
            date: task.date,
            time: dateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            title: task.completed ? '完成任务' : '创建任务',
            description: task.title,
            userId: task.assignedTo,
            metadata: {
              completed: task.completed,
            },
          });
        });

        return events.sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return b.time.localeCompare(a.time);
        });
      },

      getWeeklyWorkload: () => {
        const { users, customers } = get();
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return users
          .filter(user => user.role === 'sales')
          .map((user) => {
            const userOpportunities = customers.flatMap((c) =>
              c.opportunities.filter((o) => o.ownerId === user.id)
            );

            const userFollowUps = customers.flatMap((c) =>
              c.followUps.filter((f) => f.userId === user.id && new Date(f.date) >= weekStart)
            );

            const userTasks = customers.flatMap((c) =>
              c.tasks.filter((t) => t.assignedTo === user.id)
            );

            const completedTasksThisWeek = userTasks.filter(
              (t) => t.completed && t.completedAt && new Date(t.completedAt) >= weekStart
            );

            const overdueTasks = userTasks.filter(
              (t) => !t.completed && new Date(t.date) < today
            );

            const quoteCount = userOpportunities.reduce(
              (sum, o) => sum + o.quotes.filter((q) => new Date(q.date) >= weekStart).length,
              0
            );

            return {
              userId: user.id,
              name: user.name,
              avatar: user.avatar,
              newFollowUps: userFollowUps.length,
              completedTasks: completedTasksThisWeek.length,
              overdueTasks: overdueTasks.length,
              quoteCount,
            };
          });
      },

      getCustomerSummary: (customerId) => {
        const { customers, users } = get();
        const customer = customers.find(c => c.id === customerId);
        if (!customer) {
          return { lastContact: null, lastQuote: null, nextTask: null, risks: [] };
        }

        const sortedFollowUps = [...customer.followUps].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastFollowUp = sortedFollowUps[0];

        const allQuotes = customer.opportunities.flatMap(o => 
          o.quotes.map(q => ({ ...q, opportunityName: o.name }))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastQuote = allQuotes[0];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pendingTasks = customer.tasks
          .filter(t => !t.completed && new Date(t.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const nextTask = pendingTasks[0];

        const risks: string[] = [];
        const overdueTasks = customer.tasks.filter(t => !t.completed && new Date(t.date) < today);
        if (overdueTasks.length > 0) {
          risks.push(`${overdueTasks.length}个任务已逾期`);
        }

        const stalledOpportunities = customer.opportunities.filter(o => {
          const daysSinceUpdate = Math.floor(
            (today.getTime() - new Date(o.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceUpdate > 7 && o.stage !== 'won' && o.stage !== 'lost';
        });
        if (stalledOpportunities.length > 0) {
          risks.push(`${stalledOpportunities.length}个商机超过7天未更新`);
        }

        if (!lastFollowUp || new Date(lastFollowUp.date) < new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)) {
          risks.push('超过14天未联系');
        }

        const lastContactUser = lastFollowUp ? users.find(u => u.id === lastFollowUp.userId) : null;
        const nextTaskUser = nextTask ? users.find(u => u.id === nextTask.assignedTo) : null;

        return {
          lastContact: lastFollowUp ? {
            date: lastFollowUp.date,
            type: lastFollowUp.type,
            content: lastFollowUp.content,
            user: lastContactUser?.name || lastFollowUp.userId,
          } : null,
          lastQuote: lastQuote ? {
            date: lastQuote.date,
            amount: lastQuote.amount,
            opportunityName: lastQuote.opportunityName,
          } : null,
          nextTask: nextTask ? {
            title: nextTask.title,
            date: nextTask.date,
            assignedTo: nextTaskUser?.name || nextTask.assignedTo,
          } : null,
          risks,
        };
      },

      addOpportunityActivity: (opportunityId, type, description, oldValue, newValue) => {
        const { currentUser } = get();
        const now = new Date();
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? {
                ...o,
                updatedAt: now.toISOString().split('T')[0],
                activityLog: [
                  {
                    id: generateId(),
                    type,
                    description,
                    userId: currentUser.id,
                    createdAt: now.toISOString(),
                    oldValue,
                    newValue,
                  },
                  ...o.activityLog,
                ],
              } : o
            ),
          })),
        }));
      },

      getOpportunityActivityLog: (opportunityId) => {
        const opportunity = get().getOpportunityById(opportunityId);
        return opportunity?.activityLog || [];
      },
    }),
    {
      name: 'crm-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.customers.length === 0) {
          state.initData();
        }
      },
    }
  )
);
