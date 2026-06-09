import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, User, Contact, FollowUp, Opportunity, Task, Quote, Attachment, FunnelData, TeamPerformance, TaskStats } from '../types';
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

  addOpportunity: (customerId: string, opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'quotes' | 'customerId'>) => void;
  updateOpportunityStage: (opportunityId: string, stage: Opportunity['stage']) => void;
  updateOpportunity: (opportunityId: string, data: Partial<Opportunity>) => void;
  addQuote: (opportunityId: string, quote: Omit<Quote, 'id'>) => void;
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
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? { ...o, stage, updatedAt: new Date().toISOString().split('T')[0] } : o
            ),
          })),
        }));
      },

      updateOpportunity: (opportunityId, data) => {
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? { ...o, ...data, updatedAt: new Date().toISOString().split('T')[0] } : o
            ),
          })),
        }));
      },

      addQuote: (opportunityId, quote) => {
        const newQuote: Quote = {
          ...quote,
          id: generateId(),
        };
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            opportunities: c.opportunities.map((o) =>
              o.id === opportunityId ? { ...o, quotes: [...o.quotes, newQuote], updatedAt: new Date().toISOString().split('T')[0] } : o
            ),
          })),
        }));
      },

      getQuotesByOpportunity: (opportunityId) => {
        const opportunity = get().getOpportunityById(opportunityId);
        return opportunity ? opportunity.quotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
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
        set((state) => ({
          customers: state.customers.map((c) => ({
            ...c,
            tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
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
